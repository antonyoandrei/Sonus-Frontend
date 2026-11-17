import React, { type ReactNode } from "react";
import { ArrowUpRight, Clock3, Pause, Play, Plus } from "lucide";
import { MorphIcon } from "morphicons/react";
import { Link } from "react-router-dom";
import type {
  EditorialArtist,
  EditorialArtistCardVariant,
  EditorialCrop,
  EditorialPlaylist,
  EditorialRelease,
  EditorialTone,
  EditorialTrack,
} from "../../editorial/editorial-data";
import "./brand-ui.css";

export { Field } from "./Field";

export type ArtworkRatio = "square" | "portrait" | "landscape";

export const Artwork = ({
  crop = "center",
  imageUrl,
  label,
  physicalCover = false,
  priority = false,
  ratio = "square",
  tone = "coral",
}: {
  crop?: EditorialCrop;
  imageUrl?: string | null;
  label: string;
  physicalCover?: boolean;
  priority?: boolean;
  ratio?: ArtworkRatio;
  tone?: EditorialTone;
}) => {
  const monogram = label
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <span
      aria-label={imageUrl ? undefined : label}
      className={`brand-artwork brand-artwork--${ratio} brand-artwork--crop-${crop} brand-tone--${tone}${imageUrl ? " has-image" : ""}${physicalCover ? " brand-artwork--physical-cover" : ""}`}
      role={imageUrl ? undefined : "img"}
    >
      {imageUrl ? (
        <img alt={label} decoding="async" loading={priority ? "eager" : "lazy"} src={imageUrl} />
      ) : (
        <>
          <span className="brand-artwork__monogram" aria-hidden="true">{monogram}</span>
          <span className="brand-artwork__signal" aria-hidden="true" />
        </>
      )}
      {physicalCover && <span className="brand-artwork__bezel" aria-hidden="true" />}
    </span>
  );
};

