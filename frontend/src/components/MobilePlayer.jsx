import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Heart, Music2, Pause, Play, Repeat2, Shuffle, SkipBack, SkipForward } from 'lucide-react';

const formatTime = (value) => { if (!Number.isFinite(value) || value <= 0) return '0:00'; return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`; };

export default function MobilePlayer({ track, isPlaying, setIsPlaying, onNext, onPrev, liked, onLike }) {
  const audioRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeat, setRepeat] = useState(false);

  useEffect(() => { if (track && audioRef.current) { audioRef.current.src = track.streamUrl; audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false)); } }, [track, setIsPlaying]);
  if (!track) return null;
  const toggle = () => { if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); } else { audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {}); } };
  const seek = (event) => { const value = Number(event.target.value); audioRef.current.currentTime = value; setTime(value); };
  const art = track.cover ? <img src={track.cover} alt="" /> : <Music2 />;

  return <><audio ref={audioRef} onTimeUpdate={() => { setTime(audioRef.current.currentTime); setDuration(audioRef.current.duration || 0); }} onEnded={() => repeat ? (audioRef.current.currentTime = 0, audioRef.current.play()) : onNext()} />
    <section className="mini-player" aria-label="Now playing"><button type="button" className="mini-player__track" onClick={() => setExpanded(true)}><span className="mini-player__art">{art}</span><span><strong>{track.title}</strong><small>{track.artist}</small></span></button><button type="button" className="mini-control" onClick={toggle} aria-label={isPlaying ? 'Pause' : 'Play'}>{isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</button><button type="button" className="mini-control" onClick={onNext} aria-label="Next track"><SkipForward fill="currentColor" /></button></section>
    {expanded && <section className="now-playing" role="dialog" aria-modal="true" aria-label="Now playing"><header><button type="button" className="flat-icon-button" onClick={() => setExpanded(false)} aria-label="Close player"><ChevronDown /></button><span>Now playing</span><button type="button" className="flat-icon-button" onClick={() => onLike(track)} aria-label={liked ? 'Unlike track' : 'Like track'}><Heart className={liked ? 'is-liked' : ''} fill={liked ? 'currentColor' : 'none'} /></button></header><div className="now-playing__art">{art}</div><div className="now-playing__copy"><h1>{track.title}</h1><p>{track.artist}</p></div><input className="player-progress" type="range" min="0" max={duration || 100} value={time} onChange={seek} aria-label="Playback progress"/><div className="player-time"><span>{formatTime(time)}</span><span>-{formatTime(Math.max(0, duration - time))}</span></div><div className="player-controls"><button type="button" onClick={() => {}} aria-label="Shuffle"><Shuffle /></button><button type="button" onClick={onPrev} aria-label="Previous"><SkipBack fill="currentColor" /></button><button type="button" className="player-main-control" onClick={toggle} aria-label={isPlaying ? 'Pause' : 'Play'}>{isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</button><button type="button" onClick={onNext} aria-label="Next"><SkipForward fill="currentColor" /></button><button type="button" className={repeat ? 'is-selected' : ''} onClick={() => setRepeat(!repeat)} aria-label="Repeat"><Repeat2 /></button></div></section>}
  </>;
}
