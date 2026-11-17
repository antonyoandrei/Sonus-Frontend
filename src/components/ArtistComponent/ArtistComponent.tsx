import React from "react";
import { NavLink, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./artist.css";
import { useCatalogArtist } from "../../catalog/catalog-hooks";
import type { CatalogTrack } from "../../catalog/catalog.types";
import { usePlayer } from "../../utils/usePlayer";
import CatalogState from "../CatalogState/CatalogState";
import Footer from "../Footer/Footer";
import ProfileModal from "../ProfileModal/ProfileModal";

const ArtistComponent = () => {
  const { id } = useParams<{ id?: string }>();
  const { data: artist, error, reload, status } = useCatalogArtist(id);
  const { playTrack } = usePlayer();
  const { t } = useTranslation();

  const handleTrack = (track: CatalogTrack) => {
    playTrack(track, artist?.tracks ?? [track]);
  };

  return (
    <main className="display-panel">
      <section className="card-main">
        <ProfileModal />
        <div className="artist-display-panel-content">
          <CatalogState error={error} isEmpty={status === "success" && !artist} isLoading={status === "loading"} onRetry={reload}>
            {artist && (
              <>
                <section className="artist-profile">
                  <article style={{ backgroundImage: `url(${artist.imageUrl ?? ""})` }} className="artist-profile-img" />
                  <article className="artist-profile-details"><p className="artist-profile-name">{artist.name}</p></article>
                </section>
                <h2 className="most-played-title">{t("Songs")}</h2>
                <article className="most-played-swiper">
                  {artist.tracks.map((track) => (
                    <div onDoubleClick={() => handleTrack(track)} key={track.id} className="most-played">
                      <div style={{ backgroundImage: `url(${track.coverUrl ?? ""})` }} className="image-most-played" />
                      <div className="most-played-song-details">
                        <p className="most-played-text">{track.title}</p>
                        <p className="tracks">{track.album?.title ?? ""}</p>
                      </div>
                    </div>
                  ))}
                </article>
                <h2 className="albums-title">{t("Albums")}</h2>
                <article className="artist-albums-swiper">
                  {artist.albums.map((album) => (
                    <NavLink key={album.id} to={`/album/${album.id}`} className="albums">
                      <div style={{ backgroundImage: `url(${album.coverUrl ?? ""})` }} className="image-albums" />
                      <p className="albums-name">{album.title}</p>
                    </NavLink>
                  ))}
                </article>
              </>
            )}
          </CatalogState>
          <Footer />
        </div>
      </section>
    </main>
  );
};

export default ArtistComponent;
