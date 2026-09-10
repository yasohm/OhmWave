import React, { useEffect, useRef, useState } from 'react';
import DownloadModal from './components/DownloadModal';
import MobileCollection from './components/MobileCollection';
import MobileNav from './components/MobileNav';
import MobilePlayer from './components/MobilePlayer';
import MobileSearch from './components/MobileSearch';
import MobileTrackList from './components/MobileTrackList';
import { apiFetch, apiUrl } from './lib/api';

const USER_ID = 'local-listener';

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchCategory, setSearchCategory] = useState('track');
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [libraryFiles, setLibraryFiles] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [downloadJobId, setDownloadJobId] = useState(null);
  const [downloadJobStatus, setDownloadJobStatus] = useState(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const pollRef = useRef(null);
  const pendingPlayRef = useRef(null);

  const fetchLibrary = async () => {
    try {
      const response = await apiFetch('/api/library');
      if (response.ok) setLibraryFiles((await response.json()).files || []);
    } catch { /* The collection has its own empty state. */ }
  };

  useEffect(() => { fetchLibrary(); }, []);
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  useEffect(() => {
    if (!downloadJobId) return undefined;
    pollRef.current = setInterval(async () => {
      try {
        const response = await apiFetch(`/api/download/status/${downloadJobId}`);
        if (!response.ok) return;
        const status = await response.json();
        setDownloadJobStatus(status);
        if (status.status === 'completed') {
          clearInterval(pollRef.current);
          const pendingTrack = pendingPlayRef.current;
          const savedFile = status.files?.find((file) => file.title === pendingTrack?.title) || status.files?.[0];
          if (pendingTrack && savedFile?.relative_path) {
            pendingPlayRef.current = null;
            setCurrentTrack({ ...pendingTrack, streamUrl: apiUrl(`/api/stream/${savedFile.relative_path}`) });
            setIsPlaying(true);
            setSearchError('');
          } else if (pendingTrack) {
            pendingPlayRef.current = null;
            setSearchError(status.errors?.[0]?.error || 'This track could not be prepared for playback.');
          }
          fetchLibrary();
        }
      } catch { /* Keep the last known progress visible. */ }
    }, 1000);
    return () => clearInterval(pollRef.current);
  }, [downloadJobId]);

  const search = async (query, category) => {
    setIsLoading(true);
    setSearchError('');
    try {
      const response = await apiFetch('/api/search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), type: category }),
      });
      if (!response.ok) throw new Error('Search could not be completed.');
      const data = await response.json();
      let source = data.songs || data.tracks || data.results || data;
      if (data.artists?.length) source = data.artists.flatMap((artist) => artist.songs || []);
      if (data.albums?.length) source = data.albums.flatMap((album) => album.tracks || []);
      const list = Array.isArray(source) ? source : [];
      setTracks(list.map((item, index) => ({
        id: item.videoId || item.id || `track-${index}`,
        videoId: item.videoId || item.id,
        title: item.title || item.name || 'Untitled track',
        artist: item.artist || item.artists?.[0]?.name || 'Unknown artist',
        album: item.album || item.album?.name || '',
        duration: item.duration || item.length || '',
        cover: item.thumbnails?.[0]?.url || item.cover || null,
        url: item.url,
      })));
    } catch (error) {
      setTracks([]);
      setSearchError(error.message || 'Search could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  const playSearchTrack = async (track) => {
    const local = libraryFiles.find((file) => file.title.toLowerCase() === track.title.toLowerCase());
    if (local) {
      setCurrentTrack({ ...track, streamUrl: apiUrl(`/api/stream/${local.relative_path}`) });
      setIsPlaying(true);
      return;
    }

    pendingPlayRef.current = track;
    setSearchError(`Preparing ${track.title} for playback…`);
    await download(track, { playWhenReady: true });
  };

  const playLibraryTrack = (file) => {
    setCurrentTrack({ id: file.relative_path, title: file.title, artist: file.artist, cover: null, streamUrl: apiUrl(`/api/stream/${file.relative_path}`) });
    setIsPlaying(true);
  };

  const toggleLike = async (track) => {
    const isLiked = likedTracks.some((item) => item.id === track.id);
    setLikedTracks((current) => isLiked ? current.filter((item) => item.id !== track.id) : [...current, track]);
    if (!isLiked) {
      try {
        await apiFetch('/api/likes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: USER_ID, track_id: track.id, title: track.title, artist: track.artist, album: track.album || '', cover: track.cover }) });
      } catch { /* Favorite remains available in this local session. */ }
    }
  };

  const download = async (track, { playWhenReady = false } = {}) => {
    try {
      const response = await apiFetch('/api/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tracks: [track], format: 'mp3', quality: '320' }) });
      if (!response.ok) throw new Error('Download could not be started.');
      const data = await response.json();
      setDownloadJobId(data.job_id);
      setShowDownloadModal(!playWhenReady);
    } catch (error) {
      if (playWhenReady) pendingPlayRef.current = null;
      setSearchError(error.message || 'Download could not be started.');
    }
  };

  const next = () => {
    if (activeTab !== 'search' || !currentTrack) return;
    const index = tracks.findIndex((track) => track.id === currentTrack.id);
    if (index >= 0 && index < tracks.length - 1) playSearchTrack(tracks[index + 1]);
  };
  const previous = () => {
    if (activeTab !== 'search' || !currentTrack) return;
    const index = tracks.findIndex((track) => track.id === currentTrack.id);
    if (index > 0) playSearchTrack(tracks[index - 1]);
  };

  const likedIds = likedTracks.map((track) => track.id);
  const collectionTab = activeTab === 'search' ? null : activeTab;

  return <div className="music-app">
    <main className={currentTrack ? 'music-main has-player' : 'music-main'}>
      {activeTab === 'search' ? <>
        <MobileSearch query={searchQuery} setQuery={setSearchQuery} category={searchCategory} setCategory={setSearchCategory} isLoading={isLoading} onSearch={search} />
        {searchError && <p className="mobile-error" role="alert">{searchError}</p>}
        <MobileTrackList tracks={tracks} currentTrackId={currentTrack?.id} isPlaying={isPlaying} likedIds={likedIds} onPlay={playSearchTrack} onLike={toggleLike} onDownload={download} />
      </> : <MobileCollection tab={collectionTab} libraryFiles={libraryFiles} likedTracks={likedTracks} onPlay={playLibraryTrack} />}
    </main>
    <MobilePlayer track={currentTrack} isPlaying={isPlaying} setIsPlaying={setIsPlaying} onNext={next} onPrev={previous} liked={currentTrack ? likedIds.includes(currentTrack.id) : false} onLike={toggleLike} />
    <MobileNav activeTab={activeTab} onChange={setActiveTab} />
    {showDownloadModal && <DownloadModal jobStatus={downloadJobStatus} onClose={() => setShowDownloadModal(false)} autoSaveToDevice={false} setAutoSaveToDevice={() => {}} onSaveAllToDevice={() => {}} />}
  </div>;
}
