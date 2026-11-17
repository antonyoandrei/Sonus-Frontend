import React, { useMemo } from "react";
import { ArrowLeft, Check, Heart, Play, RotateCw } from "lucide";
import { MorphIcon } from "morphicons/react";
import { Link, useParams } from "react-router-dom";
import {
  useCatalogAlbum,
  useCatalogArtist,
  useCatalogGenre,
  useCatalogPlaylist,
} from "../../catalog/catalog-hooks";
import type { CatalogAlbum, CatalogTrack } from "../../catalog/catalog.types";
import {
  Artwork,
  BrandNotice,
  LoadingGrid,
  ReleaseCard,
  SectionHeading,
  TrackList,
} from "../../components/BrandUI/BrandUI";
import {
  discoveryMoods,
  editorialPlaylists,
  editorialReleases,
  editorialTracks,
  editorialTrackToCatalog,
  findEditorialArtist,
  findEditorialPlaylist,
  findEditorialRelease,
  type EditorialArtistHeroVariant,
  type EditorialCrop,
  type EditorialRelease,
  type EditorialTone,
  type EditorialTrack,
} from "../../editorial/editorial-data";
import { usePlayer } from "../../utils/usePlayer";
import "./entity-pages.css";

const tones: EditorialTone[] = ["coral", "blue", "lime", "sand", "violet", "ink"];

