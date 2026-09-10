import React from 'react';
import { Disc3, FileAudio, Heart, ListMusic, Music2, Play } from 'lucide-react';

const headings = { albums: ['Albums', Disc3, 'Downloaded music and albums'], playlists: ['Playlists', ListMusic, 'Your saved music collections'], liked: ['Liked tracks', Heart, 'Songs you have marked as favorites'] };

export default function MobileCollection({ tab, libraryFiles = [], likedTracks = [], onPlay }) {
  const [title, Icon, subtitle] = headings[tab];
  const items = tab === 'liked' ? likedTracks : libraryFiles;
  return <section className="mobile-collection" aria-labelledby="collection-title">
    <div className="mobile-page-title"><div><h1 id="collection-title">{title}</h1><p>{subtitle}</p></div><Icon aria-hidden="true" /></div>
    {items.length === 0 ? <div className="mobile-empty"><FileAudio /><p>{tab === 'liked' ? 'Tap the heart on a track to add it here.' : 'Your downloaded tracks will appear here.'}</p></div> : <div className="mobile-track-list">
      {items.map((item) => <article key={item.id || item.relative_path} className="mobile-track">
        <button type="button" className="mobile-track-main" onClick={() => onPlay(item)} aria-label={`Play ${item.title}`}><span className="mobile-art"><Music2 /></span><span className="mobile-track-copy"><strong>{item.title}</strong><small>{item.artist}</small></span></button>
        <button type="button" className="mobile-row-button primary" onClick={() => onPlay(item)} aria-label={`Play ${item.title}`}><Play fill="currentColor" /></button>
      </article>)}
    </div>}
  </section>;
}
