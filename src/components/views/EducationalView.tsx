import React, { useState } from 'react';
import { BookOpen, Code2, GraduationCap } from 'lucide-react';
import type { Book, LibraryDB } from '../../types/library';
import { BOOKS } from '../../data/books';
import { BookCard } from '../BookCard';

interface EducationalViewProps {
  reviews: LibraryDB['reviews'];
  favorites: string[];
  onToggleFavorite: (bookId: string) => void;
  onOpenBook: (bookId: string) => void;
  onStartReading: (bookId: string) => void;
}

const COURSE_TRACKS = [
  'All Courses',
  'ComProg',
  'Mathematics',
  'Natural Sciences',
  'Humanities & Strategy',
] as const;

export const EducationalView: React.FC<EducationalViewProps> = ({
  reviews,
  favorites,
  onToggleFavorite,
  onOpenBook,
  onStartReading,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<string>('All Courses');

  const educationalBooks: Book[] = BOOKS.filter((b) =>
    b.genres.includes('Educational')
  );

  const visibleBooks =
    selectedTrack === 'All Courses'
      ? educationalBooks
      : educationalBooks.filter((b) => b.courseTrack === selectedTrack);

  const comprogBooks = educationalBooks.filter(
    (b) => b.courseTrack === 'ComProg'
  );

  return (
    <section className="space-y-10">
      {/* Academic Header Banner */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 dark:border-stone-800 dark:bg-stone-900">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-700 dark:text-amber-300">
              <GraduationCap className="h-4 w-4" />
              <span>School &amp; Course Textbooks</span>
            </div>
            <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-100">
              Educational &amp; ComProg Library
            </h1>
            <p className="font-book mt-2.5 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              Illustrated academic modules curated for students across Computer
              Programming (ComProg), Web Systems, Applied Mathematics, Natural
              Sciences, and General Education.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSelectedTrack('ComProg')}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-fg)',
            }}
          >
            <Code2 className="h-4 w-4" />
            Focus: ComProg Track ({comprogBooks.length})
          </button>
        </div>

        {/* Course Track Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {COURSE_TRACKS.map((track) => (
            <button
              key={track}
              type="button"
              onClick={() => setSelectedTrack(track)}
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
                selectedTrack === track
                  ? 'shadow-sm'
                  : 'border border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-400 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-800/70 dark:text-stone-300'
              }`}
              style={
                selectedTrack === track
                  ? {
                      backgroundColor: 'var(--accent)',
                      color: 'var(--accent-fg)',
                    }
                  : undefined
              }
            >
              {track === 'ComProg' ? 'ComProg & Computing' : track}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-stone-900 sm:text-2xl dark:text-stone-100">
            {selectedTrack === 'All Courses'
              ? 'All School Coursebooks'
              : selectedTrack === 'ComProg'
              ? 'ComProg & Computer Studies Modules'
              : `${selectedTrack} Coursebooks`}
          </h2>
          <span className="font-tab text-xs text-stone-500 dark:text-stone-400">
            {visibleBooks.length}{' '}
            {visibleBooks.length === 1 ? 'coursebook' : 'coursebooks'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visibleBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              reviews={reviews}
              isFavorite={favorites.includes(book.id)}
              onToggleFavorite={onToggleFavorite}
              onOpenBook={onOpenBook}
              footerSlot={
                <div className="mt-2 flex items-center justify-between gap-2 px-0.5">
                  <span className="font-tab truncate text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                    {book.courseCode || 'COURSE'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onStartReading(book.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700 hover:underline dark:text-stone-300"
                  >
                    <BookOpen className="h-3 w-3" /> Read
                  </button>
                </div>
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
};
