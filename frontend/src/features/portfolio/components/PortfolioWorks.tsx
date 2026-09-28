// src/features/portfolio/components/PortfolioWorks.tsx
import { Plus, Trophy, Briefcase } from 'lucide-react';
import { useState } from 'react';
import type { Service, Work, WorkCreateInput } from '../types/portfolio.types';
import PortfolioWorkForm from './PortfolioWorkForm';
import PortfolioWorkCard from './PortfolioWorkCard';
import type { WorkImageFiles } from './PortfolioWorkForm';

interface PortfolioWorksProps {
  works: Work[];
  services: Service[];
  saving?: boolean;
  isOwner?: boolean;
  onCreate: (input: WorkCreateInput) => Promise<Work | null>;
  onUpdate: (id: string, input: WorkCreateInput) => Promise<Work | null>;
  onDelete: (id: string) => Promise<void>;
  onUploadImages: (
    id: string,
    files: { before?: File; after?: File }
  ) => Promise<Work | null>;
}

/* ───────────────────────── Shared tokens ───────────────────────── */

const BTN_PRIMARY =
  'group inline-flex w-full items-center justify-center gap-1.5 rounded ' +
  'bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white ' +
  'shadow-sm shadow-blue-500/25 transition-colors hover:bg-blue-500 ' +
  'active:scale-[0.98] sm:w-auto';

/* ─────────────────────────────────────────────────────────────── */

export default function PortfolioWorks({
  works,
  services,
  saving = false,
  isOwner = false,
  onCreate,
  onUpdate,
  onDelete,
  onUploadImages,
}: PortfolioWorksProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Work | null>(null);

  const count = works.length;

  /* ── Handlers ── */

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (work: Work) => {
    setEditing(work);
    setFormOpen(true);
  };

  /**
   * Two-step save: persist the work record first, then upload any
   * new before/after images using the resulting id.
   *
   * Throws if the record creation fails so the form's error handler
   * can surface the failure instead of silently dropping the images.
   */
  const handleSubmit = async (
    input: WorkCreateInput,
    files: WorkImageFiles
  ) => {
    const hasFiles = Boolean(files.before || files.after);

    if (editing) {
      const updated = await onUpdate(editing.id, input);
      if (!updated) throw new Error('Failed to update work');
      if (hasFiles) {
        await onUploadImages(editing.id, files);
      }
    } else {
      const created = await onCreate(input);
      if (!created) throw new Error('Failed to create work');
      if (hasFiles) {
        await onUploadImages(created.id, files);
      }
    }

    setFormOpen(false);
    setEditing(null);
  };

  /* ── Render ── */

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ═══════════ Header ═══════════ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:border-blue-400/20 dark:text-blue-400">
            <Briefcase className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
                Works showcase
              </h2>
              {count > 0 && (
                <span className="inline-flex h-5 items-center rounded-sm border border-slate-200/80 bg-white/70 px-1.5 text-[10px] font-bold tabular-nums text-slate-600 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-300">
                  {count}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {count === 0
                ? 'Showcase past projects to build trust with new clients.'
                : `${count} project${count === 1 ? '' : 's'} in your showcase`}
            </p>
          </div>
        </div>

        {isOwner && count > 0 && (
          <button type="button" onClick={handleAdd} className={BTN_PRIMARY}>
            <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
            <span>Add work</span>
          </button>
        )}
      </div>

      {/* ═══════════ Empty state ═══════════ */}
      {count === 0 ? (
        <div className="relative overflow-hidden rounded-md border border-dashed border-blue-500/25 bg-blue-500/[0.03] px-6 py-10 text-center backdrop-blur-sm dark:border-blue-400/20 dark:bg-blue-500/[0.04]">
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative flex flex-col items-center">
            <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-600 shadow-sm shadow-blue-500/10 dark:border-blue-400/20 dark:text-blue-400">
              <Trophy className="h-6 w-6" />
            </div>

            <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
              No works yet
            </h3>
            <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {isOwner
                ? 'Showcase your past work to build trust with new customers.'
                : "This professional hasn't shared any past work yet."}
            </p>

            {isOwner && (
              <button
                type="button"
                onClick={handleAdd}
                className="group mt-5 inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
              >
                <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
                <span>Add your first work</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ═══════════ Works grid ═══════════ */
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          {works.map((work) => (
            <PortfolioWorkCard
              key={work.id}
              work={work}
              isOwner={isOwner}
              onEdit={() => handleEdit(work)}
              onDelete={() => onDelete(work.id)}
              onUploadImages={(before, after) =>
                onUploadImages(work.id, { before, after }).then(() => {})
              }
            />
          ))}
        </div>
      )}

      {/* ═══════════ Work form modal (owner only) ═══════════ */}
      {isOwner && (
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
      )}
    </div>
  );
}