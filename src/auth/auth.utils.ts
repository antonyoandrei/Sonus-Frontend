const PASSWORD_MIN_LENGTH = 8;

export const sanitizeNextPath = (value: string | null): string => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  if (value.includes("\\")) {
    return "/";
  }
  return value;
};

export const getPasswordValidationError = (password: string): string | null => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "La contraseña debe incluir al menos una letra y un número.";
  }
  return null;
};

export const isValidHandle = (handle: string): boolean =>
  handle.length >= 3 &&
  handle.length <= 32 &&
  /^[A-Za-z0-9_][A-Za-z0-9_.-]*$/.test(handle);

export const getAuthErrorMessage = (error: unknown): string => {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("invalid login credentials")) {
    return "El email o la contraseña no son correctos.";
  }
  if (message.includes("email not confirmed")) {
    return "Confirma tu email antes de iniciar sesión.";
  }
  if (message.includes("user already registered")) {
    return "Ya existe una cuenta asociada a ese email.";
  }
  if (message.includes("password") && message.includes("weak")) {
    return "La contraseña no cumple los requisitos de seguridad.";
  }
  if (message.includes("rate limit")) {
    return "Se han hecho demasiados intentos. Espera un momento y prueba de nuevo.";
  }
  if (message.includes("reserved by an existing alias") || message.includes("duplicate")) {
    return "Ese handle ya está reservado. Prueba con otro.";
  }

  return "No se pudo completar la operación. Inténtalo de nuevo.";
};