export const PageIntro = ({
  actions,
  eyebrow,
  title,
  children,
}: {
  actions?: ReactNode;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) => (
  <header className="brand-page-intro">
    <div>
      <p className="brand-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <div className="brand-page-intro__copy">{children}</div>
    </div>
    {actions && <div className="brand-page-intro__actions">{actions}</div>}
  </header>
);

export const SectionHeading = ({
  eyebrow,
  title,
  link,
}: {
  eyebrow?: string;
  title: string;
  link?: { label: string; to: string };
}) => (
  <header className="brand-section-heading">
    <div>
      {eyebrow && <p className="brand-eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
    </div>
    {link && (
      <Link className="brand-text-link" to={link.to}>
        {link.label}
        <MorphIcon icon={ArrowUpRight} size={17} strokeWidth={1.8} reducedMotion="user" />
      </Link>
    )}
  </header>
);

export const ArtistCard = ({
  artist,
  priority = false,
}: {
  artist: EditorialArtist;
  priority?: boolean;
  variant?: EditorialArtistCardVariant;
}) => {
  const imageUrl = artist.portraitUrl ?? artist.imageUrl ?? artist.heroUrl;

  return (
    <Link className="brand-artist-card" to={`/artist/${artist.id}`}>
      <span className="brand-artist-card__media">
        <Artwork
          crop={artist.crop}
          imageUrl={imageUrl}
          label={artist.name}
          priority={priority}
          ratio="square"
          tone={artist.tone}
        />
      </span>
      <span className="brand-artist-card__copy">
        <strong>{artist.name}</strong>
        <small>Artista</small>
      </span>
    </Link>
  );
};

export const MediaShelf = ({ children }: { children: ReactNode }) => (
  <div className="brand-shelf">{children}</div>
);

export type ReleaseCardVariant = "grid" | "feature";

export const ReleaseCard = ({
  priority = false,
  release,
  variant = "grid",
}: {
  priority?: boolean;
  release: EditorialRelease;
  variant?: ReleaseCardVariant;
}) => (
  <Link className={`brand-release-card brand-release-card--${variant}`} to={`/album/${release.id}`}>
    <span className="brand-release-card__media">
      <Artwork
        crop={release.crop}
        imageUrl={release.coverUrl ?? release.imageUrl}
        label={`${release.title}, de ${release.artist}`}
        physicalCover
        priority={priority}
        ratio="square"
        tone={release.tone}
      />
      <span className="brand-play-fab" aria-hidden="true">
        <MorphIcon icon={Play} size={16} strokeWidth={2.2} reducedMotion="user" />
      </span>
      {release.status === "preview" && <span className="brand-preview-label">Próximamente</span>}
    </span>
    <span className="brand-release-card__copy">
      <span className="brand-release-card__identity">
        <strong>{release.title}</strong>
        <span>{release.artist}</span>
      </span>
      <small>{release.format} · {release.year}</small>
      {variant === "feature" && (
        <span className="brand-card-arrow" aria-hidden="true">
          <MorphIcon icon={ArrowUpRight} size={18} strokeWidth={1.7} reducedMotion="user" />
        </span>
      )}
    </span>
  </Link>
);

export const PlaylistCard = ({ playlist }: { playlist: EditorialPlaylist }) => (
  <Link className="brand-playlist-card" to={`/playlist/${playlist.id}`}>
    <span className="brand-playlist-card__media">
      <Artwork
        crop={playlist.crop}
        imageUrl={playlist.coverUrl ?? playlist.imageUrl}
        label={`Portada de ${playlist.title}`}
        physicalCover
        ratio="square"
        tone={playlist.tone}
      />
      <span className="brand-play-fab" aria-hidden="true">
        <MorphIcon icon={Play} size={16} strokeWidth={2.2} reducedMotion="user" />
      </span>
    </span>
    <span className="brand-playlist-card__body">
      <span>
        <small>{playlist.eyebrow ?? "Selección Sonus"}</small>
        <strong>{playlist.title}</strong>
      </span>
      {playlist.description && <p>{playlist.description}</p>}
      <span className="brand-playlist-card__footer">
        <small>{playlist.count}</small>
        <span className="brand-card-arrow" aria-hidden="true">
          <MorphIcon icon={ArrowUpRight} size={18} strokeWidth={1.7} reducedMotion="user" />
        </span>
      </span>
    </span>
  </Link>
);

export const TrackList = ({
  activeId,
  onAdd,
  onPlay,
  tracks,
}: {
  activeId?: string | null;
  onAdd?: (track: EditorialTrack, index: number) => void;
  onPlay?: (track: EditorialTrack, index: number) => void;
  tracks: EditorialTrack[];
}) => (
  <ol className="brand-track-list">
    {tracks.map((track, index) => {
      const isActive = activeId === track.id;
      const rowClassName = [
        isActive ? "is-active" : "",
        onPlay ? "has-action" : "is-preview",
        onAdd ? "has-add" : "",
      ].filter(Boolean).join(" ");

      return (
        <li className={rowClassName} key={track.id}>
          <button
            aria-label={onPlay ? `${isActive ? "Pausar" : "Reproducir"} ${track.title}` : `${track.title}, audio próximamente`}
            className="brand-track-list__play"
            disabled={!onPlay}
            onClick={() => onPlay?.(track, index)}
            type="button"
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <MorphIcon icon={isActive ? Pause : Play} size={17} strokeWidth={1.8} reducedMotion="user" />
          </button>
          <span className="brand-track-list__art">
            <Artwork
              imageUrl={track.coverUrl ?? track.imageUrl}
              label={`${track.album}, de ${track.artist}`}
              physicalCover
              ratio="square"
              tone={track.tone}
            />
          </span>
          <span className="brand-track-list__title">
            <strong>{track.title}</strong>
            <span>{track.artist}</span>
          </span>
          <span className="brand-track-list__album">{track.album}</span>
          <span className="brand-track-list__duration">
            <MorphIcon icon={Clock3} size={14} strokeWidth={1.7} reducedMotion="user" />
            {track.duration}
          </span>
          {onAdd && (
            <button aria-label={`Añadir ${track.title}`} className="brand-track-list__add" onClick={() => onAdd(track, index)} type="button">
              <MorphIcon icon={Plus} size={17} strokeWidth={1.8} reducedMotion="user" />
            </button>
          )}
        </li>
      );
    })}
  </ol>
);

export const BrandNotice = ({
  action,
  eyebrow = "Vista previa",
  title,
  children,
}: {
  action?: ReactNode;
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) => (
  <section className="brand-notice">
    <span className="brand-notice__signal" aria-hidden="true">S</span>
    <div>
      <p className="brand-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
    {action}
  </section>
);

export const LoadingGrid = () => (
  <div className="brand-loading-grid" aria-label="Cargando contenido">
    {Array.from({ length: 4 }, (_, index) => <span key={index} />)}
  </div>
);
