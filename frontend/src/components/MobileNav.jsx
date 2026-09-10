import React from 'react';
import { Search, Disc3, ListMusic, Heart } from 'lucide-react';

const tabs = [
  { id: 'search', label: 'Search', icon: Search },
  { id: 'albums', label: 'Albums', icon: Disc3 },
  { id: 'playlists', label: 'Playlists', icon: ListMusic },
  { id: 'liked', label: 'Liked', icon: Heart },
];

export default function MobileNav({ activeTab, onChange }) {
  return <nav className="mobile-nav" aria-label="Main navigation">
    {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={activeTab === id ? 'is-active' : ''} onClick={() => onChange(id)} aria-current={activeTab === id ? 'page' : undefined}>
      <Icon aria-hidden="true" /><span>{label}</span>
    </button>)}
  </nav>;
}
