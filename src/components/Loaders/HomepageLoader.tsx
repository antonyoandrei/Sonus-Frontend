import React from "react";
import "./homepage-loader.css";

const HomepageLoader = () => (
  <div className="sonus-route-loader" role="status">
    <span className="sonus-route-loader__mark" aria-hidden="true">S</span>
    <span className="sonus-route-loader__copy">Cargando Sonus</span>
    <span className="sonus-route-loader__signal" aria-hidden="true">
      <i /><i /><i /><i /><i />
    </span>
  </div>
);

export default HomepageLoader;
