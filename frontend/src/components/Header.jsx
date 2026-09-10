import React from 'react';
import { Music, Search, Library, RefreshCw, Sparkles, User } from 'lucide-react';

export default function Header({
    activeTab,
    setActiveTab,
    libraryCount,
    onRefreshLibrary
}) {
    return (
        <header className="h-16 px-6 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between sticky top-0 z-30 shadow-md">
            {}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 glow-emerald">
                    <Music className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                </div>
                <div>
                    <h1 className="text-lg font-bold font-heading bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent leading-none">
                        SoundScrape
                    </h1>
                    <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase mt-0.5">
                        Music Scraper
                    </p>
                </div>
            </div>

            {}
            <nav className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 shadow-inner">
                <button
                    onClick={() => setActiveTab('search')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${activeTab === 'search'
                            ? 'bg-slate-800 text-emerald-400 shadow border border-slate-700/80'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                        }`}
                >
                    <Search className="w-3.5 h-3.5" />
                    <span>Explore & Search</span>
                </button>

                <button
                    onClick={() => setActiveTab('library')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${activeTab === 'library'
                            ? 'bg-slate-800 text-emerald-400 shadow border border-slate-700/80'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                        }`}
                >
                    <Library className="w-3.5 h-3.5" />
                    <span>Your Collection</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {libraryCount}
                    </span>
                </button>
            </nav>

            {}
            <div className="flex items-center gap-3">
                <button
                    onClick={onRefreshLibrary}
                    title="Refresh Collection"
                    className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 border border-slate-800/80 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-slate-800" />

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-medium hidden sm:inline">Online</span>
                </div>
            </div>
        </header>
    );
}
