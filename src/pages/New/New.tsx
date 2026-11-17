import React from "react";
import { Link } from "react-router-dom";
import {
  Artwork,
  ArtistCard,
  BrandNotice,
  PageIntro,
  ReleaseCard,
  SectionHeading,
} from "../../components/BrandUI/BrandUI";
import {
  editorialArtists,
  editorialReleases,
} from "../../editorial/editorial-data";
import "./new.css";

const New = () => {
  const leadRelease = editorialReleases[0];
  const leadArtist = editorialArtists.find(
    (artist) => artist.id === leadRelease.artistId,
  );
  const upcomingReleases = editorialReleases.filter(
    (release) => release.status === "preview" && release.id !== leadRelease.id,
  );
  const previewArtists = editorialArtists.filter(
    (artist) => artist.status === "preview",
  );
  const publishedReleases = editorialReleases.filter(
    (release) => release.status === "published",
  );

  return (
    <main className="new-page">
      <div className="brand-page brand-page--wide new-page__inner">
        <PageIntro eyebrow="Novedades" title="Lo nuevo ya tiene forma.">
          <p>
            Adelantos, discos en preparación y archivos que vuelven a sonar.
            Una portada distinta cada vez que entras.
          </p>
        </PageIntro>

        <section className="new-feature" aria-labelledby="new-feature-title">
          <div className="new-feature__copy">
            <p className="new-feature__label">Próximo lanzamiento</p>
            <h2 id="new-feature-title">{leadRelease.title}</h2>
            <Link className="new-feature__artist" to={`/artist/${leadRelease.artistId}`}>
              {leadRelease.artist}
            </Link>
            <p>
              {leadArtist?.description ??
                "Un nuevo lanzamiento empieza a tomar forma dentro de Sonus."}
            </p>
            <div className="new-feature__meta">
              <span>{leadRelease.format}</span>
              <span>{leadRelease.year}</span>
            </div>
            <Link className="new-action" to={`/album/${leadRelease.id}`}>
              Abrir adelanto
            </Link>
          </div>

          <Link
            aria-label={`Abrir ${leadRelease.title}`}
            className="new-feature__media"
            to={`/album/${leadRelease.id}`}
          >
            <Artwork
              crop={leadRelease.crop}
              imageUrl={leadRelease.coverUrl ?? leadRelease.imageUrl}
              label={leadRelease.title}
              physicalCover
              priority
              tone={leadRelease.tone}
            />
          </Link>
        </section>

        <section className="new-section" aria-label="Lanzamientos en preparación">
          <SectionHeading title="En preparación" />
          <div className="new-release-grid">
            {upcomingReleases.map((release) => (
              <ReleaseCard key={release.id} release={release} />
            ))}
          </div>
        </section>

        <section className="new-section" aria-label="Artistas que llegan a Sonus">
          <SectionHeading title="Las voces detrás de lo próximo" />
          <div className="new-artist-rail">
            {previewArtists.map((artist) => (
              <ArtistCard artist={artist} key={artist.id} />
            ))}
          </div>
        </section>

        <section className="new-section new-published" aria-labelledby="new-published-title">
          <div className="new-published__copy">
            <h2 id="new-published-title">Ya publicado</h2>
            <p>
              El archivo de Sonus recupera discos que siguen abriendo caminos.
              Aquí conviven con escenas nuevas, sesiones y próximos lanzamientos.
            </p>
          </div>
          <div className="new-published__releases">
            {publishedReleases.map((release) => (
              <ReleaseCard key={release.id} release={release} variant="feature" />
            ))}
          </div>
        </section>

        <BrandNotice
          action={
            <Link className="new-notice-action" to="/playlist/pulso-nuevo">
              Abrir playlist
            </Link>
          }
          eyebrow="Cada viernes"
          title="Pulso nuevo reúne lo que empieza a sonar."
        >
          <p>Una selección breve de adelantos, demos y lanzamientos recientes.</p>
        </BrandNotice>
      </div>
    </main>
  );
};

export default New;
