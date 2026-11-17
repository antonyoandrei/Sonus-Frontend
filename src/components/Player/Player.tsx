import React from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import "./Player.css";
import { usePlayer } from "../../utils/usePlayer";

const Player = () => {
  const { currentSong, nextTrack, previousTrack } = usePlayer();

  const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-player-play-filled" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" strokeWidth="0" fill="currentColor" />
    </svg>
  );

  const NextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-player-skip-forward-filled" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M3 5v14a1 1 0 0 0 1.504 .864l12 -7a1 1 0 0 0 0 -1.728l-12 -7a1 1 0 0 0 -1.504 .864z" strokeWidth="0" fill="currentColor" />
      <path d="M20 4a1 1 0 0 1 1 1v14a1 1 0 0 1 -2 0v-14a1 1 0 0 1 1 -1z" strokeWidth="0" fill="currentColor" />
    </svg>
  );

  const PreviousIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-player-skip-back-filled" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M19.496 4.136l-12 7a1 1 0 0 0 0 1.728l12 7a1 1 0 0 0 1.504 -.864v-14a1 1 0 0 0 -1.504 -.864z" strokeWidth="0" fill="currentColor" />
      <path d="M4 4a1 1 0 0 1 1 1v14a1 1 0 0 1 -2 0v-14a1 1 0 0 1 1 -1z" strokeWidth="0" fill="currentColor" />
    </svg>
  );

  const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-player-pause-filled" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" strokeWidth="0" fill="currentColor" />
      <path d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" strokeWidth="0" fill="currentColor" />
    </svg>
  );

  return (
    <AudioPlayer
      showSkipControls
      showJumpControls={false}
      src={currentSong?.streamUrl ?? undefined}
      customIcons={{
        play: <PlayIcon />,
        next: <NextIcon />,
        previous: <PreviousIcon />,
        pause: <PauseIcon />,
      }}
      autoPlayAfterSrcChange
      onClickNext={nextTrack}
      onClickPrevious={previousTrack}
      onEnded={nextTrack}
    />
  );
};

export default Player;
