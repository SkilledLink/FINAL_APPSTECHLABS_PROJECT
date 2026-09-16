// src/features/ai/components/AISearchBar.tsx
import {
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AISearchBarProps {
  onSubmit: (query: string, image: File | null) => void;
  loading?: boolean;
  error?: string | null;
  initialQuery?: string;
  placeholder?: string;
}

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 8 * 1024 * 1024;

export default function AISearchBar({
  onSubmit,
  loading = false,
  error = null,
  initialQuery = '',
  placeholder = "Describe who you need — or attach a photo. Try 'electricians in Douala'.",
}: AISearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLocalError(null);

    if (!ALLOWED.includes(f.type)) {
      setLocalError('Please choose a JPEG, PNG, or WEBP image.');
      return;
    }
    if (f.size > MAX_BYTES) {
      setLocalError('Image is too large. Max 8 MB.');
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setImage(f);
    setPreview(URL.createObjectURL(f));
    if (fileRef.current) fileRef.current.value = '';
  };

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!query.trim() && !image) {
      setLocalError('Type a description or attach an image.');
      return;
    }
    setLocalError(null);
    onSubmit(query.trim(), image);
  };

  const displayError = localError || error;
  const canSubmit = (query.trim().length > 0 || image) && !loading;

  return (
    <div className="rounded-md border border-slate-200/70 bg-white/85 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 sm:p-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-sm shadow-blue-500/25">
            <Sparkles className="h-4 w-4" />
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2 rounded border border-slate-200/80 bg-white px-3.5 py-0.5 shadow-sm transition-all focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/25 dark:border-white/10 dark:bg-slate-900">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              disabled={loading}
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60 dark:text-slate-100 dark:placeholder:text-slate-500"
            />

            {loading && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-600 dark:text-blue-400" />
            )}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600 disabled:opacity-40 dark:hover:bg-slate-800"
              title="Attach an image"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex h-[42px] shrink-0 items-center justify-center gap-2 rounded bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-500/25 transition-colors hover:bg-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>Search</span>
          </button>
        </div>

        {preview && (
          <div className="flex items-center gap-3 rounded border border-slate-200/80 bg-slate-50 p-2 pr-3 dark:border-white/10 dark:bg-slate-800/40">
            <img
              src={preview}
              alt="Attached"
              className="h-14 w-14 rounded object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                Image attached
              </div>
              <div className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                {image?.name}
              </div>
            </div>
            <button
              type="button"
              onClick={clearImage}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {displayError && (
          <div className="flex items-center gap-2 rounded border border-rose-500/20 bg-rose-500/8 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}
      </form>
    </div>
  );
}