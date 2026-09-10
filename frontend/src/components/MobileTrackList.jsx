import React from 'react';
import { Download, Heart, Music2, Pause, Play } from 'lucide-react';

export default function MobileTrackList({ tracks = [], currentTrackId, isPlaying, likedIds, onPlay, onLike, onDownload }) {
  return <section className="mobile-results" aria-labelledby="top-tracks-title">
    <div className="mobile-section-heading"><h2 id="top-tracks-title">Top tracks</h2>{tracks.length > 0 && <span>{tracks.length} results</span>}</div>
    {tracks.length === 0 ? <div className="mobile-empty"><Music2 /><p>Search for a song, artist, album, or genre.</p></div> : <div className="mobile-track-list">
      {tracks.map((track) => {
        const isCurrent = track.id === currentTrackId;
        const isLiked = likedIds.includes(track.id);
        return <article key={track.id} className={`mobile-track ${isCurrent ? 'is-playing' : ''}`}>
          <button type="button" className="mobile-track-main" onClick={() => onPlay(track)} aria-label={`Play ${track.title} by ${track.artist}`}>
            <span className="mobile-art">{track.cover ? <img src={track.cover} alt="" /> : <Music2 />}</span>
            <span className="mobile-track-copy"><strong>{track.title}</strong><small>{track.artist}</small></span>
          </button>
          <span className="mobile-duration">{track.duration}</span>
          <button type="button" className="mobile-row-button secondary" onClick={() => onLike(track)} aria-label={isLiked ? `Unlike ${track.title}` : `Like ${track.title}`}><Heart className={isLiked ? 'is-liked' : ''} fill={isLiked ? 'currentColor' : 'none'} /></button>
          <button type="button" className="mobile-row-button secondary" onClick={() => onDownload(track)} aria-label={`Download ${track.title}`}><Download /></button>
          <button type="button" className="mobile-row-button primary" onClick={() => onPlay(track)} aria-label={isCurrent && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}>{isCurrent && isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</button>
        </article>;
      })}
    </div>}
  </section>;
}
