// src/features/portfolio/pages/PortfolioDashboard.tsx

import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowLeft,
  ShieldCheck,
  Pencil,
  Eye,
  Info,
  CircleDot,
  MessageSquare,
  Share2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/hooks/useAuth';
import { usePortfolio, usePublicPortfolio } from '../hooks/usePortfolio';
import {
  useSubscription,
  useProposals,
  SubscriptionCard,
  ProposalReview,
  DeepAnalysisPanel,
  UpgradeModal,
} from '../../subscription';
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

/* ───────────────────────── Shared tokens ───────────────────────── */

const GLASS_CARD =
  'relative overflow-hidden rounded-none border-y border-slate-200/70 ' +
  'sm:rounded-xl sm:border ' +
  'dark:border-white/10 ' +
  'bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl ' +
  'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)] ' +
  'dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-16px_rgba(0,0,0,0.5)]';

const EASE = [0.22, 1, 0.36, 1] as const;

/* ───────────────────────── Ambience ───────────────────────── */

function Ambience() {
  return (
    <>
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-blue-500/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-[30%] h-[24rem] w-[24rem] rounded-full bg-blue-400/8 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
    </>
  );
}

/* ───────────────────────── Section header ───────────────────────── */

function SectionHeader({
  index,
  title,
  subtitle,
  action,
}: {
  index: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 sm:mb-3">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 inline-flex h-6 items-center rounded-md border border-blue-500/20 bg-blue-500/8 px-1.5 text-[10px] font-bold tabular-nums tracking-wider text-blue-700 dark:border-blue-400/20 dark:text-blue-400">
          {index}
        </span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-[15px]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ───────────────────────── Status pill ───────────────────────── */

function StatusPill({ isPublic }: { isPublic: boolean }) {
  if (isPublic) {
    return (
      <span
        title="Portfolio is live and visible to everyone"
        className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/25 bg-blue-500/8 px-2 py-1 text-[11px] font-semibold text-blue-700 dark:border-blue-400/25 dark:text-blue-300"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-600" />
        </span>
        <span className="hidden sm:inline">Live</span>
      </span>
    );
  }
  return (
    <span
      title="Portfolio is private — only the owner can see it"
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/80 bg-white/70 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-300"
    >
      <CircleDot className="h-3 w-3 text-blue-500" />
      <span className="hidden sm:inline">Draft</span>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * OWNER DASHBOARD
 * ═══════════════════════════════════════════════════════════════ */

function OwnerDashboard() {
  const { user } = useAuth();
  const isProfessional =
    user?.account_type === 'professional' ||
    user?.account_type === 'PROFESSIONAL';

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
    uploadWorkImages,
    setAvailability,
  } = usePortfolio(isProfessional);

  const {
    active,
    entitlements,
    tiers,
    loading: subLoading,
    refresh: refreshSub,
  } = useSubscription(isProfessional);

  const {
    proposals,
    loading: proposalsLoading,
    generating,
    analyzing,
    analysis,
    generate,
    accept,
    reject,
    acceptBatch,
    rejectBatch,
    runDeepAnalysis,
  } = useProposals(isProfessional);

  const [tab, setTab] = useState<PortfolioTab>('services');
  const [editOpen, setEditOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (!isProfessional) return <ProfessionalRequired />;
  if (loading && !portfolio)
    return <LoadingState label="Loading workspace portfolio…" />;
  if (error && !portfolio)
    return <ErrorState message={error} onRetry={refresh} />;

  if (!portfolio) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
        <Ambience />
        <div className="relative z-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <PortfolioCreateForm
            categories={categories}
            saving={saving}
            onCreate={async (input) => {
              const created = await createPortfolio(input);
              if (created) setTab('services');
            }}
          />
        </div>
      </div>
    );
  }

  const publicHref = portfolio.user?.username
    ? `/profile/${portfolio.user.username}`
    : null;

  const liveCount = availability.filter((a) => a.is_available).length;

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Ambience />

      {/* ═══════ Top bar ═══════ */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75">
        <div className="flex h-14 w-full items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-sm shadow-blue-500/25">
              <LayoutDashboard className="h-4 w-4" />
            </div>

            <nav
              aria-label="Breadcrumb"
              className="flex min-w-0 items-center gap-2"
            >
              <span className="hidden text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 sm:inline">
                Workspace
              </span>
              <span className="hidden text-slate-300 sm:inline dark:text-slate-700">
                /
              </span>
              <h1 className="truncate text-[13px] font-semibold tracking-tight text-slate-900 dark:text-white">
                Portfolio Studio
              </h1>
              {portfolio.is_verified && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/8 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:border-blue-400/20 dark:text-blue-400">
                  <ShieldCheck className="h-3 w-3" />
                  <span className="hidden md:inline">Verified</span>
                </span>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <StatusPill isPublic={!!portfolio.is_public} />

            {publicHref && portfolio.is_public && (
              <Link
                to={publicHref}
                target="_blank"
                rel="noreferrer"
                aria-label="View public profile"
                className="group hidden items-center gap-1.5 rounded-md border border-slate-200/80 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors hover:border-blue-500/40 hover:text-blue-700 sm:inline-flex dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:text-blue-400"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>View public</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            )}

            <button
              type="button"
              onClick={() => setEditOpen(true)}
              aria-label="Edit profile"
              className="group inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-blue-500/25 transition-colors hover:bg-blue-500 active:scale-[0.98]"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit profile</span>
            </button>
          </div>
        </div>
      </header>

      {/* ═══════ Main content ═══════ */}
      <main className="relative z-10 w-full flex-1 px-4 pt-5 pb-8 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* 01 Profile */}
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <SectionHeader
            index="01"
            title="Profile"
            subtitle="How clients see you on SkilledLink"
          />
          <PortfolioHeader
            portfolio={portfolio}
            isOwner
            onEdit={() => setEditOpen(true)}
          />
        </motion.section>

        {/* 02 At a glance */}
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: EASE }}
          className="mt-8 sm:mt-6"
        >
          <SectionHeader
            index="02"
            title="At a glance"
            subtitle="Your key performance signals"
          />
          <PortfolioStats
            portfolio={portfolio}
            services={services}
            works={works}
          />
        </motion.section>

        {/* 03 Subscription & AI */}
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08, ease: EASE }}
          className="mt-8 space-y-5 sm:mt-6"
        >
          <SectionHeader
            index="03"
            title="Subscription & AI"
            subtitle="Your plan, benefits, and AI-powered suggestions"
          />

          <SubscriptionCard
            active={active}
            entitlements={entitlements}
            loading={subLoading}
            onUpgrade={() => setUpgradeOpen(true)}
          />

          <DeepAnalysisPanel
            analysis={analysis}
            analyzing={analyzing}
            onRun={runDeepAnalysis}
          />

          <ProposalReview
            proposals={proposals}
            loading={proposalsLoading}
            generating={generating}
            onGenerate={generate}
            onAccept={accept}
            onReject={reject}
            onAcceptBatch={async (ids) => {
              await acceptBatch(ids);
            }}
            onRejectBatch={async (ids) => {
              await rejectBatch(ids);
            }}
          />
        </motion.section>

        {/* 04 Manage panel */}
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: EASE }}
          className="mt-8 sm:mt-6"
        >
          <SectionHeader
            index="04"
            title="Manage your portfolio"
            subtitle="Services, past work, availability, and about"
          />

          <div className={GLASS_CARD}>
            <div className="border-b border-slate-200/70 dark:border-white/10">
              <PortfolioTabs
                active={tab}
                onChange={setTab}
                counts={{
                  services: services.length,
                  works: works.length,
                  availability: liveCount,
                }}
              />
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
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
                      onUploadImages={async (id, files) => {
                        return await uploadWorkImages(id, files);
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

                  {tab === 'about' && (
                    <PortfolioAboutTab portfolio={portfolio} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-200/70 bg-slate-50/60 px-4 py-3 dark:border-white/10 dark:bg-slate-950/40 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <Info className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                <span>
                  {tab === 'services' &&
                    `${services.length} service${services.length === 1 ? '' : 's'} configured`}
                  {tab === 'works' &&
                    `${works.length} project${works.length === 1 ? '' : 's'} showcased`}
                  {tab === 'availability' &&
                    `${liveCount} slot${liveCount === 1 ? '' : 's'} available this week`}
                  {tab === 'about' && 'Full biography and credentials'}
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                SkilledLink Portfolio Studio
              </span>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Modals */}
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

      <UpgradeModal
        open={upgradeOpen}
        tiers={tiers?.items ?? []}
        currentLevel={active?.subscription?.tier?.level ?? 0}
        onClose={() => setUpgradeOpen(false)}
        onSuccess={async () => {
          // The mock provider resolves and persists the subscription
          // synchronously during fetch_provider_status, so a single
          // refresh after a short delay is enough.
          await new Promise((r) => setTimeout(r, 800));
          await refreshSub();
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * PUBLIC VIEW
 * ═══════════════════════════════════════════════════════════════ */

function PublicView({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const { data, loading, error, refresh } = usePublicPortfolio(userId);

  const [tab, setTab] = useState<PortfolioTab>('services');

  const portfolio = data?.portfolio ?? null;
  const services = data?.services ?? [];
  const works = data?.works ?? [];
  const availability = data?.availability ?? [];
  const author = data?.professional ?? null;

  const fullName = author
    ? `${author.first_name ?? ''} ${author.last_name ?? ''}`.trim() ||
      author.username ||
      'Professional'
    : 'Professional';

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${fullName}'s portfolio`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      }
    } catch {
      /* cancelled */
    }
  };

  if (loading && !data) {
    return <LoadingState label="Loading portfolio…" />;
  }

  if (error || !data || !portfolio) {
    return (
      <ErrorState
        message={
          error ??
          "This professional hasn't published a portfolio yet."
        }
        onRetry={refresh}
      />
    );
  }

  const liveCount = availability.filter((a) => a.is_available).length;

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Ambience />

      <header className="sticky top-0 z-30 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75">
        <div className="flex h-14 w-full items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-600 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-sm shadow-blue-500/25">
              <LayoutDashboard className="h-4 w-4" />
            </div>

            <nav
              aria-label="Breadcrumb"
              className="flex min-w-0 items-center gap-2"
            >
              <span className="hidden text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 sm:inline">
                Portfolio
              </span>
              <span className="hidden text-slate-300 sm:inline dark:text-slate-700">
                /
              </span>
              <h1 className="truncate text-[13px] font-semibold tracking-tight text-slate-900 dark:text-white">
                {portfolio.business_name || fullName}
              </h1>
              {portfolio.is_verified && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/8 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:border-blue-400/20 dark:text-blue-400">
                  <ShieldCheck className="h-3 w-3" />
                  <span className="hidden md:inline">Verified</span>
                </span>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <StatusPill isPublic={!!portfolio.is_public} />

            <button
              type="button"
              onClick={handleShare}
              aria-label="Share portfolio"
              className="group inline-flex items-center gap-1.5 rounded-md border border-slate-200/80 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors hover:border-blue-500/40 hover:text-blue-700 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:text-blue-400"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <Link
              to={`/messages?user=${author?.id ?? userId}`}
              className="group inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-blue-500/25 transition-colors hover:bg-blue-500 active:scale-[0.98]"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Message</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full flex-1 px-4 pt-5 pb-8 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* 01 Profile */}
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <SectionHeader
            index="01"
            title="Profile"
            subtitle="How this professional presents on SkilledLink"
          />
          <PortfolioHeader portfolio={portfolio} isOwner={false} />
        </motion.section>

        {/* 02 At a glance */}
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: EASE }}
          className="mt-8 sm:mt-6"
        >
          <SectionHeader
            index="02"
            title="At a glance"
            subtitle="Key performance signals"
          />
          <PortfolioStats
            portfolio={portfolio}
            services={services}
            works={works}
          />
        </motion.section>

        {/* 03 Portfolio details */}
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: EASE }}
          className="mt-8 sm:mt-6"
        >
          <SectionHeader
            index="03"
            title="Portfolio"
            subtitle="Services, past work, availability, and about"
          />

          <div className={GLASS_CARD}>
            <div className="border-b border-slate-200/70 dark:border-white/10">
              <PortfolioTabs
                active={tab}
                onChange={setTab}
                counts={{
                  services: services.length,
                  works: works.length,
                  availability: liveCount,
                }}
              />
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  {tab === 'services' && (
                    <PortfolioServices
                      services={services}
                      saving={false}
                      isOwner={false}
                      onCreate={async () => {}}
                      onUpdate={async () => {}}
                      onDelete={async () => {}}
                    />
                  )}

                  {tab === 'works' && (
                    <PortfolioWorks
                      works={works}
                      services={services}
                      saving={false}
                      isOwner={false}
                      onCreate={async () => {}}
                      onUpdate={async () => {}}
                      onDelete={async () => {}}
                      onUploadImages={async () => null}
                    />
                  )}

                  {tab === 'availability' && (
                    <PortfolioAvailability
                      availability={availability}
                      saving={false}
                      isOwner={false}
                      onSave={async () => null}
                    />
                  )}

                  {tab === 'about' && (
                    <PortfolioAboutTab portfolio={portfolio} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-200/70 bg-slate-50/60 px-4 py-3 dark:border-white/10 dark:bg-slate-950/40 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <Info className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                <span>
                  {tab === 'services' &&
                    `${services.length} service${services.length === 1 ? '' : 's'} configured`}
                  {tab === 'works' &&
                    `${works.length} project${works.length === 1 ? '' : 's'} showcased`}
                  {tab === 'availability' &&
                    `${liveCount} slot${liveCount === 1 ? '' : 's'} available this week`}
                  {tab === 'about' && 'Full biography and credentials'}
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                SkilledLink Portfolio
              </span>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * DEFAULT EXPORT
 * ═══════════════════════════════════════════════════════════════ */

interface PortfolioDashboardProps {
  userId?: string;
}

export default function PortfolioDashboard({
  userId: propUserId,
}: PortfolioDashboardProps = {}) {
  const { user } = useAuth();
  const { userId: routeUserId } = useParams<{ userId: string }>();

  const userId = propUserId ?? routeUserId;
  const isOwnView = !userId || String(userId) === String(user?.id);

  if (!isOwnView) return <PublicView userId={String(userId)} />;
  return <OwnerDashboard />;
}