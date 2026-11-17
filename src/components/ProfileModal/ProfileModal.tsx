import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { getProfileInitials } from "../../utils/profile.utils";
import { useUserContext } from "../../utils/useUserContext";
import "./profile.modal.css";

const ProfileModal = () => {
  const { isAuthenticated, logout } = useAuth();
  const { currentUser } = useUserContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [isElementHidden, setIsElementHidden] = useState(true);

  const toggleElement = useCallback(() => {
    setIsElementHidden((isHidden) => !isHidden);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (isElementHidden) {
        return;
      }
      const target = event.target as Element | null;
      if (
        target &&
        !target.closest(".profile-modal") &&
        !target.closest(".corner-user")
      ) {
        setIsElementHidden(true);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsElementHidden(true);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isElementHidden]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsElementHidden(true);
      navigate("/", { replace: true });
    } catch {
      toast.error("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    }
  };

  const next = `${location.pathname}${location.search}${location.hash}`;
  const profileUrl = currentUser
    ? `/profile/${encodeURIComponent(currentUser.handle)}`
    : "/";
  const initials = getProfileInitials(currentUser?.name ?? "Sonus");

  return (
    <section className="corner-items">
      <article className="corner-logo-img">
        <NavLink className="corner-img" to="/" aria-label="Sonus, inicio" />
      </article>
      <article className="corner-user-container">
        {isAuthenticated ? (
          <>
            <div
              aria-hidden={isElementHidden}
              className={`profile-modal ${
                isElementHidden ? "hidden-modal" : "visible-modal"
              }`}
            >
              <NavLink
                aria-label="Abrir mi perfil"
                onClick={() => setIsElementHidden(true)}
                to={profileUrl}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                  <path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M6 20a6 6 0 0 1 12 0M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9Z" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </NavLink>
              <button aria-label="Cerrar sesión" onClick={handleLogout} type="button">
                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                  <path d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2M9 12h12m-3-3 3 3-3 3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            </div>
            <button
              aria-expanded={!isElementHidden}
              aria-haspopup="menu"
              aria-label="Abrir menú de usuario"
              className={`corner-user ${currentUser?.avatar ? "has-avatar" : "profile-avatar-initials"}`}
              onClick={toggleElement}
              style={
                currentUser?.avatar
                  ? { backgroundImage: `url(${currentUser.avatar})` }
                  : undefined
              }
              type="button"
            >
              {!currentUser?.avatar && <span>{initials}</span>}
            </button>
          </>
        ) : (
          <Link
            aria-label="Iniciar sesión"
            className="corner-login"
            to={`/auth?next=${encodeURIComponent(next)}`}
          >
            <span>Entrar</span>
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              <path d="M15 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2M21 12H8m3-3-3 3 3 3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </Link>
        )}
      </article>
    </section>
  );
};

export default ProfileModal;
