import React, { useState } from 'react';
import {
  BookMarked,
  Heart,
  Highlighter,
  Lock,
  Search,
  Trash2,
} from 'lucide-react';
import type {
  Book,
  LibraryDB,
  ReaderFont,
  ReaderLayout,
  ReaderTheme,
  Settings,
  ShelfStatus,
  UserAccount,
} from '../../types/library';
import { BOOKS, getBookById, SHELF_STATUSES } from '../../data/books';
import { computeUserStats, getBookCompletionPct } from '../../utils/storage';
import { BookCard, ShelfRow } from '../BookCard';
import { ModalShell } from '../Modals';

interface AuthGateProps {
  title: string;
  onOpenAuth: () => void;
}

const AuthGate: React.FC<AuthGateProps> = ({ title, onOpenAuth }) => (
  <div className="mx-auto my-12 max-w-md rounded-2xl border border-stone-200 bg-white p-10 text-center dark:border-stone-800 dark:bg-stone-900">
    <Lock className="mx-auto mb-3 h-10 w-10 text-stone-400" />
    <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
      Sign in to view {title}
    </h2>
    <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
      Your personal bookshelf, favorites, silk bookmarks, and margin notes are saved to your account.
    </p>
    <button
      type="button"
      onClick={onOpenAuth}
      className="mt-6 rounded-lg px-5 py-2.5 text-sm font-semibold"
      style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
    >
      Sign in or Try Demo
    </button>
  </div>
);

/* ---- Favorites View ---- */
interface FavoritesViewProps {
  user: UserAccount | null;
  reviews: LibraryDB['reviews'];
  onOpenAuth: () => void;
  onToggleFavorite: (bookId: string) => void;
  onOpenBook: (bookId: string) => void;
  onBrowse: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  user,
  reviews,
  onOpenAuth,
  onToggleFavorite,
  onOpenBook,
  onBrowse,
}) => {
  if (!user) return <AuthGate title="Favorites" onOpenAuth={onOpenAuth} />;

  const favBooks = user.data.favorites
    .map((id) => getBookById(id))
    .filter((b): b is Book => Boolean(b));

  return (
    <section>
      <h1 className="font-display mb-6 text-3xl font-bold text-stone-900 dark:text-stone-100">
        Favorites
      </h1>
      {favBooks.length > 0 ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {favBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              reviews={reviews}
              isFavorite
              onToggleFavorite={onToggleFavorite}
              onOpenBook={onOpenBook}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200 bg-white py-16 text-center dark:border-stone-800 dark:bg-stone-900">
          <Heart className="mx-auto mb-3 h-10 w-10 text-stone-400" />
          <h3 className="font-display text-lg font-bold">No favorites yet</h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Tap the heart on any hardcover book to keep it close at hand.
          </p>
          <button
            type="button"
            onClick={onBrowse}
            className="mt-5 rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            Browse Books
          </button>
        </div>
      )}
    </section>
  );
};

/* ---- My Bookshelf View ---- */
interface BookshelfViewProps {
  user: UserAccount | null;
  reviews: LibraryDB['reviews'];
  onOpenAuth: () => void;
  onToggleFavorite: (bookId: string) => void;
  onOpenBook: (bookId: string) => void;
  onSetShelfStatus: (bookId: string, status: ShelfStatus) => void;
  onRemoveFromShelf: (bookId: string) => void;
  onBrowse: () => void;
}

