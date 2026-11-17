import React from "react";
import { Link } from "react-router-dom";
import sonusWordmark from "../../assets/brand/sonus-wordmark-white.png";
import "./footer.css";

const Footer = () => (
  <footer className="footer-container">
    <Link className="footer-brand" to="/" aria-label="Sonus, inicio">
      <img src={sonusWordmark} alt="Sonus" />
    </Link>
    <p>Una plataforma musical en movimiento.</p>
    <nav aria-label="Enlaces de Sonus">
      <Link to="/search">Explorar</Link>
      <Link to="/auth">Acceso demo</Link>
    </nav>
  </footer>
);

export default Footer;
