import {
  normalizeLikedAlbums,
  normalizeLikedPlaylists,
  normalizeSonusUser,
} from "./personal-normalizers";

describe("personal API normalizers", () => {
  it("keeps Prisma relation names behind the personal boundary", () => {
    const user = normalizeSonusUser({
      id: "user-1",
      name: "Ada",
      email: "ada@example.com",
      avatar: "avatar.jpg",
      Playlist: [{ id: "playlist-1", name: "Focus", Song: [] }],
      followedUserId: ["user-2"],
      followedById: [],
    });
    const albums = normalizeLikedAlbums([{ Albums: { id: "album-1", name: "Night", Song: [] } }]);
    const playlists = normalizeLikedPlaylists([{ Playlists: { id: "playlist-1", name: "Focus", Song: [] } }]);

    expect(user?.playlists[0].title).toBe("Focus");
    expect(user?.followedUserIds).toEqual(["user-2"]);
    expect(albums[0].title).toBe("Night");
    expect(playlists[0].title).toBe("Focus");
  });
});
