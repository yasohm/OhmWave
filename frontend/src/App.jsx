import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import SearchBarRow from './components/SearchBarRow';
import SearchHero from './components/SearchHero';
import TrackTable from './components/TrackTable';
import LibraryView from './components/LibraryView';
import DownloadModal from './components/DownloadModal';
import AudioPlayer from './components/AudioPlayer';
import { apiFetch, apiUrl } from './lib/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchCategory, setSearchCategory] = useState('artist');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [tracks, setTracks] = useState([]);
  const [searchMetadata, setSearchMetadata] = useState({
    title: 'SoundScrape Explorer',
    artist: 'YouTube Music Scraper',
    type: 'Collection',
    cover: null
  });
  const [selectedTrackIds, setSelectedTrackIds] = useState([]);

  const [audioFormat, setAudioFormat] = useState('mp3');
  const [audioQuality, setAudioQuality] = useState('320');

  const [libraryFiles, setLibraryFiles] = useState([]);

  const [downloadJobId, setDownloadJobId] = useState(null);
  const [downloadJobStatus, setDownloadJobStatus] = useState(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [autoSaveToDevice, setAutoSaveToDevice] = useState(true);
  const autoDownloadedPathsRef = useRef(new Set());
  const pollIntervalRef = useRef(null);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const triggerBrowserFileSave = (relativePath) => {
    const link = document.createElement('a');
    link.href = apiUrl(`/api/download_file/${encodeURI(relativePath)}`);
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchLibrary();
    executeSearch('Rihanna', 'artist');
  }, []);

  useEffect(() => {
    if (downloadJobId) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await apiFetch(`/api/download/status/${downloadJobId}`);
          if (res.ok) {
            const statusData = await res.json();
            setDownloadJobStatus(statusData);

            if (autoSaveToDevice && statusData.files && Array.isArray(statusData.files)) {
              statusData.files.forEach((file) => {
                if (file.relative_path && !autoDownloadedPathsRef.current.has(file.relative_path)) {
                  autoDownloadedPathsRef.current.add(file.relative_path);
                  triggerBrowserFileSave(file.relative_path);
                }
              });
            }

            if (statusData.status === 'completed') {
              clearInterval(pollIntervalRef.current);
              fetchLibrary();
            }
          }
        } catch (err) {
          console.error('Error fetching download status:', err);
        }
      }, 1000);
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [downloadJobId, autoSaveToDevice]);

  const fetchLibrary = async () => {
    try {
      const res = await apiFetch('/api/library');
      if (res.ok) {
        const data = await res.json();
        setLibraryFiles(data.files || []);
      }
    } catch (err) {
      console.error('Failed to fetch library:', err);
    }
  };

  const executeSearch = async (query, category) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setActiveTab('search');

    try {
      const res = await apiFetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), type: category })
      });

      if (!res.ok) throw new Error('Search failed');

      const data = await res.json();

      let trackList = [];
      let meta = {
        title: query,
        artist: `${category.toUpperCase()} SEARCH`,
        type: category,
        cover: null
      };

      if (data.songs && Array.isArray(data.songs) && data.songs.length > 0) {
        trackList = data.songs;
      } else if (data.tracks && Array.isArray(data.tracks) && data.tracks.length > 0) {
        trackList = data.tracks;
      } else if (data.artists && Array.isArray(data.artists) && data.artists.length > 0) {
        data.artists.forEach((art) => {
          if (art.songs && Array.isArray(art.songs)) {
            trackList.push(...art.songs);
          }
        });
        meta.title = data.artists[0]?.name || query;
        meta.artist = 'Artist Top Tracks';
        meta.cover = data.artists[0]?.thumbnails?.[0]?.url || null;
      } else if (data.albums && Array.isArray(data.albums) && data.albums.length > 0) {
        data.albums.forEach((alb) => {
          if (alb.tracks && Array.isArray(alb.tracks)) {
            trackList.push(...alb.tracks);
          }
        });
        meta.title = data.albums[0]?.title || query;
        meta.artist = data.albums[0]?.artist || 'Album Collection';
        meta.cover = data.albums[0]?.thumbnails?.[0]?.url || null;
      } else if (data.results && Array.isArray(data.results)) {
        trackList = data.results;
      } else if (Array.isArray(data)) {
        trackList = data;
      }

      const formattedTracks = trackList.map((item, i) => ({
        id: item.videoId || item.id || `track-${i}`,
        videoId: item.videoId || item.id,
        title: item.title || item.name || 'Unknown Title',
        artist: item.artist || item.artists?.[0]?.name || meta.artist || 'Unknown Artist',
        album: item.album || item.album?.name || meta.title || 'YouTube Audio',
        duration: item.duration || item.length || '3:30',
        cover: item.thumbnails?.[0]?.url || item.cover || meta.cover || null,
        url: item.url || (item.videoId ? `https://music.youtube.com/watch?v=${item.videoId}` : null)
      }));

      setTracks(formattedTracks);
      setSearchMetadata(meta);
      setSelectedTrackIds([]);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTrack = (trackId) => {
    setSelectedTrackIds((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
  };

  const handleToggleAll = () => {
    if (selectedTrackIds.length === tracks.length) {
      setSelectedTrackIds([]);
    } else {
      setSelectedTrackIds(tracks.map((t) => t.id));
    }
  };

  const handleDownloadSelected = async () => {
    const selectedTracks = tracks.filter((t) => selectedTrackIds.includes(t.id));
    if (selectedTracks.length === 0) return;

    autoDownloadedPathsRef.current.clear();
    try {
      const res = await apiFetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracks: selectedTracks,
          format: audioFormat,
          quality: audioQuality
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDownloadJobId(data.job_id);
        setShowDownloadModal(true);
      }
    } catch (err) {
      console.error('Download trigger error:', err);
    }
  };

  const handleDownloadSingle = async (track) => {
    autoDownloadedPathsRef.current.clear();
    try {
      const res = await apiFetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracks: [track],
          format: audioFormat,
          quality: audioQuality
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDownloadJobId(data.job_id);
        setShowDownloadModal(true);
      }
    } catch (err) {
      console.error('Single download trigger error:', err);
    }
  };

  const handleSaveAllToDevice = () => {
    if (downloadJobStatus && downloadJobStatus.files) {
      downloadJobStatus.files.forEach((file, index) => {
        setTimeout(() => {
          triggerBrowserFileSave(file.relative_path);
        }, index * 300);
      });
    }
  };

  const handleDeleteFile = async (relative_path) => {
    try {
      const res = await apiFetch('/api/delete_file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relative_path })
      });

      if (res.ok) {
        fetchLibrary();
      }
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  };

  const handlePlaySearchTrack = (track) => {
    const matchingLib = libraryFiles.find(
      (f) => f.title.toLowerCase().includes(track.title.toLowerCase())
    );

    const streamUrl = matchingLib
      ? apiUrl(`/api/stream/${matchingLib.relative_path}`)
      : apiUrl(`/api/stream/${track.artist}/${track.title}.${audioFormat}`);

    setCurrentTrack({
      title: track.title,
      artist: track.artist,
      cover: track.cover,
      streamUrl: streamUrl
    });
    setIsPlaying(true);
  };

  const handlePlayLibraryFile = (file) => {
    setCurrentTrack({
      title: file.title,
      artist: file.artist,
      cover: null,
      streamUrl: apiUrl(`/api/stream/${file.relative_path}`)
    });
    setIsPlaying(true);
  };

  const handleNextTrack = () => {
    if (!currentTrack) return;
    if (activeTab === 'library' && libraryFiles.length > 0) {
      const idx = libraryFiles.findIndex((f) => apiUrl(`/api/stream/${f.relative_path}`) === currentTrack.streamUrl);
      if (idx !== -1 && idx < libraryFiles.length - 1) {
        handlePlayLibraryFile(libraryFiles[idx + 1]);
      }
    } else if (tracks.length > 0) {
      const idx = tracks.findIndex((t) => t.title === currentTrack.title);
      if (idx !== -1 && idx < tracks.length - 1) {
        handlePlaySearchTrack(tracks[idx + 1]);
      }
    }
  };

  const handlePrevTrack = () => {
    if (!currentTrack) return;
    if (activeTab === 'library' && libraryFiles.length > 0) {
      const idx = libraryFiles.findIndex((f) => apiUrl(`/api/stream/${f.relative_path}`) === currentTrack.streamUrl);
      if (idx > 0) {
        handlePlayLibraryFile(libraryFiles[idx - 1]);
      }
    } else if (tracks.length > 0) {
      const idx = tracks.findIndex((t) => t.title === currentTrack.title);
      if (idx > 0) {
        handlePlaySearchTrack(tracks[idx - 1]);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans">
      {}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        libraryCount={libraryFiles.length}
        onRefreshLibrary={fetchLibrary}
      />

      {}
      <main className={`flex-1 overflow-y-auto px-6 py-6 ${currentTrack ? 'pb-28' : 'pb-10'}`}>
        <div className="max-w-6xl mx-auto space-y-6">
          {activeTab === 'search' ? (
            <>
              {}
              <SearchBarRow
                onSearch={executeSearch}
                isLoading={isLoading}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchCategory={searchCategory}
                setSearchCategory={setSearchCategory}
                audioFormat={audioFormat}
                setAudioFormat={setAudioFormat}
                audioQuality={audioQuality}
                setAudioQuality={setAudioQuality}
              />

              {}
              <SearchHero
                metadata={searchMetadata}
                tracksCount={tracks.length}
                selectedCount={selectedTrackIds.length}
                onSelectAll={handleToggleAll}
                isAllSelected={tracks.length > 0 && selectedTrackIds.length === tracks.length}
                onDownloadSelected={handleDownloadSelected}
                onPlayAll={() => tracks.length > 0 && handlePlaySearchTrack(tracks[0])}
              />

              {}
              <TrackTable
                tracks={tracks}
                selectedTrackIds={selectedTrackIds}
                onToggleTrack={handleToggleTrack}
                onToggleAll={handleToggleAll}
                onPlayTrack={handlePlaySearchTrack}
                onDownloadSingle={handleDownloadSingle}
                currentPlayingId={currentTrack?.title}
                isPlaying={isPlaying}
              />
            </>
          ) : (
            <LibraryView
              libraryFiles={libraryFiles}
              onRefresh={fetchLibrary}
              onPlayFile={handlePlayLibraryFile}
              onDeleteFile={handleDeleteFile}
              currentPlayingPath={currentTrack?.streamUrl?.replace(apiUrl('/api/stream/'), '')}
              isPlaying={isPlaying}
            />
          )}
        </div>
      </main>

      {}
      <AudioPlayer
        currentTrack={currentTrack}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
      />

      {}
      {showDownloadModal && (
        <DownloadModal
          jobStatus={downloadJobStatus}
          onClose={() => setShowDownloadModal(false)}
          autoSaveToDevice={autoSaveToDevice}
          setAutoSaveToDevice={setAutoSaveToDevice}
          onSaveAllToDevice={handleSaveAllToDevice}
        />
      )}
    </div>
  );
}
