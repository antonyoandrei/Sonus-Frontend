import React, { useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./main.card.css";
import { useCatalogHome } from "../../catalog/catalog-hooks";
import type { CatalogTrack } from "../../catalog/catalog.types";
import { usePlayer } from "../../utils/usePlayer";
import CatalogState from "../CatalogState/CatalogState";
import Footer from "../Footer/Footer";
import ProfileModal from "../ProfileModal/ProfileModal";

const MainCard = () => {
  const { data: home, error, reload, status } = useCatalogHome();
  const { playTrack } = usePlayer();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const mostPlayed = useMemo(
    () => [...(home?.tracks ?? [])]
      .sort((left, right) => right.playCount - left.playCount)
      .slice(0, 9),
    [home?.tracks],
  );

  const handleTrack = (track: CatalogTrack) => {
    if (isAuthenticated) {
      playTrack(track, mostPlayed);
    } else {
      toast.error(t("You need to log in!"));
    }
  };

  const isEmpty = Boolean(
    home &&
    home.tracks.length === 0 &&
    home.albums.length === 0 &&
    home.artists.length === 0 &&
    home.playlists.length === 0 &&
    home.genres.length === 0,
  );

  return (
    <main className="card-main">
      <ProfileModal />
      <section className="display-panel-content">
        <CatalogState
          error={error}
          isEmpty={isEmpty}
          isLoading={status === "loading"}
          onRetry={reload}
        >
          <h2 className="genre-title">{t("Genres")}</h2>
          <article className="genres-swiper">
            <Swiper navigation modules={[Navigation]} slidesPerView={4} spaceBetween={20} loop breakpoints={{ 300: { slidesPerView: 1 }, 700: { slidesPerView: 4 } }}>
              {home?.genres.map((genre) => (
                <SwiperSlide key={genre.id}>
                  <NavLink to={`/genre/${genre.id}`} className="genres">
                    <p className="genre-text">{genre.name}</p>
                  </NavLink>
                </SwiperSlide>
              ))}
            </Swiper>
          </article>

          <h2 className="most-played-title">{t("Most played songs")}</h2>
          <article className="most-played-swiper">
            {mostPlayed.map((track) => {
              const artist = track.artists[0];
              return (
                <div onDoubleClick={() => handleTrack(track)} className="most-played" key={track.id}>
                  <div style={{ backgroundImage: `url(${track.coverUrl ?? ""})` }} className="image-most-played" />
                  <div className="most-played-song-details">
                    <p className="most-played-text">{track.title}</p>
                    {artist && (
                      <Link to={`/artist/${artist.id}`} className="most-played-artist">
                        {artist.name}
                      </Link>
                    )}
                    <p className="tracks">{t("Played")} {track.playCount.toLocaleString()} {t("times")}</p>
                  </div>
                </div>
              );
            })}
          </article>

          <h2 className="artist-title">{t("Artists")}</h2>
          <article className="artist-swiper">
            <Swiper navigation modules={[Navigation]} slidesPerView={4} spaceBetween={20} loop breakpoints={{ 300: { slidesPerView: 2 }, 700: { slidesPerView: 4 } }}>
              {home?.artists.map((artist) => (
                <SwiperSlide key={artist.id}>
                  <NavLink to={`/artist/${artist.id}`} className="artist">
                    <div style={{ backgroundImage: `url(${artist.imageUrl ?? ""})` }} className="image-artist" />
                    <p className="artist-name">{artist.name}</p>
                  </NavLink>
                </SwiperSlide>
              ))}
            </Swiper>
          </article>

          <h2 className="playlist-title">{t("Playlists")}</h2>
          <article className="playlist-swiper">
            <Swiper navigation modules={[Navigation]} slidesPerView={4} spaceBetween={20} loop breakpoints={{ 300: { slidesPerView: 2 }, 700: { slidesPerView: 4 } }}>
              {home?.playlists.map((playlist) => (
                <SwiperSlide key={playlist.id}>
                  <NavLink to={`/playlist/${playlist.id}`} className="playlist">
                    <div style={{ backgroundImage: `url(${playlist.coverUrl ?? ""})` }} className="image-playlist" />
                    <p className="playlist-name">{playlist.title}</p>
                  </NavLink>
                </SwiperSlide>
              ))}
            </Swiper>
          </article>

          <h2 className="albums-title">{t("Albums")}</h2>
          <article className="albums-swiper">
            <Swiper navigation modules={[Navigation]} slidesPerView={4} spaceBetween={20} loop breakpoints={{ 300: { slidesPerView: 2 }, 700: { slidesPerView: 4 } }}>
              {home?.albums.map((album) => (
                <SwiperSlide key={album.id}>
                  <NavLink to={`/album/${album.id}`} className="albums">
                    <div style={{ backgroundImage: `url(${album.coverUrl ?? ""})` }} className="image-albums" />
                    <p className="albums-name">{album.title}</p>
                    <p className="albums-artist-name">{album.artists[0]?.name ?? ""}</p>
                  </NavLink>
                </SwiperSlide>
              ))}
            </Swiper>
          </article>
        </CatalogState>
      </section>
      <Footer />
    </main>
  );
};

export default MainCard;
