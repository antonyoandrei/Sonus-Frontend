import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, Edit3, UserPlus } from "lucide";
import { MorphIcon } from "morphicons/react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAuthErrorMessage, isValidHandle } from "../../auth/auth.utils";
import { useAuth } from "../../auth/useAuth";
import type { CatalogPlaylist } from "../../catalog/catalog.types";
import {
  BrandNotice,
  Field,
  PlaylistCard,
  SectionHeading,
} from "../../components/BrandUI/BrandUI";
import { editorialPlaylists, type EditorialTone } from "../../editorial/editorial-data";
import type { SonusUser, UpdateSonusUserInput } from "../../personal/personal.types";
import { getAllPlaylistsByUserId } from "../../services/playlist.service";
import { getProfileInitials, getProfileTone } from "../../utils/profile.utils";
import { useUserContext } from "../../utils/useUserContext";
import "./profile-page.css";

type LoadStatus = "loading" | "success" | "error";
type SaveStatus = "idle" | "saving" | "success" | "error";
type ProfileForm = UpdateSonusUserInput;

const tones: EditorialTone[] = ["coral", "blue", "lime", "sand", "violet", "ink"];
const emptyForm: ProfileForm = { name: "", handle: "", bio: "", isPublic: true };

const formFromProfile = (profile: SonusUser): ProfileForm => ({
  name: profile.name,
  handle: profile.handle,
  bio: profile.bio,
  isPublic: profile.isPublic,
});

const getFormErrors = (form: ProfileForm) => {
  const errors: Partial<Record<keyof ProfileForm, string>> = {};
  const name = form.name.trim();
  const handle = form.handle.trim();

  if (!name) errors.name = "Escribe un nombre visible.";
  else if (name.length > 100) errors.name = "El nombre puede tener hasta 100 caracteres.";

  if (!handle) errors.handle = "Elige un handle.";
  else if (!isValidHandle(handle)) {
    errors.handle = "Usa entre 3 y 32 letras, números, puntos, guiones o guiones bajos.";
  }

  if (form.bio.length > 500) errors.bio = "La biografía puede tener hasta 500 caracteres.";
  return errors;
};

