import React from 'react'
import ReactDOM from 'react-dom/client'
import "@fontsource-variable/outfit/wght.css"
import App from './App.tsx'
import "./css/main.css"
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider.tsx'
import { UserContextProvider } from './context/UserContext.tsx'
import { PlayerProvider } from './context/PlayerContext.tsx'
import { CatalogProviderProvider } from './catalog/CatalogProviderProvider.tsx'
import { createCatalogProvider } from './catalog/catalog-provider.factory.ts'

const catalogProvider = createCatalogProvider()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <UserContextProvider>
          <PlayerProvider>
            <CatalogProviderProvider provider={catalogProvider}>
              <App />
            </CatalogProviderProvider>
          </PlayerProvider>
      </UserContextProvider>
    </AuthProvider>
  </BrowserRouter>
);
