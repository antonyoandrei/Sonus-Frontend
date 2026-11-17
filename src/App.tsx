import React from 'react'
import { HelmetProvider } from 'react-helmet-async';
import RoutesComponent from "./routes/PublicRoutes.routes";
import AppShell from './app/AppShell';

function App() {
  const helmetContext = {};

  return (
    <HelmetProvider context={helmetContext}>
      <AppShell>
        <RoutesComponent />
      </AppShell>
    </HelmetProvider>
  )
}

export default App
