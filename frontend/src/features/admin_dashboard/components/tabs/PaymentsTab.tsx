// src/features/admin/components/tabs/PaymentsTab.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Ban,
  Banknote,
  CheckCircle,
  Clock,
  CreditCard,
  ExternalLink,
  Eye,
  Filter,
  Inbox,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Smartphone,
  Wallet,
  X,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { usePayments } from '../../hooks/usePayments';
import type {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  ProfessionalPaymentAdmin,
} from '../../types/admin.types';
import ReasonPrompt from '../ReasonPrompt';

/* ───────────────────────── Metadata ───────────────────────── */

const STATUS_META: Record<
  PaymentStatus,
  { label: string; tone: string; dot: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: 'Pending',
    tone:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60',
    dot: 'bg-amber-500',
    icon: <Clock size={11} />,
  },
  PROCESSING: {
    label: 'Processing',
    tone:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60',
    dot: 'bg-blue-500',
    icon: <Loader2 size={11} />,
  },
  SUCCESS: {
    label: 'Success',
    tone:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60',
    dot: 'bg-emerald-500',
    icon: <CheckCircle size={11} />,
  },
  FAILED: {
    label: 'Failed',
    tone:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60',
    dot: 'bg-rose-500',
    icon: <XCircle size={11} />,
  },
  CANCELLED: {
    label: 'Cancelled',
    tone:
      'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-gray-400 dark:bg-slate-500',
    icon: <Ban size={11} />,
  },
  EXPIRED: {
    label: 'Expired',
    tone:
      'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-gray-400 dark:bg-slate-500',
    icon: <AlertTriangle size={11} />,
  },
  REFUNDED: {
    label: 'Refunded',
    tone:
      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-900/60',
    dot: 'bg-violet-500',
    icon: <RotateCcw size={11} />,
  },
};

const PROVIDER_META: Record<
  string,
  { label: string; icon: React.ReactNode; tone: string }
> = {
  MTN_MOMO: {
    label: 'MTN MoMo',
    icon: <Smartphone size={11} />,
    tone:
      'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900/60',
  },
  ORANGE_MONEY: {
    label: 'Orange Money',
    icon: <Smartphone size={11} />,
    tone:
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/60',
  },
  STRIPE: {
    label: 'Stripe',
    icon: <CreditCard size={11} />,
    tone:
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/60',
  },
  PAYPAL: {
    label: 'PayPal',
    icon: <Wallet size={11} />,
    tone:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60',
  },
  CASH: {
    label: 'Cash',
    icon: <Banknote size={11} />,
    tone:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60',
  },
};

const METHOD_LABEL: Record<string, string> = {
  MOBILE_MONEY: 'Mobile Money',
  CARD: 'Card',
  BANK_TRANSFER: 'Bank Transfer',
  CASH: 'Cash',
};

const shortId = (id?: string) => (id ? id.slice(0, 8) : '—');

const formatAmount = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'XAF',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

const getStatusMeta = (status: string) =>
  STATUS_META[status as PaymentStatus] ?? {
    label: status,
    tone:
      'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-gray-400 dark:bg-slate-500',
    icon: null,
  };

const getProviderMeta = (provider: string) =>
  PROVIDER_META[provider] ?? {
    label: provider,
    icon: null,
    tone:
      'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

/* ───────────────────────── Skeletons ───────────────────────── */

const SkeletonBlock: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className = '', style }) => (
  <div
    className={`animate-pulse rounded bg-gray-200 dark:bg-slate-700 ${className}`}
    style={style}
  />
);

