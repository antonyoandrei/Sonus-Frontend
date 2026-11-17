import type { CatalogTrack } from "../catalog/catalog.types";
import liveCrowd from "../assets/discovery/live-crowd.jpg";
import nightShow from "../assets/discovery/night-show.jpg";
import pianoRoom from "../assets/discovery/piano-room.jpg";
import stageVoice from "../assets/discovery/stage-voice.jpg";
import thrillerCover from "../assets/showcase/thriller-cover.webp";
import michaelImage from "../assets/showcase/mj-live-red.webp";

export type EditorialTone = "coral" | "lime" | "blue" | "sand" | "violet" | "ink";
export type EditorialCrop = "center" | "top" | "left" | "right";
export type EditorialArtistCardVariant = "feature" | "portrait" | "type";
export type EditorialArtistHeroVariant = "portrait" | "wide";

export interface EditorialArtist {
  id: string;
  name: string;
  description: string;
  eyebrow: string;
  /** Compatibility alias for older consumers. Prefer portraitUrl or heroUrl. */
  imageUrl?: string;
  portraitUrl?: string;
  heroUrl?: string;
  crop?: EditorialCrop;
  heroCrop?: EditorialCrop;
  cardVariant?: EditorialArtistCardVariant;
  heroVariant?: EditorialArtistHeroVariant;
  initials: string;
  tone: EditorialTone;
  status?: "published" | "preview";
}

export interface EditorialRelease {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  format: "Álbum" | "EP" | "Single" | "Archivo";
  year: string;
  /** Compatibility alias for older consumers. Prefer coverUrl. */
  imageUrl?: string;
  coverUrl?: string;
  crop?: EditorialCrop;
  tone: EditorialTone;
  status?: "published" | "preview";
}

export interface EditorialPlaylist {
  id: string;
  title: string;
  description: string;
  count: string;
  eyebrow?: string;
  /** Compatibility alias for older consumers. Prefer coverUrl. */
  imageUrl?: string;
  coverUrl?: string;
  crop?: EditorialCrop;
  tone: EditorialTone;
}

export interface EditorialTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverUrl?: string;
  imageUrl?: string;
  tone: EditorialTone;
}

export const editorialArtists: EditorialArtist[] = [
  {
    id: "vera-sol",
    name: "Vera Sol",
    description: "Pop de cámara, sintetizadores cálidos y canciones escritas para la última luz del día.",
    eyebrow: "Artista en preparación",
    imageUrl: stageVoice,
    portraitUrl: stageVoice,
    heroUrl: stageVoice,
    crop: "top",
    heroCrop: "center",
    cardVariant: "feature",
    heroVariant: "wide",
    initials: "VS",
    tone: "sand",
    status: "preview",
  },
  {
    id: "michael-jackson",
    name: "Michael Jackson",
    description: "Una selección de discos, directos y momentos que cambiaron la escala del pop.",
    eyebrow: "Archivo publicado",
    imageUrl: michaelImage,
    portraitUrl: michaelImage,
    heroUrl: michaelImage,
    crop: "top",
    heroCrop: "top",
    cardVariant: "portrait",
    heroVariant: "portrait",
    initials: "MJ",
    tone: "coral",
    status: "published",
  },
  {
    id: "northline",
    name: "Northline",
    description: "Electrónica nocturna de pulso lento, grabada entre estaciones y carreteras vacías.",
    eyebrow: "Artista en preparación",
    imageUrl: nightShow,
    portraitUrl: nightShow,
    heroUrl: nightShow,
    crop: "center",
    heroCrop: "center",
    cardVariant: "type",
    heroVariant: "wide",
    initials: "NL",
    tone: "blue",
    status: "preview",
  },
  {
    id: "lia-mar",
    name: "Lía Mar",
    description: "Neo soul luminoso, armonías vocales y una banda que respira en cada toma.",
    eyebrow: "Artista en preparación",
    imageUrl: pianoRoom,
    portraitUrl: pianoRoom,
    heroUrl: pianoRoom,
    crop: "left",
    heroCrop: "left",
    cardVariant: "portrait",
    heroVariant: "portrait",
    initials: "LM",
    tone: "lime",
    status: "preview",
  },
  {
    id: "kairo-blue",
    name: "Kairo Blue",
    description: "Rap introspectivo y texturas de jazz para historias que no caben en un estribillo.",
    eyebrow: "Artista en preparación",
    cardVariant: "type",
    heroVariant: "portrait",
    initials: "KB",
    tone: "violet",
    status: "preview",
  },
  {
    id: "sora-ensemble",
    name: "Sora Ensemble",
    description: "Cuerdas, piano preparado y pequeñas piezas para escuchar sin prisa.",
    eyebrow: "Artista en preparación",
    cardVariant: "feature",
    heroVariant: "wide",
    initials: "SE",
    tone: "ink",
    status: "preview",
  },
];

