import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, BookOpen, FolderOpen } from 'lucide-react';
import { useTheme } from '@/lib/useTheme';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // No direct link to the editor: a project must be created (or opened) via
  // the "Nouveau projet" modal on /projects, which is what actually creates
  // a valid project id — /editor/new isn't a real project and just bounces
  // back to /projects.
  const navItems = [
    { to: '/docs', label: 'Documentation', icon: BookOpen },
    { to: '/projects', label: 'Mes projets', icon: FolderOpen },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-ink-900/80 border-b border-ink-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img
            src="/icon-96.png"
            alt="MyMotionStudio"
            className="w-8 h-8 rounded-lg shadow-lg shadow-accent-violet/20 group-hover:shadow-accent-violet/40 transition-shadow"
          />
          <span className="font-semibold text-ink-50 hidden sm:block">MyMotionStudio</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'text-accent-violet bg-accent-violet/10'
                    : 'text-ink-200 hover:text-ink-50 hover:bg-ink-750'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden md:block">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={toggleTheme} className="icon-btn" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link
            to="/settings"
            title="Paramètres"
            className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-pink to-accent-violet flex items-center justify-center text-xs font-bold text-white hover:opacity-85 transition-opacity"
          >
            MM
          </Link>
        </div>
      </div>
    </header>
  );
}
