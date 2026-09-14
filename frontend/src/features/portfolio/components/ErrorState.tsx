import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center rounded-3xl border border-rose-200/70 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 px-6 py-16 text-center shadow-sm backdrop-blur-md transition-all">
        {/* Icon Badge */}
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200/60 dark:border-rose-800/50 bg-rose-100/80 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 backdrop-blur-sm">
          <AlertCircle className="h-7 w-7" />
        </div>

        {/* Text Details */}
        <h3 className="font-display text-lg font-bold text-rose-900 dark:text-rose-200">
          Something went wrong
        </h3>
        <p className="mt-1.5 max-w-md text-sm text-rose-700/90 dark:text-rose-300/80 leading-relaxed">
          {message}
        </p>

        {/* Action Button */}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-600/20 hover:bg-rose-500 dark:bg-rose-600 dark:hover:bg-rose-500 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/30 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try again</span>
          </button>
        )}
      </div>
    </div>
  );
}