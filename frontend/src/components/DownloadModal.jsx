import React from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, Music, Download, HardDrive, Smartphone } from 'lucide-react';

export default function DownloadModal({
    jobStatus,
    onClose,
    autoSaveToDevice = true,
    setAutoSaveToDevice = () => { },
    onSaveAllToDevice = () => { }
}) {
    if (!jobStatus) return null;

    const {
        status = 'in_progress',
        total = 0,
        completed = 0,
        current_track = '',
        current_percent = 0,
        files = [],
        errors = []
    } = jobStatus;

    const overallPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const isFinished = status === 'completed';

    const triggerSingleDownload = (relativePath) => {
        const link = document.createElement('a');
        link.href = `/api/download_file/${encodeURI(relativePath)}`;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden glass-panel">
                {}
                <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isFinished ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                            {isFinished ? (
                                <CheckCircle2 className="w-5 h-5" />
                            ) : (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-heading font-bold text-slate-100 text-base">
                                {isFinished ? 'Downloads Complete' : 'Parallel Download Engine Active'}
                            </h3>
                            <p className="text-xs text-slate-400">
                                {isFinished ? `Successfully saved ${completed} track(s)` : `Processing ${completed} of ${total} audio streams...`}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {}
                <div className="p-5 space-y-4">
                    {}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <Smartphone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <div>
                                <div className="text-xs font-semibold text-slate-200">Save directly to this device</div>
                                <div className="text-[11px] text-slate-400">Auto-download songs to visitor's browser</div>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={autoSaveToDevice}
                                onChange={(e) => setAutoSaveToDevice(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>

                    {}
                    <div>
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1.5">
                            <span>Overall Progress</span>
                            <span className="font-mono text-emerald-400 font-bold">{overallPercent}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-300 glow-emerald"
                                style={{ width: `${overallPercent}%` }}
                            />
                        </div>
                    </div>

                    {}
                    {!isFinished && current_track && (
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
                            <Music className="w-4 h-4 text-emerald-400 animate-bounce" />
                            <div className="min-w-0 flex-1">
                                <div className="text-xs text-slate-400 font-medium">Currently Downloading:</div>
                                <div className="text-xs font-semibold text-slate-200 truncate">{current_track}</div>
                            </div>
                            <span className="text-[11px] font-mono font-semibold text-cyan-400">
                                {Math.round(current_percent)}%
                            </span>
                        </div>
                    )}

                    {}
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Downloaded Tracks ({files.length})
                        </div>
                        {files.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 text-xs">
                                <div className="flex items-center gap-2 truncate pr-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                    <span className="text-slate-200 font-medium truncate">{file.title}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-[10px] text-slate-400 font-mono">{file.artist}</span>
                                    <button
                                        onClick={() => triggerSingleDownload(file.relative_path)}
                                        title="Download to this device"
                                        className="p-1 rounded bg-slate-700/60 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition-colors"
                                    >
                                        <Download className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {errors.map((err, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                                <div className="flex items-center gap-2 truncate">
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                                    <span className="truncate">{err.track}: {err.error}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {}
                <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between">
                    {files.length > 0 ? (
                        <button
                            onClick={onSaveAllToDevice}
                            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Save All to Device</span>
                        </button>
                    ) : <div />}

                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                    >
                        {isFinished ? 'Close' : 'Background Run'}
                    </button>
                </div>
            </div>
        </div>
    );
}

