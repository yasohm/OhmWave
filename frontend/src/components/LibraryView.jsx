import React, { useState } from 'react';
import { Play, Download, Trash2, Search, RefreshCw, Folder, Music, HardDrive, FileAudio, AlertCircle } from 'lucide-react';
import { apiUrl } from '../lib/api';

export default function LibraryView({
    libraryFiles = [],
    onRefresh,
    onPlayFile,
    onDeleteFile,
    currentPlayingPath,
    isPlaying
}) {
    const [filterQuery, setFilterQuery] = useState('');
    const [deletingPath, setDeletingPath] = useState(null);

    const filteredFiles = libraryFiles.filter((file) => {
        const q = filterQuery.toLowerCase();
        return (
            file.title.toLowerCase().includes(q) ||
            file.artist.toLowerCase().includes(q) ||
            file.album.toLowerCase().includes(q) ||
            file.filename.toLowerCase().includes(q)
        );
    });

    const totalSizeMB = libraryFiles.reduce((acc, f) => acc + (f.size_mb || 0), 0).toFixed(1);

    const handleDelete = async (relative_path) => {
        if (window.confirm(`Are you sure you want to delete this track from your library?\n\n${relative_path}`)) {
            setDeletingPath(relative_path);
            await onDeleteFile(relative_path);
            setDeletingPath(null);
        }
    };

    return (
        <div className="space-y-6">
            {}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                        <Folder className="w-4 h-4" />

                        <span>LOCAL AUDIO STORAGE</span>
                    </div>
                    <h2 className="text-2xl font-bold font-heading text-white">Your Scraped Library</h2>
                    <p className="text-sm text-slate-400 mt-0.5">
                        High-definition tracks stored directly in your local <code className="bg-slate-950 px-1.5 py-0.5 rounded text-emerald-400 border border-slate-800">./downloads</code> folder.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
                        <HardDrive className="w-4 h-4 text-emerald-400" />
                        <div className="text-xs">
                            <span className="text-slate-400">Total Size: </span>
                            <span className="font-bold text-slate-200">{totalSizeMB} MB</span>
                            <span className="text-slate-500 mx-1">•</span>
                            <span className="font-bold text-slate-200">{libraryFiles.length} files</span>
                        </div>
                    </div>

                    <button
                        onClick={onRefresh}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {}
            <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Filter downloaded tracks by name, artist, or folder..."
                    className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/70 text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-2.5 transition-all outline-none"
                />
            </div>

            {}
            {filteredFiles.length === 0 ? (
                <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60 p-8">
                    <div className="w-14 h-14 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-4 border border-slate-700/50">
                        <FileAudio className="w-7 h-7 stroke-[1.5]" />
                    </div>
                    <h3 className="text-lg font-semibold font-heading text-slate-300">
                        {libraryFiles.length === 0 ? 'Your library is empty' : 'No matching files found'}
                    </h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                        {libraryFiles.length === 0
                            ? 'Start searching and downloading tracks to populate your offline collection.'
                            : 'Try adjusting your search filter term.'}
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-950/60 border-b border-slate-800/80 text-xs font-semibold uppercase text-slate-400">
                                <tr>
                                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                                    <th className="py-3.5 px-4">Track Title</th>
                                    <th className="py-3.5 px-4 hidden md:table-cell">Artist / Folder</th>
                                    <th className="py-3.5 px-4 w-32 text-center">Format & Size</th>
                                    <th className="py-3.5 px-4 w-36 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-800/40">
                                {filteredFiles.map((file, idx) => {
                                    const isCurrentPlaying = currentPlayingPath === file.relative_path;

                                    return (
                                        <tr key={file.relative_path} className="group hover:bg-slate-800/50 transition-colors">
                                            {}
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => onPlayFile(file)}
                                                    className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center bg-slate-800/80 group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-300 transition-all"
                                                >
                                                    {isCurrentPlaying && isPlaying ? (
                                                        <div className="flex items-end justify-center gap-0.5 w-3.5 h-3.5">
                                                            <span className="w-0.5 h-full bg-emerald-400 animate-pulse" />
                                                            <span className="w-0.5 h-2/3 bg-emerald-400 animate-pulse delay-75" />
                                                            <span className="w-0.5 h-full bg-emerald-400 animate-pulse delay-150" />
                                                        </div>
                                                    ) : (
                                                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                                    )}
                                                </button>
                                            </td>

                                            {}
                                            <td className="py-3 px-4">
                                                <div className={`font-semibold text-sm truncate ${isCurrentPlaying ? 'text-emerald-400' : 'text-slate-100'}`}>
                                                    {file.title}
                                                </div>
                                                <div className="text-xs text-slate-400 truncate md:hidden">
                                                    {file.artist}
                                                </div>
                                            </td>

                                            {}
                                            <td className="py-3 px-4 hidden md:table-cell">
                                                <div className="text-xs font-medium text-slate-300 truncate">
                                                    {file.artist}
                                                </div>
                                                <div className="text-[11px] text-slate-500 font-mono truncate">
                                                    {file.album}
                                                </div>
                                            </td>

                                            {}
                                            <td className="py-3 px-4 text-center">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        {file.ext}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-mono">
                                                        {file.size_mb} MB
                                                    </span>
                                                </div>
                                            </td>

                                            {}
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <a
                                                        href={apiUrl(`/api/download_file/${file.relative_path}`)}
                                                        download
                                                        title="Download to computer"
                                                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                    </a>

                                                    <button
                                                        onClick={() => handleDelete(file.relative_path)}
                                                        disabled={deletingPath === file.relative_path}
                                                        title="Delete file"
                                                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500 hover:text-white text-slate-400 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
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
            )}
        </div>
    );
}
