import React, { useEffect, useMemo, useState } from 'react';
import {
  Inbox, Search, X, Filter, Eye,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import type { AuditLog, AuditLogDetail } from '../../types/admin.types';
import { formatDistanceToNow } from 'date-fns';
import ExportMenu, { type ExportFormat } from '../ExportMenu';
import {
  exportToCSV,
  exportToExcel,
  exportToDetailedPDF,
  type ExportRow,
  type ExportSection,
} from '../../../../utils/exportUtils';

// ---------- Skeleton primitives ----------
const SkeletonBlock: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style,
}) => (
  <div className={`animate-pulse rounded bg-gray-200 dark:bg-slate-700 ${className}`} style={style} />
);

const SkeletonTableRow: React.FC = () => (
  <tr>
    <td className="px-5 py-4">
      <div className="space-y-2">
        <SkeletonBlock className="h-3.5 w-20" />
        <SkeletonBlock className="h-2.5 w-16" />
      </div>
    </td>
    <td className="px-5 py-4"><SkeletonBlock className="h-5 w-32 rounded-md" /></td>
    <td className="px-5 py-4"><SkeletonBlock className="h-3 w-28" /></td>
    <td className="px-5 py-4"><SkeletonBlock className="h-3 w-40" /></td>
    <td className="px-5 py-4"><SkeletonBlock className="h-3 w-24" /></td>
    <td className="px-5 py-4"><SkeletonBlock className="h-3 w-20" /></td>
    <td className="px-5 py-4">
      <div className="flex justify-end">
        <SkeletonBlock className="rounded-lg" style={{ width: 32, height: 32 }} />
      </div>
    </td>
  </tr>
);

const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 8 }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800/60">
          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actor</th>
          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Entity</th>
          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Reason</th>
          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">IP</th>
          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">When</th>
          <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} />
        ))}
      </tbody>
    </table>
  </div>
);

const SkeletonCard: React.FC = () => (
  <div className="p-4 space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-2 flex-1 min-w-0">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-2.5 w-20" />
      </div>
      <SkeletonBlock className="h-5 w-28 rounded-md" />
    </div>
    <SkeletonBlock className="h-2.5 w-3/4" />
    <div className="flex items-center gap-2">
      <SkeletonBlock className="h-2.5 w-24" />
      <SkeletonBlock className="h-2.5 w-20" />
    </div>
  </div>
);

const SkeletonCardList: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-800/60">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

const SkeletonDrawer: React.FC = () => (
  <div className="space-y-5">
    <div className="space-y-2">
      <SkeletonBlock className="h-4 w-2/3" />
      <SkeletonBlock className="h-3 w-40" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <SkeletonBlock className="h-2.5 w-16" />
          <SkeletonBlock className="h-3.5 w-24" />
        </div>
      ))}
    </div>
    <div className="space-y-2">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-32 w-full rounded-lg" />
    </div>
    <div className="space-y-2">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-32 w-full rounded-lg" />
    </div>
  </div>
);

// ---------- Local UI ----------
const EmptyState: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 text-center">
    <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl text-gray-400 dark:text-slate-500 mb-4">
      <Inbox size={28} />
    </div>
    <p className="font-semibold text-gray-900 dark:text-slate-100">{title}</p>
    {description && <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-sm">{description}</p>}
  </div>
);

const SearchInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({
  value, onChange, placeholder = 'Search...',
}) => (
  <div className="relative w-full sm:max-w-sm">
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:focus:bg-slate-900"
    />
  </div>
);

const shortId = (id?: string) => (id ? id.slice(0, 8) : '—');

const JsonBlock: React.FC<{ label: string; value: unknown }> = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
      {label}
    </p>
    {value === null || value === undefined ? (
      <p className="text-xs text-gray-400 dark:text-slate-500 italic">None</p>
    ) : (
      <pre className="bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800/60 rounded-lg p-3 text-[11px] leading-relaxed text-gray-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap break-words max-h-72 overflow-y-auto font-mono">
        {JSON.stringify(value, null, 2)}
      </pre>
    )}
  </div>
);

