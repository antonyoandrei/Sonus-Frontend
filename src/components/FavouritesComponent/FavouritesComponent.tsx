import React from 'react';
import { useEffect, useState } from 'react';
import Footer from '../Footer/Footer';
import ProfileModal from '../ProfileModal/ProfileModal';
import './favourites.component.css';
import SongsComponent from '../SongsComponent/SongsComponent';
import { useParams } from 'react-router-dom';
import { getLikedSongsByUserId } from '../../services/song.service';
import { useAuth } from '../../auth/useAuth';
import { useTranslation } from 'react-i18next';
import type { CatalogTrack } from '../../catalog/catalog.types';
import { useUserContext } from '../../utils/useUserContext';
import liveCrowd from '../../assets/discovery/live-crowd.jpg';

const FavouritesComponent = () => {
    const { id } = useParams<{ id?: string }>();
    const [song, setSong] = useState<CatalogTrack[]>([]);
    const { getAccessTokenSilently } = useAuth();
    const { currentUser } = useUserContext();
    const {t} = useTranslation()
    const [updateSongs, setUpdateSongs] = useState(false);
    
    const handleUpdateSongs = () => {
        setUpdateSongs((prev) => !prev);
    }

    useEffect(() => {
        const fetchSongFavourites = async () => {
            try {
                const favouritesSongData = await getLikedSongsByUserId(id, getAccessTokenSilently);
                if (favouritesSongData) {
                    setSong(favouritesSongData);
                }
            } catch (error) {
                console.error(error)
            }
        }
        fetchSongFavourites();
    }, [getAccessTokenSilently, id, updateSongs])
    
    return (
        <>
            <main className="display-panel">
                <section className="card-main">
                    <ProfileModal />
                    <div className="playlist-display-panel-content">
                        <section className="playlist-wrapper">
                            <div style={{ backgroundImage: `url(${liveCrowd})` }} className="playlist-details-cover" />
                            <article className="playlist-details">
                                    <p className="playlist-details-name">{t('Favourites')}</p>
                                    <p className="playlist-details-artist-name">{currentUser?.name}</p>
                            </article>
                        </section>
                        <SongsComponent songs={song} updateSong={handleUpdateSongs}/>
                        <Footer />
                    </div>
                </section>
            </main>
        </>
    )
}

export default FavouritesComponent
