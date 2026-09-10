import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const filters = ['track', 'artist', 'album', 'genre'];

export default function MobileSearch({ query, setQuery, category, setCategory, isLoading, onSearch }) {
  const submit = (event) => { event.preventDefault(); if (query.trim()) onSearch(query, category); };
  return <section className="mobile-search" aria-labelledby="search-title">
    <div className="mobile-page-title"><h1 id="search-title">Search</h1><button type="button" className="flat-icon-button" aria-label="Adjust search filters"><SlidersHorizontal /></button></div>
    <form className="mobile-search-input" onSubmit={submit}>
      <Search aria-hidden="true" />
      <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search songs, artists, albums..." aria-label="Search songs, artists, and albums" />
      {query && <button type="button" onClick={() => setQuery('')} className="flat-icon-button" aria-label="Clear search"><X /></button>}
    </form>
    <div className="mobile-filter-row" aria-label="Search category">
      {filters.map((filter) => <button key={filter} type="button" className={category === filter ? 'is-active' : ''} onClick={() => setCategory(filter)} aria-pressed={category === filter}>{filter}</button>)}
    </div>
    {isLoading && <p className="mobile-status" role="status">Finding music…</p>}
  </section>;
}
