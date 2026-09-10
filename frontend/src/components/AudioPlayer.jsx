import React, { useRef, useState, useEffect } from 'react';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Shuffle,
    Repeat,
    Volume2,
    VolumeX,
    Music
} from 'lucide-react';

export default function AudioPlayer({
    currentTrack,
    onNext,
    onPrev,
    isPlaying,
    setIsPlaying
}) {
    const audioRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    useEffect(() => {
        if (currentTrack && audioRef.current) {
            audioRef.current.src = currentTrack.streamUrl;
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(err => {
                console.log("Audio play deferred or interrupted:", err);
            });
        }
    }, [currentTrack]);

    const togglePlay = () => {
        if (!audioRef.current || !currentTrack) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
        }
    };

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleEnded = () => {
        if (isRepeat && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        } else if (onNext) {
            onNext();
        } else {
            setIsPlaying(false);
        }
    };

    const formatTime = (secs) => {
        if (isNaN(secs) || secs === 0) return '0:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (!currentTrack) return null;

    return (
        <footer className="fixed bottom-0 left-0 right-0 h-20 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-6 flex items-center justify-between z-40 shadow-2xl">
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
            />

            {}
            <div className="flex items-center gap-3.5 w-1/4 min-w-[200px]">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0 shadow-md">
                    {currentTrack.cover ? (
                        <img src={currentTrack.cover} alt={currentTrack.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <Music className="w-5 h-5" />
                        </div>
                    )}
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-semibold font-heading text-slate-100 truncate">
                        {currentTrack.title || 'Unknown Title'}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                        {currentTrack.artist || 'Unknown Artist'}
                    </div>
                </div>
            </div>

            {}
            <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-xl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsShuffle(!isShuffle)}
                        className={`p-1.5 rounded-lg transition-colors ${isShuffle ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <Shuffle className="w-4 h-4" />
                    </button>

                    <button
                        onClick={onPrev}
                        className="text-slate-300 hover:text-white p-1 rounded-lg transition-colors"
                    >
                        <SkipBack className="w-4 h-4 fill-current" />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-transform active:scale-95 glow-emerald"
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5 fill-current" />
                        ) : (
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                    </button>

                    <button
                        onClick={onNext}
                        className="text-slate-300 hover:text-white p-1 rounded-lg transition-colors"
                    >
                        <SkipForward className="w-4 h-4 fill-current" />
                    </button>

                    <button
                        onClick={() => setIsRepeat(!isRepeat)}
                        className={`p-1.5 rounded-lg transition-colors ${isRepeat ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <Repeat className="w-4 h-4" />
                    </button>
                </div>

                {}
                <div className="w-full flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {}
            <div className="flex items-center justify-end gap-3 w-1/4 min-w-[150px]">
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                    {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                        <Volume2 className="w-4 h-4 text-slate-300" />
                    )}
                </button>
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                        setIsMuted(false);
                        setVolume(parseFloat(e.target.value));
                    }}
                    className="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
            </div>
        </footer>
    );
}
