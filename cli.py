import sys
import os
import argparse
from yt_music_scraper import YTMusicScraper

def print_header():
    print("=" * 60)
    print("       YOUTUBE MUSIC SCRAPER & DOWNLOADER ")
    print("=" * 60)

def main():
    parser = argparse.ArgumentParser(description="Scrape and download music from YouTube by Artist, Album, or Genre.")
    parser.add_argument("-a", "--artist", help="Search by artist name")
    parser.add_argument("-l", "--album", help="Search by album name")
    parser.add_argument("-g", "--genre", help="Search by genre")
    parser.add_argument("-q", "--query", help="General search query")
    parser.add_argument("-f", "--format", default="mp3", choices=["mp3", "m4a", "flac", "wav", "opus"], help="Audio format (default: mp3)")
    parser.add_argument("-k", "--quality", default="320", choices=["320", "256", "192", "128"], help="Audio quality in kbps (default: 320)")
    parser.add_argument("--limit", type=int, default=10, help="Max search results (default: 10)")
    parser.add_argument("--download-all", action="store_true", help="Automatically download all found search results")
    parser.add_argument("-o", "--output", default="downloads", help="Output download directory (default: downloads)")
    parser.add_argument("-i", "--interactive", action="store_true", help="Launch interactive menu mode")

    args = parser.parse_args()

    scraper = YTMusicScraper(download_dir=args.output)

    if args.artist or args.album or args.genre or args.query:
        run_cli_search(scraper, args)
    else:
        run_interactive_menu(scraper, args)

def run_cli_search(scraper, args):
    print_header()
    tracks_to_download = []
    subfolder = ""

    if args.artist:
        print(f" Searching Artist: '{args.artist}'...")
        res = scraper.search_artist(args.artist, limit=args.limit)
        artists = res.get("artists", [])
        if not artists:
            print(" No artists found.")
            return

        artist = artists[0]
        subfolder = scraper.sanitize_filename(artist.get("name", args.artist))
        print(f"\n Artist Found: {artist.get('name')}")

        songs = artist.get("songs", [])
        print(f" Top Songs ({len(songs)}):")
        for idx, s in enumerate(songs, 1):
            print(f"  [{idx}] {s.get('title')} - {s.get('artist')} ({s.get('duration')})")
            tracks_to_download.append(s)

    elif args.album:
        print(f" Searching Album: '{args.album}'...")
        res = scraper.search_album(args.album, limit=args.limit)
        albums = res.get("albums", [])
        if not albums:
            print(" No albums found.")
            return

        album = albums[0]
        subfolder = os.path.join(
            scraper.sanitize_filename(album.get("artist", "Unknown")),
            scraper.sanitize_filename(album.get("title", args.album))
        )
        print(f"\n Album Found: {album.get('title')} by {album.get('artist')} ({album.get('year')})")

        tracks = album.get("tracks", [])
        print(f" Tracks ({len(tracks)}):")
        for idx, t in enumerate(tracks, 1):
            print(f"  [{idx}] {t.get('title')} - {t.get('artist')} ({t.get('duration')})")
            tracks_to_download.append(t)

    elif args.genre:
        print(f" Searching Genre: '{args.genre}'...")
        res = scraper.search_genre(args.genre, limit=args.limit)
        subfolder = scraper.sanitize_filename(args.genre)
        songs = res.get("songs", [])
        print(f"\n Top Genre Tracks ({len(songs)}):")
        for idx, s in enumerate(songs, 1):
            print(f"  [{idx}] {s.get('title')} - {s.get('artist')} ({s.get('duration')})")
            tracks_to_download.append(s)

    elif args.query:
        print(f" Searching: '{args.query}'...")
        res = scraper.search_tracks(args.query, limit=args.limit)
        songs = res.get("songs", [])
        print(f"\n Search Results ({len(songs)}):")
        for idx, s in enumerate(songs, 1):
            print(f"  [{idx}] {s.get('title')} - {s.get('artist')} ({s.get('duration')})")
            tracks_to_download.append(s)

    if not tracks_to_download:
        print(" No tracks available for download.")
        return

    selected_tracks = []
    if args.download_all:
        selected_tracks = tracks_to_download
    else:
        print("\nEnter track numbers to download (e.g. 1,3,5 or 1-5 or 'all' or 'q' to quit):")
        choice = input("Choice: ").strip()
        if choice.lower() in ["q", "quit", "exit"]:
            print("Bye!")
            return
        elif choice.lower() == "all":
            selected_tracks = tracks_to_download
        else:
            selected_tracks = parse_selection(choice, tracks_to_download)

    if not selected_tracks:
        print("No valid tracks selected.")
        return

    print(f"\n Downloading {len(selected_tracks)} track(s) in {args.format.upper()} @ {args.quality}kbps...")
    for idx, track in enumerate(selected_tracks, 1):
        print(f"\n[{idx}/{len(selected_tracks)}]  Downloading: {track.get('title')} - {track.get('artist')}...")

        def progress(d):
            if d.get("status") == "downloading":
                print(f"  Progress: {d.get('percent', 0)}%", end="\r")

        res = scraper.download_track(
            video_id_or_url=track.get("videoId") or track.get("url"),
            output_subfolder=subfolder,
            audio_format=args.format,
            audio_quality=args.quality,
            metadata=track,
            progress_callback=progress
        )
        if res.get("success"):
            print(f"   Saved to: {res.get('filepath')}")
        else:
            print(f"   Download failed: {res.get('error')}")

    print("\n Download task finished!")