const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100 bg-gray-50 dark:border-slate-800/60 dark:bg-slate-950">
          {['Reference', 'Professional', 'Amount', 'Provider', 'Status', 'When', ''].map(
            (h, i) => (
              <th
                key={i}
                className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 ${
                  i === 6 ? 'text-right' : 'text-left'
                }`}
              >
                {h}
              </th>
            ),
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i}>
            <td className="px-5 py-4"><SkeletonBlock className="h-3 w-24" /></td>
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="rounded-full" style={{ width: 28, height: 28 }} />
                <SkeletonBlock className="h-3 w-24" />
              </div>
            </td>
            <td className="px-5 py-4"><SkeletonBlock className="h-3 w-20" /></td>
            <td className="px-5 py-4"><SkeletonBlock className="h-5 w-24 rounded-full" /></td>
            <td className="px-5 py-4"><SkeletonBlock className="h-5 w-20 rounded-full" /></td>
            <td className="px-5 py-4"><SkeletonBlock className="h-3 w-20" /></td>
            <td className="px-5 py-4"><SkeletonBlock className="ml-auto h-8 w-8 rounded-lg" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ───────────────────────── Local UI ───────────────────────── */

const EmptyState: React.FC<{ title: string; description?: string }> = ({
  title,
  description,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="mb-4 rounded-2xl bg-gray-50 p-4 text-gray-400 dark:bg-slate-950 dark:text-slate-500">
      <Inbox size={28} />
    </div>
    <p className="font-semibold text-gray-900 dark:text-slate-100">{title}</p>
    {description && (
      <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-slate-400">
        {description}
      </p>
    )}
  </div>
);

const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative w-full sm:max-w-sm">
    <Search
      size={16}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:focus:bg-slate-900"
    />
  </div>
);

/* ───────────────────────── Badges ───────────────────────── */

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const m = getStatusMeta(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${m.tone}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
};

const ProviderBadge: React.FC<{ provider: string }> = ({ provider }) => {
  const m = getProviderMeta(provider);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${m.tone}`}
    >
      {m.icon}
      {m.label}
    </span>
  );
};

/* ───────────────────────── Payment Drawer ───────────────────────── */

interface DrawerProps {
  payment: ProfessionalPaymentAdmin | null;
  onClose: () => void;
  onRefund: (reason: string) => Promise<void>;
}

