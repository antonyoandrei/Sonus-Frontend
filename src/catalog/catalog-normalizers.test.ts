import {
  normalizeArtistDetail,
  normalizeCatalogHome,
  normalizeGenreDetail,
  normalizeTrack,
} from "./catalog-normalizers";

describe("catalog normalizers", () => {
  it("maps the current Sonus song shape to the normalized track contract", () => {
    const track = normalizeTrack(
      {
        id: "track-1",
        name: "Northern Lights",
        url: "https://cdn.example/track.mp3",
        cover: "https://cdn.example/cover.jpg",
        duration: "3:21",
        explicit: true,
        Artist: [{ id: "artist-1", name: "Aster", img: "https://cdn.example/artist.jpg" }],
        Album: [{ id: "album-1", name: "Night Drive", cover: "https://cdn.example/album.jpg" }],
        Genres: [{ id: "genre-1", name: "Electronic" }],
      },
      "sonus",
    );

    expect(track).toEqual({
      id: "track-1",
      title: "Northern Lights",
      artists: [{
        id: "artist-1",
        name: "Aster",
        imageUrl: "https://cdn.example/artist.jpg",
        providerId: "sonus",
      }],
      album: {
        id: "album-1",
        title: "Night Drive",
        coverUrl: "https://cdn.example/album.jpg",
        providerId: "sonus",
      },
      coverUrl: "https://cdn.example/cover.jpg",
      streamUrl: "https://cdn.example/track.mp3",
      durationMs: 201000,
      year: null,
      genres: [{ id: "genre-1", name: "Electronic", providerId: "sonus" }],
      explicit: true,
      playCount: 0,
      providerId: "sonus",
    });
  });

  it("normalizes a home payload without exposing legacy relation names", () => {
    const home = normalizeCatalogHome(
      {
        songs: [{ id: "track-1", name: "Song", url: "https://cdn.example/song.mp3" }],
        albums: [{ id: "album-1", name: "Album", cover: null, Song: [] }],
        artists: [{ id: "artist-1", name: "Artist", img: null }],
        playlists: [{ id: "playlist-1", name: "Playlist", cover: null, Song: [] }],
        genres: [{ id: "genre-1", name: "Genre" }],
      },
      "sonus",
    );

    expect(home.tracks[0].title).toBe("Song");
    expect(home.albums[0].title).toBe("Album");
    expect(home.artists[0].name).toBe("Artist");
    expect(home.playlists[0].title).toBe("Playlist");
    expect(home.genres[0].name).toBe("Genre");
    expect(home.tracks[0]).not.toHaveProperty("name");
  });

  it("normalizes artist and genre detail collections", () => {
    const artist = normalizeArtistDetail({
      id: "artist-1",
      name: "Aster",
      Albums: [{ id: "album-1", name: "Night Drive", Song: [] }],
      Song: [{ id: "track-1", name: "Northern Lights" }],
    }, "sonus");
    const genre = normalizeGenreDetail({
      id: "genre-1",
      name: "Electronic",
      Artist: [{ id: "artist-1", name: "Aster" }],
      Song: [{ id: "track-1", name: "Northern Lights" }],
    }, "sonus");

    expect(artist.albums[0].title).toBe("Night Drive");
    expect(artist.tracks[0].artists[0].name).toBe("Aster");
    expect(genre.artists[0].name).toBe("Aster");
    expect(genre.tracks[0].genres[0].name).toBe("Electronic");
  });
});
