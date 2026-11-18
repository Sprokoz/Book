import React, { useState } from 'react';
import { BookOpen, Heart } from 'lucide-react';
import type { Book } from '../types/library';

interface BookCoverProps {
  book: Book;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showEdges?: boolean;
  className?: string;
}

export const BookCover: React.FC<BookCoverProps> = ({
  book,
  isFavorite = false,
  onToggleFavorite,
  size = 'md',
  showEdges = true,
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const sizeClasses: Record<NonNullable<BookCoverProps['size']>, string> = {
    sm: 'w-28 rounded-lg',
    md: 'w-full rounded-r-xl rounded-l-[4px]',
    lg: 'w-56 sm:w-64 rounded-r-xl rounded-l-[5px]',
    hero: 'w-52 sm:w-60 lg:w-64 rounded-r-xl rounded-l-[6px]',
  };

  return (
    <div
      className={`group relative aspect-[3/4] select-none overflow-hidden transition-transform duration-300 ${
        showEdges ? 'book-edge-stack' : 'shadow-xl'
      } ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: book.spineColor }}
    >
      {!imgFailed ? (
        <img
          src={book.coverUrl}
          alt={`${book.title} by ${book.author}`}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
      ) : (
        <div
          className="flex h-full w-full flex-col justify-between p-4 text-amber-50"
          style={{
            background: `linear-gradient(155deg, hsl(${book.hue} 48% 28%), hsl(${book.hue} 58% 12%))`,
          }}
        >
          <span className="text-[10px] tracking-[0.2em] uppercase opacity-75">
            {book.genres[0]}
          </span>
          <div className="my-auto flex flex-col items-center text-center">
            <BookOpen className="mb-2 h-8 w-8 opacity-75" />
            <span className="font-display text-base font-bold leading-tight">
              {book.title}
            </span>
          </div>
          <span className="text-[11px] opacity-80">{book.author}</span>
        </div>
      )}

      {/* Hardcover spine crease & bevel shading */}
      <div className="book-binding-overlay pointer-events-none absolute inset-0" />

      {/* Subtle gold inner framing rule */}
      <div className="pointer-events-none absolute inset-2 rounded-[6px] border border-amber-200/25" />

      {/* Bottom title plate scrim for immediate book identification */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-3 pt-10 pb-3 text-amber-50">
        <p className="font-display line-clamp-2 text-sm font-semibold leading-snug tracking-tight drop-shadow-sm">
          {book.title}
        </p>
        <p className="mt-0.5 truncate text-[11px] font-medium text-amber-100/80">
          {book.author}
        </p>
      </div>

      {/* Interactive Favorite button */}
      {onToggleFavorite && (
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? `Remove ${book.title} from favorites` : `Add ${book.title} to favorites`}
          className={`absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 ${
            isFavorite
              ? 'bg-rose-600/90 text-white shadow-md'
              : 'bg-black/45 text-white/80 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-black/70 hover:text-white'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      )}
    </div>
  );
};
