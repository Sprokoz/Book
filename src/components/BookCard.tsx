import React from 'react';
import { Star } from 'lucide-react';
import type { Book, LibraryDB } from '../types/library';
import { getBookRating } from '../utils/storage';
import { BookCover } from './BookCover';

interface BookCardProps {
  book: Book;
  reviews: LibraryDB['reviews'];
  isFavorite: boolean;
  onToggleFavorite: (bookId: string) => void;
  onOpenBook: (bookId: string) => void;
  progressPct?: number;
  footerSlot?: React.ReactNode;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  reviews,
  isFavorite,
  onToggleFavorite,
  onOpenBook,
  progressPct,
  footerSlot,
}) => {
  const rating = getBookRating(book, reviews);

  return (
    <div className="group flex flex-col">
      <a
        href={`#book-${book.id}`}
        onClick={(e) => {
          e.preventDefault();
          onOpenBook(book.id);
        }}
        className="block transition-transform duration-200 hover:-translate-y-1.5"
      >
        <BookCover
          book={book}
          isFavorite={isFavorite}
          onToggleFavorite={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(book.id);
          }}
        />
        <div className="mt-3 px-0.5">
          <h4 className="font-display truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
            {book.title}
          </h4>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
            <span className="truncate">{book.author}</span>
            <span aria-hidden="true">·</span>
            <span className="font-tab inline-flex shrink-0 items-center gap-0.5 text-amber-700 dark:text-amber-300">
              <Star className="h-3 w-3 fill-current" />
              {rating}
            </span>
          </div>
        </div>
      </a>

      {typeof progressPct === 'number' && (
        <div className="mt-2 px-0.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progressPct}%`,
                backgroundColor: 'var(--accent)',
              }}
            />
          </div>
          <p className="font-tab mt-1 text-[11px] text-stone-500 dark:text-stone-400">
            {progressPct}% read
          </p>
        </div>
      )}

      {footerSlot}
    </div>
  );
};

interface ShelfRowProps {
  title: string;
  subtitle?: string;
  books: Book[];
  reviews: LibraryDB['reviews'];
  favorites: string[];
  onToggleFavorite: (bookId: string) => void;
  onOpenBook: (bookId: string) => void;
  progressMap?: Record<string, number>;
  actionLabel?: string;
  onAction?: () => void;
}

export const ShelfRow: React.FC<ShelfRowProps> = ({
  title,
  subtitle,
  books,
  reviews,
  favorites,
  onToggleFavorite,
  onOpenBook,
  progressMap,
  actionLabel,
  onAction,
}) => {
  if (books.length === 0) return null;

  return (
    <section className="my-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-stone-900 sm:text-2xl dark:text-stone-100">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
              {subtitle}
            </p>
          )}
        </div>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="shrink-0 text-xs font-semibold text-amber-700 hover:underline dark:text-amber-300"
          >
            {actionLabel}
          </button>
        )}
      </div>

      <div className="shelf-scroll flex gap-5 overflow-x-auto pb-4 pt-1 snap-x">
        {books.map((book) => (
          <div key={book.id} className="w-[152px] shrink-0 snap-start sm:w-[168px]">
            <BookCard
              book={book}
              reviews={reviews}
              isFavorite={favorites.includes(book.id)}
              onToggleFavorite={onToggleFavorite}
              onOpenBook={onOpenBook}
              progressPct={progressMap ? progressMap[book.id] : undefined}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
