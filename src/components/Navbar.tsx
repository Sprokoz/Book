import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  BookMarked,
  Heart,
  LogOut,
  Menu,
  Search,
  Settings as SettingsIcon,
  User,
  X,
} from 'lucide-react';
import type { Book, RouteName, UserAccount } from '../types/library';
import { BOOKS } from '../data/books';

interface NavbarProps {
  activeRoute: RouteName;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigate: (hash: string) => void;
  user: UserAccount | null;
  notificationsEnabled: boolean;
  onOpenAuth: (tab?: 'in' | 'up') => void;
  onLogout: () => void;
  onMarkAllRead: () => void;
}

const NAV_LINKS: Array<{ route: RouteName; hash: string; label: string }> = [
  { route: 'home', hash: 'home', label: 'Home' },
  { route: 'educational', hash: 'educational', label: 'Educational' },
  { route: 'browse', hash: 'browse', label: 'Browse' },
  { route: 'categories', hash: 'cats', label: 'Categories' },
  { route: 'trending', hash: 'trending', label: 'Trending' },
  { route: 'shelf', hash: 'shelf', label: 'My Bookshelf' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeRoute,
  searchQuery,
  onSearchChange,
  onNavigate,
  user,
  notificationsEnabled,
  onOpenAuth,
  onLogout,
  onMarkAllRead,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchFocused(false);
      }
      if (bellRef.current && !bellRef.current.contains(target)) {
        setBellOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = user
    ? user.data.notifications.filter((n) => !n.read).length
    : 0;

  const trimmed = searchQuery.trim().toLowerCase();
  const matches: Book[] = trimmed
    ? BOOKS.filter((b) =>
        [
          b.title,
          b.author,
          b.genres.join(' '),
          b.description,
          b.collection,
          b.courseCode || '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(trimmed)
      ).slice(0, 5)
    : [];

  const handleLinkClick = (hash: string) => {
    setMobileOpen(false);
    onNavigate(hash);
  };

  const logoSrc = `${import.meta.env.BASE_URL}assets/aistudio/ucspherebook_97d0f2ac.png`;

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#f7f4ee]/90 backdrop-blur-md dark:border-stone-800/80 dark:bg-[#111114]/90">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:gap-6">
        {/* Zone 1: Brand Logo + Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-stone-700 hover:bg-stone-200/70 lg:hidden dark:text-stone-300 dark:hover:bg-stone-800"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('home');
            }}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0"
          >
            <img
              src={logoSrc}
              alt="UCbooksphere logo"
              className="h-9 w-9 rounded-lg bg-[#f5f3ec] object-contain p-0.5 shadow-sm ring-1 ring-black/10"
            />
            <span className="font-display text-xl font-bold tracking-tight text-stone-900 dark:text-amber-100">
              UCbooksphere
            </span>
          </a>
        </div>

        {/* Zone 2: Clean Single-Line Nav Links */}
        <nav className="hidden lg:flex items-center gap-5">
          {NAV_LINKS.map((item) => {
            const isActive = activeRoute === item.route;
            return (
              <a
                key={item.route}
                href={`#${item.hash}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.hash);
                }}
                className={`relative py-1.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'text-stone-950 dark:text-amber-200'
                    : 'text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Search + Actions */}
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <div ref={searchRef} className="relative w-full max-w-[240px] sm:max-w-[270px]">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={searchQuery}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setSearchFocused(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearchFocused(false);
                  onNavigate('search');
                }
              }}
              placeholder="Search titles, ComProg..."
              aria-label="Search books"
              className="w-full rounded-lg border border-stone-300/90 bg-white/90 py-1.5 pr-3 pl-9 text-sm text-stone-900 placeholder-stone-400 transition-colors focus:border-amber-600 focus:outline-none dark:border-stone-700/80 dark:bg-stone-900/90 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-amber-400"
            />
            {searchFocused && trimmed && (
              <div className="absolute right-0 left-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl dark:border-stone-700 dark:bg-stone-900">
                {matches.length > 0 ? (
                  <>
                    {matches.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSearchFocused(false);
                          onNavigate(`book-${b.id}`);
                        }}
                        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
                      >
                        <img
                          src={b.coverUrl}
                          alt=""
                          className="h-10 w-8 rounded object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
                            {b.title}
                          </p>
                          <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                            {b.courseCode ? `${b.courseCode} · ` : ''}{b.author}
                          </p>
                        </div>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setSearchFocused(false);
                        onNavigate('search');
                      }}
                      className="w-full border-t border-stone-200 px-3.5 py-2 text-left text-xs font-semibold text-amber-700 hover:bg-stone-50 dark:border-stone-800 dark:text-amber-300 dark:hover:bg-stone-800/70"
                    >
                      View all results for “{searchQuery}”
                    </button>
                  </>
                ) : (
                  <p className="px-4 py-3 text-xs text-stone-500 dark:text-stone-400">
                    No matching books found.
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('favorites')}
            title="Favorites"
            aria-label="Favorites"
            className={`hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
              activeRoute === 'favorites'
                ? 'bg-stone-200 text-rose-600 dark:bg-stone-800 dark:text-rose-400'
                : 'text-stone-600 hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100'
            }`}
          >
            <Heart className="h-4 w-4" />
          </button>

          {/* Notifications */}
          <div ref={bellRef} className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setBellOpen((v) => !v)}
              title="Notifications"
              aria-label="Notifications"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 transition-colors hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
            >
              <Bell className="h-4 w-4" />
              {notificationsEnabled && unreadCount > 0 && (
                <span
                  className="font-tab absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--accent-fg)',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-72 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl dark:border-stone-700 dark:bg-stone-900">
                <div className="flex items-center justify-between border-b border-stone-200 px-4 py-2.5 dark:border-stone-800">
                  <span className="text-xs font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400">
                    Notifications
                  </span>
                  {user && unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      className="text-xs font-medium text-amber-700 hover:underline dark:text-amber-300"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {!notificationsEnabled ? (
                    <p className="p-4 text-xs text-stone-500 dark:text-stone-400">
                      Notifications are turned off in Settings.
                    </p>
                  ) : !user ? (
                    <p className="p-4 text-xs text-stone-500 dark:text-stone-400">
                      Sign in to receive reading reminders and shelf updates.
                    </p>
                  ) : user.data.notifications.length === 0 ? (
                    <p className="p-4 text-xs text-stone-500 dark:text-stone-400">
                      You’re all caught up.
                    </p>
                  ) : (
                    user.data.notifications.slice(0, 8).map((n) => (
                      <div
                        key={n.id}
                        className={`border-b border-stone-100 px-4 py-3 text-xs last:border-0 dark:border-stone-800 ${
                          !n.read ? 'bg-amber-50/70 dark:bg-amber-950/20' : ''
                        }`}
                      >
                        <p className="text-stone-800 dark:text-stone-200">{n.text}</p>
                        <p className="mt-1 text-[11px] text-stone-400">
                          {new Date(n.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('settings')}
            title="Settings"
            aria-label="Settings"
            className={`hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
              activeRoute === 'settings'
                ? 'bg-stone-200 text-stone-950 dark:bg-stone-800 dark:text-amber-200'
                : 'text-stone-600 hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100'
            }`}
          >
            <SettingsIcon className="h-4 w-4" />
          </button>

          {/* Primary Account CTA */}
          {user ? (
            <div ref={userMenuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex h-10 items-center gap-2 rounded-lg border border-stone-300/80 bg-white/80 px-2.5 transition-colors hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-500"
                aria-label="User menu"
              >
                <span
                  className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full text-xs"
                  style={{ backgroundColor: user.avatar.color }}
                >
                  {user.avatar.image ? (
                    <img src={user.avatar.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    user.avatar.emoji
                  )}
                </span>
                <span className="hidden md:inline max-w-[100px] truncate text-sm font-medium text-stone-800 dark:text-stone-200">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-56 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl dark:border-stone-700 dark:bg-stone-900">
                  <div className="border-b border-stone-200 px-4 py-3 dark:border-stone-800">
                    <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                      @{user.username}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onNavigate('profile');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                    >
                      <User className="h-4 w-4 text-stone-400" /> Profile & Stats
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onNavigate('shelf');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                    >
                      <BookMarked className="h-4 w-4 text-stone-400" /> My Bookshelf
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onNavigate('favorites');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                    >
                      <Heart className="h-4 w-4 text-stone-400" /> Favorites
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onNavigate('settings');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                    >
                      <SettingsIcon className="h-4 w-4 text-stone-400" /> Settings
                    </button>
                    <div className="my-1 border-t border-stone-200 dark:border-stone-800" />
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth('in')}
              className="shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-transform active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-fg)',
              }}
            >
              Sign in
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-stone-200 bg-[#f7f4ee] px-4 py-3 lg:hidden dark:border-stone-800 dark:bg-[#111114]">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((item) => (
              <button
                key={item.route}
                type="button"
                onClick={() => handleLinkClick(item.hash)}
                className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                  activeRoute === item.route
                    ? 'bg-stone-200/80 text-stone-950 dark:bg-stone-800 dark:text-amber-200'
                    : 'text-stone-700 hover:bg-stone-200/40 dark:text-stone-300 dark:hover:bg-stone-800/50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="my-1 border-t border-stone-200 dark:border-stone-800" />
            <button
              type="button"
              onClick={() => handleLinkClick('favorites')}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-stone-700 hover:bg-stone-200/40 dark:text-stone-300"
            >
              Favorites
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('settings')}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-stone-700 hover:bg-stone-200/40 dark:text-stone-300"
            >
              Settings
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
