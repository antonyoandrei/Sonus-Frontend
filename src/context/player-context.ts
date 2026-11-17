import { createContext } from "react";
import type { CatalogTrack } from "../catalog/catalog.types";

export interface PlayerContextValue {
  currentSong: CatalogTrack | null;
  songs: CatalogTrack[];
  queue: CatalogTrack[];
  isShuffled: boolean;
  setSong(track: CatalogTrack | null): void;
  playTrack(track: CatalogTrack, queue?: CatalogTrack[]): void;
  setQueue(queue: CatalogTrack[]): void;
  nextTrack(): void;
  previousTrack(): void;
  shuffleSongs(): void;
}

export const PlayerContext = createContext<PlayerContextValue | null>(null);