// ---------- Filter bar ----------
interface FilterBarProps {
  entityType: string;
  setEntityType: (v: string) => void;
  action: string;
  setAction: (v: string) => void;
  actorUserId: string;
  setActorUserId: (v: string) => void;
  entityTypeOptions: string[];
  actionOptions: string[];
  onClear: () => void;
  disabled?: boolean;
}

const selectClass =
  'h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none transition-all hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:focus:bg-slate-900';

const FilterBar: React.FC<FilterBarProps> = ({
  entityType, setEntityType,
  action, setAction,
  actorUserId, setActorUserId,
  entityTypeOptions, actionOptions,
  onClear, disabled,
}) => {
  const hasFilters = !!(entityType || action || actorUserId);
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
          <Filter size={12} /> Filters
        </span>

        <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            disabled={disabled}
            className={selectClass}
          >
            <option value="">All entities</option>
            {entityTypeOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>

          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            disabled={disabled}
            className={selectClass}
          >
            <option value="">All actions</option>
            {actionOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>

          <input
            type="text"
            value={actorUserId}
            onChange={(e) => setActorUserId(e.target.value)}
            disabled={disabled}
            placeholder="Actor user ID (UUID)"
            className="h-10 w-full sm:w-64 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-mono dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:focus:bg-slate-900"
          />

          {hasFilters && (
            <button
              onClick={onClear}
              disabled={disabled}
              className="h-10 px-3 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-60"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- Drawer ----------
interface DrawerProps {
  logId: string | null;
  onClose: () => void;
  fetchOne: (id: string) => Promise<AuditLogDetail>;
}

const AuditLogDrawer: React.FC<DrawerProps> = ({ logId, onClose, fetchOne }) => {
  const [detail, setDetail] = useState<AuditLogDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!logId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchOne(logId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load log');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [logId, fetchOne]);

  useEffect(() => {
    if (!logId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [logId]);

  useEffect(() => {
    if (!logId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [logId, onClose]);

  if (!logId) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-xl lg:max-w-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 dark:border-slate-800/60">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100 truncate">Audit log entry</h3>
            {detail && (
              <p className="text-xs text-gray-500 dark:text-slate-400 font-mono truncate">
                {detail.action}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading && <SkeletonDrawer />}

          {error && !loading && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {detail && !loading && !error && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Action</p>
                  <p className="font-mono text-gray-900 dark:text-slate-100 break-words">{detail.action}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">When</p>
                  <p className="text-gray-900 dark:text-slate-100">
                    {formatDistanceToNow(new Date(detail.timestamp), { addSuffix: true })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Actor role</p>
                  <p className="text-gray-900 dark:text-slate-100 capitalize">{detail.actorRole ?? 'system'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Actor user ID</p>
                  <p className="font-mono text-xs text-gray-900 dark:text-slate-100 break-all">
                    {detail.actorUserId ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Entity type</p>
                  <p className="text-gray-900 dark:text-slate-100">{detail.entityType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Entity ID</p>
                  <p className="font-mono text-xs text-gray-900 dark:text-slate-100 break-all">
                    {detail.entityId ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">IP address</p>
                  <p className="font-mono text-xs text-gray-900 dark:text-slate-100">
                    {detail.ipAddress ?? '—'}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500 dark:text-slate-400">User agent</p>
                  <p className="font-mono text-[11px] text-gray-700 dark:text-slate-300 break-all">
                    {detail.userAgent ?? '—'}
                  </p>
                </div>
                {detail.reason && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500 dark:text-slate-400">Reason</p>
                    <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                      {detail.reason}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <JsonBlock label="Old value" value={detail.oldValue} />
                <JsonBlock label="New value" value={detail.newValue} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ---------- Mobile card ----------
interface LogCardProps {
  log: AuditLog;
  onOpen: () => void;
}

const LogCard: React.FC<LogCardProps> = ({ log, onOpen }) => (
  <div
    onClick={onOpen}
    className="p-4 hover:bg-gray-50/70 active:bg-gray-100 dark:hover:bg-slate-800/50 dark:active:bg-slate-800 transition-colors cursor-pointer"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{log.actorRole ?? 'system'}</p>
        <p className="text-xs text-gray-500 dark:text-slate-400 font-mono truncate">{shortId(log.actorUserId)}</p>
      </div>
      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs font-mono shrink-0">
        {log.action}
      </span>
    </div>

    <p className="text-xs text-gray-500 dark:text-slate-400 font-mono mt-2 truncate">
      {log.entityType}:{shortId(log.entityId)}
    </p>

    {log.reason && (
      <p className="text-sm text-gray-700 dark:text-slate-300 mt-1 line-clamp-2">{log.reason}</p>
    )}

    <div className="flex items-center justify-between mt-3 gap-3">
      <span className="text-xs text-gray-400 dark:text-slate-500 font-mono truncate">{log.ipAddress ?? '—'}</span>
      <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
      </span>
    </div>

    <div className="mt-3 flex justify-end" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700"
      >
        <Eye size={14} /> View details
      </button>
    </div>
  </div>
);

// ---------- Export configuration ----------
const EXPORT_COLUMNS = [
  { key: 'timestamp', header: 'Timestamp', width: 22 },
  { key: 'actorRole', header: 'Actor role', width: 14 },
  { key: 'actorUserId', header: 'Actor user ID', width: 38 },
  { key: 'action', header: 'Action', width: 22 },
  { key: 'entityType', header: 'Entity type', width: 16 },
  { key: 'entityId', header: 'Entity ID', width: 38 },
  { key: 'reason', header: 'Reason', width: 50 },
  { key: 'ipAddress', header: 'IP address', width: 16 },
];

const buildTableRows = (logs: AuditLog[]): ExportRow[] =>
  logs.map((l) => ({
    timestamp: new Date(l.timestamp).toLocaleString(),
    actorRole: l.actorRole ?? 'system',
    actorUserId: l.actorUserId ?? '',
    action: l.action,
    entityType: l.entityType,
    entityId: l.entityId ?? '',
    reason: l.reason ?? '',
    ipAddress: l.ipAddress ?? '',
  }));

const buildDetailedSections = (logs: AuditLog[]): ExportSection[] =>
  logs.map((l) => {
    const anyLog = l as any;

    const jsonBlocks: { label: string; value: unknown }[] = [];
    if (anyLog.oldValue !== undefined && anyLog.oldValue !== null) {
      jsonBlocks.push({ label: 'Old value', value: anyLog.oldValue });
    }
    if (anyLog.newValue !== undefined && anyLog.newValue !== null) {
      jsonBlocks.push({ label: 'New value', value: anyLog.newValue });
    }

    return {
      heading: l.action,
      subheading: new Date(l.timestamp).toLocaleString(),
      fields: [
        { label: 'Entry ID', value: l.id },
        { label: 'When', value: new Date(l.timestamp).toLocaleString() },
        { label: 'Actor role', value: l.actorRole ?? 'system' },
        { label: 'Actor user ID', value: l.actorUserId ?? '—' },
        { label: 'Entity type', value: l.entityType },
        { label: 'Entity ID', value: l.entityId ?? '—' },
        { label: 'IP address', value: l.ipAddress ?? '—' },
        ...(anyLog.userAgent
          ? [{ label: 'User agent', value: anyLog.userAgent }]
          : []),
        { label: 'Reason', value: l.reason ?? '—' },
      ],
      jsonBlocks,
    };
  });

// ---------- Tab ----------
const AuditLogsTab: React.FC = () => {
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [actorUserId, setActorUserId] = useState('');

  const { logs, loading, error, fetchOne } = useAuditLogs({
    entityType: entityType || undefined,
    action: action || undefined,
    actorUserId: actorUserId.trim() || undefined,
  });

  const [query, setQuery] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const entityTypeOptions = useMemo(() => {
    const s = new Set<string>();
    logs.forEach((l) => s.add(l.entityType));
    return Array.from(s).sort();
  }, [logs]);

  const actionOptions = useMemo(() => {
    const s = new Set<string>();
    logs.forEach((l) => s.add(l.action));
    return Array.from(s).sort();
  }, [logs]);

  const filtered = useMemo(
    () =>
      logs.filter(
        (l) =>
          l.description.toLowerCase().includes(query.toLowerCase()) ||
          l.action.toLowerCase().includes(query.toLowerCase()) ||
          (l.actorRole ?? '').toLowerCase().includes(query.toLowerCase()),
      ),
    [logs, query],
  );

  const clearFilters = () => {
    setEntityType('');
    setAction('');
    setActorUserId('');
  };

  const handleExport = async (format: ExportFormat) => {
    if (isExporting) return;

    if (filtered.length === 0) {
      toast.info('Nothing to export for the current filters');
      return;
    }

    const dateStamp = new Date().toISOString().slice(0, 10);
    const baseName = `audit-logs-${dateStamp}`;

    const activeFilters: string[] = [];
    if (entityType) activeFilters.push(`Entity: ${entityType}`);
    if (action) activeFilters.push(`Action: ${action}`);
    if (actorUserId.trim())
      activeFilters.push(`Actor: ${actorUserId.trim().slice(0, 8)}…`);
    if (query.trim()) activeFilters.push(`Search: "${query.trim()}"`);

    setIsExporting(true);
    try {
      if (format === 'csv') {
        await exportToCSV(baseName, EXPORT_COLUMNS, buildTableRows(filtered));
      } else if (format === 'excel') {
        await exportToExcel(
          baseName,
          EXPORT_COLUMNS,
          buildTableRows(filtered),
          'Audit Logs',
        );
      } else {
        await exportToDetailedPDF(baseName, buildDetailedSections(filtered), {
          title: 'Audit Log',
          subtitle: [
            `Generated: ${new Date().toLocaleString()}`,
            `${filtered.length} entr${filtered.length === 1 ? 'y' : 'ies'}`,
            activeFilters.length ? activeFilters.join(' · ') : 'No filters',
          ].join('  ·  '),
        });
      }
      toast.success(`${format.toUpperCase()} downloaded`);
    } catch (e) {
      console.error('Export failed:', e);
      toast.error(`Failed to export ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (error) return <EmptyState title="Failed to load audit logs" description={error} />;

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">Audit Logs</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 mt-1">
            Track all administrator actions on the platform
          </p>
        </div>
        <ExportMenu onExport={handleExport} disabled={isExporting || loading} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Search actions..." />
      </div>

      <FilterBar
        entityType={entityType}
        setEntityType={setEntityType}
        action={action}
        setAction={setAction}
        actorUserId={actorUserId}
        setActorUserId={setActorUserId}
        entityTypeOptions={entityTypeOptions}
        actionOptions={actionOptions}
        onClear={clearFilters}
        disabled={loading}
      />

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <>
            <SkeletonCardList rows={6} />
            <div className="hidden md:block">
              <SkeletonTable rows={8} />
            </div>
          </>
        ) : filtered.length === 0 ? (
          <EmptyState title="No audit logs found" description="Try adjusting your filters." />
        ) : (
          <>
            <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-800/60">
              {filtered.map((l: AuditLog) => (
                <LogCard
                  key={l.id}
                  log={l}
                  onOpen={() => setDetailId(l.id)}
                />
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actor</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Entity</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Reason</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">IP</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">When</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                  {filtered.map((l: AuditLog) => (
                    <tr
                      key={l.id}
                      onClick={() => setDetailId(l.id)}
                      className="hover:bg-gray-50/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{l.actorRole ?? 'system'}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">{shortId(l.actorUserId)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs font-mono">
                          {l.action}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 dark:text-slate-400 font-mono whitespace-nowrap">
                        {l.entityType}:{shortId(l.entityId)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 max-w-xs truncate">
                        {l.reason ?? '—'}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 dark:text-slate-400 font-mono whitespace-nowrap">{l.ipAddress ?? '—'}</td>
                      <td className="px-5 py-4 text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(l.timestamp), { addSuffix: true })}
                      </td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setDetailId(l.id)}
                          className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                          title="Details"
                          aria-label="View details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <AuditLogDrawer
        logId={detailId}
        onClose={() => setDetailId(null)}
        fetchOne={fetchOne}
      />
    </div>
  );
};

export default AuditLogsTab;