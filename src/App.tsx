import React, { useCallback, useEffect, useState } from 'react';
import type {
  Book,
  LibraryDB,
  MarginNote,
  ParsedRoute,
  RouteName,
  Settings,
  ShelfStatus,
  UserAccount,
} from './types/library';
import { BOOKS, getBookById } from './data/books';
import {
  createEmptyUserData,
  getSessionId,
  hashPassword,
  loadDB,
  loadSettings,
  monthIso,
  saveDB,
  saveSettings,
  setSessionId,
  todayIso,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { OpenBookReader } from './components/OpenBookReader';
import {
  AuthModal,
  ConfirmModal,
  EditProfileModal,
  ShareModal,
} from './components/Modals';
import { HomeView } from './components/views/HomeView';
import {
  BrowseView,
  CategoriesView,
  SearchView,
  TrendingView,
} from './components/views/CatalogViews';
import { BookDetailView } from './components/views/BookDetailView';
import {
  BookshelfView,
  FavoritesView,
  ProfileView,
  SettingsView,
} from './components/views/AccountViews';
import { EducationalView } from './components/views/EducationalView';

function parseHashRoute(hashStr: string): ParsedRoute {
  const clean = hashStr.replace(/^#/, '') || 'home';
  const parts = clean.split('-');
  const head = parts[0];

  const routeMap: Record<string, RouteName> = {
    home: 'home',
    browse: 'browse',
    educational: 'educational',
    edu: 'educational',
    cats: 'categories',
    categories: 'categories',
    trending: 'trending',
    search: 'search',
    favs: 'favorites',
    favorites: 'favorites',
    shelf: 'shelf',
    profile: 'profile',
    prefs: 'settings',
    settings: 'settings',
    book: 'book',
    read: 'read',
  };

  const name = routeMap[head] || 'home';
  if (name === 'book') {
    return { name, bookId: parts.slice(1).join('-') };
  }
  if (name === 'read') {
    const maybeCh = Number(parts[parts.length - 1]);
    if (!Number.isNaN(maybeCh) && parts.length >= 3) {
      return {
        name,
        bookId: parts.slice(1, -1).join('-'),
        chapter: maybeCh,
      };
    }
    return { name, bookId: parts.slice(1).join('-') };
  }
  return { name };
}

export default function App() {
  const [db, setDb] = useState<LibraryDB>(() => loadDB());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [sessionUserId, setSessionUserId] = useState<string | null>(() =>
    getSessionId()
  );
  const [route, setRoute] = useState<ParsedRoute>(() =>
    parseHashRoute(window.location.hash)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [browseGenre, setBrowseGenre] = useState('All');
  const [browseCollection, setBrowseCollection] = useState('All');
  const [browseSort, setBrowseSort] = useState<'pop' | 'rate' | 'year' | 'az'>(
    'pop'
  );

  // Modals & Toast
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: 'in' | 'up' }>({
    open: false,
    tab: 'in',
  });
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [shareBook, setShareBook] = useState<Book | null>(null);
  const [confirmState, setConfirmState] = useState<{
    message: string;
    confirmLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
  }, []);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 2400);
    return () => clearTimeout(t);
  }, [toastMsg]);

  // Apply theme & accent CSS tokens cleanly
  useEffect(() => {
    const applyTheme = () => {
      const resolvedDark =
        settings.theme === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
          : settings.theme === 'dark';

      document.documentElement.classList.toggle('dark', resolvedDark);
      document.documentElement.style.setProperty('--accent', settings.accent);
    };
    applyTheme();
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    mq.addEventListener('change', applyTheme);
    return () => mq.removeEventListener('change', applyTheme);
  }, [settings.theme, settings.accent]);

  // Listen to hash changes
  useEffect(() => {
    const onHash = () => {
      const next = parseHashRoute(window.location.hash);
      setRoute(next);
      if (next.name !== 'read') {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((hash: string) => {
    const clean = hash.replace(/^#/, '');
    if (window.location.hash.replace(/^#/, '') === clean) {
      setRoute(parseHashRoute(clean));
    } else {
      window.location.hash = clean;
    }
  }, []);

  const currentUser: UserAccount | null =
    sessionUserId && db.users[sessionUserId] ? db.users[sessionUserId] : null;

  const updateDb = useCallback((updater: (prev: LibraryDB) => LibraryDB) => {
    setDb((prev) => {
      const next = updater(prev);
      if (!saveDB(next)) {
        showToast('Could not save: browser storage full or unavailable');
      }
      return next;
    });
  }, [showToast]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const updateUserData = useCallback(
    (updater: (user: UserAccount) => UserAccount) => {
      if (!sessionUserId) return;
      updateDb((prev) => {
        const u = prev.users[sessionUserId];
        if (!u) return prev;
        return {
          ...prev,
          users: {
            ...prev.users,
            [sessionUserId]: updater(u),
          },
        };
      });
    },
    [sessionUserId, updateDb]
  );

  const pushNotification = (
    user: UserAccount,
    settingKey: 'chapterNotifications' | 'bookmarkUpdates',
    text: string
  ): UserAccount => {
    if (!settings.notificationsEnabled || !settings[settingKey]) return user;
    return {
      ...user,
      data: {
        ...user.data,
        notifications: [
          {
            id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            text,
            timestamp: Date.now(),
            read: false,
          },
          ...user.data.notifications,
        ].slice(0, 25),
      },
    };
  };

  /* ---- Auth Handlers ---- */
  const handleLogin = async (
    identifier: string,
    password: string,
    remember: boolean
  ): Promise<string | null> => {
    const norm = identifier.trim().toLowerCase();
    const account = Object.values(db.users).find(
      (u) => u.email === norm || u.username.toLowerCase() === norm
    );
    if (!account) return 'Incorrect email/username or password.';
    const { hash } = await hashPassword(password, account.salt);
    if (hash !== account.hash) return 'Incorrect email/username or password.';
    setSessionId(account.id, remember);
    setSessionUserId(account.id);
    setAuthModal({ open: false, tab: 'in' });
    showToast(`Welcome back, ${account.name.split(' ')[0]}`);
    return null;
  };

  const handleSignup = async (payload: {
    name: string;
    username: string;
    email: string;
    password: string;
  }): Promise<string | null> => {
    const email = payload.email.trim().toLowerCase();
    const username = payload.username.trim();
    const users = Object.values(db.users);
    if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(email)) {
      return 'Please enter a valid email address.';
    }
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return 'That username is already taken.';
    }
    if (users.some((u) => u.email === email)) {
      return 'That email is already registered.';
    }
    if (
      payload.password.length < 8 ||
      !/\d/.test(payload.password) ||
      !/[a-z]/i.test(payload.password)
    ) {
      return 'Password needs 8+ characters with at least one letter and number.';
    }

    const { salt, hash } = await hashPassword(payload.password);
    const id = `u_${Date.now()}`;
    const newUser: UserAccount = {
      id,
      name: payload.name.trim(),
      username,
      email,
      salt,
      hash,
      avatar: { emoji: '📖', color: settings.accent },
      data: createEmptyUserData(),
    };

    updateDb((prev) => ({
      ...prev,
      users: { ...prev.users, [id]: newUser },
    }));
    setSessionId(id, true);
    setSessionUserId(id);
    setAuthModal({ open: false, tab: 'in' });
    showToast('Account created');
    return null;
  };

  const handleResetPassword = async (
    emailInput: string,
    usernameInput: string,
    newPassword: string
  ): Promise<string | null> => {
    const email = emailInput.trim().toLowerCase();
    const username = usernameInput.trim().toLowerCase();
    const account = Object.values(db.users).find(
      (u) => u.email === email && u.username.toLowerCase() === username
    );
    if (!account) {
      return 'No account matches both that email and username.';
    }
    if (
      newPassword.length < 8 ||
      !/\d/.test(newPassword) ||
      !/[a-z]/i.test(newPassword)
    ) {
      return 'Password needs 8+ characters with a letter and a number.';
    }
    const { salt, hash } = await hashPassword(newPassword);
    updateDb((prev) => ({
      ...prev,
      users: {
        ...prev.users,
        [account.id]: { ...account, salt, hash },
      },
    }));
    showToast('Password updated. You may now sign in.');
    return null;
  };

  const handleQuickDemo = async () => {
    const existingDemo = Object.values(db.users).find(
      (u) => u.username === 'demo_reader'
    );
    if (existingDemo) {
      setSessionId(existingDemo.id, true);
      setSessionUserId(existingDemo.id);
      setAuthModal({ open: false, tab: 'in' });
      showToast('Signed in as Demo Reader');
      return;
    }

    const { salt, hash } = await hashPassword('DemoReader1');
    const id = `u_demo_${Date.now()}`;
    const empty = createEmptyUserData();
    const today = todayIso();
    const month = monthIso();

    const demoUser: UserAccount = {
      id,
      name: 'Clara Vance',
      username: 'demo_reader',
      email: 'clara@ucbooksphere.edu',
      salt,
      hash,
      avatar: { emoji: '🦉', color: '#d4a73a' },
      data: {
        ...empty,
        favorites: ['pride', 'scandal', 'odyssey'],
        shelf: {
          pride: 'Currently Reading',
          scandal: 'Currently Reading',
          wizard: 'Want to Read',
          war: 'Completed',
        },
        progress: {
          pride: { chapter: 1, page: 0, pct: 0.35, updatedAt: Date.now() - 3600000 },
          scandal: { chapter: 2, page: 0, pct: 0.5, updatedAt: Date.now() - 86400000 },
          war: { chapter: 3, page: 0, pct: 1, updatedAt: Date.now() - 172800000 },
        },
        chaptersCompleted: {
          war: [1, 2, 3],
          scandal: [1],
        },
        daysActive: [today],
        monthlyActivity: { [month]: 4 },
        history: [
          { bookId: 'pride', chapter: 1, timestamp: Date.now() - 3600000 },
          { bookId: 'scandal', chapter: 2, timestamp: Date.now() - 86400000 },
        ],
      },
    };

    updateDb((prev) => ({
      ...prev,
      users: { ...prev.users, [id]: demoUser },
    }));
    setSessionId(id, true);
    setSessionUserId(id);
    setAuthModal({ open: false, tab: 'in' });
    showToast('Signed in as Clara Vance (Demo Reader)');
  };

  const handleLogout = () => {
    setSessionId(null);
    setSessionUserId(null);
    showToast('Logged out');
    navigate('home');
  };

  /* ---- Library Actions ---- */
  const requireAuth = () => {
    if (currentUser) return true;
    setAuthModal({ open: true, tab: 'in' });
    return false;
  };

  const handleToggleFavorite = (bookId: string) => {
    if (!requireAuth()) return;
    const already = currentUser!.data.favorites.includes(bookId);
    updateUserData((u) => ({
      ...u,
      data: {
        ...u.data,
        favorites: already
          ? u.data.favorites.filter((id) => id !== bookId)
          : [...u.data.favorites, bookId],
      },
    }));
    showToast(already ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleSetShelfStatus = (bookId: string, status: ShelfStatus) => {
    if (!requireAuth()) return;
    const book = getBookById(bookId);
    const wasOnShelf = Boolean(currentUser!.data.shelf[bookId]);
    updateUserData((u) => {
      let nextUser: UserAccount = {
        ...u,
        data: {
          ...u.data,
          shelf: { ...u.data.shelf, [bookId]: status },
        },
      };
      if (!wasOnShelf && book) {
        nextUser = pushNotification(
          nextUser,
          'bookmarkUpdates',
          `“${book.title}” added to your ${status} shelf.`
        );
      }
      return nextUser;
    });
    showToast(`Shelf: ${status}`);
  };

  const handleRemoveFromShelf = (bookId: string) => {
    const book = getBookById(bookId);
    setConfirmState({
      message: `Remove “${book?.title || 'this book'}” from your bookshelf? Your reading progress will be kept.`,
      confirmLabel: 'Remove',
      danger: true,
      onConfirm: () => {
        updateUserData((u) => {
          const nextShelf = { ...u.data.shelf };
          delete nextShelf[bookId];
          return { ...u, data: { ...u.data, shelf: nextShelf } };
        });
        setConfirmState(null);
        showToast('Removed from bookshelf');
      },
    });
  };

  const handleStartReading = (bookId: string, chapter?: number) => {
    const savedCh = currentUser?.data.progress[bookId]?.chapter || 1;
    const targetCh = chapter || savedCh;
    navigate(`read-${bookId}-${targetCh}`);
  };

  const handleSaveProgress = useCallback(
    (bookId: string, chapter: number, page: number, pct: number) => {
      if (!sessionUserId) return;
      const today = todayIso();
      const month = monthIso();
      updateUserData((u) => {
        const prevProg = u.data.progress[bookId];
        const prevDone = u.data.chaptersCompleted?.[bookId] || [];
        const isNewChapterVisit =
          !prevProg || prevProg.chapter !== chapter;
        const alreadyLoggedCh = prevDone.includes(chapter);

        const nextShelf = { ...u.data.shelf };
        if (!nextShelf[bookId] || nextShelf[bookId] === 'Want to Read') {
          nextShelf[bookId] = 'Currently Reading';
        }

        const nextHistory = isNewChapterVisit
          ? [
              { bookId, chapter, timestamp: Date.now() },
              ...u.data.history.filter((h) => h.bookId !== bookId),
            ].slice(0, 50)
          : u.data.history;

        const nextDays = u.data.daysActive.includes(today)
          ? u.data.daysActive
          : [...u.data.daysActive, today];

        const nextMonthly = { ...u.data.monthlyActivity };
        if (!alreadyLoggedCh) {
          nextMonthly[month] = (nextMonthly[month] || 0) + 1;
        }

        return {
          ...u,
          data: {
            ...u.data,
            shelf: nextShelf,
            progress: {
              ...u.data.progress,
              [bookId]: { chapter, page, pct, updatedAt: Date.now() },
            },
            chaptersCompleted: {
              ...(u.data.chaptersCompleted || {}),
              [bookId]: alreadyLoggedCh ? prevDone : [...prevDone, chapter],
            },
            history: nextHistory,
            daysActive: nextDays,
            monthlyActivity: nextMonthly,
          },
        };
      });
    },
    [sessionUserId, updateUserData]
  );

  const handleFinishBook = (book: Book) => {
    if (currentUser) {
      updateUserData((u) => {
        const nextUser: UserAccount = {
          ...u,
          data: {
            ...u.data,
            shelf: { ...u.data.shelf, [book.id]: 'Completed' },
            progress: {
              ...u.data.progress,
              [book.id]: {
                chapter: book.chapters.length,
                page: 0,
                pct: 1,
                updatedAt: Date.now(),
              },
            },
          },
        };
        return pushNotification(
          nextUser,
          'chapterNotifications',
          `Congratulations! You finished “${book.title}”.`
        );
      });
    }
    showToast(`Finished “${book.title}”!`);
    navigate(`book-${book.id}`);
  };

  const handleSubmitReview = (bookId: string, rating: number, text: string) => {
    if (!requireAuth()) return;
    const u = currentUser!;
    updateDb((prev) => {
      const existing = (prev.reviews[bookId] || []).filter(
        (r) => r.userId !== u.id
      );
      return {
        ...prev,
        reviews: {
          ...prev.reviews,
          [bookId]: [
            {
              userId: u.id,
              userName: u.name,
              rating,
              text: text.trim(),
              createdAt: Date.now(),
            },
            ...existing,
          ],
        },
      };
    });
    showToast('Review saved');
  };

  const handleAddBookmark = (
    bookId: string,
    chapter: number,
    page: number,
    pct: number,
    excerpt: string
  ) => {
    updateUserData((u) => ({
      ...u,
      data: {
        ...u.data,
        bookmarks: [
          {
            id: `bm_${Date.now()}`,
            bookId,
            chapter,
            page,
            pct,
            excerpt,
            createdAt: Date.now(),
          },
          ...u.data.bookmarks,
        ],
      },
    }));
  };

  const handleDeleteBookmark = (bookmarkId: string) => {
    updateUserData((u) => ({
      ...u,
      data: {
        ...u.data,
        bookmarks: u.data.bookmarks.filter((b) => b.id !== bookmarkId),
      },
    }));
  };

  const handleSaveMarginNote = (
    notePayload: Omit<MarginNote, 'id' | 'createdAt'>
  ) => {
    updateUserData((u) => {
      const filtered = u.data.notes.filter(
        (n) =>
          !(
            n.bookId === notePayload.bookId &&
            n.chapter === notePayload.chapter &&
            n.paragraphIndex === notePayload.paragraphIndex
          )
      );
      return {
        ...u,
        data: {
          ...u.data,
          notes: [
            {
              ...notePayload,
              id: `mn_${Date.now()}`,
              createdAt: Date.now(),
            },
            ...filtered,
          ],
        },
      };
    });
  };

  const handleDeleteMarginNote = (noteId: string) => {
    updateUserData((u) => ({
      ...u,
      data: {
        ...u.data,
        notes: u.data.notes.filter((n) => n.id !== noteId),
      },
    }));
  };

  /* ---- Render Active Reader Mode ---- */
  if (route.name === 'read') {
    const activeBook = getBookById(route.bookId);
    if (activeBook) {
      const chNum = Math.min(
        activeBook.chapters.length,
        Math.max(1, route.chapter || 1)
      );
      return (
        <>
          <OpenBookReader
            book={activeBook}
            chapterNumber={chNum}
            user={currentUser}
            settings={settings}
            onUpdateSettings={updateSettings}
            onNavigateChapter={(ch) => navigate(`read-${activeBook.id}-${ch}`)}
            onExitReader={() => navigate(`book-${activeBook.id}`)}
            onFinishBook={() => handleFinishBook(activeBook)}
            onSaveProgress={(ch, pg, pct) =>
              handleSaveProgress(activeBook.id, ch, pg, pct)
            }
            onAddBookmark={(ch, pg, pct, ex) =>
              handleAddBookmark(activeBook.id, ch, pg, pct, ex)
            }
            onDeleteBookmark={handleDeleteBookmark}
            onSaveMarginNote={handleSaveMarginNote}
            onDeleteMarginNote={handleDeleteMarginNote}
            onToast={showToast}
            onRequireAuth={() => setAuthModal({ open: true, tab: 'in' })}
          />
          {authModal.open && (
            <AuthModal
              initialTab={authModal.tab}
              onClose={() => setAuthModal({ open: false, tab: 'in' })}
              onLogin={handleLogin}
              onSignup={handleSignup}
              onResetPassword={handleResetPassword}
              onQuickDemo={handleQuickDemo}
            />
          )}
          {toastMsg && (
            <div
              className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full px-5 py-2.5 text-xs font-semibold shadow-xl"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-fg)',
              }}
            >
              {toastMsg}
            </div>
          )}
        </>
      );
    }
  }

  const activeBookDetail =
    route.name === 'book' ? getBookById(route.bookId) : undefined;

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-stone-900 transition-colors dark:bg-[#0e0e11] dark:text-stone-100">
      <Navbar
        activeRoute={route.name}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigate={navigate}
        user={currentUser}
        notificationsEnabled={settings.notificationsEnabled}
        onOpenAuth={(tab = 'in') => setAuthModal({ open: true, tab })}
        onLogout={handleLogout}
        onMarkAllRead={() => {
          updateUserData((u) => ({
            ...u,
            data: {
              ...u.data,
              notifications: u.data.notifications.map((n) => ({
                ...n,
                read: true,
              })),
            },
          }));
        }}
      />

      <main className="mx-auto max-w-[1360px] px-4 py-7 sm:px-6 sm:py-9">
        {route.name === 'home' && (
          <HomeView
            user={currentUser}
            reviews={db.reviews}
            onOpenBook={(id) => navigate(`book-${id}`)}
            onStartReading={(id) => handleStartReading(id)}
            onToggleFavorite={handleToggleFavorite}
            onSelectCollection={(col) => {
              setBrowseCollection(col);
              setBrowseGenre('All');
              navigate('browse');
            }}
            onBrowseAll={() => {
              setBrowseCollection('All');
              setBrowseGenre('All');
              navigate('browse');
            }}
            onBrowseEducational={() => navigate('educational')}
          />
        )}

        {route.name === 'educational' && (
          <EducationalView
            reviews={db.reviews}
            favorites={currentUser?.data.favorites || []}
            onToggleFavorite={handleToggleFavorite}
            onOpenBook={(id) => navigate(`book-${id}`)}
            onStartReading={(id) => handleStartReading(id)}
          />
        )}

        {route.name === 'browse' && (
          <BrowseView
            selectedGenre={browseGenre}
            selectedCollection={browseCollection}
            sortBy={browseSort}
            onChangeGenre={setBrowseGenre}
            onChangeCollection={setBrowseCollection}
            onChangeSort={setBrowseSort}
            reviews={db.reviews}
            favorites={currentUser?.data.favorites || []}
            onToggleFavorite={handleToggleFavorite}
            onOpenBook={(id) => navigate(`book-${id}`)}
          />
        )}

        {route.name === 'categories' && (
          <CategoriesView
            onSelectGenre={(genre) => {
              setBrowseGenre(genre);
              setBrowseCollection('All');
              navigate('browse');
            }}
          />
        )}

        {route.name === 'trending' && (
          <TrendingView
            reviews={db.reviews}
            onOpenBook={(id) => navigate(`book-${id}`)}
            onStartReading={(id) => handleStartReading(id)}
          />
        )}

        {route.name === 'search' && (
          <SearchView
            query={searchQuery}
            onQueryChange={setSearchQuery}
            reviews={db.reviews}
            favorites={currentUser?.data.favorites || []}
            onToggleFavorite={handleToggleFavorite}
            onOpenBook={(id) => navigate(`book-${id}`)}
          />
        )}

        {route.name === 'favorites' && (
          <FavoritesView
            user={currentUser}
            reviews={db.reviews}
            onOpenAuth={() => setAuthModal({ open: true, tab: 'in' })}
            onToggleFavorite={handleToggleFavorite}
            onOpenBook={(id) => navigate(`book-${id}`)}
            onBrowse={() => navigate('browse')}
          />
        )}

        {route.name === 'shelf' && (
          <BookshelfView
            user={currentUser}
            reviews={db.reviews}
            onOpenAuth={() => setAuthModal({ open: true, tab: 'in' })}
            onToggleFavorite={handleToggleFavorite}
            onOpenBook={(id) => navigate(`book-${id}`)}
            onSetShelfStatus={handleSetShelfStatus}
            onRemoveFromShelf={handleRemoveFromShelf}
            onBrowse={() => navigate('browse')}
          />
        )}

        {route.name === 'profile' && (
          <ProfileView
            user={currentUser}
            reviews={db.reviews}
            onOpenAuth={() => setAuthModal({ open: true, tab: 'in' })}
            onEditProfile={() => setEditProfileOpen(true)}
            onToggleFavorite={handleToggleFavorite}
            onOpenBook={(id) => navigate(`book-${id}`)}
            onStartReading={handleStartReading}
            onClearHistory={() => {
              setConfirmState({
                message: 'Clear your reading history? This cannot be undone.',
                confirmLabel: 'Clear History',
                danger: true,
                onConfirm: () => {
                  updateUserData((u) => ({
                    ...u,
                    data: { ...u.data, history: [] },
                  }));
                  setConfirmState(null);
                  showToast('Reading history cleared');
                },
              });
            }}
            onDeleteNote={handleDeleteMarginNote}
          />
        )}

        {route.name === 'settings' && (
          <SettingsView
            settings={settings}
            user={currentUser}
            onUpdateSettings={updateSettings}
            onOpenAuth={() => setAuthModal({ open: true, tab: 'in' })}
            onEditProfile={() => setEditProfileOpen(true)}
            onChangePassword={async (oldPw, newPw) => {
              if (!currentUser) return 'Not signed in.';
              const { hash } = await hashPassword(oldPw, currentUser.salt);
              if (hash !== currentUser.hash) return 'Current password is incorrect.';
              if (
                newPw.length < 8 ||
                !/\d/.test(newPw) ||
                !/[a-z]/i.test(newPw)
              ) {
                return 'New password needs 8+ chars with a letter and number.';
              }
              const next = await hashPassword(newPw);
              updateDb((prev) => ({
                ...prev,
                users: {
                  ...prev.users,
                  [currentUser.id]: {
                    ...currentUser,
                    salt: next.salt,
                    hash: next.hash,
                  },
                },
              }));
              showToast('Password updated');
              return null;
            }}
            onChangeEmail={async (newEmail, password) => {
              if (!currentUser) return 'Not signed in.';
              const { hash } = await hashPassword(password, currentUser.salt);
              if (hash !== currentUser.hash) return 'Password is incorrect.';
              const norm = newEmail.trim().toLowerCase();
              if (
                Object.values(db.users).some(
                  (u) => u.email === norm && u.id !== currentUser.id
                )
              ) {
                return 'Email already in use.';
              }
              updateDb((prev) => ({
                ...prev,
                users: {
                  ...prev.users,
                  [currentUser.id]: { ...currentUser, email: norm },
                },
              }));
              showToast('Email updated');
              return null;
            }}
            onDeleteAccount={() => {
              if (!currentUser) return;
              setConfirmState({
                message:
                  'Delete your account and all local bookshelves, bookmarks, and margin notes permanently?',
                confirmLabel: 'Delete Account',
                danger: true,
                onConfirm: () => {
                  const id = currentUser.id;
                  updateDb((prev) => {
                    const nextUsers = { ...prev.users };
                    delete nextUsers[id];
                    return { ...prev, users: nextUsers };
                  });
                  setConfirmState(null);
                  handleLogout();
                },
              });
            }}
            onClearHistory={() => {
              setConfirmState({
                message: 'Clear your reading history?',
                confirmLabel: 'Clear',
                danger: true,
                onConfirm: () => {
                  updateUserData((u) => ({
                    ...u,
                    data: { ...u.data, history: [] },
                  }));
                  setConfirmState(null);
                  showToast('Reading history cleared');
                },
              });
            }}
            onToast={showToast}
          />
        )}

        {route.name === 'book' &&
          (activeBookDetail ? (
            <BookDetailView
              book={activeBookDetail}
              user={currentUser}
              reviews={db.reviews}
              onStartReading={handleStartReading}
              onOpenBook={(id) => navigate(`book-${id}`)}
              onToggleFavorite={handleToggleFavorite}
              onSetShelfStatus={handleSetShelfStatus}
              onRemoveFromShelf={handleRemoveFromShelf}
              onSelectGenre={(genre) => {
                setBrowseGenre(genre);
                setBrowseCollection('All');
                navigate('browse');
              }}
              onOpenShare={(b) => setShareBook(b)}
              onSubmitReview={handleSubmitReview}
            />
          ) : (
            <div className="py-16 text-center">
              <h2 className="font-display text-2xl font-bold">Volume Not Found</h2>
              <p className="mt-2 text-sm text-stone-500">
                That book could not be found in the UCbooksphere catalog.
              </p>
              <button
                type="button"
                onClick={() => navigate('home')}
                className="mt-5 rounded-lg px-4 py-2 text-sm font-semibold"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-fg)',
                }}
              >
                Return Home
              </button>
            </div>
          ))}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="mt-14 border-t border-stone-200 py-8 text-center text-xs text-stone-500 dark:border-stone-800/80 dark:text-stone-400">
        <p className="font-medium text-stone-700 dark:text-stone-300">
          UCbooksphere · {BOOKS.length} Illustrated Editions &amp; Academic Coursebooks
        </p>
        <p className="mt-1 text-[11px] text-stone-400 dark:text-stone-500">
          Created by Philippe Blink Segovia, Kent Macabodbod, Kurt Remulta, Kian Tiro &amp; John Simbahon
        </p>
      </footer>

      {/* Modals */}
      {authModal.open && (
        <AuthModal
          initialTab={authModal.tab}
          onClose={() => setAuthModal({ open: false, tab: 'in' })}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onResetPassword={handleResetPassword}
          onQuickDemo={handleQuickDemo}
        />
      )}

      {editProfileOpen && currentUser && (
        <EditProfileModal
          user={currentUser}
          onClose={() => setEditProfileOpen(false)}
          onSave={(payload) => {
            const un = payload.username.trim();
            if (
              Object.values(db.users).some(
                (u) =>
                  u.username.toLowerCase() === un.toLowerCase() &&
                  u.id !== currentUser.id
              )
            ) {
              return 'Username is already taken.';
            }
            updateDb((prev) => ({
              ...prev,
              users: {
                ...prev.users,
                [currentUser.id]: {
                  ...currentUser,
                  name: payload.name.trim(),
                  username: un,
                  avatar: {
                    emoji: payload.emoji,
                    color: payload.color,
                    image: payload.image,
                  },
                },
              },
            }));
            showToast('Profile updated');
            return null;
          }}
        />
      )}

      {shareBook && (
        <ShareModal
          book={shareBook}
          onClose={() => setShareBook(null)}
          onCopied={() => showToast('Link copied to clipboard')}
        />
      )}

      {confirmState && (
        <ConfirmModal
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          danger={confirmState.danger}
          onCancel={() => setConfirmState(null)}
          onConfirm={confirmState.onConfirm}
        />
      )}

      {toastMsg && (
        <div
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full px-5 py-2.5 text-xs font-semibold shadow-xl"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-fg)',
          }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
