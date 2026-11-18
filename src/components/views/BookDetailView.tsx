import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Check,
  Heart,
  Plus,
  Share2,
  Star,
} from 'lucide-react';
import type { Book, LibraryDB, ShelfStatus, UserAccount } from '../../types/library';
import { getSimilarBooks, SHELF_STATUSES } from '../../data/books';
import {
  countWords,
  formatYear,
  getBookCompletionPct,
  getBookRating,
} from '../../utils/storage';
import { BookCover } from '../BookCover';
import { ShelfRow } from '../BookCard';

interface BookDetailViewProps {
  book: Book;
  user: UserAccount | null;
  reviews: LibraryDB['reviews'];
  onStartReading: (bookId: string, chapter?: number) => void;
  onOpenBook: (bookId: string) => void;
  onToggleFavorite: (bookId: string) => void;
  onSetShelfStatus: (bookId: string, status: ShelfStatus) => void;
  onRemoveFromShelf: (bookId: string) => void;
  onSelectGenre: (genre: string) => void;
  onOpenShare: (book: Book) => void;
  onSubmitReview: (bookId: string, rating: number, text: string) => void;
}

export const BookDetailView: React.FC<BookDetailViewProps> = ({
  book,
  user,
  reviews,
  onStartReading,
  onOpenBook,
  onToggleFavorite,
  onSetShelfStatus,
  onRemoveFromShelf,
  onSelectGenre,
  onOpenShare,
  onSubmitReview,
}) => {
  const bookReviews = reviews[book.id] || [];
  const existingMine = user
    ? bookReviews.find((r) => r.userId === user.id)
    : undefined;

  const [rating, setRating] = useState(existingMine?.rating || 5);
  const [reviewText, setReviewText] = useState(existingMine?.text || '');

  useEffect(() => {
    setRating(existingMine?.rating || 5);
    setReviewText(existingMine?.text || '');
  }, [book.id, existingMine?.rating, existingMine?.text]);

  const isFav = Boolean(user?.data.favorites.includes(book.id));
  const shelfStatus = user?.data.shelf[book.id];
  const progress = user?.data.progress[book.id];
  const pct = getBookCompletionPct(book, user);
  const similar = getSimilarBooks(book, 5);
  const totalWords = book.chapters.reduce((s, c) => s + countWords(c.text), 0);

  return (
    <div>
      {/* Main Catalog Presentation */}
      <div className="grid gap-8 lg:grid-cols-[270px_1fr] lg:gap-12">
        <div className="mx-auto lg:mx-0">
          <BookCover
            book={book}
            size="lg"
            isFavorite={isFav}
            onToggleFavorite={() => onToggleFavorite(book.id)}
          />
          <p className="font-book mt-3 text-center text-xs italic text-stone-500 dark:text-stone-400">
            {book.plateCaption}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-amber-700 dark:text-amber-300">
            {book.editionLabel} · {book.collection}
          </p>

          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-100">
            {book.title}
          </h1>

          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
            <span>by {book.author}</span>
            <span aria-hidden="true">·</span>
            <span className="font-tab">{formatYear(book.year)}</span>
            <span aria-hidden="true">·</span>
            <span className="font-tab">{book.chapters.length} chapters</span>
            <span aria-hidden="true">·</span>
            <span className="font-tab">~{Math.max(2, Math.round(totalWords / 220))} min read</span>
            <span aria-hidden="true">·</span>
            <span className="font-tab inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300">
              <Star className="h-3.5 w-3.5 fill-current" />
              {getBookRating(book, reviews)} ({bookReviews.length + 50} ratings)
            </span>
          </div>

          {/* Interactive Genre Links */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {book.genres.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onSelectGenre(g)}
                className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-600 transition-colors hover:border-amber-600 hover:text-stone-950 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              >
                {g}
              </button>
            ))}
          </div>

          <p className="font-book mt-5 max-w-2xl text-base leading-relaxed text-stone-700 dark:text-stone-300">
            {book.description}
          </p>

          {user && (
            <div className="mt-5 max-w-sm">
              <div className="mb-1 flex justify-between text-xs text-stone-500 dark:text-stone-400">
                <span>{shelfStatus || 'Not on shelf yet'}</span>
                <span className="font-tab">{pct}% complete</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }}
                />
              </div>
            </div>
          )}

          {/* Action Strip */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onStartReading(book.id, progress?.chapter || 1)}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition-transform active:scale-[0.98]"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              <BookOpen className="h-4 w-4" />
              {progress ? 'Continue Reading' : 'Open Book'}
            </button>

            <button
              type="button"
              onClick={() => onToggleFavorite(book.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                isFav
                  ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                  : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
              {isFav ? 'Favorited' : 'Favorite'}
            </button>

            {shelfStatus ? (
              <div className="inline-flex items-center gap-1.5">
                <select
                  aria-label="Bookshelf status"
                  value={shelfStatus}
                  onChange={(e) =>
                    onSetShelfStatus(book.id, e.target.value as ShelfStatus)
                  }
                  className="rounded-lg border border-amber-600/40 bg-amber-500/10 px-3 py-2.5 text-sm font-medium text-amber-800 dark:text-amber-200"
                >
                  {SHELF_STATUSES.map((st) => (
                    <option
                      key={st}
                      value={st}
                      className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100"
                    >
                      {st}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onRemoveFromShelf(book.id)}
                  className="rounded-lg border border-stone-300 px-3 py-2.5 text-xs font-medium text-stone-600 hover:border-rose-400 hover:text-rose-600 dark:border-stone-700 dark:text-stone-400"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onSetShelfStatus(book.id, 'Want to Read')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                <Plus className="h-4 w-4" />
                Add to Bookshelf
              </button>
            )}

            {shelfStatus !== 'Completed' && (
              <button
                type="button"
                onClick={() => onSetShelfStatus(book.id, 'Completed')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                <Check className="h-4 w-4" />
                Mark Completed
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenShare(book)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>

          {/* Chapter Index */}
          <div className="mt-10">
            <h2 className="font-display mb-3 text-xl font-bold text-stone-900 dark:text-stone-100">
              Table of Contents
            </h2>
            <div className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900">
              {book.chapters.map((ch, idx) => {
                const chNum = idx + 1;
                const isBookmarkedHere = progress?.chapter === chNum;
                return (
                  <button
                    key={ch.title}
                    type="button"
                    onClick={() => onStartReading(book.id, chNum)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/60"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-stone-900 dark:text-stone-100">
                        {ch.title}
                      </p>
                      {ch.subtitle && (
                        <p className="font-book text-xs italic text-stone-500 dark:text-stone-400">
                          {ch.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="font-tab shrink-0 text-right text-xs text-stone-500 dark:text-stone-400">
                      <span>{countWords(ch.text)} words</span>
                      {isBookmarkedHere && (
                        <span className="ml-2 font-sans font-semibold text-amber-700 dark:text-amber-300">
                          · Current
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reader Reviews */}
          <div className="mt-10">
            <h2 className="font-display mb-3 text-xl font-bold text-stone-900 dark:text-stone-100">
              Reader Reviews
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmitReview(book.id, rating, reviewText);
              }}
              className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
            >
              <div className="mb-3 flex items-center justify-between gap-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Your Rating
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-amber-700 dark:border-stone-700 dark:bg-stone-950 dark:text-amber-300"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {'★'.repeat(n)} ({n}/5)
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts on this edition..."
                className="w-full rounded-lg border border-stone-300 bg-stone-50 p-3 text-sm focus:border-amber-600 focus:outline-none dark:border-stone-700 dark:bg-stone-950"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg px-4 py-2 text-sm font-semibold"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--accent-fg)',
                  }}
                >
                  {existingMine ? 'Update Review' : 'Post Review'}
                </button>
              </div>
            </form>

            <div className="mt-4 space-y-3">
              {bookReviews.length === 0 ? (
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  No reader reviews yet. Be the first to leave a note.
                </p>
              ) : (
                bookReviews.map((r) => (
                  <div
                    key={`${r.userId}-${r.createdAt}`}
                    className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {r.userName}
                      </span>
                      <span className="font-tab text-xs text-amber-700 dark:text-amber-300">
                        {'★'.repeat(r.rating)}
                      </span>
                    </div>
                    {r.text && (
                      <p className="mt-1.5 text-sm text-stone-600 dark:text-stone-300">
                        {r.text}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Volumes */}
      <ShelfRow
        title="Readers Also Enjoyed"
        subtitle="Related works from our catalog"
        books={similar}
        reviews={reviews}
        favorites={user?.data.favorites || []}
        onToggleFavorite={onToggleFavorite}
        onOpenBook={onOpenBook}
      />
    </div>
  );
};
