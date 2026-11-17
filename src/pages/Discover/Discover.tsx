import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Artwork,
  ArtistCard,
  MediaShelf,
  PageIntro,
  PlaylistCard,
  ReleaseCard,
  SectionHeading,
} from "../../components/BrandUI/BrandUI";
import {
  discoveryMoods,
  editorialArtists,
  editorialPlaylists,
  editorialReleases,
} from "../../editorial/editorial-data";
import "./discover.css";

const discoverViews = [
  { id: "all", label: "Todo" },
  { id: "artists", label: "Artistas" },
  { id: "albums", label: "Álbumes" },
  { id: "playlists", label: "Playlists" },
] as const;

type DiscoverView = (typeof discoverViews)[number]["id"];

const isDiscoverView = (value: string | null): value is DiscoverView =>
  discoverViews.some((view) => view.id === value);

const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedView = searchParams.get("view");
  const activeView: DiscoverView = isDiscoverView(requestedView)
    ? requestedView
    : "all";
  const leadArtist = editorialArtists[0];
  const leadRelease = editorialReleases.find(
    (release) => release.artistId === leadArtist.id,
  );

  const changeView = (view: DiscoverView) => {
    const nextParams = new URLSearchParams(searchParams);
    if (view === "all") {
      nextParams.delete("view");
    } else {
      nextParams.set("view", view);
    }
    setSearchParams(nextParams);
  };

  const showArtists = activeView === "all" || activeView === "artists";
  const showAlbums = activeView === "all" || activeView === "albums";
  const showPlaylists = activeView === "all" || activeView === "playlists";

  return (
    <main className="discover-page">
      <div className="brand-page brand-page--wide discover-page__inner">
        <PageIntro eyebrow="Descubrir" title="Encuentra otro ritmo.">
          <p>
            Artistas, discos y selecciones elegidos por Sonus. Clásicos,
            escenas nuevas y voces que empiezan a llegar comparten espacio.
          </p>
        </PageIntro>

        <nav className="discover-tabs" aria-label="Filtrar descubrimiento">
          {discoverViews.map((view) => (
            <button
              aria-pressed={activeView === view.id}
              className={activeView === view.id ? "is-active" : undefined}
              key={view.id}
              onClick={() => changeView(view.id)}
              type="button"
            >
              {view.label}
            </button>
          ))}
        </nav>

        {activeView === "all" && (
          <>
            <section className="discover-lead" aria-labelledby="discover-lead-title">
              <Link
                aria-label={`Abrir el mundo de ${leadArtist.name}`}
                className="discover-lead__media"
                to={`/artist/${leadArtist.id}`}
              >
                <Artwork
                  imageUrl={leadArtist.imageUrl}
                  label={leadArtist.name}
                  priority
                  ratio="landscape"
                  tone={leadArtist.tone}
                />
              </Link>

              <div className="discover-lead__copy">
                <p className="discover-lead__label">Escucha de la semana</p>
                <h2 id="discover-lead-title">Vera Sol escribe para la última luz.</h2>
                <p>{leadArtist.description}</p>
                <Link className="discover-action" to={`/artist/${leadArtist.id}`}>
                  Conocer a Vera Sol
                </Link>

                {leadRelease && (
                  <Link
                    className="discover-lead__release"
                    to={`/album/${leadRelease.id}`}
                  >
                    <Artwork
                      crop={leadRelease.crop}
                      imageUrl={leadRelease.coverUrl ?? leadRelease.imageUrl}
                      label={leadRelease.title}
                      physicalCover
                      tone={leadRelease.tone}
                    />
                    <span>
                      <small>Próximo álbum</small>
                      <strong>{leadRelease.title}</strong>
                      <span>{leadRelease.year}</span>
                    </span>
                  </Link>
                )}
              </div>
            </section>

            <section className="discover-section" aria-labelledby="discover-moods-title">
              <SectionHeading title="Elige cómo quieres escuchar" />
              <h2 className="discover-visually-hidden" id="discover-moods-title">
                Estados de escucha
              </h2>
              <div className="discover-moods">
                {discoveryMoods.map((mood) => (
                  <Link
                    className="discover-mood"
                    key={mood.id}
                    to={`/genre/${mood.id}`}
                  >
                    <Artwork label={mood.title} ratio="landscape" tone={mood.tone} />
                    <span>
                      <strong>{mood.title}</strong>
                      <small>{mood.copy}</small>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        {showArtists && (
          <section className="discover-section" aria-label="Artistas para descubrir">
            <SectionHeading
              title={activeView === "artists" ? "Todos los artistas" : "Voces con un mundo propio"}
              link={
                activeView === "all"
                  ? { label: "Ver artistas", to: "/discover?view=artists" }
                  : undefined
              }
            />
            <MediaShelf>
              {editorialArtists.map((artist) => (
                <ArtistCard artist={artist} key={artist.id} />
              ))}
            </MediaShelf>
          </section>
        )}

        {showAlbums && (
          <section className="discover-section" aria-label="Álbumes para descubrir">
            <SectionHeading
              title={activeView === "albums" ? "Todos los álbumes" : "Discos para entrar por otro sitio"}
              link={
                activeView === "all"
                  ? { label: "Ver álbumes", to: "/discover?view=albums" }
                  : undefined
              }
            />
            <MediaShelf>
              {editorialReleases.map((release) => (
                <ReleaseCard key={release.id} release={release} />
              ))}
            </MediaShelf>
          </section>
        )}

        {showPlaylists && (
          <section className="discover-section" aria-label="Playlists de Sonus">
            <SectionHeading
              title={activeView === "playlists" ? "Todas las playlists" : "Selecciones hechas por Sonus"}
              link={
                activeView === "all"
                  ? { label: "Ver playlists", to: "/discover?view=playlists" }
                  : undefined
              }
            />
            <MediaShelf>
              {editorialPlaylists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </MediaShelf>
          </section>
        )}
      </div>
    </main>
  );
};

export default Discover;
