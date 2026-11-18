import React, { useEffect, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Heart, Shuffle, Star } from 'lucide-react';
import type { Book, LibraryDB, UserAccount } from '../../types/library';
import { BOOKS, COLLECTIONS, getBookById } from '../../data/books';
import { formatYear, getBookCompletionPct, getBookRating } from '../../utils/storage';
import { BookCover } from '../BookCover';
import { ShelfRow } from '../BookCard';

interface HomeViewProps {
  user: UserAccount | null;
  reviews: LibraryDB['reviews'];
  onOpenBook: (bookId: string) => void;
  onStartReading: (bookId: string) => void;
  onToggleFavorite: (bookId: string) => void;
  onSelectCollection: (collection: string) => void;
  onBrowseAll: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  reviews,
  onOpenBook,
  onStartReading,
  onToggleFavorite,
  onSelectCollection,
  onBrowseAll,
}) => {
  const featuredBooks = BOOKS.filter((b) => b.featured);
  const [heroIdx, setHeroIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || featuredBooks.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIdx((i) => (i + 1) % featuredBooks.length);
    }, 8500);
    return () => clearInterval(timer);
  }, [paused, featuredBooks.length]);

  const featured = featuredBooks[heroIdx % featuredBooks.length] || BOOKS[0];
  const favorites = user?.data.favorites || [];

  // Continue reading sorted descending by most recently read
  const continueReading: Book[] = user
    ? BOOKS.filter(
        (b) => user.data.progress[b.id] && user.data.shelf[b.id] !== 'Completed'
      ).sort(
        (a, b) =>
          (user.data.progress[b.id]?.updatedAt || 0) -
          (user.data.progress[a.id]?.updatedAt || 0)
      )
    : [];

  const progressMap: Record<string, number> = {};
  if (user) {
    continueReading.forEach((b) => {
      progressMap[b.id] = getBookCompletionPct(b, user);
    });
  }

  // Personalized recommendations
  const recommended = (() => {
    if (!user) return [...BOOKS].sort((a, b) => b.rating - a.rating);
    const weights: Record<string, number> = {};
    [
      ...user.data.favorites,
      ...Object.keys(user.data.shelf),
      ...user.data.history.map((h) => h.bookId),
    ].forEach((id) => {
      const book = getBookById(id);
      book?.genres.forEach((g) => {
        weights[g] = (weights[g] || 0) + 1;
      });
    });

    const unread = BOOKS.filter((b) => !user.data.shelf[b.id]);
    const pool = unread.length >= 4 ? unread : BOOKS;
    return [...pool].sort((a, b) => {
      const sa = a.genres.reduce((acc, g) => acc + (weights[g] || 0), 0);
      const sb = b.genres.reduce((acc, g) => acc + (weights[g] || 0), 0);
      return sb - sa || b.rating - a.rating;
    });
  })();

  const trending = [...BOOKS].sort((a, b) => b.readers - a.readers);
  const newAdditions = [...BOOKS].slice(9).concat([...BOOKS].slice(0, 5));
  const editorsPicks = BOOKS.filter((b) => b.featured);

  const handleSurpriseMe = () => {
    const others = BOOKS.filter((b) => b.id !== featured.id);
    const pick = others[Math.floor(Math.random() * others.length)] || BOOKS[0];
    onOpenBook(pick.id);
  };

  return (
    <div>
      {/* Featured Exhibition Showcase */}
      <section
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative overflow-hidden rounded-2xl border border-stone-200/90 bg-stone-900 text-stone-100 shadow-xl dark:border-stone-800"
      >
        {/* Blurred Atmospheric Art Backdrop */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src={featured.coverUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full scale-110 object-cover opacity-35 blur-2xl saturate-150 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/80 to-stone-950/60" />
        </div>

        <div className="relative z-10 grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[260px_1fr] lg:gap-12 lg:p-12">
          {/* Hardcover Book Showcase */}
          <div className="mx-auto lg:mx-0">
            <a
              href={`#book-${featured.id}`}
              onClick={(e) => {
                e.preventDefault();
                onOpenBook(featured.id);
              }}
              className="block transition-transform duration-300 hover:scale-[1.02]"
            >
              <BookCover
                book={featured}
                size="hero"
                isFavorite={favorites.includes(featured.id)}
                onToggleFavorite={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite(featured.id);
                }}
              />
            </a>
          </div>

          {/* Editorial Copy */}
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-wider uppercase text-amber-300/90">
              <span>Featured Volume</span>
              <span aria-hidden="true">·</span>
              <span>{featured.editionLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-tab">{formatYear(featured.year)}</span>
            </div>

            <h1 className="font-display mt-3 text-3xl font-bold tracking-tight text-balance text-white sm:text-5xl">
              {featured.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-stone-300">
              <span>by {featured.author}</span>
              <span aria-hidden="true">·</span>
              <span className="font-tab inline-flex items-center gap-1 text-amber-300">
                <Star className="h-3.5 w-3.5 fill-current" />
                {getBookRating(featured, reviews)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-400">
                {featured.genres.slice(0, 3).join(' / ')}
              </span>
            </div>

            <p className="font-book mt-4 text-base leading-relaxed text-stone-300">
              {featured.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onStartReading(featured.id)}
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-lg transition-transform active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-fg)',
                }}
              >
                <BookOpen className="h-4 w-4" />
                Open Book
              </button>

              <button
                type="button"
                onClick={() => onOpenBook(featured.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Book Details
              </button>

              <button
                type="button"
                onClick={() => onToggleFavorite(featured.id)}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  favorites.includes(featured.id)
                    ? 'border-rose-400/50 bg-rose-500/20 text-rose-200'
                    : 'border-white/15 bg-black/25 text-stone-200 hover:bg-white/10'
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${
                    favorites.includes(featured.id) ? 'fill-current' : ''
                  }`}
                />
                {favorites.includes(featured.id) ? 'Favorited' : 'Favorite'}
              </button>

              <button
                type="button"
                onClick={handleSurpriseMe}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3.5 py-2.5 text-xs font-medium text-stone-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Shuffle className="h-3.5 w-3.5" />
                Surprise Me
              </button>
            </div>

            {/* Featured Carousel Controls */}
            <div className="mt-7 flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setHeroIdx(
                    (i) => (i - 1 + featuredBooks.length) % featuredBooks.length
                  )
                }
                aria-label="Previous featured book"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-stone-300 hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1.5">
                {featuredBooks.map((b, idx) => (
                  <button
                    key={b.id}
                    type="button"
                    aria-label={`Feature ${b.title}`}
                    onClick={() => setHeroIdx(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === heroIdx % featuredBooks.length
                        ? 'w-6 bg-amber-400'
                        : 'w-1.5 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setHeroIdx((i) => (i + 1) % featuredBooks.length)}
                aria-label="Next featured book"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-stone-300 hover:bg-white/10"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Continue Reading Shelf */}
      {continueReading.length > 0 && (
        <ShelfRow
          title="Continue Reading"
          subtitle="Pick up right where your silk bookmark rests"
          books={continueReading}
          reviews={reviews}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onOpenBook={onOpenBook}
          progressMap={progressMap}
        />
      )}

      {/* Curated Collections Strip */}
      <section className="my-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-stone-900 sm:text-2xl dark:text-stone-100">
              Curated Collections
            </h2>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
              Thematic reading rooms assembled by our editors
            </p>
          </div>
          <button
            type="button"
            onClick={onBrowseAll}
            className="text-xs font-semibold text-amber-700 hover:underline dark:text-amber-300"
          >
            Browse all 14 volumes
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((col) => {
            const colBooks = BOOKS.filter((b) => b.collection === col);
            const lead = colBooks[0];
            return (
              <button
                key={col}
                type="button"
                onClick={() => onSelectCollection(col)}
                className="group flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-amber-600/50 hover:shadow-md dark:border-stone-800 dark:bg-stone-900/90 dark:hover:border-amber-400/40"
              >
                {lead && (
                  <img
                    src={lead.coverUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-20 w-14 shrink-0 rounded object-cover shadow-sm transition-transform group-hover:scale-105"
                  />
                )}
                <div className="min-w-0">
                  <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                    {col}
                  </h3>
                  <p className="font-tab mt-1 text-xs text-stone-500 dark:text-stone-400">
                    {colBooks.length} illustrated editions
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <ShelfRow
        title="Trending in the Library"
        subtitle="Most-read classics this week"
        books={trending}
        reviews={reviews}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        onOpenBook={onOpenBook}
      />

      <ShelfRow
        title="Newly Illustrated Editions"
        subtitle="Expanded catalog with frontispiece plates"
        books={newAdditions}
        reviews={reviews}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        onOpenBook={onOpenBook}
      />

      <ShelfRow
        title="Recommended For You"
        subtitle={
          user
            ? 'Tailored from your shelf, favorites, and reading history'
            : 'Highest-rated literary classics'
        }
        books={recommended}
        reviews={reviews}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        onOpenBook={onOpenBook}
      />

      <ShelfRow
        title="Editor’s Selections"
        subtitle="Essential starting volumes for your reading desk"
        books={editorsPicks}
        reviews={reviews}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        onOpenBook={onOpenBook}
      />
    </div>
  );
};
