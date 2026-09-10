import React from 'react';
import { Play, Download, Clock, Music, Check, Disc } from 'lucide-react';

export default function TrackTable({
    tracks = [],
    selectedTrackIds = [],
    onToggleTrack,
    onToggleAll,
    onPlayTrack,
    onDownloadSingle,
    currentPlayingId,
    isPlaying
}) {
    const isAllSelected = tracks.length > 0 && selectedTrackIds.length === tracks.length;

    if (tracks.length === 0) {
        return (
            <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60 p-8">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-4 border border-slate-700/50">
                    <Music className="w-7 h-7 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-semibold font-heading text-slate-300">No tracks to display</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                    Use the search bar above or choose a preset from the sidebar to find and scrape songs.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md shadow-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/60 border-b border-slate-800/80 text-xs font-semibold uppercase text-slate-400">
                        <tr>
                            <th className="py-3.5 px-4 w-12 text-center">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={onToggleAll}
                                    className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500/30 w-4 h-4 cursor-pointer"
                                />
                            </th>
                            <th className="py-3.5 px-3 w-12 text-center">#</th>
                            <th className="py-3.5 px-4">Title</th>
                            <th className="py-3.5 px-4 hidden md:table-cell">Artist & Album</th>
                            <th className="py-3.5 px-4 w-24 text-center">
                                <Clock className="w-4 h-4 mx-auto" />
                            </th>
                            <th className="py-3.5 px-4 w-28 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800/40">
                        {tracks.map((track, idx) => {
                            const trackId = track.videoId || track.id || idx;
                            const isSelected = selectedTrackIds.includes(trackId);
                            const isCurrentPlaying = currentPlayingId === trackId;

                            return (
                                <tr
                                    key={trackId}
                                    className={`group hover:bg-slate-800/50 transition-colors ${isSelected ? 'bg-emerald-500/5' : ''
                                        }`}
                                >
                                    {}
                                    <td className="py-3 px-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => onToggleTrack(trackId)}
                                            className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500/30 w-4 h-4 cursor-pointer"
                                        />
                                    </td>

                                    {}
                                    <td className="py-3 px-3 text-center text-xs font-medium text-slate-500">
                                        <button
                                            onClick={() => onPlayTrack(track)}
                                            className="w-7 h-7 mx-auto rounded-lg flex items-center justify-center hover:bg-emerald-500 hover:text-slate-950 transition-all text-slate-400 group-hover:text-emerald-400"
                                        >
                                            {isCurrentPlaying && isPlaying ? (
                                                <div className="flex items-end justify-center gap-0.5 w-3.5 h-3.5">
                                                    <span className="w-0.5 h-full bg-emerald-400 animate-pulse" />
                                                    <span className="w-0.5 h-2/3 bg-emerald-400 animate-pulse delay-75" />
                                                    <span className="w-0.5 h-full bg-emerald-400 animate-pulse delay-150" />
                                                </div>
                                            ) : (
                                                <Play className="w-3.5 h-3.5 fill-current" />
                                            )}
                                        </button>
                                    </td>

                                    {}
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700/50">
                                                {track.cover || track.thumbnails?.[0]?.url ? (
                                                    <img
                                                        src={track.cover || track.thumbnails?.[0]?.url}
                                                        alt={track.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                                        <Music className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className={`font-semibold truncate text-sm ${isCurrentPlaying ? 'text-emerald-400' : 'text-slate-100'}`}>
                                                    {track.title}
                                                </div>
                                                <div className="text-xs text-slate-400 truncate md:hidden">
                                                    {track.artist || 'Unknown Artist'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {}
                                    <td className="py-3 px-4 hidden md:table-cell">
                                        <div className="text-xs font-medium text-slate-300 truncate">
                                            {track.artist || 'Unknown Artist'}
                                        </div>
                                        {track.album && (
                                            <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                                <Disc className="w-3 h-3" />
                                                <span>{track.album}</span>
                                            </div>
                                        )}
                                    </td>

                                    {}
                                    <td className="py-3 px-4 text-center text-xs font-mono text-slate-400">
                                        {track.duration || '3:30'}
                                    </td>

                                    {}
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => onDownloadSingle(track)}
                                                title="Download track"
                                                className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-slate-700/60 text-xs font-medium transition-all flex items-center gap-1.5"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">Save</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
