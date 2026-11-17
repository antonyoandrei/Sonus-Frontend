import React from "react";
import { Play } from "lucide";
import { MorphIcon } from "morphicons/react";
import { Link } from "react-router-dom";
import {
  ArtistCard,
  MediaShelf,
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
  editorialTrackToCatalog,
} from "../../editorial/editorial-data";
import { usePlayer } from "../../utils/usePlayer";
import { useUserContext } from "../../utils/useUserContext";
import "./home.css";

const Home = () => {
  const { currentUser } = useUserContext();
  const { currentSong, playTrack } = usePlayer();
  const featured = editorialReleases.find((release) => release.id === "thriller") ?? editorialReleases[0];
  const featuredArtist = editorialArtists.find((artist) => artist.id === featured.artistId);
  const catalogTracks = editorialTracks.map(editorialTrackToCatalog);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <main className="home-listen">
      <header className="home-listen__intro">
        <p className="brand-eyebrow">Listen Now</p>
        <h1>{greeting}{currentUser ? `, ${currentUser.name.split(" ")[0]}` : ""}.</h1>
        <p>Recomendaciones, artistas y álbumes para seguir escuchando.</p>
      </header>

      <section className="home-featured">
        <Link className="home-featured__art" to={`/album/${featured.id}`}>
          <img
            alt={`Portada de ${featured.title}`}
            src={featured.coverUrl ?? featured.imageUrl ?? featuredArtist?.imageUrl}
          />
        </Link>
        <div className="home-featured__copy">
          <p>Álbum destacado</p>
          <h2>{featured.title}</h2>
          <Link to={`/artist/${featured.artistId}`}>{featured.artist}</Link>
          <p>{featuredArtist?.description ?? `${featured.format} · ${featured.year}`}</p>
          <button
            className="sonus-button sonus-button--light"
            onClick={() => playTrack(catalogTracks[2] ?? catalogTracks[0], catalogTracks)}
            type="button"
          >
            <MorphIcon icon={Play} size={16} strokeWidth={2} reducedMotion="user" />
            Escuchar
          </button>
        </div>
      </section>

      <section className="home-listen__section">
        <SectionHeading
          title="Hecho para ti"
          link={{ label: "Ver playlists", to: "/discover?view=playlists" }}
        />
        <MediaShelf>
          {editorialPlaylists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </MediaShelf>
      </section>

      <section className="home-listen__section">
        <SectionHeading title="Canciones para ti" />
        <TrackList
          activeId={currentSong?.id}
          onPlay={(_, index) => playTrack(catalogTracks[index], catalogTracks)}
          tracks={editorialTracks}
        />
      </section>

      <section className="home-listen__section">
        <SectionHeading
          title="Artistas"
          link={{ label: "Ver todos", to: "/discover?view=artists" }}
        />
        <MediaShelf>
          {editorialArtists.map((artist, index) => (
            <ArtistCard artist={artist} key={artist.id} priority={index < 3} />
          ))}
        </MediaShelf>
      </section>

      <section className="home-listen__section">
        <SectionHeading
          title="Álbumes para ti"
          link={{ label: "Novedades", to: "/new" }}
        />
        <MediaShelf>
          {editorialReleases.map((release) => (
            <ReleaseCard key={release.id} release={release} />
          ))}
        </MediaShelf>
      </section>
    </main>
  );
};

export default Home;
