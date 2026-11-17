import React, { useEffect, useMemo, useState } from "react";
import { Search as SearchIcon, X } from "lucide";
import { MorphIcon } from "morphicons/react";
import { useSearchParams } from "react-router-dom";
import { useCatalogSearch } from "../../catalog/catalog-hooks";
import type { CatalogTrack } from "../../catalog/catalog.types";
import {
  ArtistCard,
  BrandNotice,
  LoadingGrid,
  PlaylistCard,
  ReleaseCard,
  SectionHeading,
  TrackList,
} from "../../components/BrandUI/BrandUI";
import {
  editorialArtists,
  editorialPlaylists,
  editorialReleases,
  editorialTracks,
  type EditorialArtist,
  type EditorialPlaylist,
  type EditorialRelease,
  type EditorialTone,
  type EditorialTrack,
} from "../../editorial/editorial-data";
import { usePlayer } from "../../utils/usePlayer";
import "./search-page.css";

const tones: EditorialTone[] = ["coral", "blue", "lime", "sand", "violet", "ink"];

const normalize = (value: string) => value.trim().toLocaleLowerCase("es");

const useDebouncedValue = (value: string, delayMs = 280) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timeout);
  }, [delayMs, value]);
  return debounced;
};

const RemoteTrackResults = ({ tracks }: { tracks: CatalogTrack[] }) => {
  const { currentSong, playTrack } = usePlayer();
  const rows = useMemo<EditorialTrack[]>(() => tracks.map((track, index) => ({
    id: track.id,
    title: track.title,
    artist: track.artists.map((artist) => artist.name).join(", ") || "Artista por confirmar",
    album: track.album?.title ?? "Single",
    duration: track.durationMs
      ? `${Math.floor(track.durationMs / 60000)}:${String(Math.round(track.durationMs / 1000) % 60).padStart(2, "0")}`
      : "—",
    coverUrl: track.coverUrl ?? track.album?.coverUrl ?? undefined,
    tone: tones[index % tones.length],
  })), [tracks]);
  return <TrackList activeId={currentSong?.id} onPlay={(_, index) => playTrack(tracks[index], tracks)} tracks={rows} />;
};

