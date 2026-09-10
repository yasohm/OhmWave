import React from 'react';
import {
    Music,
    Search,
    Library,
    User,
    Disc,
    Radio,
    Sliders,
    Sparkles,
    Heart,
    Wand2,
    CloudSun,
    Flame,
    Zap
} from 'lucide-react';

export default function Sidebar({
    activeTab,
    setActiveTab,
    searchCategory,
    setSearchCategory,
    libraryCount,
    audioFormat,
    setAudioFormat,
    audioQuality,
    setAudioQuality,
    onQuickSearch
}) {
    const categories = [
        { id: 'artist', label: 'Artist', icon: User },
        { id: 'album', label: 'Album', icon: Disc },
        { id: 'genre', label: 'Genre', icon: Radio },
        { id: 'track', label: 'Track', icon: Music },
    ];

    const presets = [
        { name: 'Rihanna Top Tracks', type: 'artist', query: 'Rihanna', icon: Heart, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
        { name: 'Discover Weekly', type: 'album', query: 'A Girl Like Me', icon: Wand2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
        { name: 'Chill Vibes & Lo-Fi', type: 'genre', query: 'Chill Vibes', icon: CloudSun, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
        { name: 'Synthwave Hits', type: 'genre', query: 'Synthwave', icon: Zap, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        { name: 'Daft Punk Essentials', type: 'artist', query: 'Daft Punk', icon: Flame, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    ];

    return (
        <aside className="w-72 flex-shrink-0 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/60 flex flex-col h-full overflow-y-auto">
            {}
            <div className="p-5 flex items-center gap-3 border-b border-slate-800/50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 glow-emerald">
                    <Music className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                </div>
                <div>
                    <h1 className="text-xl font-bold font-heading bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-wide">
                        SoundScrape
                    </h1>
                    <p className="text-[11px] text-emerald-400/90 font-medium tracking-wider uppercase">
                        Pro Audio Scraper
                    </p>
                </div>
            </div>

            <div className="p-4 space-y-6 flex-1">
                {}
                <div>
                    <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase px-3 mb-2">
                        Navigation
                    </div>
                    <nav className="space-y-1.5">
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === 'search'
                                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/40 shadow-md shadow-emerald-500/10'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Search className="w-4 h-4" />
                                <span>Search & Scrape</span>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab('library')}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === 'library'
                                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/40 shadow-md shadow-emerald-500/10'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Library className="w-4 h-4 text-emerald-400" />
                                <span className="font-semibold">Your Collection</span>
                            </div>
                            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-950 text-emerald-400 border border-emerald-500/30">
                                {libraryCount}
                            </span>
                        </button>
                    </nav>
                </div>

                {}
                <div>
                    <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase px-3 mb-2">
                        Search Filter Category
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800/60">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            const isSelected = searchCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSearchCategory(cat.id)}
                                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${isSelected
                                            ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80 font-semibold'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                                        }`}
                                >
                                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                                    <span>{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {}
                <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-800/40 to-slate-900/40 border border-slate-800/80 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                        <span>DOWNLOAD ENGINE SPECS</span>
                    </div>

                    <div className="space-y-2 text-xs">
                        <div>
                            <label className="block text-slate-400 mb-1 text-[11px]">Audio Format</label>
                            <select
                                value={audioFormat}
                                onChange={(e) => setAudioFormat(e.target.value)}
                                className="w-full bg-slate-950/90 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/80 transition-colors"
                            >
                                <option value="mp3">MP3 (Universal 320k)</option>
                                <option value="flac">FLAC (Lossless Audio)</option>
                                <option value="m4a">M4A (AAC High Quality)</option>
                                <option value="opus">OPUS (Ultra High Speed)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-slate-400 mb-1 text-[11px]">Bitrate Quality</label>
                            <select
                                value={audioQuality}
                                onChange={(e) => setAudioQuality(e.target.value)}
                                className="w-full bg-slate-950/90 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/80 transition-colors"
                            >
                                <option value="320">320 kbps (Extreme Quality)</option>
                                <option value="256">256 kbps (High Quality)</option>
                                <option value="192">192 kbps (Standard)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {}
                <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 tracking-wider uppercase px-3 mb-2">
                        <span>Quick Presets</span>
                        <Sparkles className="w-3 h-3 text-emerald-400/80" />
                    </div>
                    <div className="space-y-1">
                        {presets.map((preset, idx) => {
                            const Icon = preset.icon;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => onQuickSearch(preset.type, preset.query)}
                                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/40 text-left transition-colors group"
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${preset.color}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                                            {preset.name}
                                        </div>
                                        <div className="text-[10px] text-slate-400 capitalize">
                                            {preset.type} • {preset.query}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </aside>
    );
}
