<p align="center">
  <img src="img/OhmWaveLogo.png" alt="OhmWave Logo" width="400" />
</p>

<h1 align="center" style="color: #2A835F;">OhmWave</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python 3.9+" />
  <img src="https://img.shields.io/badge/Flask-API-000000?style=flat-square&logo=flask&logoColor=white" alt="Flask" />
  <img src="https://img.shields.io/badge/React-UI-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/FFmpeg-Audio-007808?style=flat-square&logo=ffmpeg&logoColor=white" alt="FFmpeg" />
  <img src="https://img.shields.io/badge/yt--dlp-Scraper-FF0000?style=flat-square" alt="yt-dlp" />
</p>

OhmWave is a local music search and downloader built around YouTube Music. It provides both a Flask web application and a command-line interface for searching by artist, album, genre, or track, downloading audio, embedding metadata, and managing a local music library.

## Features

- Search YouTube Music by artist, album, genre, or general track query.
- Download audio as MP3, M4A, FLAC, WAV, or Opus.
- Select audio quality up to 320 kbps where supported by the source.
- Embed title, artist, album, year, and downloaded cover art into supported formats.
- Organize downloads by artist and album.
- View, stream, download, and delete files from the local library.
- Track multi-file download progress in the web interface.
- Use the interactive CLI or scripted command-line options.
- Fall back to `yt-dlp` search when the YouTube Music API lookup fails.

## Project structure

```text
.
├── app.py                 # Flask web server and JSON API
├── cli.py                 # Command-line and interactive interface
├── yt_music_scraper.py    # Search, download, conversion, and metadata logic
├── frontend/              # React + Vite frontend source and build output
├── templates/             # Flask fallback HTML template
├── static/                # Legacy/static frontend assets
├── bin/                   # Local ffmpeg and ffprobe binaries
└── downloads/             # Local music library (generated at runtime)
```

## Requirements

- Python 3.9 or newer
- Node.js and npm for frontend development/builds
- FFmpeg and FFprobe (the project currently includes binaries in `bin/`)
- Network access to YouTube and YouTube Music

The Python application imports these packages:

```bash
pip install flask requests ytmusicapi yt-dlp mutagen
```

The frontend dependencies are defined in [`frontend/package.json`](frontend/package.json).

## Web application

Install the frontend dependencies and build the React interface:

```bash
cd frontend
npm install
npm run build
cd ..
```

Start the Flask server from the project root:

```bash
python app.py
```

Then open <http://localhost:5000>. The server serves `frontend/dist/index.html` when the frontend has been built; otherwise it falls back to `templates/index.html`.

For frontend development, run Vite in a separate terminal:

```bash
cd frontend
npm run dev
```

## Command-line usage

Run the interactive menu:

```bash
python cli.py --interactive
```

Search for an artist and interactively select tracks:

```bash
python cli.py --artist "Rihanna"
```

Download every result for an album as FLAC:

```bash
python cli.py --album "Album Name" --download-all --format flac
```

Other supported options include:

```text
-a, --artist       Search by artist
-l, --album        Search by album
-g, --genre        Search by genre
-q, --query        General track search
-f, --format       mp3, m4a, flac, wav, or opus
-k, --quality      320, 256, 192, or 128 kbps
--limit            Maximum number of search results
--download-all     Download all search results
-o, --output       Download directory
-i, --interactive  Launch the interactive menu
```

## API routes

The Flask application exposes these routes for the web frontend:

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/search` | Search by track, artist, album, or genre |
| `GET` | `/api/album/<browse_id>` | Get tracks for an album |
| `POST` | `/api/download` | Start an asynchronous download job |
| `GET` | `/api/download/status/<job_id>` | Read download progress and results |
| `GET` | `/api/library` | List downloaded audio files |
| `GET` | `/api/stream/<path:filename>` | Stream a local audio file |
| `GET` | `/api/download_file/<path:filename>` | Download a local file to the browser |
| `POST` | `/api/delete_file` | Delete a local library file |

## Notes

- Downloads are written to `downloads/` by default and are intentionally ignored by Git.
- The current backend runs Flask with `debug=True` and is intended for local use. Review the configuration before exposing it to a network.
- You are responsible for complying with YouTube's terms, copyright law, and any applicable local regulations when using the downloader.

## License

No license has been declared for this project yet.
