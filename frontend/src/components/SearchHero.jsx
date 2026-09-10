import React from 'react';
import { Play, CheckSquare, Square, Download, Music, Disc } from 'lucide-react';

export default function SearchHero({
    metadata,
    tracksCount,
    selectedCount,
    onSelectAll,
    isAllSelected,
    onDownloadSelected,
    onPlayAll
}) {
    const { title = 'Music Scraper', artist = 'YouTube Music', type = 'Collection', cover = null } = metadata || {};

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800/80 p-6 mb-6 shadow-2xl">
            {}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6 z-10">
                {}
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-950 flex-shrink-0 group">
                    {cover ? (
                        <img
                            src={cover}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-slate-500">
                            <Disc className="w-16 h-16 stroke-[1.5] text-slate-600 mb-1" />
                            <span className="text-[11px] font-semibold tracking-wider text-slate-400">SOUNDSCRAPE</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors" />
                </div>

                {}
                <div className="flex-1 text-center sm:text-left space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                        <Music className="w-3.5 h-3.5" />
                        <span>{type}</span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight leading-tight">
                        {title}
                    </h2>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-slate-300">
                        <span className="font-semibold text-slate-100">{artist}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">{tracksCount} tracks found</span>
                    </div>

                    {}
                    <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                        <button
                            onClick={onPlayAll}
                            disabled={tracksCount === 0}
                            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 glow-emerald transition-all hover:scale-[1.02]"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            <span>Play All</span>
                        </button>

                        <button
                            onClick={onSelectAll}
                            disabled={tracksCount === 0}
                            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 font-medium text-sm flex items-center gap-2 transition-all hover:border-slate-600"
                        >
                            {isAllSelected ? (
                                <>
                                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                                    <span>Deselect All</span>
                                </>
                            ) : (
                                <>
                                    <Square className="w-4 h-4 text-slate-400" />
                                    <span>Select All</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={onDownloadSelected}
                            disabled={selectedCount === 0}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${selectedCount > 0
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-[1.02]'
                                    : 'bg-slate-800/50 text-slate-500 border border-slate-800 cursor-not-allowed'
                                }`}
                        >
                            <Download className="w-4 h-4" />
                            <span>Download Selected ({selectedCount})</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
