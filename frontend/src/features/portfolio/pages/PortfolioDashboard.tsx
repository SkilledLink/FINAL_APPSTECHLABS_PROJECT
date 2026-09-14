import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Sparkles, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { usePortfolio } from '../hooks/usePortfolio';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ProfessionalRequired from '../components/ProfessionalRequired';
import PortfolioHeader from '../components/PortfolioHeader';
import PortfolioStats from '../components/PortfolioStats';
import PortfolioTabs, { type PortfolioTab } from '../components/PortfolioTabs';
import PortfolioServices from '../components/PortfolioServices';
import PortfolioWorks from '../components/PortfolioWorks';
import PortfolioAvailability from '../components/PortfolioAvailability';
import PortfolioAboutTab from '../components/PortfolioAboutTab';
import PortfolioCreateForm from '../components/PortfolioCreateForm';
import EditPortfolioModal from '../components/EditPortfolioModal';

export default function PortfolioDashboard() {
  const { user } = useAuth();
  const isProfessional =
    user?.account_type === 'professional' || user?.account_type === 'PROFESSIONAL';

  const {
    portfolio,
    services,
    works,
    availability,
    categories,
    loading,
    saving,
    error,
    refresh,
    createPortfolio,
    updatePortfolio,
    createService,
    updateService,
    deleteService,
    createWork,
    updateWork,
    deleteWork,
    setAvailability,
  } = usePortfolio(isProfessional);

  const [tab, setTab] = useState<PortfolioTab>('services');
  const [editOpen, setEditOpen] = useState(false);

  /* ── Gate: not a professional ─────────────────────── */
  if (!isProfessional) {
    return <ProfessionalRequired />;
  }

  /* ── Loading / error ──────────────────────────────── */
  if (loading && !portfolio) {
    return <LoadingState label="Loading portfolio dashboard…" />;
  }

  if (error && !portfolio) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  /* ── No portfolio yet → create form ───────────────── */
  if (!portfolio) {
    return (
      <PortfolioCreateForm
        categories={categories}
        saving={saving}
        onCreate={async (input) => {
          const created = await createPortfolio(input);
          if (created) setTab('services');
        }}
      />
    );
  }

  /* ── Full dashboard ───────────────────────────────── */
  const publicHref = portfolio.user?.username
    ? `/profile/${portfolio.user.username}`
    : null;

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 pb-20 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white shadow-xs dark:bg-indigo-600">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl text-slate-900 dark:text-slate-100">
                Portfolio Dashboard
              </h1>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                Manage services, showcase works, and configure client availability.
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {publicHref && portfolio.is_public && (
              <Link
                to={publicHref}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-all active:scale-95"
              >
                <ExternalLink className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>View Public Profile</span>
              </Link>
            )}
            {!portfolio.is_public && (
              <span className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>Private Portfolio</span>
              </span>
            )}
          </div>
        </div>

        {/* Portfolio Main Card */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <PortfolioHeader
            portfolio={portfolio}
            isOwner
            onEdit={() => setEditOpen(true)}
          />
        </div>

        {/* Key Metrics Grid */}
        <div className="w-full">
          <PortfolioStats
            portfolio={portfolio}
            services={services}
            works={works}
          />
        </div>

        {/* Tab Control & Main Panel */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <PortfolioTabs
            active={tab}
            onChange={setTab}
            counts={{
              services: services.length,
              works: works.length,
              availability: availability.filter((a) => a.is_available).length,
            }}
          />

          <div className="p-5 sm:p-6">
            {tab === 'services' && (
              <PortfolioServices
                services={services}
                saving={saving}
                isOwner
                onCreate={async (input) => {
                  await createService(input);
                }}
                onUpdate={async (id, input) => {
                  await updateService(id, input);
                }}
                onDelete={async (id) => {
                  await deleteService(id);
                }}
              />
            )}

            {tab === 'works' && (
              <PortfolioWorks
                works={works}
                services={services}
                saving={saving}
                isOwner
                onCreate={async (input) => {
                  await createWork(input);
                }}
                onUpdate={async (id, input) => {
                  await updateWork(id, input);
                }}
                onDelete={async (id) => {
                  await deleteWork(id);
                }}
              />
            )}

            {tab === 'availability' && (
              <PortfolioAvailability
                availability={availability}
                saving={saving}
                isOwner
                onSave={async (items) => {
                  await setAvailability(items);
                }}
              />
            )}

            {tab === 'about' && <PortfolioAboutTab portfolio={portfolio} />}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditPortfolioModal
        open={editOpen}
        portfolio={portfolio}
        saving={saving}
        onClose={() => setEditOpen(false)}
        onSubmit={async (input) => {
          const updated = await updatePortfolio(input);
          if (updated) setEditOpen(false);
        }}
      />
    </div>
  );
}