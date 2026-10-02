import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SettingsModal } from '../features/settings/SettingsModal';

const TitleScreen = lazy(() => import('../features/title/TitleScreen'));
const Onboarding = lazy(() => import('../features/onboarding/Onboarding'));
const CartridgeShelf = lazy(() => import('../features/shelf/CartridgeShelf'));
const Workstation = lazy(() => import('../features/workstation/Workstation'));
const HighScores = lazy(() => import('../features/scores/HighScores'));
const Report = lazy(() => import('../features/report/Report'));
const About = lazy(() => import('../features/about/About'));
const Styleguide = lazy(() => import('../features/styleguide/Styleguide'));
const AuthChoice = lazy(() => import('../features/auth/AuthChoice'));
const LoginPage = lazy(() => import('../features/auth/LoginPage'));

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="zone-work flex min-h-screen items-center justify-center p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <span aria-hidden="true" className="animate-spin text-2xl">⏳</span>
              <p className="font-bold text-ink text-sm">Booting ThinkCode…</p>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<TitleScreen />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth/choice" element={<AuthChoice />} />
          <Route path="/auth" element={<AuthChoice />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />
          <Route path="/shelf" element={<CartridgeShelf />} />
          <Route
            path="/play/:exerciseId"
            element={<Workstation onOpenSettings={() => setSettingsOpen(true)} />}
          />
          <Route path="/scores" element={<HighScores />} />
          <Route path="/report" element={<Report />} />
          <Route path="/about" element={<About />} />
          <Route path="/styleguide" element={<Styleguide />} />
        </Routes>
      </Suspense>

      {/* Global Settings Modal */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </BrowserRouter>
  );
}
