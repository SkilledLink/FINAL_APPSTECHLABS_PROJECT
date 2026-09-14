import { Clock, Edit3, Loader2, Plus, Shield, Trash2, Wrench } from 'lucide-react';
import { useState } from 'react';
import type { Service, ServiceCreateInput } from '../types/portfolio.types';
import PortfolioServiceForm from './PortfolioServiceForm';

interface PortfolioServicesProps {
  services: Service[];
  saving?: boolean;
  isOwner?: boolean;
  onCreate: (input: ServiceCreateInput) => Promise<void>;
  onUpdate: (id: string, input: ServiceCreateInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function formatPrice(service: Service): string {
  if (service.starting_price == null) return 'Price on request';
  const amount = service.starting_price.toLocaleString();
  const type = service.pricing_type ?? 'starting_from';
  switch (type) {
    case 'hourly':
      return `$${amount} / hr`;
    case 'daily':
      return `$${amount} / day`;
    case 'monthly':
      return `$${amount} / month`;
    case 'fixed':
      return `$${amount} (fixed)`;
    case 'negotiable':
      return `$${amount} (negotiable)`;
    default:
      return `From $${amount}`;
  }
}

export default function PortfolioServices({
  services,
  saving = false,
  isOwner = false,
  onCreate,
  onUpdate,
  onDelete,
}: PortfolioServicesProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditing(service);
    setFormOpen(true);
  };

  const handleSubmit = async (input: ServiceCreateInput) => {
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
            Services
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {services.length} {services.length === 1 ? 'service' : 'services'} offered
          </p>
        </div>
        {isOwner && (
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:scale-95 dark:bg-cyan-600 dark:hover:bg-cyan-500"
          >
            <Plus className="h-4 w-4" />
            Add service
          </button>
        )}
      </div>

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/50 p-10 text-center backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Wrench className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200">No services yet</h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
            {isOwner
              ? 'Add your first service to let customers know what you offer.'
              : "This professional hasn't listed any services yet."}
          </p>
          {isOwner && (
            <button
              type="button"
              onClick={handleAdd}
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-600/20 transition-all hover:-translate-y-0.5 hover:bg-cyan-700 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add your first service
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5 dark:border-slate-800/80 dark:bg-slate-900/80 dark:hover:border-cyan-500/30"
            >
              {/* Background Glow */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/5 blur-2xl transition-all duration-500 group-hover:bg-cyan-500/15 dark:bg-cyan-500/10" />

              {/* Banner */}
              {service.banner_image_url ? (
                <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={service.banner_image_url}
                    alt={service.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-[16/9] w-full bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600">
                  <div className="flex h-full w-full items-center justify-center">
                    <Wrench className="h-10 w-10 text-white/70" />
                  </div>
                </div>
              )}

              <div className="relative flex flex-1 flex-col p-4">
                {/* Header with status badges */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 font-bold text-slate-900 transition-colors duration-200 group-hover:text-cyan-600 dark:text-slate-100 dark:group-hover:text-cyan-400">
                    {service.title}
                  </h3>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {service.is_emergency_service && (
                      <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-400">
                        Emergency
                      </span>
                    )}
                    {!service.is_active && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {service.description && (
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {service.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  {service.category && (
                    <span className="rounded-full border border-slate-200/60 bg-slate-100/80 px-2.5 py-1 font-medium text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-300">
                      {service.category}
                    </span>
                  )}
                  {service.warranty_days != null && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-700 dark:text-emerald-400">
                      <Shield className="h-3 w-3" />
                      {service.warranty_days}d warranty
                    </span>
                  )}
                  {service.estimated_duration && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/60 bg-slate-100/80 px-2.5 py-1 font-medium text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-300">
                      <Clock className="h-3 w-3" />
                      {service.estimated_duration}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Rate / Investment
                    </div>
                    <div className="text-base font-extrabold text-cyan-600 dark:text-cyan-400">
                      {formatPrice(service)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isOwner && (
                  <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleEdit(service)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-cyan-500/40 hover:bg-cyan-50 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-400"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(service.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition-all hover:-translate-y-0.5 hover:bg-rose-50 dark:border-rose-900/40 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <PortfolioServiceForm
        open={formOpen}
        initial={editing}
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
              Delete this service?
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              This can't be undone. Customers won't see this service anymore.
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