def parse_selection(choice_str, items):
    selected = []
    parts = choice_str.split(",")
    for part in parts:
        part = part.strip()
        if "-" in part:
            try:
                start, end = map(int, part.split("-"))
                for idx in range(start, end + 1):
                    if 1 <= idx <= len(items):
                        selected.append(items[idx - 1])
            except ValueError:
                pass
        else:
            try:
                idx = int(part)
                if 1 <= idx <= len(items):
                    selected.append(items[idx - 1])
            except ValueError:
                pass
    return selected

def run_interactive_menu(scraper, args):
    while True:
        print_header()
        print("Choose an option:")
        print("  1. Search by Artist Name")
        print("  2. Search by Album Name")
        print("  3. Search by Music Genre")
        print("  4. Search by Track / Query")
        print("  5. View Downloaded Library")
        print("  6. Exit")

        choice = input("\nEnter choice (1-6): ").strip()
        if choice == "1":
            artist = input("Enter artist name: ").strip()
            if artist:
                args.artist = artist
                args.album = args.genre = args.query = None
                run_cli_search(scraper, args)
        elif choice == "2":
            album = input("Enter album name: ").strip()
            if album:
                args.album = album
                args.artist = args.genre = args.query = None
                run_cli_search(scraper, args)
        elif choice == "3":
            genre = input("Enter genre (e.g. Jazz, Rock, Pop, Synthwave): ").strip()
            if genre:
                args.genre = genre
                args.artist = args.album = args.query = None
                run_cli_search(scraper, args)
        elif choice == "4":
            query = input("Enter track or query: ").strip()
            if query:
                args.query = query
                args.artist = args.album = args.genre = None
                run_cli_search(scraper, args)
        elif choice == "5":
            print(f"\n Downloaded Files in '{scraper.download_dir}':")
            files_found = []
            for root, _, files in os.walk(scraper.download_dir):
                for f in files:
                    if f.endswith((".mp3", ".m4a", ".flac", ".wav", ".opus")):
                        rel_path = os.path.relpath(os.path.join(root, f), scraper.download_dir)
                        files_found.append(rel_path)
            if files_found:
                for idx, fn in enumerate(files_found, 1):
                    print(f"  {idx}. {fn}")
            else:
                print("  No music files found yet.")
            input("\nPress Enter to continue...")
        elif choice in ["6", "q", "exit"]:
            print("Goodbye!")
            break
        else:
            print("Invalid selection.")

if __name__ == "__main__":
    main()
