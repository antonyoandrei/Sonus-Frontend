import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "./searchbar.css";
import { useCatalogSearch } from "../../catalog/catalog-hooks";
import type { CatalogTrack } from "../../catalog/catalog.types";
import { usePlayer } from "../../utils/usePlayer";
import type { SonusUser } from "../../personal/personal.types";
import { getAllUsers } from "../../services/user.service";
import { getProfileInitials } from "../../utils/profile.utils";
import CatalogState from "../CatalogState/CatalogState";
import Footer from "../Footer/Footer";
import ProfileModal from "../ProfileModal/ProfileModal";

const Searchbar = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const { data: results, error, reload, status } = useCatalogSearch(query);
  const { playTrack } = usePlayer();
  const [users, setUsers] = useState<SonusUser[]>([]);

  useEffect(() => {
    let active = true;
    void getAllUsers()
      .then((loadedUsers) => {
        if (active) {
          setUsers(loadedUsers);
        }
      })
      .catch(() => {
        if (active) {
          setUsers([]);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const matchingUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.handle.toLowerCase().includes(normalizedQuery),
    );
  }, [query, users]);

  const handleTrack = (track: CatalogTrack) => {
    playTrack(track, results?.tracks ?? [track]);
  };

  const handleInput = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(target.value ? { q: target.value } : {});
  };

  const hasCatalogResults = Boolean(
    results &&
    (results.tracks.length ||
      results.albums.length ||
      results.artists.length ||
      results.playlists.length ||
      results.genres.length),
  );

  return (
    <main className="card-main">
      <ProfileModal />
      <section className="display-panel-content">
        <div className="search-wrapper">
          <div className="search-bar">
            <div className="search-container">
              <input className="search-input" type="search" value={query} onChange={handleInput} placeholder={t("Search...")} />
              <svg viewBox="0 0 24 24" className="search__icon">
                <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9s4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66a.75.75 0 1 0 1.062-1.06zM3.5 11a7.5 7.5 0 1 1 15 0a7.5 7.5 0 0 1 -15 0z" />
              </svg>
            </div>
          </div>
        </div>

        {query && (
          <>
            <h2 className="artist-title">{t("Users")}</h2>
            <article className="searchbar-artist-swiper">
              <Swiper navigation modules={[Navigation]} slidesPerView={4} spaceBetween={20} loop={matchingUsers.length > 4} breakpoints={{ 300: { slidesPerView: 2 }, 700: { slidesPerView: 4 } }}>
                {matchingUsers.map((user) => (
                  <SwiperSlide key={user.id}>
                    <div className="user-search-result">
                      <NavLink to={`/profile/${encodeURIComponent(user.handle)}`} className="artist">
                        <div
                          className={`image-artist ${user.avatar ? "" : "profile-avatar-initials"}`}
                          style={user.avatar ? { backgroundImage: `url(${user.avatar})` } : undefined}
                        >
                          {!user.avatar && <span>{getProfileInitials(user.name)}</span>}
                        </div>
                        <p className="artist-name">{user.name}</p>
                      </NavLink>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </article>

            <CatalogState error={error} isEmpty={status === "success" && !hasCatalogResults} isLoading={status === "loading"} onRetry={reload}>
              <h2 className="most-played-title">{t("All songs")}</h2>
              <article className="most-played-swiper">
                {results?.tracks.map((track) => (
                  <div className="most-played" onDoubleClick={() => handleTrack(track)} key={track.id}>
                    <div className="image-most-played" style={{ backgroundImage: `url(${track.coverUrl ?? ""})` }} />
                    <div className="most-played-song-details">
                      <p className="most-played-text">{track.title}</p>
                      <p className="tracks">{track.artists[0]?.name ?? ""}</p>
                    </div>
                  </div>
                ))}
              </article>

              <h2 className="artist-title">{t("Artists")}</h2>
              <article className="searchbar-artist-swiper">
                <Swiper navigation modules={[Navigation]} slidesPerView={4} spaceBetween={20} loop={(results?.artists.length ?? 0) > 4} breakpoints={{ 300: { slidesPerView: 2 }, 700: { slidesPerView: 4 } }}>
                  {results?.artists.map((artist) => (
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
              <article className="searchbar-playlist-swiper">
                <Swiper navigation modules={[Navigation]} slidesPerView={4} spaceBetween={20} loop={(results?.playlists.length ?? 0) > 4} breakpoints={{ 300: { slidesPerView: 2 }, 700: { slidesPerView: 4 } }}>
                  {results?.playlists.map((playlist) => (
                    <SwiperSlide key={playlist.id}>
                      <NavLink to={`/playlist/${playlist.id}`} className="playlist">
                        <div className="image-playlist" style={{ backgroundImage: `url(${playlist.coverUrl ?? ""})` }} />
                        <p className="playlist-name">{playlist.title}</p>
                      </NavLink>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </article>

              <h2 className="albums-title">{t("Albums")}</h2>
              <article className="searchbar-albums-swiper">
                <Swiper navigation modules={[Navigation]} slidesPerView={4} spaceBetween={20} loop={(results?.albums.length ?? 0) > 4} breakpoints={{ 300: { slidesPerView: 2 }, 700: { slidesPerView: 4 } }}>
                  {results?.albums.map((album) => (
                    <SwiperSlide key={album.id}>
                      <NavLink to={`/album/${album.id}`} className="albums">
                        <div className="image-albums" style={{ backgroundImage: `url(${album.coverUrl ?? ""})` }} />
                        <p className="albums-name">{album.title}</p>
                      </NavLink>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </article>
            </CatalogState>
          </>
        )}
      </section>
      <Footer />
    </main>
  );
};

export default Searchbar;