export const editorialReleases: EditorialRelease[] = [
  {
    id: "luz-de-paso",
    title: "Luz de paso",
    artist: "Vera Sol",
    artistId: "vera-sol",
    format: "Álbum",
    year: "Próximamente",
    tone: "sand",
    status: "preview",
  },
  {
    id: "static-bloom",
    title: "Static Bloom",
    artist: "Northline",
    artistId: "northline",
    format: "EP",
    year: "Próximamente",
    tone: "blue",
    status: "preview",
  },
  {
    id: "thriller",
    title: "Thriller",
    artist: "Michael Jackson",
    artistId: "michael-jackson",
    format: "Álbum",
    year: "1982",
    imageUrl: thrillerCover,
    coverUrl: thrillerCover,
    crop: "center",
    tone: "coral",
    status: "published",
  },
  {
    id: "mareas",
    title: "Mareas",
    artist: "Lía Mar",
    artistId: "lia-mar",
    format: "Single",
    year: "Próximamente",
    tone: "lime",
    status: "preview",
  },
  {
    id: "blue-notes",
    title: "Blue Notes / 01",
    artist: "Kairo Blue",
    artistId: "kairo-blue",
    format: "Archivo",
    year: "En preparación",
    tone: "violet",
    status: "preview",
  },
  {
    id: "small-rooms",
    title: "Small Rooms",
    artist: "Sora Ensemble",
    artistId: "sora-ensemble",
    format: "EP",
    year: "En preparación",
    tone: "ink",
    status: "preview",
  },
];

export const editorialPlaylists: EditorialPlaylist[] = [
  {
    id: "ruta-nocturna",
    title: "Ruta nocturna",
    description: "Electrónica, R&B y pop para cuando la ciudad baja el volumen.",
    count: "24 pistas · 1 h 32 min",
    imageUrl: nightShow,
    coverUrl: nightShow,
    crop: "center",
    tone: "blue",
  },
  {
    id: "domingo-lento",
    title: "Domingo lento",
    description: "Voces cercanas, piano y soul para quedarse un poco más.",
    count: "18 pistas · 58 min",
    imageUrl: pianoRoom,
    coverUrl: pianoRoom,
    crop: "left",
    tone: "sand",
  },
  {
    id: "escenario-abierto",
    title: "Escenario abierto",
    description: "Directos esenciales y nuevas sesiones seleccionadas por Sonus.",
    count: "16 pistas · 1 h 11 min",
    imageUrl: liveCrowd,
    coverUrl: liveCrowd,
    crop: "center",
    tone: "coral",
  },
  {
    id: "pulso-nuevo",
    title: "Pulso nuevo",
    description: "Lanzamientos y demos que empiezan a encontrar su sitio.",
    count: "Actualizada cada viernes",
    tone: "lime",
  },
];

export const editorialTracks: EditorialTrack[] = [
  { id: "afterglow", title: "Afterglow", artist: "Northline", album: "Static Bloom", duration: "3:42", tone: "blue" },
  { id: "cerca", title: "Cerca", artist: "Lía Mar", album: "Mareas", duration: "3:18", tone: "lime" },
  { id: "human-nature", title: "Human Nature", artist: "Michael Jackson", album: "Thriller", duration: "4:06", coverUrl: thrillerCover, tone: "coral" },
  { id: "la-ultima-luz", title: "La última luz", artist: "Vera Sol", album: "Luz de paso", duration: "3:51", tone: "sand" },
  { id: "west-end", title: "West End", artist: "Kairo Blue", album: "Blue Notes / 01", duration: "2:57", tone: "violet" },
  { id: "still-life", title: "Still Life", artist: "Sora Ensemble", album: "Small Rooms", duration: "5:12", tone: "ink" },
];

export const discoveryMoods = [
  { id: "sin-prisa", title: "Sin prisa", copy: "Soul, folk y acústicos", tone: "sand" as const },
  { id: "subir-pulso", title: "Subir el pulso", copy: "Pop, funk y electrónica", tone: "coral" as const },
  { id: "foco", title: "Foco", copy: "Ambient, jazz y neoclásica", tone: "blue" as const },
  { id: "fuera-de-horas", title: "Fuera de horas", copy: "R&B, rap y club lento", tone: "violet" as const },
];

export const findEditorialArtist = (id?: string) =>
  editorialArtists.find((artist) => artist.id === id);

export const findEditorialRelease = (id?: string) =>
  editorialReleases.find((release) => release.id === id);

export const findEditorialPlaylist = (id?: string) =>
  editorialPlaylists.find((playlist) => playlist.id === id);

export const editorialTrackToCatalog = (track: EditorialTrack): CatalogTrack => ({
  id: track.id,
  title: track.title,
  artists: [{
    id: track.artist.toLowerCase().replace(/\s+/g, "-"),
    name: track.artist,
    imageUrl: null,
    providerId: "sonus",
  }],
  album: {
    id: track.album.toLowerCase().replace(/\s+/g, "-"),
    title: track.album,
    coverUrl: track.coverUrl ?? track.imageUrl ?? null,
    providerId: "sonus",
  },
  coverUrl: track.coverUrl ?? track.imageUrl ?? null,
  streamUrl: null,
  durationMs: null,
  year: null,
  genres: [],
  explicit: false,
  playCount: 0,
  providerId: "sonus",
});