const formatDuration = (durationMs: number | null): string => {
  if (!durationMs) return "—";
  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${String(totalSeconds % 60).padStart(2, "0")}`;
};

const toEditorialTracks = (tracks: CatalogTrack[]): EditorialTrack[] =>
  tracks.map((track, index) => ({
    id: track.id,
    title: track.title,
    artist: track.artists.map((artist) => artist.name).join(", ") || "Artista por confirmar",
    album: track.album?.title ?? "Single",
    duration: formatDuration(track.durationMs),
    coverUrl: track.coverUrl ?? track.album?.coverUrl ?? undefined,
    tone: tones[index % tones.length],
  }));

const toEditorialRelease = (album: CatalogAlbum, index: number): EditorialRelease => ({
  id: album.id,
  title: album.title,
  artist: album.artists.map((artist) => artist.name).join(", ") || "Sonus",
  artistId: album.artists[0]?.id ?? "",
  format: "Álbum",
  year: album.year ? String(album.year) : "Fecha por confirmar",
  coverUrl: album.coverUrl ?? undefined,
  tone: tones[index % tones.length],
  status: "published",
});

const CatalogTrackRows = ({ tracks }: { tracks: CatalogTrack[] }) => {
  const { currentSong, playTrack } = usePlayer();
  const rows = useMemo(() => toEditorialTracks(tracks), [tracks]);

  return (
    <TrackList
      activeId={currentSong?.id}
      onPlay={(_, index) => playTrack(tracks[index], tracks)}
      tracks={rows}
    />
  );
};

const BackLink = ({ to = "/discover" }: { to?: string }) => (
  <Link className="entity-back-link" to={to}>
    <MorphIcon icon={ArrowLeft} size={17} strokeWidth={1.8} reducedMotion="user" />
    Volver
  </Link>
);

const StatusBlock = ({
  error,
  loading,
  onRetry,
}: {
  error?: Error | null;
  loading: boolean;
  onRetry: () => void;
}) => {
  if (loading) return <LoadingGrid />;
  if (!error) return null;
  return (
    <BrandNotice
      action={(
        <button className="sonus-button sonus-button--line" onClick={onRetry} type="button">
          Reintentar
          <MorphIcon icon={RotateCw} size={17} strokeWidth={1.8} reducedMotion="user" />
        </button>
      )}
      eyebrow="Catálogo no disponible"
      title="No hemos podido abrir esta ficha."
    >
      <p>Comprueba la conexión con el catálogo y vuelve a intentarlo.</p>
    </BrandNotice>
  );
};

type HeroCopyProps = {
  description: string;
  eyebrow: string;
  stats: string[];
  title: string;
};

const HeroStats = ({ stats }: { stats: string[] }) => (
  <div className="entity-hero__stats">
    {stats.map((stat) => <span key={stat}>{stat}</span>)}
  </div>
);

const EntityHeroActions = ({
  onPlay,
  primaryLabel,
  saveLabel,
  savedLabel,
}: {
  onPlay?: () => void;
  primaryLabel: string;
  saveLabel: string;
  savedLabel: string;
}) => {
  const [isSaved, setIsSaved] = React.useState(false);

  return (
    <div className="entity-hero__actions">
      <button className="sonus-button sonus-button--light" onClick={() => onPlay ? onPlay() : document.getElementById("pistas")?.scrollIntoView({ behavior: "smooth" })} type="button">
        <MorphIcon icon={Play} size={17} strokeWidth={1.8} reducedMotion="user" />
        {primaryLabel}
      </button>
      <button
        aria-pressed={isSaved}
        className="sonus-button sonus-button--line"
        onClick={() => setIsSaved((value) => !value)}
        type="button"
      >
        <MorphIcon icon={isSaved ? Check : Heart} size={17} strokeWidth={1.8} reducedMotion="user" />
        {isSaved ? savedLabel : saveLabel}
      </button>
    </div>
  );
};

const ArtistHero = ({
  crop = "center",
  description,
  eyebrow,
  imageUrl,
  label,
  published = false,
  stats,
  title,
  tone,
  variant = "portrait",
  onPlay,
}: HeroCopyProps & {
  crop?: EditorialCrop;
  imageUrl?: string | null;
  label: string;
  onPlay?: () => void;
  published?: boolean;
  tone: EditorialTone;
  variant?: EditorialArtistHeroVariant;
}) => (
  <section className={`entity-hero entity-artist-hero entity-artist-hero--${variant}`}>
    <div className="entity-hero__art entity-artist-hero__art">
      <Artwork
        crop={crop}
        imageUrl={imageUrl}
        label={label}
        priority
        ratio="square"
        tone={tone}
      />
    </div>
    <div className="entity-hero__copy">
      <p className="brand-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <HeroStats stats={stats} />
      <EntityHeroActions
        onPlay={onPlay}
        primaryLabel={published ? "Escuchar" : "Ver adelanto"}
        saveLabel={published ? "Guardar artista" : "Seguir"}
        savedLabel={published ? "Guardado" : "Siguiendo"}
      />
    </div>
  </section>
);

const AlbumHero = ({
  coverUrl,
  crop = "center",
  description,
  eyebrow,
  published = false,
  stats,
  title,
  tone,
  onPlay,
}: HeroCopyProps & {
  coverUrl?: string | null;
  crop?: EditorialCrop;
  onPlay?: () => void;
  published?: boolean;
  tone: EditorialTone;
}) => (
  <section className="entity-hero entity-album-hero">
    <div className="entity-hero__art entity-cover-hero__art">
      <Artwork
        crop={crop}
        imageUrl={coverUrl}
        label={`Portada de ${title}`}
        physicalCover
        priority
        ratio="square"
        tone={tone}
      />

    </div>
    <div className="entity-hero__copy">
      <p className="brand-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <HeroStats stats={stats} />
      <EntityHeroActions
        onPlay={onPlay}
        primaryLabel={published ? "Escuchar" : "Ver adelanto"}
        saveLabel="Guardar álbum"
        savedLabel="Guardado"
      />
    </div>
  </section>
);

const PlaylistHero = ({
  coverUrl,
  crop = "center",
  description,
  eyebrow,
  stats,
  title,
  tone,
}: HeroCopyProps & {
  coverUrl?: string | null;
  crop?: EditorialCrop;
  tone: EditorialTone;
}) => (
  <section className="entity-hero entity-playlist-hero">
    <div className="entity-hero__art entity-cover-hero__art">
      <Artwork
        crop={crop}
        imageUrl={coverUrl}
        label={`Portada de ${title}`}
        physicalCover
        priority
        ratio="square"
        tone={tone}
      />

    </div>
    <div className="entity-hero__copy">
      <p className="brand-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <HeroStats stats={stats} />
      <EntityHeroActions
        primaryLabel="Escuchar"
        saveLabel="Guardar playlist"
        savedLabel="Guardada"
      />
    </div>
  </section>
);

const GenreHero = ({
  description,
  eyebrow,
  stats,
  title,
  tone,
}: HeroCopyProps & { tone: EditorialTone }) => (
  <section className={`entity-hero entity-genre-hero brand-tone--${tone}`}>
    <div className="entity-genre-hero__type" aria-hidden="true">
      <span>SONUS / TERRITORIO SONORO</span>
      <strong>{title.slice(0, 2)}</strong>
      <i>Selección abierta</i>
    </div>
    <div className="entity-hero__copy">
      <p className="brand-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <HeroStats stats={stats} />
      <EntityHeroActions
        primaryLabel="Escuchar territorio"
        saveLabel="Seguir territorio"
        savedLabel="Territorio seguido"
      />
    </div>
  </section>
);

const releaseLayout = (count: number): "solo" | "pair" | "rail" => {
  if (count <= 1) return "solo";
  if (count === 2) return "pair";
  return "rail";
};

const ReleaseCollection = ({ releases }: { releases: EditorialRelease[] }) => {
  if (!releases.length) {
    return (
      <BrandNotice eyebrow="Discografía" title="Los lanzamientos aparecerán aquí.">
        <p>Esta ficha ya forma parte de Sonus; su discografía se incorporará cuando llegue al catálogo.</p>
      </BrandNotice>
    );
  }

  const layout = releaseLayout(releases.length);
  return (
    <div className={`entity-release-grid entity-release-grid--${layout}`}>
      {releases.map((release) => (
        <ReleaseCard
          key={release.id}
          release={release}
          variant={layout === "solo" ? "feature" : "grid"}
        />
      ))}
    </div>
  );
};

const EditorialArtistPage = ({ id }: { id: string }) => {
  const { playTrack } = usePlayer();
  const artist = findEditorialArtist(id)!;
  const releases = editorialReleases.filter((release) => release.artistId === artist.id);
  const tracks = editorialTracks.filter((track) => track.artist === artist.name);
  const catalog = tracks.map(editorialTrackToCatalog);

  return (
    <main className="brand-page entity-page entity-page--artist">
      <BackLink />
      <ArtistHero
        crop={artist.heroCrop ?? artist.crop}
        description={artist.description}
        eyebrow={artist.eyebrow}
        imageUrl={artist.heroUrl ?? artist.portraitUrl ?? artist.imageUrl}
        label={artist.name}
        published={artist.status === "published"}
        stats={[`${releases.length || 1} lanzamiento${releases.length === 1 ? "" : "s"}`, artist.status === "published" ? "Archivo Sonus" : "Contenido de muestra"]}
        title={artist.name}
        tone={artist.tone}
        variant={artist.heroVariant}
        onPlay={() => catalog[0] && playTrack(catalog[0], catalog)}
      />
      <section className="entity-section" id="pistas">
        <SectionHeading eyebrow="Selección" title={tracks.length ? "Pistas para empezar" : "Primeras pistas, muy pronto"} />
        {tracks.length ? <TrackList tracks={tracks} /> : (
          <BrandNotice eyebrow="En preparación" title="Este mundo todavía está tomando forma.">
            <p>Las imágenes y nombres son placeholders editoriales. La música aparecerá aquí cuando el catálogo esté listo.</p>
          </BrandNotice>
        )}
      </section>
      <section className="entity-section">
        <SectionHeading eyebrow="Discografía" title="Lanzamientos" />
        <ReleaseCollection releases={releases} />
      </section>
    </main>
  );
};

const RemoteArtistPage = ({ id }: { id: string }) => {
  const { playTrack } = usePlayer();
  const { data: artist, error, reload, status } = useCatalogArtist(id);
  if (!artist) {
    return <main className="brand-page entity-page"><BackLink /><StatusBlock error={error} loading={status === "loading"} onRetry={reload} /></main>;
  }

  const releases = artist.albums.map((album, index) => toEditorialRelease(album, index));
  return (
    <main className="brand-page entity-page entity-page--artist">
      <BackLink />
      <ArtistHero
        description="Música, lanzamientos y pistas destacadas reunidas en una ficha creada para escuchar sin perder el contexto."
        eyebrow="Artista en Sonus"
        imageUrl={artist.imageUrl}
        label={artist.name}
        published
        stats={[`${artist.albums.length} álbumes`, `${artist.tracks.length} pistas`]}
        title={artist.name}
        tone="coral"
        variant="portrait"
        onPlay={() => artist.tracks[0] && playTrack(artist.tracks[0], artist.tracks)}
      />
      <section className="entity-section" id="pistas">
        <SectionHeading eyebrow="Selección" title="Pistas esenciales" />
        <CatalogTrackRows tracks={artist.tracks} />
      </section>
      <section className="entity-section">
        <SectionHeading eyebrow="Discografía" title="Álbumes" />
        <ReleaseCollection releases={releases} />
      </section>
    </main>
  );
};

export const ArtistPage = () => {
  const { id = "" } = useParams<{ id: string }>();
  return findEditorialArtist(id) ? <EditorialArtistPage id={id} /> : <RemoteArtistPage id={id} />;
};

const EditorialAlbumPage = ({ id }: { id: string }) => {
  const { playTrack } = usePlayer();
  const release = findEditorialRelease(id)!;
  const artist = findEditorialArtist(release.artistId);
  const tracks = editorialTracks.filter((track) => track.album === release.title);
  const catalog = tracks.map(editorialTrackToCatalog);
  return (
    <main className="brand-page entity-page entity-page--album">
      <BackLink to="/new" />
      <AlbumHero
        coverUrl={release.coverUrl ?? release.imageUrl}
        crop={release.crop}
        description={artist?.description ?? "Un lanzamiento seleccionado por Sonus."}
        eyebrow={`${release.format} · ${release.year}`}
        published={release.status === "published"}
        stats={[release.artist, tracks.length ? `${tracks.length} pistas de muestra` : "Tracklist en preparación"]}
        title={release.title}
        tone={release.tone}
        onPlay={() => catalog[0] && playTrack(catalog[0], catalog)}
      />
      <section className="entity-section entity-section--opening" id="pistas">
        <SectionHeading eyebrow="Tracklist" title={tracks.length ? "Dentro del lanzamiento" : "Todavía en el estudio"} />
        {tracks.length ? <TrackList tracks={tracks} /> : (
          <BrandNotice eyebrow="Contenido de muestra" title="La ficha está lista para recibir la música.">
            <p>Este lanzamiento es un placeholder que ayuda a probar la navegación y la identidad de Sonus.</p>
          </BrandNotice>
        )}
      </section>
      {artist && (
        <Link className="entity-related-artist" to={`/artist/${artist.id}`}>
          <Artwork
            crop={artist.heroCrop ?? artist.crop}
            imageUrl={artist.heroUrl ?? artist.portraitUrl ?? artist.imageUrl}
            label={artist.name}
            ratio="landscape"
            tone={artist.tone}
          />
          <span><small>Conoce al artista</small><strong>{artist.name}</strong></span>
        </Link>
      )}
    </main>
  );
};

const RemoteAlbumPage = ({ id }: { id: string }) => {
  const { playTrack } = usePlayer();
  const { data: album, error, reload, status } = useCatalogAlbum(id);
  if (!album) {
    return <main className="brand-page entity-page"><BackLink /><StatusBlock error={error} loading={status === "loading"} onRetry={reload} /></main>;
  }
  const artistNames = album.artists.map((artist) => artist.name).join(", ") || "Sonus";
  return (
    <main className="brand-page entity-page entity-page--album">
      <BackLink />
      <AlbumHero
        coverUrl={album.coverUrl}
        description={`Un lanzamiento de ${artistNames}, disponible en el catálogo Sonus.`}
        eyebrow={`Álbum · ${album.year ?? "Fecha por confirmar"}`}
        published
        stats={[artistNames, `${album.tracks.length} pistas`]}
        title={album.title}
        tone="blue"
        onPlay={() => album.tracks[0] && playTrack(album.tracks[0], album.tracks)}
      />
      <section className="entity-section entity-section--opening" id="pistas">
        <SectionHeading eyebrow="Tracklist" title="Dentro del álbum" />
        <CatalogTrackRows tracks={album.tracks} />
      </section>
    </main>
  );
};

export const AlbumPage = () => {
  const { id = "" } = useParams<{ id: string }>();
  return findEditorialRelease(id) ? <EditorialAlbumPage id={id} /> : <RemoteAlbumPage id={id} />;
};

const EditorialPlaylistPage = ({ id }: { id: string }) => {
  const playlist = findEditorialPlaylist(id)!;
  const offset = editorialPlaylists.findIndex((item) => item.id === id);
  const tracks = [...editorialTracks.slice(offset), ...editorialTracks.slice(0, offset)].slice(0, 5);
  return (
    <main className="brand-page entity-page entity-page--playlist">
      <BackLink />
      <PlaylistHero
        coverUrl={playlist.coverUrl ?? playlist.imageUrl}
        crop={playlist.crop}
        description={playlist.description}
        eyebrow="Playlist · Selección Sonus"
        stats={[playlist.count, "Curada por el equipo Sonus"]}
        title={playlist.title}
        tone={playlist.tone}
      />
      <section className="entity-section entity-section--opening" id="pistas">
        <SectionHeading eyebrow="Orden de escucha" title="La selección" />
        <TrackList tracks={tracks} />
      </section>
    </main>
  );
};

const RemotePlaylistPage = ({ id }: { id: string }) => {
  const { data: playlist, error, reload, status } = useCatalogPlaylist(id);
  if (!playlist) {
    return <main className="brand-page entity-page"><BackLink /><StatusBlock error={error} loading={status === "loading"} onRetry={reload} /></main>;
  }
  return (
    <main className="brand-page entity-page entity-page--playlist">
      <BackLink />
      <PlaylistHero
        coverUrl={playlist.coverUrl}
        description={`Una selección de ${playlist.owner?.name ?? "Sonus"} para escuchar de principio a fin.`}
        eyebrow="Playlist"
        stats={[`${playlist.tracks.length} pistas`, playlist.owner?.name ?? "Sonus"]}
        title={playlist.title}
        tone="violet"
      />
      <section className="entity-section entity-section--opening" id="pistas">
        <SectionHeading eyebrow="Orden de escucha" title="La selección" />
        <CatalogTrackRows tracks={playlist.tracks} />
      </section>
    </main>
  );
};

export const PlaylistPage = () => {
  const { id = "" } = useParams<{ id: string }>();
  return findEditorialPlaylist(id) ? <EditorialPlaylistPage id={id} /> : <RemotePlaylistPage id={id} />;
};

const RemoteGenrePage = ({ id }: { id: string }) => {
  const { data: genre, error, reload, status } = useCatalogGenre(id);
  if (!genre) {
    return <main className="brand-page entity-page"><BackLink /><StatusBlock error={error} loading={status === "loading"} onRetry={reload} /></main>;
  }
  return (
    <main className="brand-page entity-page entity-page--genre">
      <BackLink />
      <GenreHero
        description={`Una puerta de entrada a ${genre.name}: artistas, álbumes y pistas del catálogo reunidos por Sonus.`}
        eyebrow="Territorio sonoro"
        stats={[`${genre.artists.length} artistas`, `${genre.tracks.length} pistas`]}
        title={genre.name}
        tone="lime"
      />
      <section className="entity-section" id="pistas">
        <SectionHeading eyebrow="Selección" title="Empieza aquí" />
        <CatalogTrackRows tracks={genre.tracks} />
      </section>
    </main>
  );
};

export const GenrePage = () => {
  const { id = "" } = useParams<{ id: string }>();
  const mood = discoveryMoods.find((item) => item.id === id);
  if (!mood) return <RemoteGenrePage id={id} />;
  return (
    <main className="brand-page entity-page entity-page--genre">
      <BackLink />
      <GenreHero
        description={`${mood.copy}. Una selección de muestra construida para entrar por el estado de ánimo.`}
        eyebrow="Estado de escucha"
        stats={[mood.copy, "Selección Sonus"]}
        title={mood.title}
        tone={mood.tone}
      />
      <section className="entity-section" id="pistas">
        <SectionHeading eyebrow="Selección" title="Empieza aquí" />
        <TrackList tracks={editorialTracks.slice(0, 5)} />
      </section>
    </main>
  );
};
