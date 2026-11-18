export type ShelfStatus =
  | 'Currently Reading'
  | 'Want to Read'
  | 'Completed'
  | 'On Hold';

export type AppTheme = 'dark' | 'light' | 'system';
export type ReaderTheme = 'ivory' | 'sepia' | 'daylight' | 'midnight';
export type ReaderFont = 'serif' | 'display' | 'sans' | 'mono';
export type ReaderLayout = 'spread' | 'single' | 'scroll';

export interface Chapter {
  title: string;
  subtitle?: string;
  text: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  genres: string[];
  rating: number;
  readers: number;
  hue: number;
  spineColor: string;
  coverUrl: string;
  plateCaption: string;
  featured?: boolean;
  editionLabel: string;
  collection: string;
  description: string;
  chapters: Chapter[];
}

export interface ReadingProgress {
  chapter: number; // 1-indexed
  page: number; // 0-indexed spread/page index
  pct: number; // 0..1 within chapter
  updatedAt: number;
}

export interface HistoryEntry {
  bookId: string;
  chapter: number;
  timestamp: number;
}

export interface Bookmark {
  id: string;
  bookId: string;
  chapter: number;
  page: number;
  pct: number;
  excerpt: string;
  createdAt: number;
}

export interface MarginNote {
  id: string;
  bookId: string;
  chapter: number;
  paragraphIndex: number;
  excerpt: string;
  note: string;
  color: 'amber' | 'sage' | 'rose';
  createdAt: number;
}

export interface NotificationItem {
  id: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface UserData {
  favorites: string[];
  shelf: Record<string, ShelfStatus>;
  progress: Record<string, ReadingProgress>;
  chaptersCompleted: Record<string, number[]>;
  history: HistoryEntry[];
  bookmarks: Bookmark[];
  notes: MarginNote[];
  daysActive: string[];
  monthlyActivity: Record<string, number>;
  notifications: NotificationItem[];
  dailyGoalMinutes: number;
  todayMinutes: { date: string; minutes: number };
}

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  salt: string;
  hash: string;
  avatar: {
    emoji: string;
    color: string;
    image?: string;
  };
  data: UserData;
}

export interface Review {
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: number;
}

export interface LibraryDB {
  users: Record<string, UserAccount>;
  reviews: Record<string, Review[]>;
}

export interface Settings {
  theme: AppTheme;
  accent: string;
  fontSize: number;
  fontFamily: ReaderFont;
  lineHeight: number;
  readerTheme: ReaderTheme;
  readerLayout: ReaderLayout;
  pageWidth: number;
  soundEffects: boolean;
  notificationsEnabled: boolean;
  chapterNotifications: boolean;
  reminderNotifications: boolean;
  bookmarkUpdates: boolean;
  profileVisibility: 'public' | 'private';
}

export type RouteName =
  | 'home'
  | 'browse'
  | 'categories'
  | 'trending'
  | 'search'
  | 'favorites'
  | 'shelf'
  | 'profile'
  | 'settings'
  | 'book'
  | 'read';

export interface ParsedRoute {
  name: RouteName;
  bookId?: string;
  chapter?: number;
}
