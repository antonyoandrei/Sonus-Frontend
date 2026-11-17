import React, {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Compass,
  Home,
  Library,
  Menu,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide";
import { MorphIcon } from "morphicons/react";
import { Link, NavLink, useLocation } from "react-router-dom";
import sonusWordmark from "../assets/brand/sonus-wordmark-white.png";
import { useAuth } from "../auth/useAuth";
import SonusPlayer from "../components/SonusPlayer/SonusPlayer";
import ToasterComponent from "../components/ToasterComponent/ToasterComponent";
import { useUserContext } from "../utils/useUserContext";
import { useScrollRestoration } from "../utils/useScrollRestoration";
import "./app-shell.css";

interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const location = useLocation();
  const { authMode, isAuthenticated } = useAuth();
  const { currentUser } = useUserContext();
  useScrollRestoration();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isAuthRoute = location.pathname === "/auth";
  const libraryPath = "/library";
  const profilePath = currentUser
    ? `/profile/${encodeURIComponent(currentUser.handle)}`
    : authMode === "supabase" && !isAuthenticated
      ? "/auth?next=%2Fprofile"
      : "/profile/oyente_sonus";
  const initials = currentUser?.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SO";
  const mobileNavigation = [
    { description: "Listen Now", end: true, icon: Home, label: "Inicio", to: "/" },
    { description: "Artistas y álbumes", icon: Compass, label: "Descubrir", to: "/discover" },
    { description: "Recién llegado", icon: Sparkles, label: "Novedades", to: "/new" },
    { description: "Todo el catálogo", icon: Search, label: "Buscar", to: "/search" },
    { description: "Tus colecciones", icon: Library, label: "Biblioteca", to: libraryPath },
    { description: currentUser?.handle ? `@${currentUser.handle}` : "Tu espacio", icon: UserRound, label: "Perfil", to: profilePath },
  ];

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    const desktopQuery = window.matchMedia("(min-width: 981px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setIsMenuOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    desktopQuery.addEventListener("change", closeOnDesktop);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      desktopQuery.removeEventListener("change", closeOnDesktop);
    };
  }, [isMenuOpen]);

  if (isAuthRoute) {
    return (
      <div className="sonus-shell sonus-shell--auth">
        <ToasterComponent />
        {children}
      </div>
    );
  }

  return (
    <div className="sonus-shell sonus-shell--content">
      <a className="sonus-skip-link" href="#sonus-main-content">Saltar al contenido</a>
      <header className={`sonus-shell-header${isMenuOpen ? " is-menu-open" : ""}`}>
        <div className="sonus-shell-header__inner">
          <Link className="sonus-shell-brand" to="/" aria-label="Sonus, inicio">
            <img src={sonusWordmark} alt="Sonus" />
          </Link>

          <nav className="sonus-shell-nav" aria-label="Navegación principal">
            <NavLink end to="/">Inicio</NavLink>
            <NavLink to="/discover">Descubrir</NavLink>
            <NavLink to="/new">Novedades</NavLink>
            <NavLink to={libraryPath}>Biblioteca</NavLink>
          </nav>

          <div className="sonus-shell-actions">
            <Link className="sonus-shell-search" to="/search" aria-label="Buscar música">
              <MorphIcon icon={Search} size={18} strokeWidth={1.8} reducedMotion="user" />
              <span>Buscar</span>
            </Link>
            <Link className="sonus-shell-profile" to={profilePath} aria-label="Abrir perfil">
              <span className="sonus-shell-profile__avatar">{initials}</span>
              <span className="sonus-shell-profile__copy">
                <strong>{currentUser?.name ?? "Tu perfil"}</strong>
                <span>{currentUser ? `@${currentUser.handle}` : "Acceder"}</span>
              </span>
            </Link>
            <button
              aria-controls="sonus-mobile-navigation"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              className={`sonus-shell-menu-button${isMenuOpen ? " is-open" : ""}`}
              onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
              ref={menuButtonRef}
              type="button"
            >
              <MorphIcon
                icon={isMenuOpen ? X : Menu}
                size={22}
                strokeWidth={1.8}
                spring="snappy"
                reducedMotion="user"
              />
            </button>
          </div>
        </div>

        <button
          aria-hidden="true"
          className={`sonus-shell-mobile-scrim${isMenuOpen ? " is-open" : ""}`}
          onClick={() => setIsMenuOpen(false)}
          tabIndex={-1}
          type="button"
        />

        <nav
          aria-hidden={!isMenuOpen}
          aria-label="Navegación móvil"
          className={`sonus-shell-mobile-nav${isMenuOpen ? " is-open" : ""}`}
          id="sonus-mobile-navigation"
        >
          <span className="sonus-shell-mobile-nav__eyebrow">Navegar por Sonus</span>
          {mobileNavigation.map((item, index) => (
            <NavLink
              end={item.end}
              key={item.to}
              onClick={() => setIsMenuOpen(false)}
              style={{ "--menu-index": index } as CSSProperties}
              tabIndex={isMenuOpen ? 0 : -1}
              to={item.to}
            >
              <span className="sonus-shell-mobile-nav__icon" aria-hidden="true">
                <MorphIcon icon={item.icon} size={19} strokeWidth={1.7} reducedMotion="user" />
              </span>
              <span className="sonus-shell-mobile-nav__copy">
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
              <span className="sonus-shell-mobile-nav__index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
            </NavLink>
          ))}
        </nav>
      </header>

      <ToasterComponent />
      <div className="sonus-shell-main" id="sonus-main-content" >{children}</div>
      <SonusPlayer />
    </div>
  );
};

export default AppShell;
