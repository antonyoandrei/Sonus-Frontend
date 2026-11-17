import React, { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomepageLoader from "../components/Loaders/HomepageLoader";
import PrivateRoutes from "./PrivateRoutes.routes";

const Home = lazy(() => import("../pages/Home/Home"));
const Discover = lazy(() => import("../pages/Discover/Discover"));
const New = lazy(() => import("../pages/New/New"));
const Search = lazy(() => import("../pages/Search/Search"));
const Library = lazy(() => import("../pages/Library/Library"));
const Album = lazy(() => import("../pages/Album/Album"));
const Artist = lazy(() => import("../pages/Artist/Artist"));
const Genres = lazy(() => import("../pages/Genres/Genres"));
const Playlist = lazy(() => import("../pages/Playlist/Playlist"));
const Profile = lazy(() => import("../pages/Profile/Profile"));
const Favourites = lazy(() => import("../pages/Favourites/Favourites"));
const Auth = lazy(() => import("../pages/Auth/Auth"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));
const Legal = lazy(() => import("../pages/Legal/Legal"));

const Pending = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<HomepageLoader />}>{children}</Suspense>
);

const Protected = ({ children }: { children: ReactNode }) => (
  <PrivateRoutes><Pending>{children}</Pending></PrivateRoutes>
);

const RoutesComponent = () => (
  <Routes>
    <Route path="/" element={<Pending><Home /></Pending>} />
    <Route path="/discover" element={<Pending><Discover /></Pending>} />
    <Route path="/new" element={<Pending><New /></Pending>} />
    <Route path="/search" element={<Pending><Search /></Pending>} />
    <Route path="/artist/:id" element={<Pending><Artist /></Pending>} />
    <Route path="/album/:id" element={<Pending><Album /></Pending>} />
    <Route path="/playlist/:id" element={<Pending><Playlist /></Pending>} />
    <Route path="/genre/:id" element={<Pending><Genres /></Pending>} />
    <Route path="/profile/:handle" element={<Pending><Profile /></Pending>} />
    <Route path="/auth" element={<Pending><Auth /></Pending>} />
    <Route path="/library" element={<Protected><Library /></Protected>} />
    <Route path="/library/:id" element={<Navigate replace to="/library" />} />
    <Route path="/favourites/:id" element={<Protected><Favourites /></Protected>} />
    <Route path="/legal/:document" element={<Pending><Legal /></Pending>} />
    <Route path="*" element={<Pending><NotFound /></Pending>} />
  </Routes>
);

export default RoutesComponent;
