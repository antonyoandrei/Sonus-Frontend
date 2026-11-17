import React from "react";
import { ArrowLeft } from "lucide";
import { MorphIcon } from "morphicons/react";
import { Link } from "react-router-dom";
import "./not-found.css";

const NotFound = () => (
  <main className="not-found-page">
    <p>404 · Fuera de pista</p>
    <span aria-hidden="true">S</span>
    <h1>Esta página no está sonando.</h1>
    <Link className="sonus-button sonus-button--light" to="/">
      <MorphIcon icon={ArrowLeft} size={17} strokeWidth={1.8} reducedMotion="user" />
      Volver al inicio
    </Link>
  </main>
);

export default NotFound;
