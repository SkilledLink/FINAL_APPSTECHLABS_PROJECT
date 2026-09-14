import {
  Calendar,
  Edit3,
  Loader2,
  MapPin,
  Plus,
  Star,
  Trash2,
  Trophy,
} from 'lucide-react';
import { useState } from 'react';
import type { Service, Work, WorkCreateInput } from '../types/portfolio.types';
import PortfolioWorkForm from './PortfolioWorkForm';

interface PortfolioWorksProps {
  works: Work[];
  services: Service[];
  saving?: boolean;
  isOwner?: boolean;
  onCreate: (input: WorkCreateInput) => Promise<void>;
  onUpdate: (id: string, input: WorkCreateInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function formatDate(date?: string | null): string | null {
  if (!date) return null;
  try {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
    });
  } catch {
    return null;
  }
}

export default function PortfolioWorks({
  works,
  services,
  saving = false,
  isOwner = false,
  onCreate,
  onUpdate,
  onDelete,
}: PortfolioWorksProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Work | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (work: Work) => {
    setEditing(work);
    setFormOpen(true);
  };

  const handleSubmit = async (input: WorkCreateInput) => {
    if (editing) {
      await onUpdate(editing.id, input);
    } else {
      await onCreate(input);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
      setConfirmDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Works Showcase
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {works.length} {works.length === 1 ? 'project' : 'projects'} completed
          </p>
        </div>
        {isOwner && (
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:scale-95 dark:bg-cyan-600 dark:hover:bg-cyan-500"
          >
            <Plus className="h-4 w-4" />
            Add work
          </button>
        )}
      </div>

      {works.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/50 p-10 text-center backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Trophy className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200">No works yet</h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
            {isOwner
              ? 'Showcase your past work to build trust with new customers.'
              : "This professional hasn't shared any past work yet."}
          </p>
          {isOwner && (
            <button
              type="button"
              onClick={handleAdd}
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add your first work
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {works.map((work) => {
            const completedLabel = formatDate(work.completed_at);
            const primaryImage =
              work.gallery?.[0] ?? work.after_image_url ?? work.before_image_url;

            return (
              <div
                key={work.id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5 dark:border-slate-800/80 dark:bg-slate-900/80 dark:hover:border-cyan-500/30"
              >
                {/* Background Glow */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/5 blur-2xl transition-all duration-500 group-hover:bg-cyan-500/15 dark:bg-cyan-500/10" />

                {/* Hero Image */}
                {primaryImage ? (
                  <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={primaryImage}
                      alt={work.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/10] w-full bg-gradient-to-br from-slate-800 to-slate-950">
                    <div className="flex h-full w-full items-center justify-center">
                      <Trophy className="h-10 w-10 text-white/50" />
                    </div>
                  </div>
                )}

                <div className="relative flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 font-bold text-slate-900 transition-colors duration-200 group-hover:text-cyan-600 dark:text-slate-100 dark:group-hover:text-cyan-400">
                    {work.title}
                  </h3>

                  {work.description && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {work.description}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    {completedLabel && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {completedLabel}
                      </span>
                    )}
                    {work.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {work.location}
                      </span>
                    )}
                    {work.rating != null && work.rating > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {work.rating}.0
                        </span>
                      </span>
                    )}
                  </div>

                  {work.client_testimonial && (
                    <blockquote className="mt-3.5 rounded-2xl border-l-2 border-cyan-500 bg-cyan-500/5 px-3.5 py-2.5 dark:bg-cyan-500/10">
                      <p className="line-clamp-3 text-xs italic leading-relaxed text-slate-700 dark:text-slate-300">
                        "{work.client_testimonial}"
                      </p>
                      {work.client_name && (
                        <footer className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          — {work.client_name}
                        </footer>
                      )}
                    </blockquote>
                  )}

                  {work.cost != null && (
                    <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Project cost
                      </span>
                      <span className="text-sm font-bold text-slate-900 tabular-nums dark:text-slate-100">
                        {work.cost.toLocaleString()} XAF
                      </span>
                    </div>
                  )}

                  {isOwner && (
                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3.5 dark:border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => handleEdit(work)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-cyan-500/40 hover:bg-cyan-50 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-400"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(work.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition-all hover:-translate-y-0.5 hover:bg-rose-50 dark:border-rose-900/40 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PortfolioWorkForm
        open={formOpen}
        initial={editing}
        services={services}
        saving={saving}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm dark:bg-slate-950/80"
            onClick={() => !deletingId && setConfirmDelete(null)}
          />
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-slate-800/80 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Delete this work?
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              This will permanently remove the entry from your portfolio.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={!!deletingId}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDelete)}
                disabled={!!deletingId}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
              >
                {deletingId === confirmDelete ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}