const RemoteResults = ({ query }: { query: string }) => {
  const { data, error, reload, status } = useCatalogSearch(query);
  if (status === "loading") return <LoadingGrid />;
  if (error) {
    return (
      <div className="search-remote-note">
        <span>El catálogo conectado no ha respondido.</span>
        <button onClick={reload} type="button">Reintentar</button>
      </div>
    );
  }
  if (!data) return null;

  const artists: EditorialArtist[] = data.artists.map((artist, index) => ({
    id: artist.id,
    name: artist.name,
    description: "Artista del catálogo Sonus.",
    eyebrow: "Catálogo",
    imageUrl: artist.imageUrl ?? undefined,
    initials: artist.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2),
    tone: tones[index % tones.length],
    status: "published",
  }));
  const releases: EditorialRelease[] = data.albums.map((album, index) => ({
    id: album.id,
    title: album.title,
    artist: album.artists.map((artist) => artist.name).join(", ") || "Sonus",
    artistId: album.artists[0]?.id ?? "",
    format: "Álbum",
    year: album.year ? String(album.year) : "Fecha por confirmar",
    imageUrl: album.coverUrl ?? undefined,
    tone: tones[index % tones.length],
    status: "published",
  }));
  const playlists: EditorialPlaylist[] = data.playlists.map((playlist, index) => ({
    id: playlist.id,
    title: playlist.title,
    description: `Una selección de ${playlist.owner?.name ?? "Sonus"}.`,
    count: `${playlist.tracks.length} pistas`,
    eyebrow: playlist.owner?.name ? `De ${playlist.owner.name}` : "Playlist",
    imageUrl: playlist.coverUrl ?? undefined,
    tone: tones[index % tones.length],
  }));
  const hasResults = data.tracks.length || artists.length || releases.length || playlists.length;
  if (!hasResults) return null;

  return (
    <div className="search-results-groups">
      {data.tracks.length > 0 && (
        <section><SectionHeading eyebrow="Catálogo" title="Pistas" /><RemoteTrackResults tracks={data.tracks} /></section>
      )}
      {artists.length > 0 && (
        <section><SectionHeading eyebrow="Catálogo" title="Artistas" /><div className="search-artist-grid">{artists.map((artist) => <ArtistCard artist={artist} key={artist.id} />)}</div></section>
      )}
      {releases.length > 0 && (
        <section><SectionHeading eyebrow="Catálogo" title="Álbumes" /><div className="search-release-grid">{releases.map((release) => <ReleaseCard key={release.id} release={release} />)}</div></section>
      )}
      {playlists.length > 0 && (
        <section><SectionHeading eyebrow="Catálogo" title="Playlists" /><div className="search-playlist-grid">{playlists.map((playlist) => <PlaylistCard key={playlist.id} playlist={playlist} />)}</div></section>
      )}
    </div>
  );
};

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q") ?? "";
  const [input, setInput] = useState(queryFromUrl);
  const debouncedQuery = useDebouncedValue(input);
  const normalizedQuery = normalize(debouncedQuery);
  const canSearch = normalizedQuery.length >= 2;

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (debouncedQuery === current) return;
    setSearchParams(debouncedQuery.trim() ? { q: debouncedQuery.trim() } : {}, { replace: true });
  }, [debouncedQuery, searchParams, setSearchParams]);

  const editorialResults = useMemo(() => ({
    artists: editorialArtists.filter((artist) => normalize(`${artist.name} ${artist.description}`).includes(normalizedQuery)),
    releases: editorialReleases.filter((release) => normalize(`${release.title} ${release.artist} ${release.format}`).includes(normalizedQuery)),
    playlists: editorialPlaylists.filter((playlist) => normalize(`${playlist.title} ${playlist.description}`).includes(normalizedQuery)),
    tracks: editorialTracks.filter((track) => normalize(`${track.title} ${track.artist} ${track.album}`).includes(normalizedQuery)),
  }), [normalizedQuery]);
  const hasEditorialResults = Object.values(editorialResults).some((items) => items.length > 0);

  return (
    <main className="brand-page search-brand-page">
      <header className="search-brand-header">
        <p className="brand-eyebrow">Buscar en Sonus</p>
        <h1 className="search-visually-hidden">Buscar música en Sonus</h1>
        <label htmlFor="sonus-search">Artista, álbum, canción o estado de ánimo</label>
        <div className="search-brand-input">
          <MorphIcon icon={SearchIcon} size={28} strokeWidth={1.55} reducedMotion="user" />
          <input
            autoComplete="off"
            autoFocus
            id="sonus-search"
            onChange={(event) => setInput(event.target.value)}
            placeholder="¿Qué quieres escuchar?"
            type="search"
            value={input}
          />
          {input && (
            <button aria-label="Limpiar búsqueda" onClick={() => setInput("")} type="button">
              <MorphIcon icon={X} size={19} strokeWidth={1.8} reducedMotion="user" />
            </button>
          )}
        </div>
      </header>

      {!input && (
        <div className="search-start">
          <p>Prueba con</p>
          <div>
            {["Vera Sol", "Northline", "Ruta nocturna", "Neo soul", "Piano", "Electrónica"].map((suggestion) => (
              <button key={suggestion} onClick={() => setInput(suggestion)} type="button">{suggestion}</button>
            ))}
          </div>
          <section>
            <SectionHeading eyebrow="Para empezar" title="Búsquedas con una dirección" />
            <div className="search-playlist-grid">
              {editorialPlaylists.slice(0, 2).map((playlist) => <PlaylistCard key={playlist.id} playlist={playlist} />)}
            </div>
          </section>
        </div>
      )}

      {input && !canSearch && <p className="search-minimum">Escribe al menos dos caracteres.</p>}

      {canSearch && (
        <div className="search-results">
          <p className="search-results__count">Resultados para <strong>“{debouncedQuery.trim()}”</strong></p>
          {hasEditorialResults && (
            <div className="search-results-groups">
              {editorialResults.tracks.length > 0 && <section><SectionHeading eyebrow="Selección Sonus" title="Pistas" /><TrackList tracks={editorialResults.tracks} /></section>}
              {editorialResults.artists.length > 0 && <section><SectionHeading eyebrow="Selección Sonus" title="Artistas" /><div className="search-artist-grid">{editorialResults.artists.map((artist) => <ArtistCard artist={artist} key={artist.id} />)}</div></section>}
              {editorialResults.releases.length > 0 && <section><SectionHeading eyebrow="Selección Sonus" title="Álbumes" /><div className="search-release-grid">{editorialResults.releases.map((release) => <ReleaseCard key={release.id} release={release} />)}</div></section>}
              {editorialResults.playlists.length > 0 && <section><SectionHeading eyebrow="Selección Sonus" title="Playlists" /><div className="search-playlist-grid">{editorialResults.playlists.map((playlist) => <PlaylistCard key={playlist.id} playlist={playlist} />)}</div></section>}
            </div>
          )}
          <RemoteResults query={debouncedQuery.trim()} />
          {!hasEditorialResults && (
            <BrandNotice eyebrow="Sin coincidencias locales" title="Puede que esté en el catálogo conectado.">
              <p>Buscaremos también en la fuente musical configurada para Sonus. Si no responde, prueba con otro artista, álbum o género.</p>
            </BrandNotice>
          )}
        </div>
      )}
    </main>
  );
};

export default Search;
