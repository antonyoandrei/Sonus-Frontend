import React, { useEffect, useMemo, useState } from "react";
import { Heart, Plus } from "lucide";
import { MorphIcon } from "morphicons/react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import type { CatalogAlbum, CatalogPlaylist } from "../../catalog/catalog.types";
import {
  ArtistCard,
  BrandNotice,
  Field,
  PageIntro,
  PlaylistCard,
  ReleaseCard,
  SectionHeading,
} from "../../components/BrandUI/BrandUI";
import {
  editorialArtists,
  editorialPlaylists,
  editorialReleases,
  type EditorialRelease,
  type EditorialTone,
} from "../../editorial/editorial-data";
import { getLikedAlbumsByUserId } from "../../services/album.service";
import {
  createPlaylistByUserId,
  getAllPlaylistsByUserId,
  getLikedPlaylistsByUserId,
} from "../../services/playlist.service";
import { useUserContext } from "../../utils/useUserContext";
import "./library-page.css";

type LibraryView = "playlists" | "albums" | "favourites" | "artists";
const tones: EditorialTone[] = ["blue", "sand", "coral", "lime", "violet", "ink"];

const Library = () => {
  const { currentUser } = useUserContext();
  const { getAccessTokenSilently } = useAuth();
  const [view, setView] = useState<LibraryView>("playlists");
  const [playlists, setPlaylists] = useState<CatalogPlaylist[]>([]);
  const [likedPlaylists, setLikedPlaylists] = useState<CatalogPlaylist[]>([]);
  const [albums, setAlbums] = useState<CatalogAlbum[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreatePending, setIsCreatePending] = useState(false);

  useEffect(() => {
    let active = true;
    if (!currentUser?.id) return () => { active = false; };

    void Promise.allSettled([
      getAllPlaylistsByUserId(currentUser.id, getAccessTokenSilently),
      getLikedPlaylistsByUserId(currentUser.id, getAccessTokenSilently),
      getLikedAlbumsByUserId(currentUser.id, getAccessTokenSilently),
    ]).then(([ownResult, likedPlaylistResult, albumResult]) => {
      if (!active) return;
      setPlaylists(ownResult.status === "fulfilled" ? ownResult.value : []);
      setLikedPlaylists(likedPlaylistResult.status === "fulfilled" ? likedPlaylistResult.value : []);
      setAlbums(albumResult.status === "fulfilled" ? albumResult.value : []);
    });

    return () => { active = false; };
  }, [currentUser?.id, getAccessTokenSilently]);

  const remoteReleases = useMemo<EditorialRelease[]>(() => albums.map((album, index) => ({
    id: album.id,
    title: album.title,
    artist: album.artists.map((artist) => artist.name).join(", ") || "Sonus",
    artistId: album.artists[0]?.id ?? "",
    format: "Álbum",
    year: album.year ? String(album.year) : "Fecha por confirmar",
    imageUrl: album.coverUrl ?? undefined,
    tone: tones[index % tones.length],
    status: "published",
  })), [albums]);

  const personalPlaylists = [...playlists, ...likedPlaylists].filter(
    (playlist, index, items) => items.findIndex((item) => item.id === playlist.id) === index,
  );

  const handleCreatePlaylist = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = playlistName.trim();
    if (!title || !currentUser?.id || isCreatePending) return;
    setIsCreatePending(true);
    setCreateError(null);
    try {
      const created = await createPlaylistByUserId(
        { title, coverUrl: editorialPlaylists[0]?.imageUrl ?? "" },
        currentUser.id,
        await getAccessTokenSilently(),
      );
      setPlaylists((items) => [created, ...items]);
      setPlaylistName("");
      setIsCreating(false);
    } catch {
      setCreateError("No hemos podido crear la playlist. Comprueba la conexión con tu cuenta.");
    } finally {
      setIsCreatePending(false);
    }
  };

  return (
    <main className="brand-page library-brand-page">
      <PageIntro
        actions={(
          <button className="library-brand-create" onClick={() => setIsCreating((value) => !value)} type="button">
            <MorphIcon icon={Plus} size={17} strokeWidth={1.8} reducedMotion="user" />
            Nueva playlist
          </button>
        )}
        eyebrow="Tu espacio"
        title="Biblioteca"
      >
        <p>Lo que guardas, lo que sigues y las playlists que estás construyendo.</p>
      </PageIntro>

      {isCreating && (
        <form aria-busy={isCreatePending} className="library-brand-create-form" onSubmit={handleCreatePlaylist}>
          <Field
            autoFocus
            error={createError ?? undefined}
            hint={createError ? undefined : "Podrás añadir canciones justo después."}
            id="new-playlist-name"
            label="Nombre de la playlist"
            maxLength={80}
            onChange={(event) => setPlaylistName(event.target.value)}
            placeholder="Por ejemplo, viaje de vuelta"
            required
            suffix={`${playlistName.length}/80`}
            value={playlistName}
          />
          <div className="library-brand-create-form__footer">
            <button onClick={() => { setIsCreating(false); setCreateError(null); setPlaylistName(""); }} type="button">Cancelar</button>
            <button className="sonus-button sonus-button--light" disabled={isCreatePending} type="submit">
              {isCreatePending ? "Creando…" : "Crear"}
            </button>
          </div>
        </form>
      )}

      <nav className="library-brand-tabs" aria-label="Secciones de la biblioteca">
        {([
          ["playlists", "Playlists"],
          ["albums", "Álbumes"],
          ["favourites", "Favoritas"],
          ["artists", "Artistas seguidos"],
        ] as const).map(([id, label]) => (
          <button className={view === id ? "is-active" : undefined} key={id} onClick={() => setView(id)} type="button">
            {label}
          </button>
        ))}
      </nav>

      {view === "playlists" && (
        <section>
          <SectionHeading eyebrow="Tus mezclas" title="Playlists" />
          {personalPlaylists.length ? (
            <div className="library-brand-grid">
              {personalPlaylists.map((playlist, index) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={{
                    id: playlist.id,
                    title: playlist.title,
                    description: `Una playlist de ${playlist.owner?.name ?? currentUser?.name ?? "Sonus"}.`,
                    count: `${playlist.tracks.length} pistas`,
                    imageUrl: playlist.coverUrl ?? undefined,
                    tone: tones[index % tones.length],
                  }}
                />
              ))}
            </div>
          ) : (
            <BrandNotice
              action={<Link className="sonus-button sonus-button--line" to="/discover?view=playlists">Encontrar playlists</Link>}
              title="Tu primera playlist puede empezar por una sola canción."
            >
              <p>Cuando crees o guardes una playlist aparecerá aquí. Mientras tanto, puedes recorrer las selecciones de Sonus.</p>
            </BrandNotice>
          )}
          <div className="library-brand-grid library-brand-suggestions">
            {editorialPlaylists.slice(0, 2).map((playlist) => <PlaylistCard key={playlist.id} playlist={playlist} />)}
          </div>
        </section>
      )}

      {view === "albums" && (
        <section>
          <SectionHeading eyebrow="Guardados" title="Álbumes" />
          <div className="library-brand-releases">
            {(remoteReleases.length ? remoteReleases : editorialReleases.slice(0, 4)).map((release) => (
              <ReleaseCard key={release.id} release={release} />
            ))}
          </div>
        </section>
      )}

      {view === "favourites" && (
        <section>
          <BrandNotice
            action={(
              <Link className="sonus-button sonus-button--light" to={`/favourites/${currentUser?.id ?? "demo"}`}>
                <MorphIcon icon={Heart} size={17} strokeWidth={1.8} reducedMotion="user" />
                Abrir canciones favoritas
              </Link>
            )}
            eyebrow="Favoritas"
            title="Las canciones a las que siempre vuelves."
          >
            <p>Tu colección de favoritas mantiene la reproducción y los datos personales actuales, ahora dentro de la interfaz Sonus.</p>
          </BrandNotice>
        </section>
      )}

      {view === "artists" && (
        <section>
          <SectionHeading eyebrow="Siguiendo" title="Artistas" />
          <div className="library-brand-releases">
            {editorialArtists.slice(0, 4).map((artist) => <ArtistCard artist={artist} key={artist.id} />)}
          </div>
        </section>
      )}
    </main>
  );
};

export default Library;