const Profile = () => {
  const { handle = "" } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const {
    authMode,
    getAccessTokenSilently,
    isAuthenticated,
    updateProfile,
  } = useAuth();
  const { currentUser, refreshCurrentUser, replaceCurrentUser } = useUserContext();
  const currentUserRef = useRef(currentUser);
  const [profile, setProfile] = useState<SonusUser | null>(null);
  const [profileStatus, setProfileStatus] = useState<LoadStatus>("loading");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<CatalogPlaylist[]>([]);
  const [playlistsStatus, setPlaylistsStatus] = useState<LoadStatus>("loading");
  const [playlistReloadToken, setPlaylistReloadToken] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [serverHandleError, setServerHandleError] = useState<string | null>(null);
  const [followStatus, setFollowStatus] = useState<SaveStatus>("idle");
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [savedForm, setSavedForm] = useState<ProfileForm>(emptyForm);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    let active = true;
    const requestedHandle = handle.toLowerCase();
    setProfileStatus("loading");
    setProfileError(null);
    setPlaylists([]);
    setPlaylistsStatus("loading");
    setIsEditing(false);
    setSaveStatus("idle");

    const load = async () => {
      const localUser = currentUserRef.current;
      if (authMode === "demo" && !localUser) return;

      try {
        const loaded = localUser?.handle.toLowerCase() === requestedHandle
          ? localUser
          : await import("../../services/user.service").then(({ getUserByHandle }) =>
              getUserByHandle(handle),
            );
        if (!active) return;
        if (!loaded) {
          setProfile(null);
          setProfileError("Este perfil no existe o no es público.");
          setProfileStatus("error");
          setPlaylistsStatus("error");
          return;
        }

        const nextForm = formFromProfile(loaded);
        setProfile(loaded);
        setForm(nextForm);
        setSavedForm(nextForm);
        setProfileStatus("success");

        if (authMode === "demo") {
          setPlaylists([]);
          setPlaylistsStatus("success");
          return;
        }

        try {
          const loadedPlaylists = await getAllPlaylistsByUserId(
            loaded.id,
            getAccessTokenSilently,
          );
          if (!active) return;
          setPlaylists(loadedPlaylists ?? []);
          setPlaylistsStatus("success");
        } catch {
          if (!active) return;
          setPlaylists([]);
          setPlaylistsStatus("error");
        }
      } catch {
        if (!active) return;
        setProfile(null);
        setProfileError("No hemos podido cargar este perfil.");
        setProfileStatus("error");
        setPlaylistsStatus("error");
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [
    authMode,
    currentUser?.id,
    getAccessTokenSilently,
    handle,
    playlistReloadToken,
  ]);

  const isOwner = Boolean(currentUser && profile && currentUser.id === profile.id);
  const isFollowing = Boolean(
    currentUser && profile?.followedByIds.includes(currentUser.id),
  );
  const formErrors = useMemo(() => getFormErrors(form), [form]);
  const hasFormErrors = Object.keys(formErrors).length > 0 || Boolean(serverHandleError);
  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm],
  );
  const openEditor = () => {
    setConfirmDiscard(false);
    setIsEditing(true);
    setSaveStatus("idle");
    window.requestAnimationFrame(() => {
      document.getElementById("profile-name")?.focus();
    });
  };

  const cancelEditing = () => {
    setForm(savedForm);
    setServerHandleError(null);
    setSaveError(null);
    setSaveStatus("idle");
    setConfirmDiscard(false);
    setIsEditing(false);
  };

  const requestCancel = () => {
    if (isDirty) {
      setConfirmDiscard(true);
      return;
    }
    cancelEditing();
  };

  const updateForm = <Key extends keyof ProfileForm>(
    key: Key,
    value: ProfileForm[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "handle") setServerHandleError(null);
    setSaveError(null);
    setSaveStatus("idle");
    setConfirmDiscard(false);
  };

  useEffect(() => {
    if (!isEditing) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestCancel();
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    };

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [isDirty, isEditing, requestCancel]);

  const handleFollow = async () => {
    if (!currentUser || !profile || isOwner || followStatus === "saving") return;
    setFollowStatus("saving");
    try {
      const { followUser, unfollowUser } = await import("../../services/user.service");
      if (isFollowing) await unfollowUser(currentUser.id, profile.id);
      else await followUser(currentUser.id, profile.id);
      setProfile((loadedProfile) => loadedProfile ? {
        ...loadedProfile,
        followedByIds: isFollowing
          ? loadedProfile.followedByIds.filter((id) => id !== currentUser.id)
          : [...loadedProfile.followedByIds, currentUser.id],
      } : loadedProfile);
      setFollowStatus("success");
      await refreshCurrentUser();
    } catch {
      setFollowStatus("error");
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile || !isOwner || saveStatus === "saving" || hasFormErrors || !isDirty) return;

    setSaveStatus("saving");
    setSaveError(null);
    setServerHandleError(null);
    try {
      const input: UpdateSonusUserInput = {
        name: form.name.trim(),
        handle: form.handle.trim().toLowerCase(),
        bio: form.bio.trim(),
        isPublic: form.isPublic,
      };
      const updated = await updateProfile(input);
      const nextForm = formFromProfile(updated);
      setProfile(updated);
      setForm(nextForm);
      setSavedForm(nextForm);
      replaceCurrentUser(updated);
      setSaveStatus("success");
      setIsEditing(false);
      setConfirmDiscard(false);
      if (updated.handle !== handle) {
        navigate(`/profile/${encodeURIComponent(updated.handle)}`, { replace: true });
      }
    } catch (error) {
      const message = getAuthErrorMessage(error);
      if (message.toLowerCase().includes("handle")) setServerHandleError(message);
      setSaveError(message);
      setSaveStatus("error");
    }
  };

  if (profileStatus === "loading") {
    return (
      <main className="brand-page profile-brand-page" aria-busy="true">
        <div className="profile-brand-loading" aria-label="Cargando perfil">
          <span /><span />
        </div>
      </main>
    );
  }

  if (!profile || profileStatus === "error") {
    return (
      <main className="brand-page profile-brand-page">
        <BrandNotice eyebrow="Perfil" title="No encontramos a este oyente.">
          <p>{profileError}</p>
        </BrandNotice>
      </main>
    );
  }

  return (
    <main className="brand-page profile-brand-page">
      <section className={`profile-brand-hero${isEditing ? " is-editing" : ""}`}>
        <div className={`profile-brand-avatar brand-tone--${getProfileTone(profile.name)}${profile.avatar ? " has-image" : ""}`}>
          {profile.avatar ? (
            <img alt={`Avatar de ${profile.name}`} decoding="async" src={profile.avatar} />
          ) : (
            <span>{getProfileInitials(profile.name)}</span>
          )}
        </div>

        <div className="profile-brand-identity">
          <p className="brand-eyebrow">
            `Perfil${authMode === "demo" && isOwner ? " demo" : ""}`
          </p>
          <h1>{profile.name}</h1>
          <p className="profile-brand-handle">@{profile.handle}</p>
          {profile.bio ? (
            <p className="profile-brand-bio">{profile.bio}</p>
          ) : isOwner && !isEditing ? (
            <button className="profile-brand-add-bio" onClick={openEditor} type="button">
              Añade una bio para contar qué escuchas.
            </button>
          ) : null}

          <div className="profile-brand-meta">
            <span className={`profile-visibility${profile.isPublic ? " is-public" : ""}`}>
              {profile.isPublic ? "Público" : "Privado"}
            </span>
            <span>@{profile.handle}</span>
          </div>

          <div className="profile-brand-actions">
            {isOwner ? (
              <button
                aria-expanded={isEditing}
                className="sonus-button sonus-button--line"
                onClick={isEditing ? requestCancel : openEditor}
                type="button"
              >
                <MorphIcon icon={Edit3} size={17} strokeWidth={1.8} reducedMotion="user" />
                {isEditing ? "Cerrar edición" : "Editar perfil"}
              </button>
            ) : isAuthenticated ? (
              <button
                aria-pressed={isFollowing}
                className="sonus-button sonus-button--light"
                disabled={followStatus === "saving"}
                onClick={() => void handleFollow()}
                type="button"
              >
                <MorphIcon icon={isFollowing ? Check : UserPlus} size={17} strokeWidth={1.8} reducedMotion="user" />
                {followStatus === "saving" ? "Actualizando…" : isFollowing ? "Siguiendo" : "Seguir"}
              </button>
            ) : (
              <Link
                className="sonus-button sonus-button--light"
                to={`/auth?next=${encodeURIComponent(`/profile/${profile.handle}`)}`}
              >
                <MorphIcon icon={UserPlus} size={17} strokeWidth={1.8} reducedMotion="user" />
                Accede para seguir
              </Link>
            )}
          </div>
          {followStatus === "error" && (
            <p className="profile-brand-follow-error" role="alert">
              No hemos podido actualizar el seguimiento. Inténtalo de nuevo.
            </p>
          )}
          {saveStatus === "success" && !isEditing && isOwner && (
            <p className="profile-brand-saved" role="status">Perfil actualizado.</p>
          )}
        </div>

        <dl className="profile-brand-stats">
          <div><dt>Playlists</dt><dd>{playlists.length}</dd></div>
          <div><dt>Seguidores</dt><dd>{profile.followedByIds.length}</dd></div>
          <div><dt>Siguiendo</dt><dd>{profile.followedUserIds.length}</dd></div>
        </dl>
      </section>

      {isOwner && isEditing && (
        <form
          aria-busy={saveStatus === "saving"}
          className="profile-identity-studio"
          id="profile-identity-studio"
          onSubmit={handleSave}
          ref={formRef}
        >
            <div className="profile-identity-studio__fields">
              <Field
                autoComplete="name"
                error={formErrors.name}
                id="profile-name"
                label="Nombre visible"
                maxLength={100}
                onChange={(event) => updateForm("name", event.target.value)}
                value={form.name}
              />
              <Field
                autoCapitalize="none"
                autoComplete="username"
                error={formErrors.handle ?? serverHandleError ?? undefined}
                hint="Tu dirección pública en Sonus."
                id="profile-handle"
                label="Handle"
                maxLength={32}
                onChange={(event) => updateForm("handle", event.target.value.replace(/^@/, ""))}
                prefix="@"
                spellCheck={false}
                value={form.handle}
              />
              <Field
                as="textarea"
                error={formErrors.bio}
                id="profile-bio"
                label={<><span>Biografía</span><em>{form.bio.length} / 500</em></>}
                maxLength={500}
                onChange={(event) => updateForm("bio", event.target.value)}
                placeholder="Qué escuchas, qué buscas, qué quieres compartir."
                rows={5}
                value={form.bio}
              />
            </div>

            <div className="profile-privacy-control">
              <button
                aria-checked={form.isPublic}
                aria-label="Perfil público"
                className={form.isPublic ? "is-active" : undefined}
                onClick={() => updateForm("isPublic", !form.isPublic)}
                role="switch"
                type="button"
              >
                <span />
              </button>
              <span>
                <strong>{form.isPublic ? "Perfil público" : "Perfil privado"}</strong>
                <small>
                  {form.isPublic
                    ? "Otros oyentes pueden encontrar tu perfil y tus playlists."
                    : "Solo tú podrás ver este perfil mientras esté privado."}
                </small>
              </span>
            </div>

            <footer className="profile-identity-studio__actions">
              <div aria-live="polite" className="profile-save-message">
                {confirmDiscard && <p>Tienes cambios sin guardar. ¿Los descartas?</p>}
                {saveStatus === "error" && <p role="alert">{saveError}</p>}
                {saveStatus === "idle" && isDirty && !confirmDiscard && <p>Cambios sin guardar.</p>}
                {saveStatus === "saving" && <p>Guardando identidad.</p>}
              </div>
              {confirmDiscard ? (
                <>
                  <button className="profile-cancel-button" onClick={() => setConfirmDiscard(false)} type="button">
                    Seguir editando
                  </button>
                  <button className="sonus-button sonus-button--line" onClick={cancelEditing} type="button">
                    Descartar
                  </button>
                </>
              ) : (
                <>
                  <button className="profile-cancel-button" onClick={requestCancel} type="button">
                    Cancelar
                  </button>
                  <button
                    className="sonus-button sonus-button--light"
                    disabled={!isDirty || hasFormErrors || saveStatus === "saving"}
                    type="submit"
                  >
                    {saveStatus === "saving" ? "Guardando…" : "Guardar cambios"}
                  </button>
                </>
              )}
            </footer>
        </form>
      )}

      <section className="profile-brand-section">
        <SectionHeading title="Playlists" />
        {playlistsStatus === "loading" ? (
          <div className="profile-playlist-loading" aria-label="Cargando playlists">
            <span /><span />
          </div>
        ) : playlistsStatus === "error" ? (
          <BrandNotice
            action={(
              <button
                className="sonus-button sonus-button--line"
                onClick={() => setPlaylistReloadToken((value) => value + 1)}
                type="button"
              >
                Reintentar
              </button>
            )}
            eyebrow="Playlists"
            title="No hemos podido cargar esta parte del perfil."
          >
            <p>El resto del perfil sigue disponible.</p>
          </BrandNotice>
        ) : playlists.length ? (
          <div className="profile-brand-playlists">
            {playlists.map((playlist, index) => (
              <PlaylistCard
                key={playlist.id}
                playlist={{
                  id: playlist.id,
                  title: playlist.title,
                  description: "",
                  count: `${playlist.tracks.length} pistas`,
                  eyebrow: `@${profile.handle}`,
                  imageUrl: playlist.coverUrl ?? undefined,
                  tone: tones[index % tones.length],
                }}
              />
            ))}
          </div>
        ) : (
          <BrandNotice
            action={isOwner ? <Link className="sonus-button sonus-button--line" to="/library">Ir a Biblioteca</Link> : undefined}
            eyebrow="Playlists"
            title={isOwner ? "Tu primera playlist empieza en la Biblioteca." : "Todavía no hay playlists aquí."}
          >
            <p>{isOwner ? "Crea una colección y aparecerá en este perfil." : "Cuando este oyente publique una colección, aparecerá aquí."}</p>
          </BrandNotice>
        )}
      </section>

      {isOwner && (
        <section className="profile-brand-section">
          <SectionHeading eyebrow="Selección Sonus" title="Para seguir escuchando" />
          <div className="profile-brand-playlists">
            {editorialPlaylists.slice(0, 2).map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default Profile;
