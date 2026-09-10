import React from 'react';
import { Search, Loader2, X, Zap, User, Disc, Radio, Music, Sliders } from 'lucide-react';

export default function SearchBarRow({
    onSearch,
    isLoading,
    searchQuery,
    setSearchQuery,
    searchCategory,
    setSearchCategory,
    audioFormat,
    setAudioFormat,
    audioQuality,
    setAudioQuality
}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onSearch(searchQuery, searchCategory);
        }
    };

    const categories = [
        { id: 'artist', label: 'Artist', icon: User },
        { id: 'album', label: 'Album', icon: Disc },
        { id: 'genre', label: 'Genre', icon: Radio },
        { id: 'track', label: 'Track', icon: Music },
    ];

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-3">
            {}
            <div className="flex flex-col lg:flex-row items-center gap-3">
                {}
                <form onSubmit={handleSubmit} className="flex-1 w-full relative">
                    <div className="relative flex items-center group">
                        <Search className="w-5 h-5 text-emerald-400 absolute left-4 pointer-events-none transition-transform group-focus-within:scale-110" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search ${searchCategory}s, tracks, or paste YouTube link...`}
                            className="w-full h-13 bg-slate-950/90 border-2 border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-100 placeholder-slate-500 text-sm font-medium rounded-xl pl-12 pr-28 transition-all shadow-inner focus:ring-4 focus:ring-emerald-500/10 outline-none"
                        />

                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-24 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !searchQuery.trim()}
                            className="absolute right-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Searching</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="w-3.5 h-3.5 fill-current" />
                                    <span>Search</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {}
                <div className="flex items-center gap-1.5 p-1 bg-slate-950/90 border border-slate-800/80 rounded-xl flex-shrink-0 w-full lg:w-auto overflow-x-auto">
                    <span className="text-[10px] font-bold text-slate-500 uppercase px-2 tracking-wider flex-shrink-0">Filter:</span>
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = searchCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSearchCategory(cat.id)}
                                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex-shrink-0 ${isSelected
                                        ? 'bg-slate-800 text-emerald-400 shadow-md border border-slate-700/80'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                                    }`}
                            >
                                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                                <span>{cat.label}</span>
                                {isSelected && (
                                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-emerald-400" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {}
            <div className="pt-1 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold text-slate-300">Format:</span>
                    <select
                        value={audioFormat}
                        onChange={(e) => setAudioFormat(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                    >
                        <option value="mp3">MP3 (320k)</option>
                        <option value="flac">FLAC (Lossless)</option>
                        <option value="m4a">M4A (AAC)</option>
                        <option value="opus">OPUS (Fast)</option>
                    </select>

                    <span className="font-semibold text-slate-300 ml-2">Bitrate:</span>
                    <select
                        value={audioQuality}
                        onChange={(e) => setAudioQuality(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                    >
                        <option value="320">320 kbps</option>
                        <option value="256">256 kbps</option>
                        <option value="192">192 kbps</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-500">Quick Try:</span>
                    {['Rihanna', 'Daft Punk', 'Synthwave'].map((q) => (
                        <button
                            key={q}
                            onClick={() => {
                                setSearchQuery(q);
                                onSearch(q, searchCategory);
                            }}
                            className="text-emerald-400 hover:underline font-medium"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
