import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bookmark as BookmarkIcon,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Columns2,
  FileText,
  Highlighter,
  List,
  Maximize2,
  Minimize2,
  ScrollText,
  Trash2,
  Type,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type {
  Book,
  Bookmark,
  MarginNote,
  ReaderFont,
  ReaderLayout,
  ReaderTheme,
  Settings,
  UserAccount,
} from '../types/library';
import { playPageTurnSound } from '../utils/audio';

interface OpenBookReaderProps {
  book: Book;
  chapterNumber: number; // 1-indexed
  user: UserAccount | null;
  settings: Settings;
  onUpdateSettings: (patch: Partial<Settings>) => void;
  onNavigateChapter: (chapter: number) => void;
  onExitReader: () => void;
  onFinishBook: () => void;
  onSaveProgress: (chapter: number, page: number, pct: number) => void;
  onAddBookmark: (chapter: number, page: number, pct: number, excerpt: string) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
  onSaveMarginNote: (note: Omit<MarginNote, 'id' | 'createdAt'>) => void;
  onDeleteMarginNote: (noteId: string) => void;
  onToast: (msg: string) => void;
  onRequireAuth: () => void;
}

interface BookPage {
  kind: 'plate' | 'text';
  paragraphs: Array<{ index: number; text: string }>;
  isChapterStart: boolean;
  pageNumber: number;
}

const THEME_PALETTES: Record<
  ReaderTheme,
  {
    label: string;
    deskBg: string;
    pageBg: string;
    pageText: string;
    mutedText: string;
    borderColor: string;
    isDark: boolean;
  }
> = {
  ivory: {
    label: 'Warm Ivory',
    deskBg: 'bg-[#1f1a15]',
    pageBg: 'bg-[#fbf6eb]',
    pageText: 'text-[#231d16]',
    mutedText: 'text-[#7c6d59]',
    borderColor: 'border-[#e4d9c3]',
    isDark: false,
  },
  sepia: {
    label: 'Archival Sepia',
    deskBg: 'bg-[#211912]',
    pageBg: 'bg-[#f0e3c7]',
    pageText: 'text-[#3a2a1a]',
    mutedText: 'text-[#7b6248]',
    borderColor: 'border-[#d8c49e]',
    isDark: false,
  },
  daylight: {
    label: 'Crisp Daylight',
    deskBg: 'bg-[#e7e4dc]',
    pageBg: 'bg-[#ffffff]',
    pageText: 'text-[#1c1917]',
    mutedText: 'text-[#78716c]',
    borderColor: 'border-[#e7e5e4]',
    isDark: false,
  },
  midnight: {
    label: 'Midnight Ink',
    deskBg: 'bg-[#09090b]',
    pageBg: 'bg-[#17171b]',
    pageText: 'text-[#ddd7cc]',
    mutedText: 'text-[#8c877d]',
    borderColor: 'border-[#2c2c34]',
    isDark: true,
  },
};

const FONT_CSS: Record<ReaderFont, string> = {
  serif: 'var(--font-serif-book)',
  display: 'var(--font-display)',
  sans: 'var(--font-sans-ui)',
  mono: 'var(--font-mono-tab)',
};

function splitIntoChunks(
  paragraphs: string[],
  maxChars: number,
  firstPagePenalty: number
): Array<Array<{ index: number; text: string }>> {
  const pages: Array<Array<{ index: number; text: string }>> = [];
  let current: Array<{ index: number; text: string }> = [];
  let currentLen = firstPagePenalty;

  paragraphs.forEach((raw, idx) => {
    const p = raw.trim();
    if (!p) return;

    if (current.length > 0 && currentLen + p.length > maxChars) {
      pages.push(current);
      current = [];
      currentLen = 0;
    }

    // If a single long paragraph exceeds page budget, split gracefully on sentence boundary
    if (p.length > maxChars && current.length === 0) {
      const words = p.split(/\s+/);
      let chunk = '';
      words.forEach((w) => {
        if ((chunk + ' ' + w).length > maxChars - 40 && chunk.length > 0) {
          pages.push([{ index: idx, text: chunk.trim() }]);
          chunk = w;
        } else {
          chunk = chunk ? `${chunk} ${w}` : w;
        }
      });
      if (chunk.trim()) {
        current.push({ index: idx, text: chunk.trim() });
        currentLen = chunk.length;
      }
      return;
    }

    current.push({ index: idx, text: p });
    currentLen += p.length + 60;
  });

  if (current.length > 0) {
    pages.push(current);
  }
  return pages;
}

