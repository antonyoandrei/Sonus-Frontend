import React, { lazy, Suspense, type ReactNode } from "react";
import { authRuntimeMode } from "./auth-mode";
import { DemoAuthProvider } from "./DemoAuthProvider";

const SupabaseAuthProvider = lazy(() => import("./SupabaseAuthProvider"));

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  if (authRuntimeMode === "demo") {
    return <DemoAuthProvider>{children}</DemoAuthProvider>;
  }

  return (
    <Suspense fallback={<div className="loader-wrapper" aria-label="Cargando sesión" />}>
      <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
    </Suspense>
  );
};