const PaymentDrawer: React.FC<DrawerProps> = ({
  payment,
  onClose,
  onRefund,
}) => {
  const [showRefund, setShowRefund] = useState(false);

  useEffect(() => {
    if (!payment) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [payment]);

  useEffect(() => {
    if (!payment) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showRefund) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [payment, showRefund, onClose]);

  if (!payment) return null;

  const meta = getStatusMeta(payment.status);
  const canRefund = payment.status === 'SUCCESS';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        role="dialog"
        aria-modal="true"
        className="fixed right-0 top-0 bottom-0 z-50 flex w-full flex-col bg-white shadow-2xl dark:bg-slate-900 sm:max-w-xl lg:max-w-2xl"
      >
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-slate-800/60">
          <div className={`pointer-events-none absolute inset-x-0 top-0 h-[3px] ${meta.dot}`} />
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
              <Wallet size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-gray-900 dark:text-slate-100">
                Payment details
              </h3>
              <p className="truncate font-mono text-xs text-gray-500 dark:text-slate-400">
                {payment.reference}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-5">
            {/* Amount hero */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/60 p-5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950/60">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Amount
                </p>
                <p className="mt-1 text-3xl font-extrabold tabular-nums text-gray-900 dark:text-slate-100">
                  {formatAmount(payment.amount, payment.currency)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={payment.status} />
                  <ProviderBadge provider={payment.provider} />
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-slate-800/60 dark:bg-slate-950/40 sm:grid-cols-2">
              <Field label="Payment ID" value={payment.id} mono />
              <Field label="Reference" value={payment.reference} mono />
              <Field
                label="Professional ID"
                value={payment.professionalId ?? '—'}
                mono
              />
              <Field label="User ID" value={payment.userId} mono />
              <Field label="Tier ID" value={payment.tierId} mono />
              <Field
                label="Subscription ID"
                value={payment.subscriptionId ?? '—'}
                mono
              />
              <Field
                label="Provider txn"
                value={payment.providerTransactionId ?? '—'}
                mono
              />
              <Field
                label="Method"
                value={METHOD_LABEL[payment.paymentMethod] ?? payment.paymentMethod}
              />
              <Field
                label="Created"
                value={formatDistanceToNow(new Date(payment.createdAt), {
                  addSuffix: true,
                })}
              />
              <Field
                label="Updated"
                value={formatDistanceToNow(new Date(payment.updatedAt), {
                  addSuffix: true,
                })}
              />
              {payment.paidAt && (
                <Field
                  label="Paid at"
                  value={formatDistanceToNow(new Date(payment.paidAt), {
                    addSuffix: true,
                  })}
                />
              )}
              {payment.failedAt && (
                <Field
                  label="Failed at"
                  value={formatDistanceToNow(new Date(payment.failedAt), {
                    addSuffix: true,
                  })}
                />
              )}
            </div>

            {payment.description && (
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Description
                </p>
                <p className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 text-sm text-gray-700 dark:border-slate-800/60 dark:bg-slate-950/40 dark:text-slate-300">
                  {payment.description}
                </p>
              </div>
            )}

            {payment.providerResponse && (
              <JsonBlock
                label="Provider response"
                value={payment.providerResponse}
              />
            )}
            {payment.extraMetadata && (
              <JsonBlock label="Extra metadata" value={payment.extraMetadata} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-gray-100 bg-gray-50/60 px-5 py-3 dark:border-slate-800/60 dark:bg-slate-950/40">
          <p className="text-[11px] text-gray-500 dark:text-slate-400">
            {canRefund
              ? 'This payment can be refunded'
              : 'Only successful payments can be refunded'}
          </p>
          {canRefund && (
            <button
              onClick={() => setShowRefund(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-purple-500 active:scale-[0.98]"
            >
              <RotateCcw size={14} />
              Issue refund
            </button>
          )}
        </div>
      </motion.div>

      {showRefund && (
        <ReasonPrompt
          title="Refund payment"
          description={`${formatAmount(
            payment.amount,
            payment.currency,
          )} · ${payment.reference}`}
          submitLabel="Refund"
          onSubmit={async (reason) => {
            await onRefund(reason);
            setShowRefund(false);
          }}
          onCancel={() => setShowRefund(false)}
        />
      )}
    </>
  );
};

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
        {label}
      </p>
      <p
        className={`mt-0.5 truncate text-sm text-gray-900 dark:text-slate-100 ${
          mono ? 'font-mono text-xs' : ''
        }`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

const JsonBlock: React.FC<{ label: string; value: unknown }> = ({
  label,
  value,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-slate-800/60">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between bg-gray-50 px-3 py-2.5 text-left dark:bg-slate-950"
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-400">
          {label}
        </span>
        <ArrowDownRight
          size={14}
          className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <pre className="max-h-72 overflow-auto border-t border-gray-100 bg-white p-3 font-mono text-[11px] leading-relaxed text-gray-700 dark:border-slate-800/60 dark:bg-slate-900 dark:text-slate-300">
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  );
};

/* ───────────────────────── Stat Card ───────────────────────── */

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  accent: string;
  hint?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  gradient,
  accent,
  hint,
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-5">
    <div
      className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${gradient} opacity-50 blur-2xl transition-opacity duration-300 group-hover:opacity-80`}
    />
    <div
      className={`absolute inset-x-0 top-0 h-[3px] ${accent} opacity-70 transition-opacity group-hover:opacity-100`}
    />
    <div className="relative flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-1.5 truncate text-2xl font-bold tabular-nums text-gray-900 dark:text-slate-100">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {hint && (
          <p className="mt-0.5 text-[11px] text-gray-400 dark:text-slate-500">
            {hint}
          </p>
        )}
      </div>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent} text-white shadow-sm`}
      >
        {icon}
      </div>
    </div>
  </div>
);

/* ───────────────────────── Filters ───────────────────────── */

type StatusFilter = 'all' | PaymentStatus;

interface FilterBarProps {
  status: StatusFilter;
  setStatus: (s: StatusFilter) => void;
  provider: string;
  setProvider: (p: string) => void;
  counts: Record<string, number>;
  disabled?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  status,
  setStatus,
  provider,
  setProvider,
  counts,
  disabled,
}) => {
  const statuses: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'SUCCESS', label: 'Success' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'FAILED', label: 'Failed' },
    { key: 'REFUNDED', label: 'Refunded' },
  ];

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-1.5">
        {statuses.map((s) => {
          const active = status === s.key;
          const count = counts[s.key] ?? 0;
          return (
            <button
              key={s.key}
              onClick={() => setStatus(s.key)}
              disabled={disabled}
              className={`group inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all disabled:opacity-60 ${
                active
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-900/60'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800/60'
              }`}
            >
              {s.label}
              <span
                className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums ${
                  active
                    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Filter size={14} className="text-gray-400 dark:text-slate-500" />
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          disabled={disabled}
          className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none transition-all hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:focus:bg-slate-900"
        >
          <option value="all">All providers</option>
          <option value="MTN_MOMO">MTN MoMo</option>
          <option value="ORANGE_MONEY">Orange Money</option>
          <option value="STRIPE">Stripe</option>
          <option value="PAYPAL">PayPal</option>
          <option value="CASH">Cash</option>
        </select>
      </div>
    </div>
  );
};

/* ───────────────────────── Mobile Card ───────────────────────── */

const PaymentCard: React.FC<{
  payment: ProfessionalPaymentAdmin;
  onOpen: () => void;
}> = ({ payment, onOpen }) => {
  const m = getStatusMeta(payment.status);
  return (
    <button
      onClick={onOpen}
      className="group flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-gray-50/70 dark:hover:bg-slate-800/50"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${m.dot} text-white shadow-sm`}
      >
        <Wallet size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-mono text-sm font-medium text-gray-900 dark:text-slate-100">
            {payment.reference}
          </p>
          <StatusBadge status={payment.status} />
        </div>
        <p className="mt-1 text-lg font-bold tabular-nums text-gray-900 dark:text-slate-100">
          {formatAmount(payment.amount, payment.currency)}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <ProviderBadge provider={payment.provider} />
          <span className="truncate font-mono text-[10px] text-gray-400 dark:text-slate-500">
            pro {shortId(payment.professionalId ?? payment.userId)}
          </span>
        </div>
        <p className="mt-2 text-[11px] text-gray-400 dark:text-slate-500">
          {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
        </p>
      </div>
    </button>
  );
};

/* ───────────────────────── Main Tab ───────────────────────── */

const PaymentsTab: React.FC = () => {
  const { payments, loading, error, refund, refetch } = usePayments();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [selected, setSelected] =
    useState<ProfessionalPaymentAdmin | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: payments.length,
      SUCCESS: 0,
      PENDING: 0,
      PROCESSING: 0,
      FAILED: 0,
      REFUNDED: 0,
      CANCELLED: 0,
      EXPIRED: 0,
    };
    payments.forEach((p) => {
      c[p.status] = (c[p.status] ?? 0) + 1;
    });
    return c;
  }, [payments]);

  const revenue = useMemo(
    () =>
      payments
        .filter((p) => p.status === 'SUCCESS')
        .reduce((sum, p) => sum + p.amount, 0),
    [payments],
  );

  const currency = payments[0]?.currency ?? 'XAF';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return payments.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (providerFilter !== 'all' && p.provider !== providerFilter)
        return false;
      if (!q) return true;
      return (
        p.reference.toLowerCase().includes(q) ||
        (p.providerTransactionId ?? '').toLowerCase().includes(q) ||
        (p.professionalId ?? '').toLowerCase().includes(q) ||
        p.userId.toLowerCase().includes(q) ||
        p.tierId.toLowerCase().includes(q)
      );
    });
  }, [payments, statusFilter, providerFilter, query]);

  if (error) {
    return (
      <EmptyState title="Failed to load payments" description={error} />
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
            <Wallet size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 sm:text-2xl">
              Professional payments
            </h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400 sm:text-base">
              All subscription charges — monitor, inspect, and refund
            </p>
          </div>
        </div>

        <button
          onClick={refetch}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatAmount(revenue, currency)}
          icon={<ArrowUpRight size={16} />}
          gradient="bg-emerald-400/30"
          accent="bg-gradient-to-r from-emerald-500 to-teal-500"
          hint={`${counts.SUCCESS ?? 0} successful`}
        />
        <StatCard
          label="Pending"
          value={(counts.PENDING ?? 0) + (counts.PROCESSING ?? 0)}
          icon={<Clock size={16} />}
          gradient="bg-amber-400/30"
          accent="bg-gradient-to-r from-amber-500 to-orange-500"
          hint="Awaiting confirmation"
        />
        <StatCard
          label="Failed"
          value={counts.FAILED ?? 0}
          icon={<XCircle size={16} />}
          gradient="bg-rose-400/30"
          accent="bg-gradient-to-r from-rose-500 to-red-500"
          hint="Rejected or errored"
        />
        <StatCard
          label="Refunded"
          value={counts.REFUNDED ?? 0}
          icon={<RotateCcw size={16} />}
          gradient="bg-violet-400/30"
          accent="bg-gradient-to-r from-violet-500 to-purple-500"
          hint="Reversed charges"
        />
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by reference, professional, provider txn…"
        />
      </div>

      {/* Filters */}
      <div className="mb-5">
        <FilterBar
          status={statusFilter}
          setStatus={setStatusFilter}
          provider={providerFilter}
          setProvider={setProviderFilter}
          counts={counts}
          disabled={loading}
        />
      </div>

      {/* Content */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <SkeletonTable rows={8} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              payments.length === 0
                ? 'No payments yet'
                : 'No payments match your filters'
            }
            description={
              payments.length === 0
                ? 'Professional subscription charges will appear here.'
                : 'Try adjusting your search or filters.'
            }
          />
        ) : (
          <>
            {/* Mobile */}
            <div className="divide-y divide-gray-100 dark:divide-slate-800/60 md:hidden">
              {filtered.map((p) => (
                <PaymentCard
                  key={p.id}
                  payment={p}
                  onOpen={() => setSelected(p)}
                />
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 dark:border-slate-800/60 dark:bg-slate-950">
                    {[
                      'Reference',
                      'Professional',
                      'Amount',
                      'Provider',
                      'Status',
                      'When',
                      '',
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 ${
                          i === 6 ? 'text-right' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                  <AnimatePresence initial={false}>
                    {filtered.map((p) => (
                      <motion.tr
                        key={p.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setSelected(p)}
                        className="group cursor-pointer transition-colors hover:bg-gray-50/70 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-mono text-xs font-medium text-gray-900 dark:text-slate-100">
                            {p.reference}
                          </p>
                          {p.providerTransactionId && (
                            <p className="mt-0.5 truncate font-mono text-[10px] text-gray-400 dark:text-slate-500">
                              {shortId(p.providerTransactionId)}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-bold text-white shadow-sm">
                              {(p.professionalId ?? p.userId)
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-900 dark:text-slate-100">
                                Professional
                              </p>
                              <p className="truncate font-mono text-[10px] text-gray-500 dark:text-slate-400">
                                {shortId(p.professionalId ?? p.userId)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold tabular-nums text-gray-900 dark:text-slate-100">
                            {formatAmount(p.amount, p.currency)}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <ProviderBadge provider={p.provider} />
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-5 py-4 text-xs whitespace-nowrap text-gray-500 dark:text-slate-400">
                          {formatDistanceToNow(new Date(p.createdAt), {
                            addSuffix: true,
                          })}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(p);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {selected && (
          <PaymentDrawer
            payment={selected}
            onClose={() => setSelected(null)}
            onRefund={async (reason) => {
              const updated = await refund(selected.id, reason);
              setSelected(updated);
              toast.success('Payment refunded');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentsTab;