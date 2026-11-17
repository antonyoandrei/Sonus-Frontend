import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "./album.css";
import { useCatalogAlbum } from "../../catalog/catalog-hooks";
import {
  getLikedAlbumsByUserId,
  updateUserLikes,
} from "../../services/album.service";
import { useUserContext } from "../../utils/useUserContext";
import CatalogState from "../CatalogState/CatalogState";
import Footer from "../Footer/Footer";
import ProfileModal from "../ProfileModal/ProfileModal";
import SongsComponent from "../SongsComponent/SongsComponent";

const AlbumComponent = () => {
  const { id } = useParams<{ id?: string }>();
  const { data: album, error, reload, status } = useCatalogAlbum(id);
  const { currentUser } = useUserContext();
  const { getAccessTokenSilently } = useAuth();
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    let active = true;
    if (!currentUser?.id || !album || album.providerId !== "sonus") {
      setIsLiked(false);
      return () => {
        active = false;
      };
    }
    void getLikedAlbumsByUserId(currentUser.id, getAccessTokenSilently)
      .then((likedAlbums) => {
        if (active) {
          setIsLiked(likedAlbums.some((item) => item.id === album.id));
        }
      })
      .catch(() => {
        if (active) {
          setIsLiked(false);
        }
      });
    return () => {
      active = false;
    };
  }, [album, currentUser?.id, getAccessTokenSilently]);

  const handleLike = async () => {
    if (!currentUser || !album || album.providerId !== "sonus") {
      return;
    }
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    try {
      await updateUserLikes(
        currentUser.id,
        album.id,
        nextLiked,
        await getAccessTokenSilently(),
      );
    } catch (requestError) {
      setIsLiked(!nextLiked);
      console.error(requestError);
    }
  };

  return (
    <main className="display-panel">
      <section className="card-main">
        <ProfileModal />
        <div className="album-display-panel-content">
          <CatalogState error={error} isEmpty={status === "success" && !album} isLoading={status === "loading"} onRetry={reload}>
            {album && (
              <>
                <section className="album-wrapper">
                  <div style={{ backgroundImage: `url(${album.coverUrl ?? ""})` }} className="album-details-cover" />
                  <article className="album-details">
                    <p className="album-name">{album.title}</p>
                    {album.artists[0] && (
                      <Link to={`/artist/${album.artists[0].id}`} className="album-details-artist-name">
                        {album.artists[0].name}
                      </Link>
                    )}
                  </article>
                  {album.providerId === "sonus" && (
                    <div className="fav-album-icon">
                      <div className="handle-like-album-wrapper" onClick={handleLike}>
                        {isLiked ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="icon-tabler icon-tabler-heart-filled" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z" strokeWidth="0" fill="currentColor" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="icon-tabler icon-tabler-heart icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" /></svg>
                        )}
                      </div>
                    </div>
                  )}
                </section>
                <SongsComponent songs={album.tracks} updateSong={reload} />
              </>
            )}
          </CatalogState>
          <Footer />
        </div>
      </section>
    </main>
  );
};

export default AlbumComponent;
