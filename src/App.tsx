import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/Header';
import LandingPage from '@/pages/LandingPage';
import DocsPage from '@/pages/DocsPage';
import ProjectsPage from '@/pages/ProjectsPage';
import SettingsPage from '@/pages/SettingsPage';
import EditorPage from '@/pages/EditorPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/docs"
          element={
            <div className="min-h-screen">
              <Header />
              <DocsPage />
            </div>
          }
        />
        <Route
          path="/projects"
          element={
            <div className="min-h-screen">
              <Header />
              <ProjectsPage />
            </div>
          }
        />
        <Route
          path="/settings"
          element={
            <div className="min-h-screen">
              <Header />
              <SettingsPage />
            </div>
          }
        />
        <Route path="/editor/:projectId" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
