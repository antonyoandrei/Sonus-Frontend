import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide";
import { MorphIcon } from "morphicons/react";
import { Link } from "react-router-dom";
import { usePlayer } from "../../utils/usePlayer";
import "./sonus-player.css";

const formatTime = (value: number) => {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const SonusPlayer = () => {
  const { currentSong, nextTrack, previousTrack, queue, isShuffled, shuffleSongs } = usePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.86);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const artwork = currentSong?.coverUrl ?? currentSong?.album?.coverUrl ?? null;
  const hasTrack = currentSong !== null;
  const canPlay = Boolean(currentSong?.streamUrl);
  const title = currentSong?.title ?? "Nada en reproducción";
  const artist = currentSong?.artists.map((item) => item.name).join(", ") || "Elige una canción";
  const albumName = currentSong?.album?.title ?? "Sonus";
  const progressPercent = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [isMuted, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    setProgress(0);
    setDuration(0);
    setIsPlaying(false);
    if (!audio || !currentSong?.streamUrl) return undefined;

    const play = async () => {
      try {
        audio.load();
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };

    void play();
    return undefined;
  }, [currentSong?.id, currentSong?.streamUrl]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !canPlay) return;
    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }
    audio.pause();
    setIsPlaying(false);
  };

  const seekTo = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = value;
    setProgress(value);
  };

  const queuePreview = useMemo(() => queue.slice(0, 6), [queue]);

  return (
    <>
      {isExpanded && (
        <button
          aria-label="Cerrar ahora suena"
          className="sonus-now-scrim"
          onClick={() => setIsExpanded(false)}
          type="button"
        />
      )}

      <aside
        className={`sonus-player${isPlaying ? " is-playing" : ""}${hasTrack ? "" : " is-empty"}${isExpanded ? " is-expanded" : ""}`}
        aria-label="Reproductor Sonus"
      >
        {artwork && <span className="sonus-player__glow" style={{ backgroundImage: `url(${artwork})` }} aria-hidden="true" />}

        <audio
          ref={audioRef}
          onEnded={() => {
            setIsPlaying(false);
            nextTrack();
          }}
          onError={() => setIsPlaying(false)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
          onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime || 0)}
          src={currentSong?.streamUrl ?? undefined}
        />

        {isExpanded && (
          <div className="sonus-now">
            <button className="sonus-now__close" onClick={() => setIsExpanded(false)} type="button">
              <MorphIcon icon={ChevronDown} size={22} strokeWidth={1.8} reducedMotion="user" />
            </button>
            <div className="sonus-now__cover">
              {artwork ? <img alt="" src={artwork} /> : <span>S</span>}
            </div>
            <div className="sonus-now__copy">
              <strong>{title}</strong>
              <span>{artist}</span>
              <small>{albumName}</small>
            </div>
            {queuePreview.length > 1 && (
              <ol className="sonus-now__queue">
                {queuePreview.map((track) => (
                  <li className={track.id === currentSong?.id ? "is-active" : undefined} key={track.id}>
                    {track.title}
                    <span>{track.artists[0]?.name}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        <button
          className="sonus-player__track"
          onClick={() => hasTrack && setIsExpanded((open) => !open)}
          type="button"
        >
          <span className={`sonus-player__artwork${artwork ? "" : " is-empty"}`}>
            {artwork ? <img decoding="async" src={artwork} alt="" /> : <span aria-hidden="true">S</span>}
          </span>
          <span className="sonus-player__meta" aria-live="polite">
            <strong>{title}</strong>
            <span>{artist}</span>
          </span>
        </button>

        <div className="sonus-player__transport">
          <div className="sonus-player__controls">
            <button
              aria-label={isShuffled ? "Desactivar aleatorio" : "Reproducción aleatoria"}
              aria-pressed={isShuffled}
              className={isShuffled ? "is-on" : undefined}
              onClick={shuffleSongs}
              type="button"
            >
              <MorphIcon icon={Shuffle} size={16} strokeWidth={1.8} reducedMotion="user" />
            </button>
            <button aria-label="Anterior" disabled={queue.length < 2} onClick={previousTrack} type="button">
              <MorphIcon icon={SkipBack} size={18} strokeWidth={1.8} reducedMotion="user" />
            </button>
            <button
              aria-label={!hasTrack ? "Selecciona una pista" : canPlay ? (isPlaying ? "Pausar" : "Reproducir") : "Audio no disponible"}
              className="sonus-player__play"
              disabled={!hasTrack}
              onClick={() => void togglePlayback()}
              type="button"
            >
              <MorphIcon
                icon={isPlaying ? Pause : Play}
                size={20}
                strokeWidth={1.9}
                spring="snappy"
                reducedMotion="user"
              />
            </button>
            <button aria-label="Siguiente" disabled={queue.length < 2} onClick={nextTrack} type="button">
              <MorphIcon icon={SkipForward} size={18} strokeWidth={1.8} reducedMotion="user" />
            </button>
            <span className="sonus-player__repeat" aria-hidden="true">
              <MorphIcon icon={Repeat} size={16} strokeWidth={1.8} reducedMotion="user" />
            </span>
          </div>

          <div className="sonus-player__timeline">
            <span>{formatTime(progress)}</span>
            <input
              aria-label="Progreso"
              disabled={!canPlay}
              max={duration || 0}
              min={0}
              onChange={(event) => seekTo(Number(event.target.value))}
              step="0.1"
              type="range"
              value={progress}
              style={{ "--progress": `${progressPercent}%` } as React.CSSProperties}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="sonus-player__aside">
          {currentSong?.album?.id ? (
            <Link aria-label="Abrir álbum" className="sonus-player__queue" to={`/album/${currentSong.album.id}`}>
              <MorphIcon icon={ListMusic} size={18} strokeWidth={1.8} reducedMotion="user" />
            </Link>
          ) : (
            <span className="sonus-player__queue is-disabled">
              <MorphIcon icon={ListMusic} size={18} strokeWidth={1.8} reducedMotion="user" />
            </span>
          )}
          <button
            aria-label={isMuted ? "Activar sonido" : "Silenciar"}
            className="sonus-player__volume"
            onClick={() => setIsMuted((muted) => !muted)}
            type="button"
          >
            <MorphIcon
              icon={isMuted || volume === 0 ? VolumeX : Volume2}
              size={18}
              strokeWidth={1.8}
              spring="snappy"
              reducedMotion="user"
            />
          </button>
          <input
            aria-label="Volumen"
            className="sonus-player__gain"
            max={1}
            min={0}
            onChange={(event) => {
              const nextVolume = Number(event.target.value);
              setVolume(nextVolume);
              if (nextVolume > 0) setIsMuted(false);
            }}
            step="0.01"
            type="range"
            value={isMuted ? 0 : volume}
          />
        </div>
      </aside>
    </>
  );
};

export default SonusPlayer;
