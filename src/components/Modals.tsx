import React, { useEffect, useState } from 'react';
import { Check, Copy, Sparkles, X } from 'lucide-react';
import type { Book, UserAccount } from '../types/library';

interface ModalShellProps {
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`relative max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 text-stone-900 shadow-2xl dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
        >
          <X className="h-4 w-4" />
        </button>
        {title && (
          <h3 className="font-display mb-3 pr-8 text-xl font-bold">{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
};

interface AuthModalProps {
  initialTab?: 'in' | 'up';
  onClose: () => void;
  onLogin: (identifier: string, password: string, remember: boolean) => Promise<string | null>;
  onSignup: (payload: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<string | null>;
  onResetPassword: (email: string, username: string, newPassword: string) => Promise<string | null>;
  onQuickDemo: () => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialTab = 'in',
  onClose,
  onLogin,
  onSignup,
  onResetPassword,
  onQuickDemo,
}) => {
  const [mode, setMode] = useState<'in' | 'up' | 'reset'>(initialTab);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Login fields
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [remember, setRemember] = useState(true);

  // Signup fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');

  // Reset fields
  const [resetEmail, setResetEmail] = useState('');
  const [resetUser, setResetUser] = useState('');
  const [resetPw, setResetPw] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'in') {
        const err = await onLogin(loginId, loginPw, remember);
        if (err) setError(err);
      } else if (mode === 'up') {
        if (pw !== pw2) {
          setError('Passwords do not match.');
          setBusy(false);
          return;
        }
        const err = await onSignup({ name, username, email, password: pw });
        if (err) setError(err);
      } else {
        const err = await onResetPassword(resetEmail, resetUser, resetPw);
        if (err) setError(err);
        else {
          setMode('in');
          setError('');
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="mb-4">
        <span className="font-display text-2xl font-bold text-amber-700 dark:text-amber-300">
          Folio
        </span>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          Accounts are stored locally in this browser with salted PBKDF2 hashing.
        </p>
      </div>

      {mode !== 'reset' && (
        <div className="mb-4 flex gap-1 rounded-xl bg-stone-100 p-1 dark:bg-stone-800">
          <button
            type="button"
            onClick={() => {
              setMode('in');
              setError('');
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === 'in'
                ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-900 dark:text-amber-200'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('up');
              setError('');
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === 'up'
                ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-900 dark:text-amber-200'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            Create account
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'in' && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
                Email or username
              </label>
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                autoComplete="username"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-amber-600 focus:outline-none dark:border-stone-700 dark:bg-stone-950"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
                Password
              </label>
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-amber-600 focus:outline-none dark:border-stone-700 dark:bg-stone-950"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showPw}
                  onChange={(e) => setShowPw(e.target.checked)}
                />
                Show password
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
            </div>
          </>
        )}

        {mode === 'up' && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
                Full name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-amber-600 focus:outline-none dark:border-stone-700 dark:bg-stone-950"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
                Username (3–20 letters, numbers, or _)
              </label>
              <input
                type="text"
                required
                pattern="[A-Za-z0-9_]{3,20}"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-amber-600 focus:outline-none dark:border-stone-700 dark:bg-stone-950"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-amber-600 focus:outline-none dark:border-stone-700 dark:bg-stone-950"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
                Password (8+ chars, letter & number)
              </label>
              <input
                type="password"
                required
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-amber-600 focus:outline-none dark:border-stone-700 dark:bg-stone-950"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
                Confirm password
              </label>
              <input
                type="password"
                required
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-amber-600 focus:outline-none dark:border-stone-700 dark:bg-stone-950"
              />
            </div>
          </>
        )}

        {mode === 'reset' && (
          <>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Verify both your registered email and username to set a new local password.
            </p>
            <input
              type="email"
              required
              placeholder="Account email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
            <input
              type="text"
              required
              placeholder="Account username"
              value={resetUser}
              onChange={(e) => setResetUser(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
            <input
              type="password"
              required
              placeholder="New password (8+ chars, letter & number)"
              value={resetPw}
              onChange={(e) => setResetPw(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
          </>
        )}

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-fg)',
          }}
        >
          {busy
            ? 'Please wait...'
            : mode === 'in'
            ? 'Log in'
            : mode === 'up'
            ? 'Create account'
            : 'Update password'}
        </button>

        {mode === 'in' && (
          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('reset');
                setError('');
              }}
              className="text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
            >
              Forgot password?
            </button>
            <button
              type="button"
              onClick={onQuickDemo}
              className="inline-flex items-center gap-1 font-medium text-amber-700 hover:underline dark:text-amber-300"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Try Demo Reader
            </button>
          </div>
        )}

        {mode === 'reset' && (
          <button
            type="button"
            onClick={() => {
              setMode('in');
              setError('');
            }}
            className="w-full text-center text-xs text-stone-500 hover:underline"
          >
            Back to log in
          </button>
        )}
      </form>
    </ModalShell>
  );
};

interface ConfirmModalProps {
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  danger = false,
  onCancel,
  onConfirm,
}) => (
  <ModalShell onClose={onCancel} title={title} maxWidth="max-w-sm">
    <p className="text-sm text-stone-600 dark:text-stone-400">{message}</p>
    <div className="mt-5 flex justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className={`rounded-lg px-4 py-2 text-sm font-semibold ${
          danger ? 'bg-rose-600 text-white hover:bg-rose-700' : ''
        }`}
        style={
          danger
            ? undefined
            : { backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }
        }
      >
        {confirmLabel}
      </button>
    </div>
  </ModalShell>
);

interface ShareModalProps {
  book: Book;
  onClose: () => void;
  onCopied: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  book,
  onClose,
  onCopied,
}) => {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.href.split('#')[0]}#book-${book.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      onCopied();
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback selects input text
      const el = document.getElementById('share-link-input') as HTMLInputElement | null;
      if (el) {
        el.select();
      }
    }
  };

  return (
    <ModalShell onClose={onClose} title={`Share “${book.title}”`}>
      <p className="mb-3 text-sm text-stone-600 dark:text-stone-400">
        Copy this direct catalog link to share this edition.
      </p>
      <div className="flex gap-2">
        <input
          id="share-link-input"
          type="text"
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="font-tab flex-1 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-700 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-fg)',
          }}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </ModalShell>
  );
};

interface EditProfileModalProps {
  user: UserAccount;
  onClose: () => void;
  onSave: (payload: {
    name: string;
    username: string;
    emoji: string;
    color: string;
    image?: string;
  }) => string | null;
}

const AVATAR_EMOJIS = ['📖', '🦉', '🐉', '🌙', '☕', '🦊', '🚀', '🎭'];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [emoji, setEmoji] = useState(user.avatar.emoji);
  const [color, setColor] = useState(user.avatar.color);
  const [image, setImage] = useState<string | undefined>(user.avatar.image);
  const [error, setError] = useState('');

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const size = Math.min(img.width, img.height);
        ctx.drawImage(
          img,
          (img.width - size) / 2,
          (img.height - size) / 2,
          size,
          size,
          0,
          0,
          128,
          128
        );
        setImage(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = onSave({ name, username, emoji, color, image });
    if (err) setError(err);
    else onClose();
  };

  return (
    <ModalShell onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
            Full name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
            Username
          </label>
          <input
            type="text"
            required
            pattern="[A-Za-z0-9_]{3,20}"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
              Badge icon
            </label>
            <select
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            >
              {AVATAR_EMOJIS.map((em) => (
                <option key={em} value={em}>
                  {em}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
              Badge color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-[38px] w-full cursor-pointer rounded-lg border border-stone-300 bg-white px-1 py-1 dark:border-stone-700 dark:bg-stone-950"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
            Upload avatar photo (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="w-full text-xs text-stone-500"
          />
          {image && (
            <button
              type="button"
              onClick={() => setImage(undefined)}
              className="mt-1 text-xs text-rose-600 hover:underline"
            >
              Remove uploaded photo
            </button>
          )}
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm dark:border-stone-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            Save changes
          </button>
        </div>
      </form>
    </ModalShell>
  );
};