export const OpenBookReader: React.FC<OpenBookReaderProps> = ({
  book,
  chapterNumber,
  user,
  settings,
  onUpdateSettings,
  onNavigateChapter,
  onExitReader,
  onFinishBook,
  onSaveProgress,
  onAddBookmark,
  onDeleteBookmark,
  onSaveMarginNote,
  onDeleteMarginNote,
  onToast,
  onRequireAuth,
}) => {
  const chapter = book.chapters[chapterNumber - 1] || book.chapters[0];
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 960 : false
  );
  const [drawer, setDrawer] = useState<'none' | 'toc' | 'settings'>('none');
  const [turnDir, setTurnDir] = useState<'none' | 'next' | 'prev'>('none');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Selected paragraph for margin note / highlight popover
  const [activePara, setActivePara] = useState<{
    index: number;
    text: string;
  } | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [noteColor, setNoteColor] = useState<'amber' | 'sage' | 'rose'>('amber');

  const touchStartX = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 960);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const effectiveLayout: ReaderLayout =
    settings.readerLayout === 'spread' && isMobile
      ? 'single'
      : settings.readerLayout;

  // Build paginated book leaves
  const pages = useMemo<BookPage[]>(() => {
    const paragraphs = chapter.text
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    const fontScale = 18 / settings.fontSize;
    const lineScale = 1.75 / settings.lineHeight;
    const baseChars = Math.max(
      340,
      Math.min(920, Math.round(680 * fontScale * lineScale))
    );
    const firstPenalty = Math.round(baseChars * 0.28);

    const textChunks = splitIntoChunks(paragraphs, baseChars, firstPenalty);

    const built: BookPage[] = [];
    if (effectiveLayout === 'spread') {
      // Dedicated Frontispiece Picture Plate on the opening left page!
      built.push({
        kind: 'plate',
        paragraphs: [],
        isChapterStart: false,
        pageNumber: (chapterNumber - 1) * 10 + 1,
      });
      textChunks.forEach((chunk, i) => {
        built.push({
          kind: 'text',
          paragraphs: chunk,
          isChapterStart: i === 0,
          pageNumber: (chapterNumber - 1) * 10 + i + 2,
        });
      });
    } else {
      textChunks.forEach((chunk, i) => {
        built.push({
          kind: 'text',
          paragraphs: chunk,
          isChapterStart: i === 0,
          pageNumber: (chapterNumber - 1) * 10 + i + 1,
        });
      });
    }

    return built;
  }, [chapter.text, chapterNumber, effectiveLayout, settings.fontSize, settings.lineHeight]);

  // Step size: 2 leaves per spread in spread mode, 1 leaf in single mode
  const stepSize = effectiveLayout === 'spread' ? 2 : 1;
  const maxPageIndex = Math.max(
    0,
    effectiveLayout === 'spread'
      ? pages.length % 2 === 0
        ? pages.length - 2
        : pages.length - 1
      : pages.length - 1
  );

  const savedProg = user?.data.progress[book.id];
  const initialPage =
    savedProg && savedProg.chapter === chapterNumber
      ? Math.min(maxPageIndex, Math.max(0, savedProg.page || 0))
      : 0;

  const [pageIdx, setPageIdx] = useState<number>(initialPage);

  // Sync page index when switching chapters
  useEffect(() => {
    const p = user?.data.progress[book.id];
    if (p && p.chapter === chapterNumber) {
      const target = Math.min(maxPageIndex, Math.max(0, p.page || 0));
      setPageIdx(
        effectiveLayout === 'spread' ? target - (target % 2) : target
      );
    } else {
      setPageIdx(0);
    }
    setActivePara(null);
  }, [book.id, chapterNumber, effectiveLayout, maxPageIndex]);

  // Persist reading progress when page changes
  useEffect(() => {
    if (effectiveLayout === 'scroll') return;
    const pct = pages.length > 1 ? Math.min(1, (pageIdx + stepSize) / pages.length) : 1;
    onSaveProgress(chapterNumber, pageIdx, pct);
  }, [pageIdx, chapterNumber, pages.length, stepSize, effectiveLayout]);

  const goNextPage = () => {
    if (effectiveLayout === 'scroll') {
      if (chapterNumber < book.chapters.length) {
        onNavigateChapter(chapterNumber + 1);
      } else {
        onFinishBook();
      }
      return;
    }

    if (pageIdx + stepSize < pages.length) {
      if (settings.soundEffects) playPageTurnSound();
      setTurnDir('next');
      setPageIdx((prev) => Math.min(maxPageIndex, prev + stepSize));
      setTimeout(() => setTurnDir('none'), 290);
    } else if (chapterNumber < book.chapters.length) {
      if (settings.soundEffects) playPageTurnSound();
      onNavigateChapter(chapterNumber + 1);
    } else {
      onFinishBook();
    }
  };

  const goPrevPage = () => {
    if (effectiveLayout === 'scroll') {
      if (chapterNumber > 1) onNavigateChapter(chapterNumber - 1);
      return;
    }

    if (pageIdx > 0) {
      if (settings.soundEffects) playPageTurnSound();
      setTurnDir('prev');
      setPageIdx((prev) => Math.max(0, prev - stepSize));
      setTimeout(() => setTurnDir('none'), 290);
    } else if (chapterNumber > 1) {
      if (settings.soundEffects) playPageTurnSound();
      onNavigateChapter(chapterNumber - 1);
    }
  };

  const toggleBookmarkCurrent = () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    const existing = user.data.bookmarks.find(
      (b) =>
        b.bookId === book.id &&
        b.chapter === chapterNumber &&
        Math.abs(b.page - pageIdx) <= (effectiveLayout === 'spread' ? 1 : 0)
    );
    if (existing) {
      onDeleteBookmark(existing.id);
      onToast('Bookmark ribbon lifted');
      return;
    }
    const currentTextPage =
      pages[pageIdx]?.kind === 'text' ? pages[pageIdx] : pages[pageIdx + 1];
    const excerpt =
      currentTextPage?.paragraphs[0]?.text.slice(0, 72) || chapter.title;
    const pct = pages.length > 0 ? pageIdx / Math.max(1, pages.length - 1) : 0;
    onAddBookmark(chapterNumber, pageIdx, pct, excerpt);
    onToast('Silk bookmark placed');
  };

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNextPage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrevPage();
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleBookmarkCurrent();
      } else if (e.key === 'Escape') {
        setDrawer('none');
        setActivePara(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const palette = THEME_PALETTES[settings.readerTheme];
  const bookBookmarks: Bookmark[] = user
    ? user.data.bookmarks.filter((b) => b.bookId === book.id)
    : [];
  const chapterNotes: MarginNote[] = user
    ? user.data.notes.filter(
        (n) => n.bookId === book.id && n.chapter === chapterNumber
      )
    : [];

  const isCurrentBookmarked = bookBookmarks.some(
    (b) =>
      b.chapter === chapterNumber &&
      Math.abs(b.page - pageIdx) <= (effectiveLayout === 'spread' ? 1 : 0)
  );

  const chapterProgress =
    effectiveLayout === 'scroll'
      ? chapterNumber / book.chapters.length
      : (chapterNumber - 1 + (pageIdx + stepSize) / Math.max(1, pages.length)) /
        book.chapters.length;
  const totalPct = Math.min(100, Math.max(2, Math.round(chapterProgress * 100)));

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {
        onToast('Fullscreen unavailable in this browser');
      });
    }
  };

  const renderParagraph = (para: { index: number; text: string }, isDropCap: boolean) => {
    const existingNote = chapterNotes.find(
      (n) => n.paragraphIndex === para.index
    );

    const highlightClass = existingNote
      ? existingNote.color === 'amber'
        ? palette.isDark
          ? 'bg-amber-500/15 decoration-amber-400/60'
          : 'bg-amber-200/55 decoration-amber-600/50'
        : existingNote.color === 'sage'
        ? palette.isDark
          ? 'bg-emerald-500/15 decoration-emerald-400/60'
          : 'bg-emerald-200/55 decoration-emerald-600/50'
        : palette.isDark
        ? 'bg-rose-500/15 decoration-rose-400/60'
        : 'bg-rose-200/55 decoration-rose-600/50'
      : '';

    return (
      <p
        key={para.index}
        onClick={() => {
          setActivePara(para);
          setNoteInput(existingNote?.note || '');
          setNoteColor(existingNote?.color || 'amber');
        }}
        title="Click to highlight or add a margin note"
        className={`group relative cursor-pointer rounded px-1 -mx-1 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03] ${highlightClass} ${
          isDropCap
            ? 'first-letter:font-display first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:text-[3.1rem] first-letter:font-bold first-letter:leading-[0.82]'
            : 'indent-6'
        }`}
        style={{
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
          fontFamily: FONT_CSS[settings.fontFamily],
        }}
      >
        {para.text}
        {existingNote && (
          <span
            className="ml-1.5 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-wider align-middle"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-fg)',
            }}
          >
            Note
          </span>
        )}
      </p>
    );
  };

  const renderPlateLeaf = (page: BookPage) => (
    <div className="flex h-full flex-col items-center justify-between py-2 text-center">
      <div className={`w-full text-[11px] tracking-[0.22em] uppercase ${palette.mutedText}`}>
        {book.title}
      </div>

      <figure className="my-auto flex max-w-[280px] flex-col items-center">
        <div
          className={`overflow-hidden rounded-sm border p-2 shadow-lg ${palette.borderColor} ${
            palette.isDark ? 'bg-stone-900' : 'bg-white'
          }`}
        >
          <img
            src={book.coverUrl}
            alt={book.plateCaption}
            referrerPolicy="no-referrer"
            className="aspect-[3/4] w-48 sm:w-56 object-cover"
          />
        </div>
        <figcaption className={`font-book mt-3 text-xs italic ${palette.mutedText}`}>
          {book.plateCaption}
        </figcaption>
        <p className={`mt-1 text-[10px] tracking-[0.18em] uppercase ${palette.mutedText} opacity-75`}>
          {book.editionLabel}
        </p>
      </figure>

      <div className={`font-tab text-xs ${palette.mutedText}`}>
        — {page.pageNumber} —
      </div>
    </div>
  );

  const renderTextLeaf = (page: BookPage, side: 'left' | 'right' | 'single') => (
    <div className="flex h-full flex-col justify-between">
      {/* Running header */}
      <div
        className={`mb-4 flex items-center justify-between text-[11px] tracking-[0.18em] uppercase ${palette.mutedText}`}
      >
        <span className="truncate">
          {side === 'left' ? book.title : chapter.title}
        </span>
        {side === 'single' && (
          <span className="ml-2 shrink-0 truncate opacity-75">{book.author}</span>
        )}
      </div>

      {/* Main page prose */}
      <div className="flex-1 overflow-y-auto pr-1">
        {page.isChapterStart && (
          <div className="mb-5 text-center">
            {effectiveLayout !== 'spread' && (
              <div className="mx-auto mb-4 flex w-28 flex-col items-center">
                <img
                  src={book.coverUrl}
                  alt={book.plateCaption}
                  referrerPolicy="no-referrer"
                  className="aspect-[3/4] w-full rounded border border-stone-300/60 object-cover shadow-md"
                />
              </div>
            )}
            <p className={`text-[11px] tracking-[0.24em] uppercase ${palette.mutedText}`}>
              {book.author}
            </p>
            <h1 className="font-display mt-1 text-2xl font-bold tracking-tight sm:text-[1.7rem]">
              {chapter.title}
            </h1>
            {chapter.subtitle && (
              <p className={`font-book mt-1 text-sm italic ${palette.mutedText}`}>
                {chapter.subtitle}
              </p>
            )}
            <div className={`mx-auto mt-3 flex items-center justify-center gap-2 ${palette.mutedText}`}>
              <span className="h-px w-10 bg-current opacity-30" />
              <span className="text-xs">❦</span>
              <span className="h-px w-10 bg-current opacity-30" />
            </div>
          </div>
        )}

        <div className="space-y-3.5 text-justify hyphens-auto">
          {page.paragraphs.map((p, idx) =>
            renderParagraph(p, page.isChapterStart && idx === 0 && p.index === 0)
          )}
        </div>
      </div>

      {/* Page footer folio */}
      <div className={`font-tab mt-4 flex items-center justify-center text-xs ${palette.mutedText}`}>
        <span>— {page.pageNumber} —</span>
      </div>
    </div>
  );

  const leftLeaf = pages[pageIdx];
  const rightLeaf = effectiveLayout === 'spread' ? pages[pageIdx + 1] : undefined;

  const canGoPrev = pageIdx > 0 || chapterNumber > 1;
  const isFinalSpread =
    effectiveLayout === 'scroll'
      ? chapterNumber >= book.chapters.length
      : pageIdx + stepSize >= pages.length && chapterNumber >= book.chapters.length;

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col ${palette.deskBg} transition-colors duration-300`}
    >
      {/* Top Progress Hairline */}
      <div className="h-1 w-full bg-black/20">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${totalPct}%`, backgroundColor: 'var(--accent)' }}
        />
      </div>

      {/* Compact Top Reader Toolbar */}
      <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/25 px-3 py-2 text-stone-200 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onExitReader}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-stone-200 transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Library</span>
          </button>
          <div className="h-4 w-px bg-white/15" />
          <div className="min-w-0">
            <p className="font-display truncate text-sm font-semibold text-amber-100">
              {book.title}
            </p>
            <p className="font-tab truncate text-[11px] text-stone-400">
              {chapter.title} · {totalPct}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Chapter Selector */}
          <select
            aria-label="Select chapter"
            value={chapterNumber}
            onChange={(e) => onNavigateChapter(Number(e.target.value))}
            className="hidden md:block max-w-[190px] rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none"
          >
            {book.chapters.map((ch, idx) => (
              <option key={ch.title} value={idx + 1} className="bg-stone-900 text-stone-100">
                {ch.title}
              </option>
            ))}
          </select>

          {/* Layout Mode Quick Switch */}
          <div className="hidden sm:flex items-center rounded-lg border border-white/15 bg-black/30 p-0.5">
            {(
              [
                ['spread', Columns2, 'Two-Page Book'],
                ['single', FileText, 'Single Page'],
                ['scroll', ScrollText, 'Scroll View'],
              ] as const
            ).map(([modeKey, Icon, label]) => (
              <button
                key={modeKey}
                type="button"
                title={label}
                onClick={() => onUpdateSettings({ readerLayout: modeKey })}
                className={`rounded-md p-1.5 transition-colors ${
                  settings.readerLayout === modeKey
                    ? 'bg-amber-500/25 text-amber-200'
                    : 'text-stone-400 hover:text-stone-100'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              onUpdateSettings({ soundEffects: !settings.soundEffects })
            }
            title={settings.soundEffects ? 'Mute page sound' : 'Enable page sound'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-stone-300 hover:bg-white/10"
          >
            {settings.soundEffects ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4 text-stone-500" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleBookmarkCurrent}
            title="Place or lift bookmark ribbon (B)"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              isCurrentBookmarked
                ? 'bg-rose-600/30 text-rose-300'
                : 'text-stone-300 hover:bg-white/10'
            }`}
          >
            <BookmarkIcon
              className={`h-4 w-4 ${isCurrentBookmarked ? 'fill-current' : ''}`}
            />
          </button>

          <button
            type="button"
            onClick={() => setDrawer(drawer === 'toc' ? 'none' : 'toc')}
            title="Contents, Bookmarks & Margin Notes"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              drawer === 'toc' ? 'bg-white/15 text-amber-200' : 'text-stone-300 hover:bg-white/10'
            }`}
          >
            <List className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setDrawer(drawer === 'settings' ? 'none' : 'settings')}
            title="Typography & Paper Settings"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              drawer === 'settings' ? 'bg-white/15 text-amber-200' : 'text-stone-300 hover:bg-white/10'
            }`}
          >
            <Type className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title="Toggle fullscreen"
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg text-stone-300 hover:bg-white/10"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      {/* Main Reading Stage */}
      <main
        ref={scrollContainerRef}
        className="relative flex flex-1 items-center justify-center overflow-y-auto px-3 py-5 sm:px-6 sm:py-7"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null || effectiveLayout === 'scroll') return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (dx < -48) goNextPage();
          else if (dx > 48) goPrevPage();
        }}
      >
        {effectiveLayout === 'scroll' ? (
          /* Continuous Scroll Folio Paper */
          <article
            className={`paper-grain mx-auto w-full rounded-xl border p-7 shadow-2xl sm:p-12 ${palette.pageBg} ${palette.pageText} ${palette.borderColor}`}
            style={{ maxWidth: `${settings.pageWidth}px` }}
          >
            <div className="mb-8 flex flex-col items-center text-center">
              <img
                src={book.coverUrl}
                alt={book.plateCaption}
                referrerPolicy="no-referrer"
                className="mb-4 aspect-[3/4] w-36 rounded border border-stone-300/60 object-cover shadow-lg"
              />
              <p className={`text-xs tracking-[0.22em] uppercase ${palette.mutedText}`}>
                {book.author} · {book.plateCaption}
              </p>
              <h1 className="font-display mt-2 text-3xl font-bold">{chapter.title}</h1>
              {chapter.subtitle && (
                <p className={`font-book mt-1 text-base italic ${palette.mutedText}`}>
                  {chapter.subtitle}
                </p>
              )}
            </div>
            <div className="space-y-5 text-justify">
              {chapter.text
                .split(/\n+/)
                .filter(Boolean)
                .map((p, idx) => renderParagraph({ index: idx, text: p }, idx === 0))}
            </div>
            <div className="mt-12 flex items-center justify-between border-t border-current/15 pt-6">
              <button
                type="button"
                disabled={chapterNumber <= 1}
                onClick={() => onNavigateChapter(chapterNumber - 1)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-current/25 px-4 py-2 text-sm font-medium disabled:opacity-35"
              >
                <ChevronLeft className="h-4 w-4" /> Previous Chapter
              </button>
              <span className="font-tab text-xs opacity-70">
                Chapter {chapterNumber} of {book.chapters.length}
              </span>
              <button
                type="button"
                onClick={goNextPage}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
              >
                {chapterNumber < book.chapters.length ? 'Next Chapter' : 'Finish Book'}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        ) : (
          /* Physical Open Book Spread / Single Hardcover Leaf */
          <div className="flex w-full max-w-[1160px] flex-col items-center">
            <div className="relative flex w-full items-center justify-center gap-2 sm:gap-4">
              {/* Left Page Turn Control */}
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={goPrevPage}
                aria-label="Previous page"
                className="hidden md:flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/35 text-stone-200 backdrop-blur transition-all hover:scale-105 hover:bg-black/60 disabled:opacity-20 disabled:hover:scale-100"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Outer Hardcover Leather Board Frame */}
              <div
                className={`relative w-full rounded-xl p-1.5 sm:p-2.5 shadow-[0_32px_70px_-15px_rgba(0,0,0,0.8)] ${
                  turnDir === 'next'
                    ? 'animate-turn-next'
                    : turnDir === 'prev'
                    ? 'animate-turn-prev'
                    : ''
                }`}
                style={{
                  backgroundColor: book.spineColor,
                  maxWidth: effectiveLayout === 'spread' ? '1020px' : '540px',
                }}
              >
                {/* Stacked outer page edges */}
                <div
                  className={`relative grid overflow-hidden rounded-lg border ${palette.borderColor} ${
                    effectiveLayout === 'spread' ? 'grid-cols-2' : 'grid-cols-1'
                  }`}
                  style={{
                    boxShadow:
                      effectiveLayout === 'spread'
                        ? '-4px 0 0 #d5cbb8, 4px 0 0 #d5cbb8, 0 4px 14px rgba(0,0,0,0.35)'
                        : '4px 0 0 #d5cbb8, 0 4px 14px rgba(0,0,0,0.35)',
                  }}
                >
                  {/* Hanging Silk Bookmark Ribbon */}
                  {isCurrentBookmarked && (
                    <div
                      className="pointer-events-none absolute top-0 left-1/2 z-20 -translate-x-1/2"
                      aria-hidden="true"
                    >
                      <div
                        className="h-24 w-4 shadow-md"
                        style={{
                          background:
                            'linear-gradient(90deg, #7f1d1d 0%, #b91c1c 48%, #7f1d1d 100%)',
                          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)',
                        }}
                      />
                    </div>
                  )}

                  {/* LEFT PAGE (or Single Page) */}
                  <div
                    className={`paper-grain relative min-h-[500px] h-[64vh] max-h-[640px] px-6 py-6 sm:px-10 sm:py-8 ${palette.pageBg} ${palette.pageText}`}
                  >
                    {leftLeaf &&
                      (leftLeaf.kind === 'plate'
                        ? renderPlateLeaf(leftLeaf)
                        : renderTextLeaf(
                            leftLeaf,
                            effectiveLayout === 'spread' ? 'left' : 'single'
                          ))}

                    {/* Spine gutter crease shading */}
                    {effectiveLayout === 'spread' && (
                      <div
                        className={`pointer-events-none absolute inset-y-0 right-0 w-16 ${
                          palette.isDark
                            ? 'spine-gutter-dark-left'
                            : 'spine-gutter-left'
                        }`}
                      />
                    )}

                    {/* Left corner page-turn hotspot */}
                    {canGoPrev && (
                      <button
                        type="button"
                        onClick={goPrevPage}
                        aria-label="Turn to previous page"
                        className="group absolute bottom-0 left-0 h-16 w-16 cursor-pointer"
                      >
                        <span
                          className={`absolute bottom-2 left-2 rounded px-1.5 py-0.5 text-[10px] font-medium opacity-0 transition-opacity group-hover:opacity-80 ${palette.mutedText}`}
                        >
                          ← Prev
                        </span>
                      </button>
                    )}
                  </div>

                  {/* RIGHT PAGE (Spread Mode only) */}
                  {effectiveLayout === 'spread' && (
                    <div
                      className={`paper-grain relative min-h-[500px] h-[64vh] max-h-[640px] border-l px-6 py-6 sm:px-10 sm:py-8 ${palette.pageBg} ${palette.pageText} ${palette.borderColor}`}
                    >
                      {rightLeaf ? (
                        renderTextLeaf(rightLeaf, 'right')
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                          <BookOpen className={`mb-3 h-8 w-8 opacity-35 ${palette.mutedText}`} />
                          <p className={`font-book text-sm italic ${palette.mutedText}`}>
                            End of {chapter.title}
                          </p>
                          <button
                            type="button"
                            onClick={goNextPage}
                            className="mt-4 rounded-lg px-4 py-2 text-xs font-semibold"
                            style={{
                              backgroundColor: 'var(--accent)',
                              color: 'var(--accent-fg)',
                            }}
                          >
                            {chapterNumber < book.chapters.length
                              ? 'Continue to Next Chapter →'
                              : 'Complete This Volume ✓'}
                          </button>
                        </div>
                      )}

                      {/* Central spine gutter shadow */}
                      <div
                        className={`pointer-events-none absolute inset-y-0 left-0 w-16 ${
                          palette.isDark
                            ? 'spine-gutter-dark-right'
                            : 'spine-gutter-right'
                        }`}
                      />

                      {/* Right corner page-turn hotspot */}
                      <button
                        type="button"
                        onClick={goNextPage}
                        aria-label="Turn to next page"
                        className="group absolute right-0 bottom-0 h-16 w-16 cursor-pointer"
                      >
                        <span
                          className={`absolute right-2 bottom-2 rounded px-1.5 py-0.5 text-[10px] font-medium opacity-0 transition-opacity group-hover:opacity-80 ${palette.mutedText}`}
                        >
                          Next →
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Page Turn Control */}
              <button
                type="button"
                onClick={goNextPage}
                aria-label={isFinalSpread ? 'Finish book' : 'Next page'}
                className="hidden md:flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/35 text-stone-200 backdrop-blur transition-all hover:scale-105 hover:bg-black/60"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Bottom Page Controls & Mobile Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-stone-300">
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={goPrevPage}
                className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 hover:bg-black/50 disabled:opacity-30 md:hidden"
              >
                <ChevronLeft className="h-4 w-4" /> Prev Page
              </button>

              <span className="font-tab text-stone-400">
                {effectiveLayout === 'spread'
                  ? `Spread ${Math.floor(pageIdx / 2) + 1} of ${Math.ceil(pages.length / 2)}`
                  : `Page ${pageIdx + 1} of ${pages.length}`}
                {' · '}
                Tap any paragraph to highlight or jot a margin note
              </span>

              <button
                type="button"
                onClick={goNextPage}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 font-semibold md:hidden"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
              >
                {isFinalSpread ? 'Finish ✓' : 'Next Page'}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Paragraph Margin Note / Highlight Popover */}
      {activePara && (
        <div className="fixed inset-x-4 bottom-5 z-50 mx-auto max-w-lg rounded-2xl border border-stone-200 bg-white p-4 text-stone-900 shadow-2xl dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300">
              <Highlighter className="h-3.5 w-3.5 text-amber-600" />
              Highlight & Margin Note
            </span>
            <button
              type="button"
              onClick={() => setActivePara(null)}
              className="rounded p-1 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="font-book mb-3 line-clamp-2 text-xs italic text-stone-500 dark:text-stone-400">
            “{activePara.text}”
          </p>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-stone-500">Ink:</span>
            {(['amber', 'sage', 'rose'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNoteColor(c)}
                className={`h-6 w-6 rounded-full border-2 transition-transform ${
                  noteColor === c ? 'scale-110 border-stone-900 dark:border-white' : 'border-transparent'
                } ${
                  c === 'amber'
                    ? 'bg-amber-400'
                    : c === 'sage'
                    ? 'bg-emerald-400'
                    : 'bg-rose-400'
                }`}
                aria-label={`Select ${c} highlight`}
              />
            ))}
          </div>
          <textarea
            rows={2}
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="Write a personal margin note (optional)..."
            className="w-full rounded-lg border border-stone-300 bg-stone-50 p-2.5 text-xs focus:border-amber-600 focus:outline-none dark:border-stone-700 dark:bg-stone-950"
          />
          <div className="mt-2.5 flex justify-end gap-2">
            {chapterNotes.find((n) => n.paragraphIndex === activePara.index) && (
              <button
                type="button"
                onClick={() => {
                  const existing = chapterNotes.find(
                    (n) => n.paragraphIndex === activePara.index
                  );
                  if (existing) onDeleteMarginNote(existing.id);
                  setActivePara(null);
                  onToast('Highlight removed');
                }}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
              >
                Remove
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  onRequireAuth();
                  return;
                }
                onSaveMarginNote({
                  bookId: book.id,
                  chapter: chapterNumber,
                  paragraphIndex: activePara.index,
                  excerpt: activePara.text.slice(0, 120),
                  note: noteInput.trim(),
                  color: noteColor,
                });
                setActivePara(null);
                onToast('Saved to your margin notes');
              }}
              className="rounded-lg px-3.5 py-1.5 text-xs font-semibold"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              Save Highlight
            </button>
          </div>
        </div>
      )}

      {/* Slide-Over Drawer: Contents / Bookmarks / Notes OR Typography Settings */}
      {drawer !== 'none' && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-[2px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawer('none');
          }}
        >
          <aside className="h-full w-full max-w-sm overflow-y-auto border-l border-stone-200 bg-white p-6 text-stone-900 shadow-2xl dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">
                {drawer === 'toc' ? 'Volume Contents' : 'Reading Desk'}
              </h3>
              <button
                type="button"
                onClick={() => setDrawer('none')}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {drawer === 'toc' ? (
              <div className="space-y-6">
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wider uppercase text-stone-500">
                    Chapters
                  </p>
                  <div className="space-y-1.5">
                    {book.chapters.map((ch, idx) => (
                      <button
                        key={ch.title}
                        type="button"
                        onClick={() => {
                          onNavigateChapter(idx + 1);
                          setDrawer('none');
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          chapterNumber === idx + 1
                            ? 'bg-amber-500/15 font-semibold text-amber-800 dark:text-amber-200'
                            : 'hover:bg-stone-100 dark:hover:bg-stone-900'
                        }`}
                      >
                        <span className="truncate">{ch.title}</span>
                        <span className="font-tab ml-2 text-xs text-stone-400">
                          {idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wider uppercase text-stone-500">
                    Bookmarks ({bookBookmarks.length})
                  </p>
                  {bookBookmarks.length === 0 ? (
                    <p className="text-xs text-stone-500">
                      Press the ribbon button or <kbd className="rounded border px-1">B</kbd> while reading to drop a silk bookmark.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {bookBookmarks.map((bm) => (
                        <div
                          key={bm.id}
                          className="flex items-start justify-between gap-2 rounded-lg border border-stone-200 p-2.5 text-xs dark:border-stone-800"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onNavigateChapter(bm.chapter);
                              setPageIdx(
                                effectiveLayout === 'spread'
                                  ? bm.page - (bm.page % 2)
                                  : bm.page
                              );
                              setDrawer('none');
                            }}
                            className="min-w-0 flex-1 text-left"
                          >
                            <p className="font-semibold text-amber-700 dark:text-amber-300">
                              {book.chapters[bm.chapter - 1]?.title}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-stone-500">
                              “{bm.excerpt}…”
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteBookmark(bm.id)}
                            className="p-1 text-stone-400 hover:text-rose-500"
                            aria-label="Remove bookmark"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wider uppercase text-stone-500">
                    Margin Notes ({user?.data.notes.filter((n) => n.bookId === book.id).length || 0})
                  </p>
                  {!user ||
                  user.data.notes.filter((n) => n.bookId === book.id).length ===
                    0 ? (
                    <p className="text-xs text-stone-500">
                      Click any paragraph on a page to highlight passages or jot notes.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {user.data.notes
                        .filter((n) => n.bookId === book.id)
                        .map((n) => (
                          <div
                            key={n.id}
                            className="rounded-lg border border-stone-200 p-2.5 text-xs dark:border-stone-800"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-stone-700 dark:text-stone-300">
                                {book.chapters[n.chapter - 1]?.title}
                              </span>
                              <button
                                type="button"
                                onClick={() => onDeleteMarginNote(n.id)}
                                className="text-stone-400 hover:text-rose-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="font-book mt-1 italic text-stone-500">
                              “{n.excerpt}…”
                            </p>
                            {n.note && (
                              <p className="mt-1.5 font-medium text-stone-800 dark:text-stone-200">
                                {n.note}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-5 text-sm">
                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wider uppercase text-stone-500">
                    Paper & Lighting
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(THEME_PALETTES) as ReaderTheme[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => onUpdateSettings({ readerTheme: key })}
                        className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
                          settings.readerTheme === key
                            ? 'border-amber-600 bg-amber-500/10 text-amber-800 dark:border-amber-400 dark:text-amber-200'
                            : 'border-stone-200 hover:bg-stone-100 dark:border-stone-800 dark:hover:bg-stone-900'
                        }`}
                      >
                        {THEME_PALETTES[key].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wider uppercase text-stone-500">
                    Reading Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        ['spread', 'Open Book'],
                        ['single', 'Single Leaf'],
                        ['scroll', 'Scroll'],
                      ] as const
                    ).map(([k, label]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => onUpdateSettings({ readerLayout: k })}
                        className={`rounded-lg border py-2 text-xs font-medium ${
                          settings.readerLayout === k
                            ? 'border-amber-600 bg-amber-500/10 text-amber-800 dark:border-amber-400 dark:text-amber-200'
                            : 'border-stone-200 dark:border-stone-800'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-semibold uppercase tracking-wider text-stone-500">
                      Font Size
                    </span>
                    <span className="font-tab">{settings.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={24}
                    step={1}
                    value={settings.fontSize}
                    onChange={(e) =>
                      onUpdateSettings({ fontSize: Number(e.target.value) })
                    }
                    className="w-full accent-amber-600"
                  />
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-semibold uppercase tracking-wider text-stone-500">
                      Line Spacing
                    </span>
                    <span className="font-tab">{settings.lineHeight.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={1.4}
                    max={2.2}
                    step={0.1}
                    value={settings.lineHeight}
                    onChange={(e) =>
                      onUpdateSettings({ lineHeight: Number(e.target.value) })
                    }
                    className="w-full accent-amber-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wider uppercase text-stone-500">
                    Typeface
                  </label>
                  <select
                    value={settings.fontFamily}
                    onChange={(e) =>
                      onUpdateSettings({ fontFamily: e.target.value as ReaderFont })
                    }
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
                  >
                    <option value="serif">Lora Book Serif</option>
                    <option value="display">Fraunces Literary</option>
                    <option value="sans">Plus Jakarta Sans</option>
                    <option value="mono">JetBrains Mono</option>
                  </select>
                </div>

                {settings.readerLayout === 'scroll' && (
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-semibold uppercase tracking-wider text-stone-500">
                        Column Width
                      </span>
                      <span className="font-tab">{settings.pageWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min={520}
                      max={880}
                      step={20}
                      value={settings.pageWidth}
                      onChange={(e) =>
                        onUpdateSettings({ pageWidth: Number(e.target.value) })
                      }
                      className="w-full accent-amber-600"
                    />
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};
