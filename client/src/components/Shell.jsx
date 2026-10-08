import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { House, LogOut, MessageCircle, Moon, Search, Sun } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';
import { useSocket } from '../lib/socket';
import SocketProvider from './SocketProvider';
import Avatar from './Avatar';

export default function Shell() {
  const { user, logout } = useAuth();
  const [theme, toggle] = useTheme();

  return (
    <SocketProvider>
      <div className="min-h-screen">
        <header className="sticky top-0 z-30 border-b border-line/70 bg-page/85 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-5">
            <Link to="/" className="font-semibold tracking-tight">
              Connectto
            </Link>
            <SearchBox />
            <nav className="ml-auto flex items-center gap-1.5">
              <NavIcon to="/" label="Home" end>
                <House className="h-[18px] w-[18px]" />
              </NavIcon>
              <MessagesLink />
              <NavIcon to="/search" label="Search" className="sm:hidden">
                <Search className="h-[18px] w-[18px]" />
              </NavIcon>
              <ThemeButton theme={theme} toggle={toggle} />
              <Link to={`/people/${user.id}`} title="Your profile" className="ml-1 rounded-full">
                <Avatar user={user} size="sm" />
              </Link>
              <button type="button" onClick={logout} className="btn ml-1 h-9 px-3" title="Sign out">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden md:inline">Sign out</span>
              </button>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-5 pb-20 pt-8">
          <Outlet />
        </main>
      </div>
    </SocketProvider>
  );
}

function SearchBox() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <form onSubmit={submit} role="search" className="relative hidden w-full max-w-xs sm:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search people"
        aria-label="Search people"
        className="field h-9 rounded-full pl-9 text-sm"
      />
    </form>
  );
}

function NavIcon({ to, label, end, className = '', children }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={label}
      aria-label={label}
      className={({ isActive }) =>
        `relative grid h-9 w-9 place-items-center rounded-full ${isActive ? 'bg-line/60 text-ink' : 'text-muted hover:text-ink'} ${className}`
      }
    >
      {children}
    </NavLink>
  );
}

function MessagesLink() {
  const { unread } = useSocket();
  return (
    <NavIcon to="/messages" label={unread.size ? 'Messages (new)' : 'Messages'}>
      <MessageCircle className="h-[18px] w-[18px]" />
      {unread.size > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />}
    </NavIcon>
  );
}

export function ThemeButton({ theme, toggle }) {
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:text-ink"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
