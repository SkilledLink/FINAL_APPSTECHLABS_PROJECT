import { Plus, Wrench, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import type {
  Service,
  ServiceCreateInput,
  ServiceUpdateInput,
} from '../types/portfolio.types';
import PortfolioServiceForm from './PortfolioServiceForm';
import PortfolioServiceCard from './PortfolioServiceCard';

interface PortfolioServicesProps {
  services: Service[];
  saving?: boolean;
  isOwner?: boolean;
  onCreate: (input: ServiceCreateInput) => Promise<Service | null>;
  onUpdate: (id: string, input: ServiceUpdateInput) => Promise<Service | null>;
  onDelete: (id: string) => Promise<void>;
  onUploadBanner?: (id: string, file: File) => Promise<void>;
  onUploadGallery?: (id: string, files: File[]) => Promise<void>;
}

const BTN_PRIMARY =
  'group inline-flex w-full items-center justify-center gap-1.5 rounded ' +
  'bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white ' +
  'shadow-sm shadow-blue-500/25 transition-colors hover:bg-blue-500 ' +
  'active:scale-[0.98] sm:w-auto';

const BTN_GHOST =
  'rounded border border-slate-200/80 bg-white px-4 py-2 text-sm font-semibold ' +
  'text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 ' +
  'dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200 ' +
  'dark:hover:bg-slate-800';

const BTN_DANGER =
  'inline-flex items-center justify-center gap-2 rounded bg-rose-600 px-4 py-2 ' +
  'text-sm font-semibold text-white shadow-sm shadow-rose-500/25 ' +
  'transition-colors hover:bg-rose-500 disabled:opacity-50';

export default function PortfolioServices({
  services,
  saving = false,
  isOwner = false,
  onCreate,
  onUpdate,
  onDelete,
  onUploadBanner,
  onUploadGallery,
}: PortfolioServicesProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const count = services.length;
  const targetService = services.find((s) => s.id === confirmDelete);

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditing(service);
    setFormOpen(true);
  };

  const handleSubmit = async (
    input: ServiceCreateInput
  ): Promise<Service | null> => {
    try {
      const saved = editing
        ? await onUpdate(editing.id, input)
        : await onCreate(input);
      return saved;
    } catch {
      return null;
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
      toast.success('Service deleted');
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const deleteModal =
    confirmDelete != null
      ? createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto
                       p-3 pt-4 pb-4 sm:items-center sm:p-6
                       bg-blue-950/75 backdrop-blur-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-service-title"
          >
            <div
              className="fixed inset-0"
              onClick={!deletingId ? () => setConfirmDelete(null) : undefined}
              aria-hidden="true"
            />

            <div
              className="relative my-auto w-full max-w-sm overflow-hidden rounded-xl
                         border border-white/60 dark:border-white/10
                         bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl
                         shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
              <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-rose-500/15 blur-3xl" />

              <div className="relative p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <Trash2 className="h-5 w-5" />
                </div>

                <h3
                  id="delete-service-title"
                  className="text-base font-semibold tracking-tight text-slate-900 dark:text-white"
                >
                  Delete this service?
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  This can't be undone. Customers won't see this service anymore.
                </p>

                {targetService && (
                  <p className="mt-2 truncate rounded border border-slate-200/60 bg-slate-50/60 px-2.5 py-1.5 text-xs italic text-slate-600 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-300">
                    "{targetService.title}"
                  </p>
                )}

                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(null)}
                    disabled={!!deletingId}
                    className={`w-full sm:w-auto ${BTN_GHOST}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(confirmDelete)}
                    disabled={!!deletingId}
                    className={`w-full sm:w-auto ${BTN_DANGER}`}
                  >
                    {deletingId === confirmDelete ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Deleting…
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:border-blue-400/20 dark:text-blue-400">
            <Wrench className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
                Services
              </h2>
              {count > 0 && (
                <span className="inline-flex h-5 items-center rounded-sm border border-slate-200/80 bg-white/70 px-1.5 text-[10px] font-bold tabular-nums text-slate-600 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-300">
                  {count}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {count === 0
                ? 'List the services you offer so clients can book you.'
                : `${count} service${count === 1 ? '' : 's'} offered`}
            </p>
          </div>
        </div>

        {isOwner && count > 0 && (
          <button type="button" onClick={handleAdd} className={BTN_PRIMARY}>
            <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
            <span>New service</span>
          </button>
        )}
      </div>

      {count === 0 ? (
        <div className="relative overflow-hidden rounded-md border border-dashed border-blue-500/25 bg-blue-500/[0.03] px-6 py-10 text-center backdrop-blur-sm dark:border-blue-400/20 dark:bg-blue-500/[0.04]">
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative flex flex-col items-center">
            <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-600 shadow-sm shadow-blue-500/10 dark:border-blue-400/20 dark:text-blue-400">
              <Wrench className="h-6 w-6" />
            </div>

            <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
              No services yet
            </h3>
            <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {isOwner
                ? 'Add your first service to let customers know what you offer.'
                : "This professional hasn't listed any services yet."}
            </p>

            {isOwner && (
              <button
                type="button"
                onClick={handleAdd}
                className="group mt-5 inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
              >
                <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
                <span>Add your first service</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          {services.map((service) => (
            <PortfolioServiceCard
              key={service.id}
              service={service}
              isOwner={isOwner}
              onEdit={() => handleEdit(service)}
              onDelete={() => handleDelete(service.id)}
            />
          ))}
        </div>
      )}

      {isOwner && (
        <PortfolioServiceForm
          open={formOpen}
          initial={editing}
          saving={saving}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
          onUploadBanner={onUploadBanner}
          onUploadGallery={onUploadGallery}
          onSuccess={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}

      {isOwner && deleteModal}
    </div>
  );
}