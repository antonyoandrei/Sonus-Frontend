import React from 'react';
import { NavLink } from "react-router-dom";
import ProfileModal from "../ProfileModal/ProfileModal";
import './library.css';
import { getAllPlaylistsByUserId, getLikedPlaylistsByUserId } from "../../services/playlist.service";
import { FC, useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { useUserContext } from "../../utils/useUserContext";
import { getLikedAlbumsByUserId } from "../../services/album.service";
import PlaylistModal from "../PlaylistModal/PlaylistModal";
import { useTranslation } from "react-i18next";
import type { CatalogAlbum, CatalogPlaylist } from "../../catalog/catalog.types";
import liveCrowd from '../../assets/discovery/live-crowd.jpg';

const LibraryComponent: FC = () => {
    const {currentUser} = useUserContext();
    const [playlists, setPlaylists] = useState<CatalogPlaylist[]>([]);
    const {getAccessTokenSilently} = useAuth();
    const [likedAlbums, setLikedAlbums] = useState<CatalogAlbum[]>([]);
    const [likedPlaylists, setLikedPlaylists] = useState<CatalogPlaylist[]>([]);
    const [updatePlaylists, setUpdatePlaylists] = useState(false);
    const {t} = useTranslation();

    const handleUpdatePlaylists = () => {
        setUpdatePlaylists((prev) => !prev);
    };

    useEffect(() => {
        const fetchPlaylist = async () => {
            if (currentUser?.id) {
                try {
                    const playlistData = await getAllPlaylistsByUserId(currentUser?.id.toString(), getAccessTokenSilently);
                    if (playlistData) {
                        setPlaylists(playlistData);
                    }
                } catch (error) {
                    console.error(error)
                }
            }
        }
        fetchPlaylist();
    }, [currentUser?.id, getAccessTokenSilently, updatePlaylists])

    useEffect(() => {
        const fetchLikedAlbums = async () => {
            if (currentUser?.id) {
                try {
                    const likedAlbumsData = await getLikedAlbumsByUserId(currentUser?.id.toString(), getAccessTokenSilently);
                    if (likedAlbumsData) {
                        setLikedAlbums(likedAlbumsData);
                    }
                } catch (error) {
                    console.error(error)
                }
            }
        }
        fetchLikedAlbums();
    }, [currentUser?.id, getAccessTokenSilently])

    useEffect(() => {
        const fetchLikedPlaylists = async () => {
            if (currentUser?.id) {
                try {
                    const likedPlaylistData = await getLikedPlaylistsByUserId(currentUser?.id.toString(), getAccessTokenSilently);
                    if (likedPlaylistData) {
                        setLikedPlaylists(likedPlaylistData);
                    }
                } catch (error) {
                    console.error(error)
                }
            }
        }
        fetchLikedPlaylists();
    }, [currentUser?.id, getAccessTokenSilently])

    return (
        <main className="card-main">
            <ProfileModal />
                <section className="display-panel-content">
                    <PlaylistModal updatePlaylists={handleUpdatePlaylists}/>
                    <h2 className="playlist-title">{t('Playlists')}</h2>
                        <article className="library-playlist-swiper">
                            <NavLink to={`/favourites/${currentUser?.id}`} className="playlist">
                                <div style={{ backgroundImage: `url(${liveCrowd})`}} className="image-playlist" />
                                <p className="playlist-name">{t('Favourites')}</p>
                            </NavLink>
                            {likedPlaylists.map((playlist) => (
                                    <NavLink key={playlist.id} to={`/playlist/${playlist.id}`} className="playlist">
                                        <div style={{ backgroundImage: `url(${playlist.coverUrl ?? ""})`}} className="image-playlist" />
                                        <p className="playlist-name">{playlist.title}</p>
                                    </NavLink>
                                ))}
                            {playlists.map((playlist) => (
                                    <NavLink key={playlist.id} to={`/playlist/${playlist.id}`} className="playlist">
                                        <div style={{ backgroundImage: `url(${playlist.coverUrl ?? ""})`}} className="image-playlist" />
                                        <p className="playlist-name">{playlist.title}</p>
                                    </NavLink>
                                ))}
                        </article>
                    <h2 className="albums-title">{t('Albums')}</h2>
                    <article className="library-albums-swiper">
                        {likedAlbums.map((album) => (
                            <NavLink key={album.id} to={`/album/${album.id}`} className="albums">
                                <div style={{ backgroundImage: `url(${album.coverUrl ?? ""})`}} className="image-albums" />
                                <p className="albums-name">{album.title}</p>
                                <p className="albums-artist-name">{album.artists[0]?.name ?? ""}</p>
                            </NavLink>
                        ))}
                    </article>
                </section>
        </main>
    )
}

export default LibraryComponent
