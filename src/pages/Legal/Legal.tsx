import React from "react";
import { useParams } from "react-router-dom";
import { PageIntro } from "../../components/BrandUI/BrandUI";
import "./legal.css";

const Legal = () => {
  const { document } = useParams<{ document: string }>();
  const isPrivacy = document === "privacy";
  return (
    <main className="brand-page legal-page">
      <PageIntro eyebrow="Sonus" title={isPrivacy ? "Privacidad" : "Términos"}>
        <p>{isPrivacy ? "Cómo tratamos la información necesaria para que Sonus funcione." : "Las reglas básicas para usar y disfrutar Sonus."}</p>
      </PageIntro>
      <article>
        <h2>Documento en preparación</h2>
        <p>Esta pantalla forma parte de la nueva arquitectura de marca. El texto legal definitivo se incorporará antes de publicar el producto.</p>
        <p>Hasta entonces, el modo de demostración guarda únicamente preferencias locales de escucha e identidad de muestra en este navegador.</p>
      </article>
    </main>
  );
};

export default Legal;
