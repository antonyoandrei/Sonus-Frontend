import React, {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CatalogTrack } from "../catalog/catalog.types";
import { PlayerContext, type PlayerContextValue } from "./player-context";

const PLAYER_STORAGE_KEY = "sonus.player.v2";
const PLAYER_STORAGE_VERSION = 2;

interface PersistedPlayerState {
  version: number;
  queue: CatalogTrack[];
  currentTrackId: string | null;
  isShuffled: boolean;
}

const isCatalogTrack = (value: unknown): value is CatalogTrack => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const track = value as Partial<CatalogTrack>;
  return (
    typeof track.id === "string" &&
    typeof track.title === "string" &&
    typeof track.providerId === "string" &&
    Array.isArray(track.artists) &&
    Array.isArray(track.genres)
  );
};

const loadPlayerState = (): PersistedPlayerState => {
  const fallback: PersistedPlayerState = {
    version: PLAYER_STORAGE_VERSION,
    queue: [],
    currentTrackId: null,
    isShuffled: false,
  };

  try {
    const stored = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (!stored) {
      return fallback;
    }
    const parsed = JSON.parse(stored) as Partial<PersistedPlayerState>;
    if (parsed.version !== PLAYER_STORAGE_VERSION || !Array.isArray(parsed.queue)) {
      return fallback;
    }
    return {
      version: PLAYER_STORAGE_VERSION,
      queue: parsed.queue.filter(isCatalogTrack),
      currentTrackId:
        typeof parsed.currentTrackId === "string" ? parsed.currentTrackId : null,
      isShuffled: parsed.isShuffled === true,
    };
  } catch {
    return fallback;
  }
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [initialState] = useState(loadPlayerState);
  const [queue, setQueueState] = useState<CatalogTrack[]>(initialState.queue);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(
    initialState.currentTrackId,
  );
  const [isShuffled, setIsShuffled] = useState(initialState.isShuffled);

  const currentSong = useMemo(
    () => queue.find((track) => track.id === currentTrackId) ?? null,
    [currentTrackId, queue],
  );

  useEffect(() => {
    const persisted: PersistedPlayerState = {
      version: PLAYER_STORAGE_VERSION,
      queue,
      currentTrackId,
      isShuffled,
    };
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(persisted));
  }, [currentTrackId, isShuffled, queue]);

  const setQueue = useCallback((nextQueue: CatalogTrack[]) => {
    setQueueState(nextQueue);
    setCurrentTrackId((activeId) =>
      nextQueue.some((track) => track.id === activeId) ? activeId : null,
    );
  }, []);

  const playTrack = useCallback((track: CatalogTrack, contextQueue?: CatalogTrack[]) => {
    if (contextQueue?.length) {
      setQueueState(contextQueue);
    } else {
      setQueueState((currentQueue) =>
        currentQueue.some((item) => item.id === track.id)
          ? currentQueue
          : [...currentQueue, track],
      );
    }
    setCurrentTrackId(track.id);
  }, []);

  const setSong = useCallback((track: CatalogTrack | null) => {
    if (!track) {
      setCurrentTrackId(null);
      return;
    }
    playTrack(track);
  }, [playTrack]);

  const selectRelativeTrack = useCallback((direction: 1 | -1) => {
    if (queue.length === 0) {
      return;
    }
    const currentIndex = Math.max(
      0,
      queue.findIndex((track) => track.id === currentTrackId),
    );
    const nextIndex = isShuffled
      ? Math.floor(Math.random() * queue.length)
      : (currentIndex + direction + queue.length) % queue.length;
    setCurrentTrackId(queue[nextIndex].id);
  }, [currentTrackId, isShuffled, queue]);

  const value = useMemo<PlayerContextValue>(() => ({
    currentSong,
    songs: queue,
    queue,
    isShuffled,
    setSong,
    playTrack,
    setQueue,
    nextTrack: () => selectRelativeTrack(1),
    previousTrack: () => selectRelativeTrack(-1),
    shuffleSongs: () => setIsShuffled((current) => !current),
  }), [currentSong, isShuffled, playTrack, queue, selectRelativeTrack, setQueue, setSong]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};
