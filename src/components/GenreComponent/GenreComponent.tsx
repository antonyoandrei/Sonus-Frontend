import React from "react";
import { useParams } from "react-router-dom";
import "./genre.css";
import { useCatalogGenre } from "../../catalog/catalog-hooks";
import CatalogState from "../CatalogState/CatalogState";
import Footer from "../Footer/Footer";
import ProfileModal from "../ProfileModal/ProfileModal";
import SongsComponent from "../SongsComponent/SongsComponent";

const GenreComponent = () => {
  const { id } = useParams<{ id?: string }>();
  const { data: genre, error, reload, status } = useCatalogGenre(id);

  return (
    <main className="display-panel">
      <section className="card-main">
        <ProfileModal />
        <div className="genre-display-panel-content">
          <CatalogState error={error} isEmpty={status === "success" && !genre} isLoading={status === "loading"} onRetry={reload}>
            {genre && (
              <>
                <section className="genre-wrapper">
                  <div className="genre-details-cover" />
                  <article className="genre-details">
                    <p className="genre-details-name">{genre.name}</p>
                    <p className="genre-details-artist-name">Sonus</p>
                  </article>
                </section>
                <SongsComponent songs={genre.tracks} updateSong={reload} />
              </>
            )}
          </CatalogState>
          <Footer />
        </div>
      </section>
    </main>
  );
};

export default GenreComponent;
