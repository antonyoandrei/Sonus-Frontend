import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "./playlist.css";
import { useCatalogPlaylist } from "../../catalog/catalog-hooks";
import {
  deletePlaylist,
  getLikedPlaylistsByUserId,
  updateUserLikes,
} from "../../services/playlist.service";
import { useUserContext } from "../../utils/useUserContext";
import CatalogState from "../CatalogState/CatalogState";
import Footer from "../Footer/Footer";
import ProfileModal from "../ProfileModal/ProfileModal";
import SongsComponent from "../SongsComponent/SongsComponent";

const PlaylistComponent = () => {
  const { id } = useParams<{ id?: string }>();
  const { data: playlist, error, reload, status } = useCatalogPlaylist(id);
  const { currentUser } = useUserContext();
  const { getAccessTokenSilently } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const isOwner = Boolean(
    playlist?.owner &&
    currentUser &&
    (playlist.owner.id === currentUser.id || playlist.owner.name === currentUser.name),
  );

  useEffect(() => {
    let active = true;
    if (!currentUser?.id || !playlist || playlist.providerId !== "sonus" || isOwner) {
      setIsLiked(false);
      return () => {
        active = false;
      };
    }
    void getLikedPlaylistsByUserId(currentUser.id, getAccessTokenSilently)
      .then((likedPlaylists) => {
        if (active) {
          setIsLiked(likedPlaylists.some((item) => item.id === playlist.id));
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
  }, [currentUser?.id, getAccessTokenSilently, isOwner, playlist]);

  const handleLike = async () => {
    if (!currentUser || !playlist || playlist.providerId !== "sonus") {
      return;
    }
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    try {
      await updateUserLikes(
        currentUser.id,
        playlist.id,
        nextLiked,
        await getAccessTokenSilently(),
      );
    } catch (requestError) {
      setIsLiked(!nextLiked);
      console.error(requestError);
    }
  };

  const handleDelete = async () => {
    if (!id || !isOwner) {
      return;
    }
    try {
      await deletePlaylist(await getAccessTokenSilently(), id);
      window.history.back();
    } catch (requestError) {
      console.error("Error deleting playlist:", requestError);
    }
  };

  return (
    <main className="display-panel">
      <section className="card-main">
        <ProfileModal />
        <div className="playlist-display-panel-content">
          <CatalogState error={error} isEmpty={status === "success" && !playlist} isLoading={status === "loading"} onRetry={reload}>
            {playlist && (
              <>
                <section className="playlist-wrapper">
                  <div style={{ backgroundImage: `url(${playlist.coverUrl ?? ""})` }} className="playlist-details-cover" />
                  <article className="playlist-details">
                    <p className="playlist-details-name">{playlist.title}</p>
                    {playlist.owner && (
                      <Link to={`/profile/${playlist.owner.name}`} className="playlist-details-artist-name">
                        {playlist.owner.name}
                      </Link>
                    )}
                  </article>
                  {playlist.providerId === "sonus" && isOwner && (
                    <svg onClick={handleDelete} xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-trash" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                  )}
                  {playlist.providerId === "sonus" && !isOwner && (
                    <div className="fav-playlist-icon">
                      <div className="handle-like-playlist-wrapper" onClick={handleLike}>
                        {isLiked ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="icon-tabler icon-tabler-heart-filled" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z" strokeWidth="0" fill="currentColor" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="icon-tabler icon-tabler-heart icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" /></svg>
                        )}
                      </div>
                    </div>
                  )}
                </section>
                <SongsComponent songs={playlist.tracks} updateSong={reload} />
              </>
            )}
          </CatalogState>
          <Footer />
        </div>
      </section>
    </main>
  );
};

export default PlaylistComponent;
