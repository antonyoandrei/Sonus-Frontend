import React, { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide";
import { MorphIcon } from "morphicons/react";
import { Link, useParams } from "react-router-dom";
import liveCrowd from "../../assets/discovery/live-crowd.jpg";
import { useAuth } from "../../auth/useAuth";
import type { CatalogTrack } from "../../catalog/catalog.types";
import {
  BrandNotice,
  SectionHeading,
  TrackList,
} from "../../components/BrandUI/BrandUI";
import { editorialTracks, type EditorialTone, type EditorialTrack } from "../../editorial/editorial-data";
import { getLikedSongsByUserId } from "../../services/song.service";
import { usePlayer } from "../../utils/usePlayer";
import { useUserContext } from "../../utils/useUserContext";
import "./favourites-page.css";

const tones: EditorialTone[] = ["coral", "blue", "lime", "sand", "violet", "ink"];

const Favourites = () => {
  const { id } = useParams<{ id: string }>();
  const { getAccessTokenSilently } = useAuth();
  const { currentUser } = useUserContext();
  const { currentSong, playTrack } = usePlayer();
  const [tracks, setTracks] = useState<CatalogTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void getLikedSongsByUserId(id, getAccessTokenSilently)
      .then((items) => { if (active) setTracks(items); })
      .catch(() => { if (active) setTracks([]); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [getAccessTokenSilently, id]);

  const rows = useMemo<EditorialTrack[]>(() => tracks.map((track, index) => ({
    id: track.id,
    title: track.title,
    artist: track.artists.map((artist) => artist.name).join(", ") || "Sonus",
    album: track.album?.title ?? "Single",
    duration: track.durationMs ? `${Math.floor(track.durationMs / 60000)}:${String(Math.round(track.durationMs / 1000) % 60).padStart(2, "0")}` : "—",
    coverUrl: track.coverUrl ?? track.album?.coverUrl ?? undefined,
    tone: tones[index % tones.length],
  })), [tracks]);

  return (
    <main className="brand-page favourites-brand-page">
      <section className="favourites-brand-hero">
        <img src={liveCrowd} alt="Público iluminado durante un concierto" />
        <div>
          <span className="favourites-brand-icon"><MorphIcon icon={Heart} size={25} strokeWidth={1.6} reducedMotion="user" /></span>
          <p className="brand-eyebrow">Tu colección</p>
          <h1>Favoritas</h1>
          <p>Las canciones que {currentUser?.name ?? "tú"} ha decidido guardar cerca.</p>
          <small>{tracks.length} pistas</small>
        </div>
      </section>

      <section className="favourites-brand-list">
        <SectionHeading eyebrow="Guardadas" title="Canciones" />
        {isLoading ? (
          <div className="favourites-brand-skeleton"><span /><span /><span /></div>
        ) : rows.length ? (
          <TrackList activeId={currentSong?.id} onPlay={(_, index) => playTrack(tracks[index], tracks)} tracks={rows} />
        ) : (
          <BrandNotice
            action={<Link className="sonus-button sonus-button--line" to="/discover">Encontrar música</Link>}
            title="Todavía no has guardado ninguna canción."
          >
            <p>Cuando marques una pista como favorita aparecerá aquí, lista para volver a sonar.</p>
          </BrandNotice>
        )}
      </section>

      {!rows.length && (
        <section className="favourites-brand-list">
          <SectionHeading eyebrow="Mientras tanto" title="Una selección de muestra" />
          <TrackList tracks={editorialTracks.slice(0, 4)} />
        </section>
      )}
    </main>
  );
};

export default Favourites;
