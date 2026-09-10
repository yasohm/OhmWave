"""Sparse implicit-feedback recommendations for the local OhmWave app.

The service keeps interaction data in SQLite and uses implicit ALS when the
optional scipy/implicit packages are installed. It always has a deterministic
popular-track fallback for cold starts and development environments.
"""
from __future__ import annotations

import json
import os
import pickle
import sqlite3
import threading
from collections import defaultdict
from datetime import datetime, timezone

DB_PATH = os.environ.get("OHMWAVE_DB", "ohmwave.db")
MODEL_PATH = os.environ.get("OHMWAVE_MODEL", "models/als_latest.pkl")


class RecommendationService:
    def __init__(self, db_path=DB_PATH, model_path=MODEL_PATH):
        self.db_path = db_path
        self.model_path = model_path
        self._model_lock = threading.Lock()
        self._model = None
        self._model_data = None
        os.makedirs(os.path.dirname(model_path) or ".", exist_ok=True)
        self._init_db()
        self._load_model()

    def _connect(self):
        connection = sqlite3.connect(self.db_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _init_db(self):
        with self._connect() as db:
            db.executescript("""
                CREATE TABLE IF NOT EXISTS listening_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    track_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    artist TEXT NOT NULL DEFAULT '',
                    album TEXT NOT NULL DEFAULT '',
                    cover TEXT,
                    played_at TEXT NOT NULL,
                    ms_played INTEGER NOT NULL DEFAULT 0,
                    completed INTEGER NOT NULL DEFAULT 0,
                    skipped INTEGER NOT NULL DEFAULT 0
                );
                CREATE TABLE IF NOT EXISTS user_likes (
                    user_id TEXT NOT NULL,
                    track_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    artist TEXT NOT NULL DEFAULT '',
                    album TEXT NOT NULL DEFAULT '',
                    cover TEXT,
                    liked_at TEXT NOT NULL,
                    PRIMARY KEY (user_id, track_id)
                );
                CREATE INDEX IF NOT EXISTS idx_events_user_track
                    ON listening_events(user_id, track_id);
            """)

    def record_event(self, event):
        required = ("user_id", "track_id", "title")
        if any(not str(event.get(key, "")).strip() for key in required):
            raise ValueError("user_id, track_id, and title are required")
        with self._connect() as db:
            db.execute("""
                INSERT INTO listening_events
                (user_id, track_id, title, artist, album, cover, played_at,
                 ms_played, completed, skipped)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                str(event["user_id"]), str(event["track_id"]), str(event["title"]),
                event.get("artist", ""), event.get("album", ""), event.get("cover"),
                event.get("played_at") or datetime.now(timezone.utc).isoformat(),
                max(0, int(event.get("ms_played", 0))),
                int(bool(event.get("completed", False))),
                int(bool(event.get("skipped", False))),
            ))

    def set_like(self, payload):
        required = ("user_id", "track_id", "title")
        if any(not str(payload.get(key, "")).strip() for key in required):
            raise ValueError("user_id, track_id, and title are required")
        with self._connect() as db:
            db.execute("""
                INSERT INTO user_likes
                (user_id, track_id, title, artist, album, cover, liked_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_id, track_id) DO UPDATE SET liked_at=excluded.liked_at
            """, (
                str(payload["user_id"]), str(payload["track_id"]), str(payload["title"]),
                payload.get("artist", ""), payload.get("album", ""), payload.get("cover"),
                datetime.now(timezone.utc).isoformat(),
            ))

    def _rows(self):
        with self._connect() as db:
            events = db.execute("SELECT * FROM listening_events").fetchall()
            likes = db.execute("SELECT * FROM user_likes").fetchall()
        return events, likes

    def _scores(self):
        events, likes = self._rows()
        scores = defaultdict(float)
        metadata = {}
        users, tracks = set(), set()
        for row in events:
            key = (row["user_id"], row["track_id"])
            completion = min(1.0, max(0.0, row["ms_played"] / 180000.0)) if row["ms_played"] else 0
            scores[key] += 1.0 + completion * 0.5 - (0.3 if row["skipped"] else 0)
            users.add(row["user_id"]); tracks.add(row["track_id"])
            metadata[row["track_id"]] = dict(row)
        for row in likes:
            key = (row["user_id"], row["track_id"])
            scores[key] += 2.0
            users.add(row["user_id"]); tracks.add(row["track_id"])
            metadata[row["track_id"]] = dict(row)
        return scores, metadata, sorted(users), sorted(tracks)

    def retrain(self):
        scores, metadata, users, tracks = self._scores()
        if not users or not tracks:
            with self._model_lock:
                self._model = None
                self._model_data = {"metadata": metadata, "users": users, "tracks": tracks}
            return {"trained": False, "reason": "not enough interaction history"}
        try:
            from scipy.sparse import csr_matrix
            import implicit
            user_index = {value: i for i, value in enumerate(users)}
            track_index = {value: i for i, value in enumerate(tracks)}
            rows, cols, values = [], [], []
            for (user, track), score in scores.items():
                if score > 0:
                    rows.append(user_index[user]); cols.append(track_index[track]); values.append(score)
            matrix = csr_matrix((values, (rows, cols)), shape=(len(users), len(tracks)))
            model = implicit.als.AlternatingLeastSquares(
                factors=min(64, max(8, len(tracks))), regularization=0.01, iterations=20
            )
            model.fit(matrix, show_progress=False)
            payload = {"model": model, "matrix": matrix, "metadata": metadata,
                       "users": users, "tracks": tracks}
            with open(self.model_path, "wb") as handle:
                pickle.dump(payload, handle)
            with self._model_lock:
                self._model = model; self._model_data = payload
            return {"trained": True, "users": len(users), "tracks": len(tracks), "algorithm": "als"}
        except ImportError:
            with self._model_lock:
                self._model = None
                self._model_data = {"metadata": metadata, "users": users, "tracks": tracks}
            return {"trained": False, "algorithm": "popular-fallback", "reason": "install scipy and implicit for ALS"}

    def _load_model(self):
        try:
            with open(self.model_path, "rb") as handle:
                payload = pickle.load(handle)
            self._model = payload.get("model")
            self._model_data = payload
        except (OSError, EOFError, pickle.PickleError):
            pass

    def recommend(self, user_id, limit=20):
        limit = min(50, max(1, int(limit)))
        scores, metadata, users, tracks = self._scores()
        seen = {track for (user, track), score in scores.items() if user == str(user_id) and score > 0}
        with self._model_lock:
            model, payload = self._model, self._model_data
        ranked = []
        if model and payload and str(user_id) in payload["users"]:
            user_index = payload["users"].index(str(user_id))
            ids, values = model.recommend(user_index, payload["matrix"][user_index], N=limit + len(seen), filter_already_liked_items=True)
            ranked = [(payload["tracks"][int(index)], float(value)) for index, value in zip(ids, values)]
        if not ranked:
            popularity = defaultdict(float)
            for (user, track), score in scores.items():
                popularity[track] += score
            ranked = sorted(popularity.items(), key=lambda item: item[1], reverse=True)
        return [dict(metadata.get(track, {"track_id": track}), recommendation_score=round(score, 4))
                for track, score in ranked if track not in seen][:limit]

