import React from "react";
import { fireEvent, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import Player from "../components/Player/Player";

const mockNextTrack = jest.fn();
const mockPreviousTrack = jest.fn();

jest.mock("../utils/usePlayer", () => ({
  usePlayer: () => ({
    currentSong: {
      id: "track-1",
      title: "Track",
      streamUrl: "mocked-audio-url",
      artists: [],
      album: null,
      coverUrl: null,
      durationMs: null,
      year: null,
      genres: [],
      explicit: false,
      playCount: 0,
      providerId: "sonus",
    },
    nextTrack: mockNextTrack,
    previousTrack: mockPreviousTrack,
  }),
}));

describe("Player", () => {
  it("renders transport controls backed by the player store", () => {
    const { getByLabelText } = render(<Player />);

    const playPauseButton = getByLabelText("Play");
    const nextButton = getByLabelText("Skip");
    const previousButton = getByLabelText("Previous");

    expect(playPauseButton).toBeInTheDocument();
    fireEvent.click(nextButton);
    fireEvent.click(previousButton);

    expect(mockNextTrack).toHaveBeenCalledTimes(1);
    expect(mockPreviousTrack).toHaveBeenCalledTimes(1);
  });
});
