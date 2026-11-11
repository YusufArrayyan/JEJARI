import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ToastProvider } from './components/Toast'
import { StoreProvider } from './data/store'
import { Detail } from './pages/Detail'
import { Home } from './pages/Home'
import { InstansiList } from './pages/instansi/List'
import { InstansiNew } from './pages/instansi/New'
import { KaderQueue } from './pages/kader/Queue'
import { KaderRate } from './pages/kader/Rate'
import { KaderWorkspace } from './pages/kader/Workspace'
import { Dashboard } from './pages/koordinator/Dashboard'
import { Gate } from './pages/koordinator/Gate'
import { Kaders } from './pages/koordinator/Kaders'
import { Login } from './pages/Login'
import { PublicPage } from './pages/PublicPage'
import './styles.css'
import './app.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/p/:slug" element={<PublicPage />} />
            <Route path="/masuk" element={<Login />} />

            <Route path="/instansi" element={<AppShell role="instansi"><InstansiList /></AppShell>} />
            <Route path="/instansi/baru" element={<AppShell role="instansi"><InstansiNew /></AppShell>} />
            <Route path="/instansi/:id" element={<AppShell role="instansi"><Detail role="instansi" /></AppShell>} />

            <Route path="/kader" element={<AppShell role="kader"><KaderQueue /></AppShell>} />
            <Route path="/kader/tugas/:id" element={<AppShell role="kader"><KaderWorkspace /></AppShell>} />
            <Route path="/kader/nilai" element={<AppShell role="kader"><KaderRate /></AppShell>} />

            <Route path="/koordinator" element={<AppShell role="koordinator"><Dashboard /></AppShell>} />
            <Route path="/koordinator/gerbang" element={<AppShell role="koordinator"><Gate /></AppShell>} />
            <Route path="/koordinator/kader" element={<AppShell role="koordinator"><Kaders /></AppShell>} />
            <Route path="/koordinator/p/:id" element={<AppShell role="koordinator"><Detail role="koordinator" /></AppShell>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </StoreProvider>
  </StrictMode>,
)
