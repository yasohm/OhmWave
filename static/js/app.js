document.addEventListener('DOMContentLoaded', () => {
  let currentCategory = 'artist';
  let currentSearchResults = [];
  let selectedTrackMap = new Map();
  let currentPollInterval = null;

  const navHome = document.getElementById('nav-home');
  const navLibrary = document.getElementById('nav-library');
  const searchTab = document.getElementById('search-tab');
  const libraryTab = document.getElementById('library-tab');

  const filterPills = document.querySelectorAll('.filter-pill');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');

  const heroBanner = document.getElementById('hero-banner');
  const heroTypeLabel = document.getElementById('hero-type-label');
  const heroTitle = document.getElementById('hero-title');
  const heroArtistName = document.getElementById('hero-artist-name');
  const heroMetaInfo = document.getElementById('hero-meta-info');
  const heroCoverImg = document.getElementById('hero-cover-img');

  const btnHeroPlay = document.getElementById('btn-hero-play');
  const btnHeroSelectAll = document.getElementById('btn-hero-select-all');
  const btnHeroDownloadAll = document.getElementById('btn-hero-download-all');
  const selectedCountSpan = document.getElementById('selected-count');

  const searchLoader = document.getElementById('search-loader');
  const loaderText = document.getElementById('loader-text');
  const resultsTableContainer = document.getElementById('results-table-container');
  const resultsTbody = document.getElementById('results-tbody');
  const masterCheckbox = document.getElementById('master-checkbox');

  const formatSelect = document.getElementById('aero-format-select');
  const qualitySelect = document.getElementById('aero-quality-select');

  const downloadModal = document.getElementById('download-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const modalStatusText = document.getElementById('modal-status-text');
  const modalTrackCount = document.getElementById('modal-track-count');
  const modalProgressFill = document.getElementById('modal-progress-fill');
  const modalCurrentTrack = document.getElementById('modal-current-track');
  const modalCompletedList = document.getElementById('modal-completed-list');

  const libraryTbody = document.getElementById('library-tbody');
  const btnRefreshLibrary = document.getElementById('btn-refresh-library');
  const libCountBadge = document.getElementById('lib-count-badge');

  const audioPlayerBar = document.getElementById('audio-player-bar');
  const audioElement = document.getElementById('html5-audio-element');
  const playerThumb = document.getElementById('player-thumb');
  const playerTitle = document.getElementById('player-title');
  const playerArtist = document.getElementById('player-artist');
  const playerPlayBtn = document.getElementById('player-play');
  const playerSeek = document.getElementById('player-seek');
  const playerCurrentTime = document.getElementById('player-current-time');
  const playerTotalTime = document.getElementById('player-total-time');
  const playerVolume = document.getElementById('player-volume');

  const placeholders = {
    artist: "Search by Artist (e.g., Rihanna, Daft Punk, Coldplay)...",
    album: "Search by Album (e.g., A Girl Like Me, Discovery, Thriller)...",
    genre: "Search by Genre (e.g., Chill Vibes, Synthwave, Jazz, Rock)...",
    track: "Search by Song Title (e.g., We Ride, Get Lucky, Umbrella)..."
  };

  navHome.addEventListener('click', () => switchTab('search-tab'));
  navLibrary.addEventListener('click', () => {
    switchTab('library-tab');
    loadLibrary();
  });

  function switchTab(tabId) {
    navHome.classList.remove('active');
    navLibrary.classList.remove('active');
    searchTab.classList.remove('active');
    libraryTab.classList.remove('active');

    if (tabId === 'search-tab') {
      navHome.classList.add('active');
      searchTab.classList.add('active');
    } else {
      navLibrary.classList.add('active');
      libraryTab.classList.add('active');
    }
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-category');
      searchInput.placeholder = placeholders[currentCategory] || placeholders.artist;
    });
  });

  window.quickSearch = (category, query) => {
    currentCategory = category;
    filterPills.forEach(p => {
      if (p.getAttribute('data-category') === category) p.classList.add('active');
      else p.classList.remove('active');
    });
    searchInput.placeholder = placeholders[category];
    searchInput.value = query;
    performSearch(query, category);
  };

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      performSearch(query, currentCategory);
    }
  });

  async function performSearch(query, category) {
    resultsTableContainer.classList.add('hidden');
    resultsTbody.innerHTML = '';
    searchLoader.classList.remove('hidden');
    loaderText.innerText = `Scraping YouTube Music for ${category} '${query}'...`;

    selectedTrackMap.clear();
    updateBatchControls();

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: category, query: query })
      });

      const data = await response.json();
      searchLoader.classList.add('hidden');

      if (data.error) {
        alert("Search error: " + data.error);
        return;
      }

      renderSearchResults(data, category, query);
    } catch (err) {
      searchLoader.classList.add('hidden');
      alert("Failed to connect to scraper API.");
    }
  }

  function renderSearchResults(data, category, query) {
    resultsTbody.innerHTML = '';
    currentSearchResults = [];

    let coverUrl = '/static/img/default-art.png';
    let titleText = query;
    let artistText = "YouTube Music";
    let metaText = "Results List";

    if (category === 'artist' && data.artists && data.artists.length > 0) {
      const artist = data.artists[0];
      titleText = artist.name;
      artistText = "Artist • " + (artist.subscribers || "Popular Artist");

      if (artist.thumbnails && artist.thumbnails.length > 0) {
        coverUrl = artist.thumbnails[artist.thumbnails.length - 1].url;
      }

      currentSearchResults = artist.songs || [];
      metaText = `${currentSearchResults.length} Top Tracks`;

    } else if (category === 'album' && data.albums && data.albums.length > 0) {
      const album = data.albums[0];
      titleText = album.title;
      artistText = album.artist || "Artist";

      if (album.thumbnails && album.thumbnails.length > 0) {
        coverUrl = album.thumbnails[album.thumbnails.length - 1].url;
      }

      currentSearchResults = album.tracks || [];
      metaText = `${album.year || 'Album'} • ${currentSearchResults.length} songs`;

    } else if (data.songs) {
      currentSearchResults = data.songs;
      titleText = `${category.toUpperCase()}: ${query}`;
      metaText = `${currentSearchResults.length} tracks found`;

      if (currentSearchResults.length > 0 && currentSearchResults[0].thumbnails) {
        coverUrl = currentSearchResults[0].thumbnails[0].url;
      }
    }

    heroTypeLabel.innerText = category.toUpperCase();
    heroTitle.innerText = titleText;
    heroArtistName.innerText = artistText;
    heroMetaInfo.innerText = metaText;
    heroCoverImg.src = coverUrl;

    currentSearchResults.forEach((track, idx) => {
      resultsTbody.appendChild(createTrackRow(track, idx + 1));
    });

    resultsTableContainer.classList.remove('hidden');
  }

  function createTrackRow(track, index) {
    const tr = document.createElement('tr');
    const trackId = track.videoId || track.id;

    const thumb = (track.thumbnails && track.thumbnails.length > 0)
      ? track.thumbnails[track.thumbnails.length - 1].url
      : '/static/img/default-art.png';

    tr.innerHTML = `
      <td class="col-check">
        <input type="checkbox" class="track-checkbox" data-id="${trackId}">
      </td>
      <td class="col-num">${index}</td>
      <td class="col-title">
        <div class="track-row-title">
          <img src="${thumb}" alt="${escapeHtml(track.title)}" onerror="this.src='/static/img/default-art.png'">
          <div class="track-names">
            <h4>${escapeHtml(track.title)}</h4>
            <p>${escapeHtml(track.artist)}</p>
          </div>
        </div>
      </td>
      <td class="col-album">${escapeHtml(track.album || 'Single')}</td>
      <td class="col-duration">${track.duration || 'N/A'}</td>
      <td class="col-action">
        <button class="btn-row-dl">
          <i class="fa-solid fa-download"></i> Download
        </button>
      </td>
    `;

    const checkbox = tr.querySelector('.track-checkbox');
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        selectedTrackMap.set(trackId, track);
      } else {
        selectedTrackMap.delete(trackId);
      }
      updateBatchControls();
    });

    tr.addEventListener('click', (e) => {
      if (!e.target.closest('input') && !e.target.closest('button')) {
        playTrackPreview(track, thumb);
      }
    });

    const downloadBtn = tr.querySelector('.btn-row-dl');
    downloadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerBatchDownload([track]);
    });

    return tr;
  }

  function updateBatchControls() {
    const count = selectedTrackMap.size;
    selectedCountSpan.innerText = count;
    btnHeroDownloadAll.disabled = (count === 0);
  }

  if (masterCheckbox) {
    masterCheckbox.addEventListener('change', () => {
      const checkboxes = document.querySelectorAll('.track-checkbox');
      checkboxes.forEach(cb => {
        cb.checked = masterCheckbox.checked;
        const trackId = cb.getAttribute('data-id');
        const track = currentSearchResults.find(t => (t.videoId || t.id) === trackId);
        if (masterCheckbox.checked && track) {
          selectedTrackMap.set(trackId, track);
        } else {
          selectedTrackMap.delete(trackId);
        }
      });
      updateBatchControls();
    });
  }

  btnHeroSelectAll.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.track-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    checkboxes.forEach(cb => {
      cb.checked = !allChecked;
      const trackId = cb.getAttribute('data-id');
      const track = currentSearchResults.find(t => (t.videoId || t.id) === trackId);
      if (!allChecked && track) {
        selectedTrackMap.set(trackId, track);
      } else {
        selectedTrackMap.delete(trackId);
      }
    });

    updateBatchControls();
  });

  btnHeroPlay.addEventListener('click', () => {
    if (currentSearchResults.length > 0) {
      triggerBatchDownload(currentSearchResults);
    }
  });

  btnHeroDownloadAll.addEventListener('click', () => {
    const tracks = Array.from(selectedTrackMap.values());
    if (tracks.length > 0) {
      triggerBatchDownload(tracks);
    }
  });

  async function triggerBatchDownload(tracks) {
    const format = formatSelect.value;
    const quality = qualitySelect.value;

    openDownloadModal(tracks.length);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracks: tracks,
          format: format,
          quality: quality
        })
      });

      const data = await response.json();
      if (data.job_id) {
        startPollingJobStatus(data.job_id);
      } else {
        alert("Failed to initiate download job.");
        closeDownloadModal();
      }
    } catch (err) {
      alert("Error contacting download server.");
      closeDownloadModal();
    }
  }

  function openDownloadModal(totalTracks) {
    downloadModal.classList.remove('hidden');
    modalStatusText.innerText = "Initializing Parallel Stream Extractor...";
    modalTrackCount.innerText = `0 / ${totalTracks}`;
    modalProgressFill.style.width = '0%';
    modalCurrentTrack.innerText = "Connecting to YouTube...";
    modalCompletedList.innerHTML = '';
  }

  function closeDownloadModal() {
    downloadModal.classList.add('hidden');
    if (currentPollInterval) clearInterval(currentPollInterval);
  }

  btnCloseModal.addEventListener('click', closeDownloadModal);

  function startPollingJobStatus(jobId) {
    if (currentPollInterval) clearInterval(currentPollInterval);

    currentPollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/download/status/${jobId}`);
        const job = await res.json();

        if (job.error) {
          clearInterval(currentPollInterval);
          modalStatusText.innerText = "Job Error: " + job.error;
          return;
        }

        modalStatusText.innerText = job.status === 'completed' ? " ALL TRACKS DOWNLOADED & TAGGED!" : "FAST MULTI-THREADED DOWNLOADING...";
        modalTrackCount.innerText = `${job.completed} / ${job.total}`;

        let overallPercent = ((job.completed / job.total) * 100) + ((job.current_percent / job.total) * 0.9);
        modalProgressFill.style.width = `${Math.min(100, Math.round(overallPercent))}%`;
        modalCurrentTrack.innerText = job.current_track ? `Current: ${job.current_track}` : '';

        if (job.files && job.files.length > 0) {
          modalCompletedList.innerHTML = job.files.map(f => `
            <div class="modal-item-row">
              <span><i class="fa-solid fa-circle-check" style="color: #7cf03d;"></i> ${escapeHtml(f.title)}</span>
              <a href="/api/download_file/${encodeURIComponent(f.relative_path)}" class="btn-row-dl" download>Save File</a>
            </div>
          `).join('');
        }

        if (job.status === 'completed') {
          clearInterval(currentPollInterval);
          loadLibrary();
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1500);
  }

  async function loadLibrary() {
    try {
      const res = await fetch('/api/library');
      const data = await res.json();

      libraryTbody.innerHTML = '';
      libCountBadge.innerText = data.total || 0;

      if (!data.files || data.files.length === 0) {
        libraryTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px;">No downloaded tracks yet in library.</td></tr>`;
        return;
      }

      data.files.forEach((file, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="col-num">${idx + 1}</td>
          <td class="col-title">
            <div class="track-row-title">
              <img src="/static/img/default-art.png" alt="Cover">
              <div class="track-names">
                <h4>${escapeHtml(file.title)}</h4>
                <p>${escapeHtml(file.artist)}</p>
              </div>
            </div>
          </td>
          <td class="col-album">${escapeHtml(file.album)}</td>
          <td class="col-duration">${file.ext} (${file.size_mb} MB)</td>
          <td class="col-action">
            <div class="hero-action-row" style="gap: 6px;">
              <button class="aero-glass-btn icon-only btn-play-lib" title="Play audio">
                <i class="fa-solid fa-play"></i>
              </button>
              <a href="/api/download_file/${encodeURIComponent(file.relative_path)}" class="aero-glass-btn icon-only" title="Download to PC" download>
                <i class="fa-solid fa-download"></i>
              </a>
              <button class="aero-glass-btn icon-only btn-delete-lib" style="color: #ff5555;" title="Delete file">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        `;

        tr.querySelector('.btn-play-lib').addEventListener('click', () => {
          playAudioFile(`/api/stream/${encodeURIComponent(file.relative_path)}`, file.title, file.artist);
        });

        tr.querySelector('.btn-delete-lib').addEventListener('click', async () => {
          if (confirm(`Delete '${file.title}'?`)) {
            await fetch('/api/delete_file', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ relative_path: file.relative_path })
            });
            loadLibrary();
          }
        });

        libraryTbody.appendChild(tr);
      });
    } catch (err) {
      console.error("Failed to load library:", err);
    }
  }

  btnRefreshLibrary.addEventListener('click', loadLibrary);
  loadLibrary();

  function playTrackPreview(track, thumb) {
    audioPlayerBar.classList.remove('hidden');
    playerTitle.innerText = track.title;
    playerArtist.innerText = track.artist;
    playerThumb.src = thumb;

    playerPlayBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';

    fetch(`/api/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tracks: [track], format: 'mp3', quality: '192' })
    }).then(r => r.json()).then(data => {
      if (data.job_id) {
        const interval = setInterval(async () => {
          const st = await fetch(`/api/download/status/${data.job_id}`).then(r => r.json());
          if (st.status === 'completed' && st.files.length > 0) {
            clearInterval(interval);
            playAudioFile(`/api/stream/${encodeURIComponent(st.files[0].relative_path)}`, track.title, track.artist, thumb);
          }
        }, 1000);
      }
    });
  }

  function playAudioFile(url, title, artist, thumb = '/static/img/default-art.png') {
    audioPlayerBar.classList.remove('hidden');
    playerTitle.innerText = title;
    playerArtist.innerText = artist;
    playerThumb.src = thumb;

    audioElement.src = url;
    audioElement.play();
    playerPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  }

  playerPlayBtn.addEventListener('click', () => {
    if (audioElement.paused) {
      audioElement.play();
      playerPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else {
      audioElement.pause();
      playerPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
  });

  audioElement.addEventListener('timeupdate', () => {
    if (audioElement.duration) {
      const pct = (audioElement.currentTime / audioElement.duration) * 100;
      playerSeek.value = pct;
      playerCurrentTime.innerText = formatTime(audioElement.currentTime);
      playerTotalTime.innerText = formatTime(audioElement.duration);
    }
  });

  playerSeek.addEventListener('input', () => {
    if (audioElement.duration) {
      audioElement.currentTime = (playerSeek.value / 100) * audioElement.duration;
    }
  });

  playerVolume.addEventListener('input', () => {
    audioElement.volume = playerVolume.value;
  });

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
});
