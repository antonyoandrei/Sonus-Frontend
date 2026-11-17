import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import type { CatalogProvider } from "../catalog/catalog-provider";
import { CatalogProviderProvider } from "../catalog/CatalogProviderProvider";
import type { CatalogSearchResult } from "../catalog/catalog.types";
import Searchbar from "../components/Searchbar/Searchbar";
import { PlayerProvider } from "../context/PlayerContext";
import { UserContextProvider } from "../context/UserContext";

jest.mock("swiper/modules", () => ({ Navigation: {} }));
jest.mock("swiper/react", () => ({
  Swiper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SwiperSlide: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock("../services/user.service", () => ({
  getAllUsers: jest.fn().mockResolvedValue([]),
}));
jest.mock("../auth/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    logout: jest.fn(),
  }),
}));

const searchResult: CatalogSearchResult = {
  tracks: [{
    id: "track-1",
    title: "Mi carro",
    artists: [{ id: "artist-1", name: "Artist1", imageUrl: null, providerId: "sonus" }],
    album: { id: "album-1", title: "Album1", coverUrl: null, providerId: "sonus" },
    coverUrl: "song-cover.jpg",
    streamUrl: "track.mp3",
    durationMs: null,
    year: null,
    genres: [],
    explicit: false,
    playCount: 0,
    providerId: "sonus",
  }],
  albums: [],
  artists: [],
  playlists: [{
    id: "playlist-1",
    title: "Mi carro",
    coverUrl: "playlist-cover.jpg",
    owner: null,
    tracks: [],
    providerId: "sonus",
  }],
  genres: [],
};

const provider: CatalogProvider = {
  id: "sonus",
  getHome: jest.fn(),
  search: jest.fn().mockResolvedValue(searchResult),
  getTrack: jest.fn(),
  getAlbum: jest.fn(),
  getArtist: jest.fn(),
  getPlaylist: jest.fn(),
  getGenre: jest.fn(),
  getGenres: jest.fn(),
};

describe("Searchbar", () => {
  it("renders normalized track and playlist results", async () => {
    render(
      <UserContextProvider>
        <PlayerProvider>
          <CatalogProviderProvider provider={provider}>
            <BrowserRouter>
              <Searchbar />
            </BrowserRouter>
          </CatalogProviderProvider>
        </PlayerProvider>
      </UserContextProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText("Search..."), {
      target: { value: "Mi carro" },
    });

    await waitFor(() => {
      expect(screen.getByText("Playlists")).toBeInTheDocument();
      expect(screen.getAllByText("Mi carro")).toHaveLength(2);
      expect(screen.getByText("All songs")).toBeInTheDocument();
    });
  });
});