export const BookshelfView: React.FC<BookshelfViewProps> = ({
  user,
  reviews,
  onOpenAuth,
  onToggleFavorite,
  onOpenBook,
  onSetShelfStatus,
  onRemoveFromShelf,
  onBrowse,
}) => {
  const [activeTab, setActiveTab] = useState<string>('All Books');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'az' | 'prog'>('recent');

  if (!user) return <AuthGate title="My Bookshelf" onOpenAuth={onOpenAuth} />;

  const tabs = ['All Books', ...SHELF_STATUSES, 'Favorites'];

  let list: Book[] =
    activeTab === 'Favorites'
      ? user.data.favorites
          .map((id) => getBookById(id))
          .filter((b): b is Book => Boolean(b))
      : BOOKS.filter((b) => Boolean(user.data.shelf[b.id]));

  if (activeTab !== 'All Books' && activeTab !== 'Favorites') {
    list = list.filter((b) => user.data.shelf[b.id] === activeTab);
  }

  const q = query.trim().toLowerCase();
  if (q) {
    list = list.filter((b) =>
      [b.title, b.author, b.genres.join(' ')].join(' ').toLowerCase().includes(q)
    );
  }

  list = [...list].sort((a, b) => {
    if (sortBy === 'az') return a.title.localeCompare(b.title);
    if (sortBy === 'prog') {
      return getBookCompletionPct(b, user) - getBookCompletionPct(a, user);
    }
    const ta = user.data.progress[a.id]?.updatedAt || 0;
    const tb = user.data.progress[b.id]?.updatedAt || 0;
    return tb - ta;
  });

  return (
    <section>
      <h1 className="font-display mb-5 text-3xl font-bold text-stone-900 dark:text-stone-100">
        My Bookshelf
      </h1>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'shadow-sm'
                : 'border border-stone-200 bg-white text-stone-600 hover:text-stone-900 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400'
            }`}
            style={
              activeTab === tab
                ? { backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }
                : undefined
            }
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your shelf..."
            className="w-full rounded-lg border border-stone-300 bg-white py-2 pr-3 pl-9 text-sm dark:border-stone-700 dark:bg-stone-900"
          />
        </div>
        <select
          aria-label="Sort shelf"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'az' | 'prog')}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="recent">Recently Read</option>
          <option value="az">Title A–Z</option>
          <option value="prog">Reading Progress</option>
        </select>
      </div>

      {list.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {list.map((book) => {
            const st = user.data.shelf[book.id];
            return (
              <BookCard
                key={book.id}
                book={book}
                reviews={reviews}
                isFavorite={user.data.favorites.includes(book.id)}
                onToggleFavorite={onToggleFavorite}
                onOpenBook={onOpenBook}
                progressPct={getBookCompletionPct(book, user)}
                footerSlot={
                  st ? (
                    <div className="mt-2 flex items-center gap-1.5">
                      <select
                        aria-label={`Shelf status for ${book.title}`}
                        value={st}
                        onChange={(e) =>
                          onSetShelfStatus(book.id, e.target.value as ShelfStatus)
                        }
                        className="min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-2 py-1 text-[11px] dark:border-stone-700 dark:bg-stone-900"
                      >
                        {SHELF_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => onRemoveFromShelf(book.id)}
                        title="Remove from shelf"
                        className="rounded-md border border-stone-200 p-1.5 text-stone-400 hover:border-rose-400 hover:text-rose-500 dark:border-stone-800"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : null
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200 bg-white py-16 text-center dark:border-stone-800 dark:bg-stone-900">
          <BookMarked className="mx-auto mb-3 h-10 w-10 text-stone-400" />
          <h3 className="font-display text-lg font-bold">Your shelf is empty</h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Open any book or add titles from their catalog page to build your personal library.
          </p>
          <button
            type="button"
            onClick={onBrowse}
            className="mt-5 rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            Discover Books
          </button>
        </div>
      )}
    </section>
  );
};

/* ---- Profile View ---- */
interface ProfileViewProps {
  user: UserAccount | null;
  reviews: LibraryDB['reviews'];
  onOpenAuth: () => void;
  onEditProfile: () => void;
  onToggleFavorite: (bookId: string) => void;
  onOpenBook: (bookId: string) => void;
  onStartReading: (bookId: string, chapter?: number) => void;
  onClearHistory: () => void;
  onDeleteNote: (noteId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  reviews,
  onOpenAuth,
  onEditProfile,
  onToggleFavorite,
  onOpenBook,
  onStartReading,
  onClearHistory,
  onDeleteNote,
}) => {
  if (!user) return <AuthGate title="Profile" onOpenAuth={onOpenAuth} />;

  const stats = computeUserStats(user, BOOKS);
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5 + i);
    return d.toISOString().slice(0, 7);
  });
  const maxAct = Math.max(
    1,
    ...months.map((m) => user.data.monthlyActivity[m] || 0)
  );

  const currentlyReading = BOOKS.filter(
    (b) => user.data.shelf[b.id] === 'Currently Reading'
  );
  const completedBooks = BOOKS.filter(
    (b) => user.data.shelf[b.id] === 'Completed'
  );

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center gap-5">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full text-4xl shadow-inner"
            style={{ backgroundColor: user.avatar.color }}
          >
            {user.avatar.image ? (
              <img src={user.avatar.image} alt="" className="h-full w-full object-cover" />
            ) : (
              user.avatar.emoji
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
              {user.name}
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              @{user.username} · {user.email}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onEditProfile}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
        >
          Edit Profile
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[
          ['Books Completed', stats.completed],
          ['Currently Reading', stats.reading],
          ['Chapters Read', stats.chaptersRead],
          ['Day Streak', stats.streak],
          ['Est. Minutes Read', stats.estMinutes],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
          >
            <p className="font-display font-tab text-3xl font-bold text-amber-700 dark:text-amber-300">
              {value}
            </p>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* 6-Month Activity Bar Chart */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <h2 className="font-display mb-4 text-lg font-bold">
          Monthly Reading Activity
        </h2>
        <div className="flex h-32 items-end gap-3">
          {months.map((m) => {
            const count = user.data.monthlyActivity[m] || 0;
            const heightPct = Math.max(4, Math.round((count / maxAct) * 100));
            return (
              <div key={m} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="font-tab text-[11px] text-stone-500">
                  {count}
                </span>
                <div className="flex h-20 w-full items-end">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: 'var(--accent)',
                    }}
                  />
                </div>
                <span className="font-tab text-xs text-stone-500">
                  {m.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <ShelfRow
        title="Currently Reading"
        books={currentlyReading}
        reviews={reviews}
        favorites={user.data.favorites}
        onToggleFavorite={onToggleFavorite}
        onOpenBook={onOpenBook}
      />

      <ShelfRow
        title="Completed Volumes"
        books={completedBooks}
        reviews={reviews}
        favorites={user.data.favorites}
        onToggleFavorite={onToggleFavorite}
        onOpenBook={onOpenBook}
      />

      {/* Saved Margin Notes */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-bold">
          <Highlighter className="h-4 w-4 text-amber-600" />
          Margin Notes & Highlights ({user.data.notes.length})
        </h2>
        {user.data.notes.length === 0 ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Tap any paragraph inside the Open Book Reader to highlight passages or save personal notes.
          </p>
        ) : (
          <div className="space-y-3">
            {user.data.notes.map((n) => {
              const b = getBookById(n.bookId);
              if (!b) return null;
              return (
                <div
                  key={n.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-stone-200 p-3.5 dark:border-stone-800"
                >
                  <button
                    type="button"
                    onClick={() => onStartReading(b.id, n.chapter)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                      {b.title} · {b.chapters[n.chapter - 1]?.title}
                    </p>
                    <p className="font-book mt-1 text-xs italic text-stone-500 dark:text-stone-400">
                      “{n.excerpt}…”
                    </p>
                    {n.note && (
                      <p className="mt-1.5 text-sm text-stone-800 dark:text-stone-200">
                        {n.note}
                      </p>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteNote(n.id)}
                    className="p-1 text-stone-400 hover:text-rose-500"
                    aria-label="Delete note"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reading History */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Reading History</h2>
          {user.data.history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
            >
              Clear History
            </button>
          )}
        </div>
        {user.data.history.length === 0 ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">
            No reading history yet.
          </p>
        ) : (
          <div className="divide-y divide-stone-200 dark:divide-stone-800">
            {user.data.history.map((h) => {
              const b = getBookById(h.bookId);
              if (!b) return null;
              return (
                <button
                  key={`${h.bookId}-${h.timestamp}`}
                  type="button"
                  onClick={() => onStartReading(b.id, h.chapter)}
                  className="flex w-full items-center justify-between py-3 text-left text-sm hover:text-amber-700 dark:hover:text-amber-300"
                >
                  <span>
                    <span className="font-medium">{b.title}</span>
                    <span className="text-stone-500">
                      {' '}
                      · {b.chapters[h.chapter - 1]?.title}
                    </span>
                  </span>
                  <span className="font-tab text-xs text-stone-400">
                    {new Date(h.timestamp).toLocaleDateString()}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* ---- Settings View ---- */
interface SettingsViewProps {
  settings: Settings;
  user: UserAccount | null;
  onUpdateSettings: (patch: Partial<Settings>) => void;
  onOpenAuth: () => void;
  onEditProfile: () => void;
  onChangePassword: (oldPw: string, newPw: string) => Promise<string | null>;
  onChangeEmail: (newEmail: string, password: string) => Promise<string | null>;
  onDeleteAccount: () => void;
  onClearHistory: () => void;
  onToast: (msg: string) => void;
}

const ACCENT_SWATCHES = [
  '#d4a73a',
  '#b8862d',
  '#c95c3c',
  '#4f86c6',
  '#4e937a',
  '#8c6bb1',
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  user,
  onUpdateSettings,
  onOpenAuth,
  onEditProfile,
  onChangePassword,
  onChangeEmail,
  onDeleteAccount,
  onClearHistory,
  onToast,
}) => {
  const [accountModal, setAccountModal] = useState<'pw' | 'email' | null>(null);
  const [infoModal, setInfoModal] = useState<string | null>(null);
  const [oldPw, setOldPw] = useState('');
  const [newVal, setNewVal] = useState('');
  const [modalErr, setModalErr] = useState('');
  const [supportMsg, setSupportMsg] = useState('');

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErr('');
    if (accountModal === 'pw') {
      const err = await onChangePassword(oldPw, newVal);
      if (err) setModalErr(err);
      else {
        setAccountModal(null);
        setOldPw('');
        setNewVal('');
      }
    } else if (accountModal === 'email') {
      const err = await onChangeEmail(newVal, oldPw);
      if (err) setModalErr(err);
      else {
        setAccountModal(null);
        setOldPw('');
        setNewVal('');
      }
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
          Settings
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Preferences are saved automatically on this device
        </p>
      </div>

      {/* Appearance */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <h2 className="font-display mb-4 text-lg font-bold">Appearance</h2>
        <div className="divide-y divide-stone-200 text-sm dark:divide-stone-800">
          <div className="flex items-center justify-between py-3">
            <span>Library Theme</span>
            <select
              value={settings.theme}
              onChange={(e) =>
                onUpdateSettings({
                  theme: e.target.value as Settings['theme'],
                })
              }
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 dark:border-stone-700 dark:bg-stone-950"
            >
              <option value="dark">Midnight Library (Dark)</option>
              <option value="light">Archival Paper (Light)</option>
              <option value="system">System Default</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-3">
            <span>Accent Foil</span>
            <div className="flex items-center gap-2">
              {ACCENT_SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onUpdateSettings({ accent: c })}
                  aria-label={`Set accent ${c}`}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    settings.accent === c
                      ? 'scale-110 border-stone-900 dark:border-white'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reading Desk */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <h2 className="font-display mb-4 text-lg font-bold">
          Open-Book Reading Preferences
        </h2>
        <div className="divide-y divide-stone-200 text-sm dark:divide-stone-800">
          <div className="flex items-center justify-between py-3">
            <span>Default Book Format</span>
            <select
              value={settings.readerLayout}
              onChange={(e) =>
                onUpdateSettings({
                  readerLayout: e.target.value as ReaderLayout,
                })
              }
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 dark:border-stone-700 dark:bg-stone-950"
            >
              <option value="spread">Two-Page Open Book</option>
              <option value="single">Single Page Leaf</option>
              <option value="scroll">Continuous Scroll</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-3">
            <span>Paper & Lighting</span>
            <select
              value={settings.readerTheme}
              onChange={(e) =>
                onUpdateSettings({
                  readerTheme: e.target.value as ReaderTheme,
                })
              }
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 dark:border-stone-700 dark:bg-stone-950"
            >
              <option value="ivory">Warm Ivory Paper</option>
              <option value="sepia">Archival Sepia</option>
              <option value="daylight">Crisp Daylight</option>
              <option value="midnight">Midnight Ink</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-3">
            <span>Typeface</span>
            <select
              value={settings.fontFamily}
              onChange={(e) =>
                onUpdateSettings({
                  fontFamily: e.target.value as ReaderFont,
                })
              }
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 dark:border-stone-700 dark:bg-stone-950"
            >
              <option value="serif">Lora Book Serif</option>
              <option value="display">Fraunces Literary</option>
              <option value="sans">Plus Jakarta Sans</option>
              <option value="mono">JetBrains Mono</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="font-tab">Font Size ({settings.fontSize}px)</span>
            <input
              type="range"
              min={15}
              max={24}
              value={settings.fontSize}
              onChange={(e) =>
                onUpdateSettings({ fontSize: Number(e.target.value) })
              }
              className="w-40 accent-amber-600"
            />
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="font-tab">
              Line Spacing ({settings.lineHeight.toFixed(1)})
            </span>
            <input
              type="range"
              min={1.4}
              max={2.2}
              step={0.1}
              value={settings.lineHeight}
              onChange={(e) =>
                onUpdateSettings({ lineHeight: Number(e.target.value) })
              }
              className="w-40 accent-amber-600"
            />
          </div>
          <div className="flex items-center justify-between py-3">
            <span>Page-Turn Paper Sound</span>
            <input
              type="checkbox"
              checked={settings.soundEffects}
              onChange={(e) =>
                onUpdateSettings({ soundEffects: e.target.checked })
              }
              className="h-5 w-5 accent-amber-600"
            />
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <h2 className="font-display mb-4 text-lg font-bold">Account</h2>
        {user ? (
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onEditProfile}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
            >
              Edit Profile
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountModal('pw');
                setModalErr('');
              }}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
            >
              Change Password
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountModal('email');
                setModalErr('');
              }}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
            >
              Change Email
            </button>
            <button
              type="button"
              onClick={onDeleteAccount}
              className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/30"
            >
              Delete Account
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">
              Sign in to manage your local library account.
            </p>
            <button
              type="button"
              onClick={onOpenAuth}
              className="rounded-lg px-4 py-2 text-sm font-semibold"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-fg)',
              }}
            >
              Sign in
            </button>
          </div>
        )}
      </div>

      {/* Notifications & Privacy */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <h2 className="font-display mb-4 text-lg font-bold">
          Notifications & Privacy
        </h2>
        <div className="divide-y divide-stone-200 text-sm dark:divide-stone-800">
          {(
            [
              ['notificationsEnabled', 'Enable notifications'],
              ['chapterNotifications', 'Completion milestones'],
              ['bookmarkUpdates', 'Saved-book updates'],
              ['reminderNotifications', 'Reading reminders'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between py-3">
              <span>{label}</span>
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={(e) => onUpdateSettings({ [key]: e.target.checked })}
                className="h-5 w-5 accent-amber-600"
              />
            </div>
          ))}
          <div className="flex items-center justify-between py-3">
            <span>Profile Visibility</span>
            <select
              value={settings.profileVisibility}
              onChange={(e) =>
                onUpdateSettings({
                  profileVisibility: e.target.value as 'public' | 'private',
                })
              }
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 dark:border-stone-700 dark:bg-stone-950"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          {user && (
            <div className="flex items-center justify-between py-3">
              <span>Reading History</span>
              <button
                type="button"
                onClick={onClearHistory}
                className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400"
              >
                Clear History
              </button>
            </div>
          )}
        </div>
      </div>

      {/* About & Legal */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <h2 className="font-display mb-4 text-lg font-bold">
          About UCbooksphere
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            'About Us',
            'Terms and Conditions',
            'Privacy Policy',
            'Contact Support',
          ].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setInfoModal(item)}
              className="rounded-lg border border-stone-300 px-3.5 py-2 text-xs font-medium hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {accountModal && (
        <ModalShell
          onClose={() => setAccountModal(null)}
          title={
            accountModal === 'pw' ? 'Change Password' : 'Change Email Address'
          }
        >
          <form onSubmit={handleAccountSubmit} className="space-y-3">
            <input
              type="password"
              required
              placeholder="Current password"
              value={oldPw}
              onChange={(e) => setOldPw(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
            <input
              type={accountModal === 'pw' ? 'password' : 'email'}
              required
              placeholder={
                accountModal === 'pw'
                  ? 'New password (8+ chars, letter & number)'
                  : 'New email address'
              }
              value={newVal}
              onChange={(e) => setNewVal(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
            {modalErr && <p className="text-xs text-rose-600">{modalErr}</p>}
            <button
              type="submit"
              className="w-full rounded-lg py-2.5 text-sm font-semibold"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-fg)',
              }}
            >
              Save
            </button>
          </form>
        </ModalShell>
      )}

      {infoModal && (
        <ModalShell onClose={() => setInfoModal(null)} title={infoModal}>
          {infoModal === 'About Us' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={`${import.meta.env.BASE_URL}assets/aistudio/ucspherebook_97d0f2ac.png`}
                  alt="UCbooksphere logo"
                  className="h-12 w-12 rounded-xl bg-[#f5f3ec] object-contain p-1 ring-1 ring-black/10"
                />
                <div>
                  <h4 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                    UCbooksphere
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    School &amp; Academic Digital Reading Library
                  </p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                UCbooksphere is an illustrated school reading platform built for
                students and lifelong learners—combining ComProg and core
                course textbooks with classic literature in an authentic
                open-book reading room.
              </p>

              <div className="border-t border-stone-200 pt-3 dark:border-stone-800">
                <p className="mb-2 text-xs font-semibold tracking-wider uppercase text-amber-700 dark:text-amber-300">
                  Created By
                </p>
                <ul className="space-y-1.5 text-sm text-stone-800 dark:text-stone-200">
                  <li>Philippe Blink Segovia</li>
                  <li>Kent Macabodbod</li>
                  <li>Kurt Remulta</li>
                  <li>Kian Tiro</li>
                  <li>John Simbahon</li>
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              {infoModal === 'Terms and Conditions' &&
                'UCbooksphere is provided for educational study and personal reading. All included coursebooks and literary editions are curated for browser-based academic use.'}
              {infoModal === 'Privacy Policy' &&
                'Your accounts, reading progress, margin notes, and settings remain strictly on your local device inside browser storage and are never transmitted externally.'}
              {infoModal === 'Contact Support' &&
                'Leave a note below. In local browser mode, support messages are saved on this device.'}
            </p>
          )}
          {infoModal === 'Contact Support' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                try {
                  const existing = JSON.parse(
                    localStorage.getItem('folio_support_msgs') || '[]'
                  );
                  existing.push({ text: supportMsg, timestamp: Date.now() });
                  localStorage.setItem(
                    'folio_support_msgs',
                    JSON.stringify(existing)
                  );
                } catch {
                  // Ignore
                }
                setSupportMsg('');
                setInfoModal(null);
                onToast('Message saved on this device');
              }}
              className="mt-4 space-y-3"
            >
              <textarea
                rows={4}
                required
                value={supportMsg}
                onChange={(e) => setSupportMsg(e.target.value)}
                placeholder="How can we help?"
                className="w-full rounded-lg border border-stone-300 bg-stone-50 p-3 text-sm dark:border-stone-700 dark:bg-stone-950"
              />
              <button
                type="submit"
                className="w-full rounded-lg py-2 text-sm font-semibold"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-fg)',
                }}
              >
                Send Note
              </button>
            </form>
          )}
        </ModalShell>
      )}
    </div>
  );
};
