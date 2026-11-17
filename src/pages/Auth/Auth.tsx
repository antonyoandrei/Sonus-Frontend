import React, { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import sonusWordmark from "../../assets/brand/sonus-wordmark-white.png";
import stageVoice from "../../assets/discovery/stage-voice.jpg";
import { useAuth } from "../../auth/useAuth";
import {
  getAuthErrorMessage,
  getPasswordValidationError,
  sanitizeNextPath,
} from "../../auth/auth.utils";
import { Field } from "../../components/BrandUI/BrandUI";
import "./auth.css";

type AuthPageMode = "login" | "signup" | "forgot" | "recovery";

const isAuthPageMode = (value: string | null): value is AuthPageMode =>
  value === "login" ||
  value === "signup" ||
  value === "forgot" ||
  value === "recovery";

const waitForFeedback = (): Promise<void> =>
  new Promise((resolve) => window.setTimeout(resolve, 180));

const Auth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    authMode,
    isAuthenticated,
    isLoading,
    isPasswordRecovery,
    signIn,
    signUp,
    requestPasswordReset,
    updatePassword,
  } = useAuth();
  const isDemo = authMode === "demo";
  const requestedMode = searchParams.get("mode");
  const mode: AuthPageMode = isPasswordRecovery
    ? "recovery"
    : isAuthPageMode(requestedMode)
      ? requestedMode
      : "login";
  const next = sanitizeNextPath(searchParams.get("next"));
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authMode === "supabase" && !isLoading && isAuthenticated && mode !== "recovery") {
      navigate(next, { replace: true });
    }
  }, [authMode, isAuthenticated, isLoading, mode, navigate, next]);

  useEffect(() => {
    setError(null);
    setMessage(null);
    setPassword("");
    setPasswordConfirmation("");
  }, [mode]);

  const copy = useMemo(() => {
    switch (mode) {
      case "signup":
        return {
          title: isDemo ? "Diseña tu identidad." : "Crea tu cuenta.",
          description: isDemo
            ? "Crea un perfil local y recorre Sonus como si fuera tu propio archivo musical."
            : "Un perfil real, una biblioteca propia y una sesión que continúa donde la dejaste.",
          action: isDemo ? "Crear perfil demo" : "Crear cuenta",
        };
      case "forgot":
        return {
          title: "Prueba la recuperación.",
          description: isDemo
            ? "Simularemos el estado completo sin enviar ningún correo."
            : "Te enviaremos un enlace temporal para definir una contraseña nueva.",
          action: isDemo ? "Simular envío" : "Enviar enlace",
        };
      case "recovery":
        return {
          title: "Elige una contraseña nueva.",
          description: "Comprueba la validación y el estado de confirmación del formulario.",
          action: "Guardar contraseña",
        };
      default:
        return {
          title: isDemo ? "Entra sin fricción." : "Vuelve a escuchar.",
          description: isDemo
            ? "Prueba todos los estados del acceso. Los datos se quedan en este navegador."
            : "Entra en tu espacio personal sin salir de la experiencia Sonus.",
          action: isDemo ? "Activar perfil demo" : "Entrar",
        };
    }
  }, [isDemo, mode]);

  const changeMode = (nextMode: AuthPageMode) => {
    const params = new URLSearchParams();
    if (nextMode !== "login") {
      params.set("mode", nextMode);
    }
    if (next !== "/") {
      params.set("next", next);
    }
    setSearchParams(params, { replace: true });
  };

  const validatePassword = (): string | null => {
    const validationError = getPasswordValidationError(password);
    if (validationError) {
      return validationError;
    }
    if (password !== passwordConfirmation) {
      return "Las contraseñas no coinciden.";
    }
    return null;
  };

  const finishDemoFlow = async (feedback: string): Promise<void> => {
    setMessage(feedback);
    await waitForFeedback();
    navigate(next, { replace: true });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (mode === "signup" || mode === "recovery") {
      const passwordError = validatePassword();
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        if (isDemo) {
          await finishDemoFlow("Perfil demo activado. Entrando en Sonus.");
        }
      } else if (mode === "signup") {
        const result = await signUp({ displayName, email, password });
        if (isDemo) {
          await finishDemoFlow("Tu identidad local está lista.");
        } else if (result.requiresEmailConfirmation) {
          setMessage("Cuenta creada. Revisa tu email para confirmar el acceso.");
        }
      } else if (mode === "forgot") {
        await requestPasswordReset(email);
        setMessage(
          isDemo
            ? "Simulación completada. En producción recibirías un enlace seguro."
            : "Si existe una cuenta con ese email, recibirás un enlace de recuperación.",
        );
      } else {
        await updatePassword(password);
        if (isDemo) {
          await finishDemoFlow("Contraseña demo actualizada.");
        } else {
          setMessage("Contraseña actualizada. Ya puedes continuar en Sonus.");
          await waitForFeedback();
          navigate(next, { replace: true });
        }
      }
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <header className="auth-header">
        <Link to="/" className="auth-wordmark" aria-label="Volver a Sonus">
          <img src={sonusWordmark} alt="Sonus" />
        </Link>
        <Link className="auth-close" to={next}>Volver a Sonus</Link>
      </header>

      <section className="auth-stage" aria-labelledby="auth-title">
        <div className="auth-visual">
          <div className="auth-visual-media">
            <img src={stageVoice} alt="Artista actuando entre luces y humo" />
          </div>
          <div className="auth-visual-caption">
            <span>SONUS RADIO</span>
            <strong>Tu espacio, a tu ritmo.</strong>
            <p>El acceso es simulado. La experiencia es completamente navegable.</p>
          </div>
        </div>

        <div className="auth-panel">
          <p className="auth-eyebrow">{isDemo ? "Demo interactiva" : "Acceso Sonus"}</p>
          <h1 id="auth-title">{copy.title}</h1>
          <p className="auth-description">{copy.description}</p>

          {isDemo && mode !== "forgot" && mode !== "recovery" && (
            <p className="auth-demo-note">
              Usa cualquier email válido y una contraseña de al menos 8 caracteres.
            </p>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <Field
                autoComplete="name"
                id="auth-name"
                label="Nombre visible"
                maxLength={100}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Tu nombre"
                required
                tone="light"
                type="text"
                value={displayName}
              />
            )}

            {mode !== "recovery" && (
              <Field
                autoComplete="email"
                id="auth-email"
                label="Email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="demo@sonus.local"
                required
                tone="light"
                type="email"
                value={email}
              />
            )}

            {mode !== "forgot" && (
              <Field
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                id="auth-password"
                label={mode === "recovery" ? "Nueva contraseña" : "Contraseña"}
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                tone="light"
                type="password"
                value={password}
              />
            )}

            {(mode === "signup" || mode === "recovery") && (
              <Field
                autoComplete="new-password"
                id="auth-password-confirm"
                label="Repite la contraseña"
                minLength={8}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                placeholder="Escríbela de nuevo"
                required
                tone="light"
                type="password"
                value={passwordConfirmation}
              />
            )}

            {error && <p className="auth-feedback auth-error" id="auth-form-error" role="alert">{error}</p>}
            {message && <p className="auth-feedback auth-success" role="status">{message}</p>}

            <button className="auth-submit" disabled={isSubmitting || isLoading} type="submit">
              {isSubmitting ? "Procesando…" : copy.action}
            </button>
          </form>

          {isDemo && (
            <button className="auth-guest" type="button" onClick={() => navigate(next, { replace: true })}>
              Explorar como invitado
            </button>
          )}

          <div className="auth-links">
            {mode === "login" && (
              <>
                <button type="button" onClick={() => changeMode("forgot")}>He olvidado mi contraseña</button>
                <p>¿Aún no tienes perfil? <button type="button" onClick={() => changeMode("signup")}>Crear uno</button></p>
              </>
            )}
            {mode === "signup" && (
              <p>¿Ya tienes un perfil? <button type="button" onClick={() => changeMode("login")}>Inicia sesión</button></p>
            )}
            {mode === "forgot" && (
              <button type="button" onClick={() => changeMode("login")}>Volver al inicio de sesión</button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Auth;
