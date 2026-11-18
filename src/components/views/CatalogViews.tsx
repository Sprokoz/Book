import React from 'react';
import { BookOpen, Search, Star } from 'lucide-react';
import type { Book, LibraryDB } from '../../types/library';
import { BOOKS, COLLECTIONS, GENRES } from '../../data/books';
import { formatYear, getBookRating } from '../../utils/storage';
import { BookCard } from '../BookCard';

interface BrowseViewProps {
  selectedGenre: string;
  selectedCollection: string;
  sortBy: 'pop' | 'rate' | 'year' | 'az';
  onChangeGenre: (genre: string) => void;
  onChangeCollection: (col: string) => void;
  onChangeSort: (sort: 'pop' | 'rate' | 'year' | 'az') => void;
  reviews: LibraryDB['reviews'];
  favorites: string[];
  onToggleFavorite: (bookId: string) => void;
  onOpenBook: (bookId: string) => void;
}

export const BrowseView: React.FC<BrowseViewProps> = ({
  selectedGenre,
  selectedCollection,
  sortBy,
  onChangeGenre,
  onChangeCollection,
  onChangeSort,
  reviews,
  favorites,
  onToggleFavorite,
  onOpenBook,
}) => {
  const filtered = BOOKS.filter(
    (b) =>
      (selectedGenre === 'All' || b.genres.includes(selectedGenre)) &&
      (selectedCollection === 'All' || b.collection === selectedCollection)
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'pop') return b.readers - a.readers;
    if (sortBy === 'rate')
      return getBookRating(b, reviews) - getBookRating(a, reviews);
    if (sortBy === 'year') return b.year - a.year;
    return a.title.localeCompare(b.title);
  });

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
            Browse Library
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Explore all {BOOKS.length} illustrated hardcover volumes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Filter by collection"
            value={selectedCollection}
            onChange={(e) => onChangeCollection(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
          >
            <option value="All">All Collections</option>
            {COLLECTIONS.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>

          <select
            aria-label="Sort books"
            value={sortBy}
            onChange={(e) =>
              onChangeSort(e.target.value as 'pop' | 'rate' | 'year' | 'az')
            }
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
          >
            <option value="pop">Most Popular</option>
            <option value="rate">Highest Rated</option>
            <option value="year">Publication Year</option>
            <option value="az">Title A–Z</option>
          </select>
        </div>
      </div>

      {/* Interactive Genre Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        {['All', ...GENRES].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => onChangeGenre(g)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedGenre === g
                ? 'shadow-sm'
                : 'border border-stone-200 bg-white text-stone-600 hover:border-stone-400 hover:text-stone-900 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
            }`}
            style={
              selectedGenre === g
                ? { backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }
                : undefined
            }
          >
            {g}
          </button>
        ))}
      </div>

      <p className="font-tab mb-4 text-xs text-stone-500 dark:text-stone-400">
        Showing {sorted.length} {sorted.length === 1 ? 'volume' : 'volumes'}
      </p>

      {sorted.length > 0 ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {sorted.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              reviews={reviews}
              isFavorite={favorites.includes(book.id)}
              onToggleFavorite={onToggleFavorite}
              onOpenBook={onOpenBook}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200 bg-white py-16 text-center dark:border-stone-800 dark:bg-stone-900">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-stone-400" />
          <h3 className="font-display text-lg font-bold">No matching volumes</h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Try clearing your genre or collection filter.
          </p>
          <button
            type="button"
            onClick={() => {
              onChangeGenre('All');
              onChangeCollection('All');
            }}
            className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
};

interface CategoriesViewProps {
  onSelectGenre: (genre: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  onSelectGenre,
}) => (
  <section>
    <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
      Categories
    </h1>
    <p className="mt-1 mb-6 text-sm text-stone-500 dark:text-stone-400">
      Browse our reading shelves by literary genre
    </p>
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {GENRES.map((genre) => {
        const matches = BOOKS.filter((b) => b.genres.includes(genre));
        const preview = matches[0];
        return (
          <button
            key={genre}
            type="button"
            onClick={() => onSelectGenre(genre)}
            className="group flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-amber-600/50 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:hover:border-amber-400/40"
          >
            <div>
              <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                {genre}
              </h3>
              <p className="font-tab mt-1 text-xs text-stone-500 dark:text-stone-400">
                {matches.length} {matches.length === 1 ? 'volume' : 'volumes'}
              </p>
            </div>
            {preview && (
              <img
                src={preview.coverUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="h-16 w-12 shrink-0 rounded object-cover shadow-sm transition-transform group-hover:scale-105"
              />
            )}
          </button>
        );
      })}
    </div>
  </section>
);

interface TrendingViewProps {
  reviews: LibraryDB['reviews'];
  onOpenBook: (bookId: string) => void;
  onStartReading: (bookId: string) => void;
}

export const TrendingView: React.FC<TrendingViewProps> = ({
  reviews,
  onOpenBook,
  onStartReading,
}) => {
  const ranked = [...BOOKS].sort((a, b) => b.readers - a.readers);

  return (
    <section>
      <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
        Trending Volumes
      </h1>
      <p className="mt-1 mb-6 text-sm text-stone-500 dark:text-stone-400">
        Most actively read classics across Folio
      </p>

      <div className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900">
        {ranked.map((book, idx) => (
          <div
            key={book.id}
            className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50"
          >
            <button
              type="button"
              onClick={() => onOpenBook(book.id)}
              className="flex min-w-0 flex-1 items-center gap-4 text-left"
            >
              <span className="font-tab w-7 shrink-0 text-center text-base font-bold text-amber-700 dark:text-amber-300">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <img
                src={book.coverUrl}
                alt={book.title}
                referrerPolicy="no-referrer"
                className="h-16 w-12 shrink-0 rounded object-cover shadow"
              />
              <div className="min-w-0">
                <h3 className="font-display truncate text-base font-bold text-stone-900 dark:text-stone-100">
                  {book.title}
                </h3>
                <p className="mt-0.5 truncate text-xs text-stone-500 dark:text-stone-400">
                  {book.author} · {formatYear(book.year)} · {book.genres.slice(0, 2).join(' / ')}
                </p>
              </div>
            </button>

            <div className="flex shrink-0 items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="font-tab inline-flex items-center gap-1 text-sm font-semibold text-amber-700 dark:text-amber-300">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {getBookRating(book, reviews)}
                </p>
                <p className="font-tab text-xs text-stone-500 dark:text-stone-400">
                  {book.readers.toLocaleString()} readers
                </p>
              </div>
              <button
                type="button"
                onClick={() => onStartReading(book.id)}
                className="rounded-lg px-3.5 py-2 text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-fg)',
                }}
              >
                Read
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

interface SearchViewProps {
  query: string;
  onQueryChange: (q: string) => void;
  reviews: LibraryDB['reviews'];
  favorites: string[];
  onToggleFavorite: (bookId: string) => void;
  onOpenBook: (bookId: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  query,
  onQueryChange,
  reviews,
  favorites,
  onToggleFavorite,
  onOpenBook,
}) => {
  const q = query.trim().toLowerCase();
  const results: Book[] = q
    ? BOOKS.filter((b) =>
        [b.title, b.author, b.genres.join(' '), b.description, b.collection]
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
    : BOOKS;

  return (
    <section>
      <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
        Search Catalog
      </h1>
      <div className="mt-4 mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search titles, authors, genres, or collections..."
            className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pr-4 pl-10 text-sm dark:border-stone-700 dark:bg-stone-900"
          />
        </div>
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
          >
            Clear
          </button>
        )}
      </div>

      <p className="font-tab mb-5 text-xs text-stone-500 dark:text-stone-400">
        {q
          ? `${results.length} ${results.length === 1 ? 'result' : 'results'} for “${query}”`
          : `Showing all ${results.length} catalog volumes`}
      </p>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              reviews={reviews}
              isFavorite={favorites.includes(book.id)}
              onToggleFavorite={onToggleFavorite}
              onOpenBook={onOpenBook}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200 bg-white py-16 text-center dark:border-stone-800 dark:bg-stone-900">
          <Search className="mx-auto mb-3 h-10 w-10 text-stone-400" />
          <h3 className="font-display text-lg font-bold">No books found</h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Try searching another author, title, or literary genre.
          </p>
        </div>
      )}
    </section>
  );
};
