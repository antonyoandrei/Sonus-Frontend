import React, { type FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { getAuthErrorMessage, isValidHandle } from "../../auth/auth.utils";
import { useAuth } from "../../auth/useAuth";
import type { CatalogPlaylist } from "../../catalog/catalog.types";
import type { SonusUser, UpdateSonusUserInput } from "../../personal/personal.types";
import { getAllPlaylistsByUserId } from "../../services/playlist.service";
import {
  followUser,
  getUserByHandle,
  unfollowUser,
  updateUser,
} from "../../services/user.service";
import { getProfileInitials } from "../../utils/profile.utils";
import { useUserContext } from "../../utils/useUserContext";
import "./profile.info.css";

const ProfileInfo = () => {
  const { getAccessTokenSilently, refreshProfile } = useAuth();
  const { currentUser, refreshCurrentUser } = useUserContext();
  const { handle = "" } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userDetails, setUserDetails] = useState<SonusUser | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<CatalogPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFollowPending, setIsFollowPending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<UpdateSonusUserInput>({
    name: "",
    handle: "",
    bio: "",
    isPublic: true,
  });

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setLoadError(null);

    const loadProfile = async () => {
      try {
        const loadedUser = await getUserByHandle(handle);
        if (!active) {
          return;
        }
        if (!loadedUser) {
          setUserDetails(null);
          setLoadError("Este perfil no existe o no es público.");
          return;
        }

        setUserDetails(loadedUser);
        setForm({
          name: loadedUser.name,
          handle: loadedUser.handle,
          bio: loadedUser.bio,
          isPublic: loadedUser.isPublic,
        });

        if (loadedUser.handle.toLowerCase() !== handle.toLowerCase()) {
          navigate(`/profile/${encodeURIComponent(loadedUser.handle)}`, {
            replace: true,
          });
        }

        try {
          const playlists = await getAllPlaylistsByUserId(
            loadedUser.id,
            getAccessTokenSilently,
          );
          if (active) {
            setUserPlaylists(playlists ?? []);
          }
        } catch {
          if (active) {
            setUserPlaylists([]);
          }
        }
      } catch (error) {
        if (active) {
          console.error("Could not load the profile:", error);
          setLoadError("No se pudo cargar el perfil.");
          setUserDetails(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();
    return () => {
      active = false;
    };
  }, [getAccessTokenSilently, handle, navigate]);

  const isOwner = Boolean(
    currentUser && userDetails && currentUser.id === userDetails.id,
  );
  const isFollowing = Boolean(
    currentUser && userDetails?.followedByIds.includes(currentUser.id),
  );

  const refreshDisplayedUser = async () => {
    if (!userDetails) {
      return;
    }
    const refreshed = await getUserByHandle(userDetails.handle);
    if (refreshed) {
      setUserDetails(refreshed);
    }
  };

  const handleFollowClick = async () => {
    if (!currentUser || !userDetails || isOwner || isFollowPending) {
      return;
    }

    setIsFollowPending(true);
    try {
      if (isFollowing) {
        await unfollowUser(currentUser.id, userDetails.id);
      } else {
        await followUser(currentUser.id, userDetails.id);
      }
      await Promise.all([refreshDisplayedUser(), refreshCurrentUser()]);
    } catch {
      toast.error("No se pudo actualizar el seguimiento.");
    } finally {
      setIsFollowPending(false);
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser || !isOwner || isSaving) {
      return;
    }

    const normalizedName = form.name.trim();
    const normalizedHandle = form.handle.trim().toLowerCase();
    if (!normalizedName) {
      toast.error("El nombre visible es obligatorio.");
      return;
    }
    if (!isValidHandle(normalizedHandle)) {
      toast.error("El handle debe tener entre 3 y 32 caracteres y no puede contener espacios.");
      return;
    }
    if (form.bio.length > 500) {
      toast.error("La biografía no puede superar los 500 caracteres.");
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await updateUser(currentUser.id, {
        ...form,
        name: normalizedName,
        handle: normalizedHandle,
      });
      setUserDetails(updatedUser);
      setForm({
        name: updatedUser.name,
        handle: updatedUser.handle,
        bio: updatedUser.bio,
        isPublic: updatedUser.isPublic,
      });
      await Promise.all([refreshProfile(), refreshCurrentUser()]);
      setIsEditing(false);
      navigate(`/profile/${encodeURIComponent(updatedUser.handle)}`, {
        replace: true,
      });
      toast.success("Perfil actualizado.");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <main className="display-panel profile-state">Cargando perfil…</main>;
  }

  if (!userDetails) {
    return <main className="display-panel profile-state">{loadError}</main>;
  }

  const avatarStyle = userDetails.avatar
    ? { backgroundImage: `url(${userDetails.avatar})` }
    : undefined;

  return (
    <main className="display-panel">
      <section className="card-main">
        <div className="display-panel-content profile-content">
          <section className="user profile-identity">
            <div
              aria-label={`Avatar de ${userDetails.name}`}
              className={`user-img ${userDetails.avatar ? "" : "profile-avatar-initials"}`}
              role="img"
              style={avatarStyle}
            >
              {!userDetails.avatar && <span>{getProfileInitials(userDetails.name)}</span>}
            </div>

            <article className="user-details">
              <p className="profile-kicker">PERFIL SONUS</p>
              <h1 className="name-user">{userDetails.name}</h1>
              <p className="email-user">@{userDetails.handle}</p>
              {userDetails.bio && <p className="profile-bio">{userDetails.bio}</p>}
              {!userDetails.isPublic && isOwner && (
                <p className="profile-private-badge">Perfil privado</p>
              )}
            </article>

            <div className="follow-container">
              {!isOwner && (
                <button
                  className="follow-btn"
                  disabled={isFollowPending}
                  onClick={handleFollowClick}
                  type="button"
                >
                  <span className="follow-btn-text">
                    {isFollowPending
                      ? "…"
                      : isFollowing
                        ? t("Following")
                        : t("Follow +")}
                  </span>
                </button>
              )}
              {isOwner && (
                <button
                  className="profile-edit-button"
                  onClick={() => setIsEditing((value) => !value)}
                  type="button"
                >
                  {isEditing ? "Cancelar" : "Editar perfil"}
                </button>
              )}
              <article className="followers-wrapper">
                <strong>{userDetails.followedByIds.length}</strong>
                <span>{t("Followers")}</span>
              </article>
              <article className="followers-wrapper">
                <strong>{userDetails.followedUserIds.length}</strong>
                <span>{t("Following")}</span>
              </article>
            </div>
          </section>

          {isOwner && isEditing && (
            <form className="profile-edit-form" onSubmit={handleSave}>
              <div className="profile-edit-grid">
                <label>
                  <span>Nombre visible</span>
                  <input
                    maxLength={100}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    required
                    type="text"
                    value={form.name}
                  />
                </label>
                <label>
                  <span>Handle</span>
                  <div className="profile-handle-input">
                    <span>@</span>
                    <input
                      maxLength={32}
                      minLength={3}
                      onChange={(event) => setForm({ ...form, handle: event.target.value })}
                      required
                      type="text"
                      value={form.handle}
                    />
                  </div>
                </label>
              </div>
              <label>
                <span>Biografía</span>
                <textarea
                  maxLength={500}
                  onChange={(event) => setForm({ ...form, bio: event.target.value })}
                  placeholder="Cuenta algo sobre tu relación con la música."
                  rows={4}
                  value={form.bio}
                />
              </label>
              <label className="profile-privacy-control">
                <input
                  checked={form.isPublic}
                  onChange={(event) => setForm({ ...form, isPublic: event.target.checked })}
                  type="checkbox"
                />
                <span>
                  <strong>Perfil público</strong>
                  Visible en búsquedas y accesible para otros usuarios.
                </span>
              </label>
              <button className="profile-save-button" disabled={isSaving} type="submit">
                {isSaving ? "Guardando…" : "Guardar cambios"}
              </button>
            </form>
          )}

          <h2 className="playlist-title">{t("Playlists")}</h2>
          <article className="library-playlist-swiper">
            {userPlaylists.length === 0 && (
              <p className="profile-empty">Todavía no hay playlists que mostrar.</p>
            )}
            {userPlaylists.map((playlist) => (
              <NavLink
                className="playlist"
                key={String(playlist.id)}
                to={`/playlist/${playlist.id}`}
              >
                <div
                  className="image-playlist"
                  style={{ backgroundImage: `url(${playlist.coverUrl ?? ""})` }}
                />
                <p className="playlist-name">{playlist.title}</p>
              </NavLink>
            ))}
          </article>
        </div>
      </section>
    </main>
  );
};

export default ProfileInfo;
