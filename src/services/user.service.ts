import type { PostgrestError } from "@supabase/supabase-js";
import type { SonusUser, UpdateSonusUserInput } from "../personal/personal.types";
import { supabase } from "../supabase/client";

export interface ProfileRow {
  id: string;
  public_id: string;
  handle: string;
  display_name: string;
  bio: string | null;
  avatar_path: string | null;
  avatar_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface ProfileRelations {
  email?: string;
  followedUserIds?: string[];
  followedByIds?: string[];
}

const PROFILE_COLUMNS = [
  "id",
  "public_id",
  "handle",
  "display_name",
  "bio",
  "avatar_path",
  "avatar_url",
  "is_public",
  "created_at",
  "updated_at",
].join(",");

const throwPostgrestError = (error: PostgrestError | null): void => {
  if (error) {
    throw error;
  }
};

const getAvatarUrl = (profile: ProfileRow): string => {
  if (profile.avatar_url) {
    return profile.avatar_url;
  }
  if (!profile.avatar_path) {
    return "";
  }
  return supabase.storage.from("avatars").getPublicUrl(profile.avatar_path).data
    .publicUrl;
};

const getFollowRelations = async (
  profileId: string,
): Promise<Pick<ProfileRelations, "followedUserIds" | "followedByIds">> => {
  const [followingResult, followersResult] = await Promise.all([
    supabase
      .from("follows")
      .select("followed_id")
      .eq("follower_id", profileId),
    supabase
      .from("follows")
      .select("follower_id")
      .eq("followed_id", profileId),
  ]);

  throwPostgrestError(followingResult.error);
  throwPostgrestError(followersResult.error);

  const following = (followingResult.data ?? []) as Array<{
    followed_id: string;
  }>;
  const followers = (followersResult.data ?? []) as Array<{
    follower_id: string;
  }>;

  return {
    followedUserIds: following.map(({ followed_id }) => followed_id),
    followedByIds: followers.map(({ follower_id }) => follower_id),
  };
};

export const profileRowToSonusUser = (
  profile: ProfileRow,
  relations: ProfileRelations = {},
): SonusUser => ({
  id: profile.id,
  publicId: profile.public_id,
  handle: profile.handle,
  name: profile.display_name,
  email: relations.email ?? "",
  bio: profile.bio ?? "",
  avatar: getAvatarUrl(profile),
  isPublic: profile.is_public,
  playlists: [],
  followedUserIds: relations.followedUserIds ?? [],
  followedByIds: relations.followedByIds ?? [],
});

export const getProfileRowById = async (
  profileId: string,
): Promise<ProfileRow | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", profileId)
    .maybeSingle();

  throwPostgrestError(error);
  return data as ProfileRow | null;
};

export const getProfileRowByHandle = async (
  rawHandle: string,
): Promise<ProfileRow | null> => {
  const handle = rawHandle.trim();
  if (!handle) {
    return null;
  }

  const directResult = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("handle", handle)
    .maybeSingle();

  throwPostgrestError(directResult.error);
  if (directResult.data) {
    return directResult.data as unknown as ProfileRow;
  }

  const aliasResult = await supabase
    .from("profile_aliases")
    .select("profile_id")
    .eq("alias", handle)
    .maybeSingle();

  throwPostgrestError(aliasResult.error);
  const alias = aliasResult.data as { profile_id: string } | null;
  return alias ? getProfileRowById(alias.profile_id) : null;
};

export const getAllUsers = async (): Promise<SonusUser[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .order("display_name", { ascending: true });

  throwPostgrestError(error);
  return ((data ?? []) as unknown as ProfileRow[]).map((profile) =>
    profileRowToSonusUser(profile),
  );
};

export const getUserById = async (
  profileId: string,
  email = "",
): Promise<SonusUser | null> => {
  const profile = await getProfileRowById(profileId);
  if (!profile) {
    return null;
  }

  const relations = await getFollowRelations(profile.id);
  return profileRowToSonusUser(profile, { ...relations, email });
};

export const getUserByHandle = async (
  handle: string,
): Promise<SonusUser | null> => {
  const profile = await getProfileRowByHandle(handle);
  if (!profile) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  const relations = data.session
    ? await getFollowRelations(profile.id)
    : { followedUserIds: [], followedByIds: [] };
  return profileRowToSonusUser(profile, relations);
};

export const updateUser = async (
  profileId: string,
  input: UpdateSonusUserInput,
): Promise<SonusUser> => {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      display_name: input.name.trim(),
      handle: input.handle.trim().toLowerCase(),
      bio: input.bio.trim() || null,
      is_public: input.isPublic,
    })
    .eq("id", profileId)
    .select(PROFILE_COLUMNS)
    .single();

  throwPostgrestError(error);
  const profile = data as unknown as ProfileRow;
  const relations = await getFollowRelations(profile.id);
  return profileRowToSonusUser(profile, relations);
};

export const followUser = async (
  followerId: string,
  followedId: string,
): Promise<void> => {
  if (followerId === followedId) {
    throw new Error("A profile cannot follow itself.");
  }

  const { error } = await supabase
    .from("follows")
    .upsert(
      { follower_id: followerId, followed_id: followedId },
      { onConflict: "follower_id,followed_id", ignoreDuplicates: true },
    );

  throwPostgrestError(error);
};

export const unfollowUser = async (
  followerId: string,
  followedId: string,
): Promise<void> => {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("followed_id", followedId);

  throwPostgrestError(error);
};
