import type { Book, LibraryDB, Settings, UserAccount, UserData } from '../types/library';

const DB_KEY = 'folio_db_v2';
const SETTINGS_KEY = 'folio_settings_v2';
const SESSION_KEY = 'folio_session_v2';

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  accent: '#d4a73a',
  fontSize: 18,
  fontFamily: 'serif',
  lineHeight: 1.75,
  readerTheme: 'ivory',
  readerLayout: 'spread',
  pageWidth: 720,
  soundEffects: true,
  notificationsEnabled: true,
  chapterNotifications: true,
  reminderNotifications: true,
  bookmarkUpdates: true,
  profileVisibility: 'public',
};

export const createEmptyUserData = (): UserData => ({
  favorites: [],
  shelf: {},
  progress: {},
  chaptersCompleted: {},
  history: [],
  bookmarks: [],
  notes: [],
  daysActive: [],
  monthlyActivity: {},
  notifications: [
    {
      id: 'welcome',
      text: 'Welcome to UCbooksphere! Explore ComProg coursebooks and classics in the two-page book reader.',
      timestamp: Date.now(),
      read: false,
    },
  ],
  dailyGoalMinutes: 20,
  todayMinutes: { date: todayIso(), minutes: 0 },
});

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function monthIso(): string {
  return todayIso().slice(0, 7);
}

export function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadDB(): LibraryDB {
  const saved = readJson<LibraryDB>(DB_KEY);
  if (saved && saved.users && saved.reviews) {
    return saved;
  }
  return { users: {}, reviews: {} };
}

export function saveDB(db: LibraryDB): boolean {
  return writeJson(DB_KEY, db);
}

export function loadSettings(): Settings {
  const saved = readJson<Partial<Settings>>(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(saved || {}) };
}

export function saveSettings(settings: Settings): boolean {
  return writeJson(SETTINGS_KEY, settings);
}

export function getSessionId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setSessionId(userId: string | null, remember = false): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    if (userId) {
      (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, userId);
    }
  } catch {
    // Ignore storage restriction
  }
}

const bytesToBase64 = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes));

const base64ToBytes = (str: string): Uint8Array =>
  Uint8Array.from(atob(str), (c) => c.charCodeAt(0));

export async function hashPassword(password: string, saltBase64?: string): Promise<{ salt: string; hash: string }> {
  const saltBytes = saltBase64
    ? base64ToBytes(saltBase64)
    : crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes.buffer as ArrayBuffer,
      iterations: 150000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return {
    salt: saltBase64 || bytesToBase64(saltBytes),
    hash: bytesToBase64(new Uint8Array(derived)),
  };
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function formatYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BCE` : String(year);
}

export function getBookRating(book: Book, reviews: LibraryDB['reviews']): number {
  const list = reviews[book.id] || [];
  const totalWeight = 50 + list.length;
  const sum = book.rating * 50 + list.reduce((acc, r) => acc + r.rating, 0);
  return Number((sum / totalWeight).toFixed(1));
}

export function getBookCompletionPct(book: Book, user: UserAccount | null): number {
  if (!user) return 0;
  if (user.data.shelf[book.id] === 'Completed') return 100;
  const p = user.data.progress[book.id];
  if (!p) return 0;
  const raw = ((p.chapter - 1 + p.pct) / Math.max(1, book.chapters.length)) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function computeUserStats(user: UserAccount, books: Book[]) {
  const dd = user.data;
  let completed = 0;
  let reading = 0;
  Object.values(dd.shelf).forEach((st) => {
    if (st === 'Completed') completed++;
    if (st === 'Currently Reading') reading++;
  });

  let chaptersRead = 0;
  let totalWordsRead = 0;

  books.forEach((book) => {
    const doneList = dd.chaptersCompleted?.[book.id];
    const prog = dd.progress[book.id];
    if (doneList && doneList.length > 0) {
      chaptersRead += doneList.length;
      doneList.forEach((chIdx) => {
        const ch = book.chapters[chIdx - 1];
        if (ch) totalWordsRead += countWords(ch.text);
      });
    } else if (prog) {
      chaptersRead += prog.chapter;
      book.chapters.slice(0, prog.chapter).forEach((ch) => {
        totalWordsRead += countWords(ch.text);
      });
    }
  });

  const estMinutes = Math.round(totalWordsRead / 220);

  let streak = 0;
  const cursor = new Date();
  if (!dd.daysActive.includes(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dd.daysActive.includes(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    completed,
    reading,
    chaptersRead,
    streak,
    estMinutes,
  };
}
