import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "./songs.css";
import type { CatalogTrack } from "../../catalog/catalog.types";
import { usePlayer } from "../../utils/usePlayer";
import {
  getLikedSongsByUserId,
  updateUserLikes,
} from "../../services/song.service";
import { useUserContext } from "../../utils/useUserContext";
import AddSongModal from "../AddSongModal/AddSongModal";

interface SongsComponentProps {
  songs: CatalogTrack[];
  updateSong: () => void;
}

const SongsComponent = ({ songs, updateSong }: SongsComponentProps) => {
  const location = useLocation();
  const { getAccessTokenSilently } = useAuth();
  const { playTrack } = usePlayer();
  const { currentUser } = useUserContext();
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set());
  const isAlbumPath = location.pathname.includes("album");

  useEffect(() => {
    let active = true;
    if (!currentUser?.id) {
      setLikedTrackIds(new Set());
      return () => {
        active = false;
      };
    }

    void getLikedSongsByUserId(currentUser.id, getAccessTokenSilently)
      .then((likedTracks) => {
        if (active) {
          setLikedTrackIds(new Set(likedTracks.map((track) => track.id)));
        }
      })
      .catch(() => {
        if (active) {
          setLikedTrackIds(new Set());
        }
      });

    return () => {
      active = false;
    };
  }, [currentUser?.id, getAccessTokenSilently, songs]);

  const handleLike = async (track: CatalogTrack) => {
    if (!currentUser || track.providerId !== "sonus") {
      return;
    }
    const wasLiked = likedTrackIds.has(track.id);
    setLikedTrackIds((current) => {
      const next = new Set(current);
      if (wasLiked) {
        next.delete(track.id);
      } else {
        next.add(track.id);
      }
      return next;
    });

    try {
      await updateUserLikes(
        currentUser.id,
        track.id,
        !wasLiked,
        await getAccessTokenSilently(),
      );
    } catch (error) {
      setLikedTrackIds((current) => {
        const reverted = new Set(current);
        if (wasLiked) {
          reverted.add(track.id);
        } else {
          reverted.delete(track.id);
        }
        return reverted;
      });
      console.error(error);
    }
  };

  return (
    <section className="songs-list-container">
      <article className="songs-list-wrapper">
        <ul className="songs-list">
          {songs.map((track) => {
            const artist = track.artists[0];
            const isLiked = likedTrackIds.has(track.id);
            const canWrite = track.providerId === "sonus";
            return (
              <li onDoubleClick={() => playTrack(track, songs)} key={track.id} className="songs-list-element">
                {!isAlbumPath && (
                  <div style={{ backgroundImage: `url(${track.coverUrl ?? ""})` }} className="songs-list-image" />
                )}
                <div className="songs-list-details-wrapper">
                  <p className="songs-list-text">{track.title}</p>
                  {artist && <Link to={`/artist/${artist.id}`} className="songs-list-text">{artist.name}</Link>}
                  {track.album && <Link to={`/album/${track.album.id}`} className="songs-list-text">{track.album.title}</Link>}
                </div>
                {canWrite && (
                  <div className="songs-icons-wrapper">
                    <div className="fav-album-icon">
                      <div className="handle-like-album-wrapper" onClick={() => handleLike(track)}>
                        {isLiked ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="icon-tabler icon-tabler-heart-filled" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z" strokeWidth="0" fill="currentColor" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="icon-tabler icon-tabler-heart icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <AddSongModal song={track} updateSong={updateSong} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </article>
    </section>
  );
};

export default SongsComponent;
