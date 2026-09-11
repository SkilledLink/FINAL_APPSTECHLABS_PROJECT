import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  HardDrive,
  RefreshCw,
  Server,
  Users,
  FileText,
  Flag,
  BadgeCheck,
  Download,
  RotateCcw,
  Search,
  XCircle,
  Zap,
  Save,
} from "lucide-react";

type ErrorLog = {
  id: number;
  level: "Error" | "Warning";
  message: string;
  service: string;
  endpoint: string;
  timestamp: string;
  statusCode: number;
};

const errorLogs: ErrorLog[] = [
  {
    id: 1,
    level: "Error",
    message: "Database connection timeout",
    service: "Database",
    endpoint: "/api/users",
    timestamp: "2 minutes ago",
    statusCode: 500,
  },
  {
    id: 2,
    level: "Warning",
    message: "API response time exceeded threshold",
    service: "API",
    endpoint: "/api/jobs",
    timestamp: "18 minutes ago",
    statusCode: 408,
  },
  {
    id: 3,
    level: "Error",
    message: "Failed to process verification request",
    service: "Verification",
    endpoint: "/api/verification",
    timestamp: "42 minutes ago",
    statusCode: 500,
  },
  {
    id: 4,
    level: "Warning",
    message: "Storage usage above 70%",
    service: "Storage",
    endpoint: "System",
    timestamp: "1 hour ago",
    statusCode: 200,
  },
];

export default function SystemCenter() {
  const [activeTab, setActiveTab] = useState<
    "health" | "errors" | "database" | "backup"
  >("health");

  const [selectedError, setSelectedError] =
    useState<ErrorLog | null>(null);

  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const createBackup = () => {
    setIsCreatingBackup(true);

    setTimeout(() => {
      setIsCreatingBackup(false);
      alert("Backup created successfully.");
    }, 1500);
  };

  const refreshSystem = () => {
    alert("System information refreshed.");
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Server size={16} />
            <span>Administration</span>
            <span>/</span>
            <span>System Center</span>
          </div>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            System Center
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor platform health, technical errors, database
            performance and backups.
          </p>
        </div>

        <button
          onClick={refreshSystem}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* OVERALL STATUS */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-100 dark:bg-green-950/60 p-2">
            <CheckCircle2
              size={22}
              className="text-green-600 dark:text-green-400"
            />
          </div>

          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              All systems operational
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Last checked just now
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          System healthy
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex min-w-max">
          <TabButton
            active={activeTab === "health"}
            onClick={() => setActiveTab("health")}
            icon={<Activity size={17} />}
            label="System Health"
          />

          <TabButton
            active={activeTab === "errors"}
            onClick={() => setActiveTab("errors")}
            icon={<AlertTriangle size={17} />}
            label="System Errors"
          />

          <TabButton
            active={activeTab === "database"}
            onClick={() => setActiveTab("database")}
            icon={<Database size={17} />}
            label="Database"
          />

          <TabButton
            active={activeTab === "backup"}
            onClick={() => setActiveTab("backup")}
            icon={<Save size={17} />}
            label="Backup & Recovery"
          />
        </div>
      </div>

      {/* CONTENT */}
      {activeTab === "health" && <SystemHealth />}

      {activeTab === "errors" && (
        <SystemErrors
          errors={errorLogs}
          onView={setSelectedError}
        />
      )}

      {activeTab === "database" && <DatabaseStatus />}

      {activeTab === "backup" && (
        <BackupRecovery
          isCreatingBackup={isCreatingBackup}
          createBackup={createBackup}
        />
      )}

      {/* ERROR DETAILS MODAL */}
      {selectedError && (
        <ErrorDetails
          error={selectedError}
          onClose={() => setSelectedError(null)}
        />
      )}
    </div>
  );
}

/* =========================================================
   SYSTEM HEALTH
========================================================= */

function SystemHealth() {
  return (
    <div className="space-y-5">
      {/* METRICS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Server response"
          value="184 ms"
          subtitle="Average response time"
          icon={<Zap size={19} />}
          status="good"
        />

        <MetricCard
          title="API requests"
          value="18,492"
          subtitle="Requests today"
          icon={<Activity size={19} />}
          status="good"
        />

        <MetricCard
          title="Active users"
          value="326"
          subtitle="Currently online"
          icon={<Users size={19} />}
          status="good"
        />

        <MetricCard
          title="Error rate"
          value="0.42%"
          subtitle="Last 24 hours"
          icon={<AlertTriangle size={19} />}
          status="good"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* SERVER */}
        <SystemCard
          title="Server health"
          description="Current application server performance."
        >
          <HealthRow
            label="Server status"
            value="Operational"
            good
          />

          <HealthRow
            label="Response time"
            value="184 ms"
            good
          />

          <HealthRow
            label="CPU usage"
            value="34%"
            good
          />

          <HealthRow
            label="Memory usage"
            value="58%"
            good
          />

          <HealthRow
            label="Server uptime"
            value="27 days 14 hours"
            good
          />
        </SystemCard>

        {/* DATABASE */}
        <SystemCard
          title="Database performance"
          description="Current database health and performance."
        >
          <HealthRow
            label="Database status"
            value="Connected"
            good
          />

          <HealthRow
            label="Average query time"
            value="42 ms"
            good
          />

          <HealthRow
            label="Active connections"
            value="18"
            good
          />

          <HealthRow
            label="Database size"
            value="1.84 GB"
            good
          />

          <HealthRow
            label="Last backup"
            value="Today, 03:00"
            good
          />
        </SystemCard>
      </div>

      {/* STORAGE */}
      <SystemCard
        title="Storage usage"
        description="Monitor platform file storage."
      >
        <div className="space-y-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2">
                <HardDrive
                  size={19}
                  className="text-slate-600 dark:text-slate-400"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Platform storage
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  68.4 GB used of 100 GB
                </p>
              </div>
            </div>

            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              68.4%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-600 dark:bg-blue-500"
              style={{ width: "68.4%" }}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StorageItem
              label="User uploads"
              value="42.1 GB"
            />

            <StorageItem
              label="Documents"
              value="12.8 GB"
            />

            <StorageItem
              label="System files"
              value="13.5 GB"
            />
          </div>
        </div>
      </SystemCard>

      {/* SERVICES */}
      <SystemCard
        title="Platform services"
        description="Status of critical backend services."
      >
        <ServiceRow
          name="API Server"
          description="FastAPI application"
        />

        <ServiceRow
          name="Database"
          description="Application database"
        />

        <ServiceRow
          name="Authentication"
          description="User authentication service"
        />

        <ServiceRow
          name="File Storage"
          description="Document and media storage"
        />

        <ServiceRow
          name="Notification Service"
          description="Email and platform notifications"
        />
      </SystemCard>
    </div>
  );
}

/* =========================================================
   SYSTEM ERRORS
========================================================= */

function SystemErrors({
  errors,
  onView,
}: {
  errors: ErrorLog[];
  onView: (error: ErrorLog) => void;
}) {
  const [search, setSearch] = useState("");

  const filteredErrors = errors.filter(
    (error) =>
      error.message
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      error.service
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      error.endpoint
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* ERROR SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Errors"
          value="12"
          subtitle="Last 24 hours"
          icon={<XCircle size={19} />}
          status="danger"
        />

        <MetricCard
          title="Warnings"
          value="27"
          subtitle="Last 24 hours"
          icon={<AlertTriangle size={19} />}
          status="warning"
        />

        <MetricCard
          title="Resolved"
          value="84"
          subtitle="This week"
          icon={<CheckCircle2 size={19} />}
          status="good"
        />
      </div>

      {/* ERROR LOG */}
      <SystemCard
        title="System error logs"
        description="Inspect technical errors and determine what is happening."
      >
        <div className="border-b border-slate-200 dark:border-slate-800 p-4">
          <div className="relative max-w-md">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search errors..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredErrors.map((error) => (
            <div
              key={error.id}
              className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className={`mt-0.5 rounded-lg p-2 ${
                    error.level === "Error"
                      ? "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400"
                      : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {error.level === "Error" ? (
                    <XCircle size={18} />
                  ) : (
                    <AlertTriangle size={18} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {error.message}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>{error.service}</span>
                    <span>{error.endpoint}</span>
                    <span>{error.timestamp}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onView(error)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                View details
              </button>
            </div>
          ))}
        </div>
      </SystemCard>
    </div>
  );
}

/* =========================================================
   DATABASE
========================================================= */

function DatabaseStatus() {
  return (
    <div className="space-y-5">
      <SystemCard
        title="Database status"
        description="Monitor the information stored by the platform."
      >
        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
          <DatabaseMetric
            icon={<Users size={18} />}
            label="Users"
            value="2,540"
          />

          <DatabaseMetric
            icon={<FileText size={18} />}
            label="Posts"
            value="8,421"
          />

          <DatabaseMetric
            icon={<Flag size={18} />}
            label="Reports"
            value="386"
          />

          <DatabaseMetric
            icon={<BadgeCheck size={18} />}
            label="Verification records"
            value="820"
          />

          <DatabaseMetric
            icon={<Database size={18} />}
            label="Database size"
            value="1.84 GB"
          />

          <DatabaseMetric
            icon={<Clock3 size={18} />}
            label="Last backup"
            value="Today, 03:00"
          />
        </div>
      </SystemCard>

      <SystemCard
        title="Database health"
        description="Technical database information."
      >
        <HealthRow
          label="Connection"
          value="Connected"
          good
        />

        <HealthRow
          label="Query performance"
          value="42 ms average"
          good
        />

        <HealthRow
          label="Active connections"
          value="18"
          good
        />

        <HealthRow
          label="Database engine"
          value="SQLite"
          good
        />

        <HealthRow
          label="Database status"
          value="Operational"
          good
        />
      </SystemCard>
    </div>
  );
}

/* =========================================================
   BACKUP
========================================================= */

function BackupRecovery({
  isCreatingBackup,
  createBackup,
}: {
  isCreatingBackup: boolean;
  createBackup: () => void;
}) {
  return (
    <div className="space-y-5">
      <SystemCard
        title="Backup status"
        description="Protect platform data with secure database backups."
      >
        <div className="grid gap-4 p-5 md:grid-cols-3">
          <DatabaseMetric
            icon={<Save size={18} />}
            label="Last backup"
            value="Today, 03:00"
          />

          <DatabaseMetric
            icon={<CheckCircle2 size={18} />}
            label="Status"
            value="Successful"
          />

          <DatabaseMetric
            icon={<HardDrive size={18} />}
            label="Backup size"
            value="1.84 GB"
          />
        </div>
      </SystemCard>

      <SystemCard
        title="Create backup"
        description="Create a new backup of the platform database."
      >
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Manual database backup
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              The backup should be stored securely and separately from
              the production database.
            </p>
          </div>

          <button
            onClick={createBackup}
            disabled={isCreatingBackup}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreatingBackup ? (
              <>
                <RefreshCw
                  size={16}
                  className="animate-spin"
                />
                Creating...
              </>
            ) : (
              <>
                <Save size={16} />
                Create Backup
              </>
            )}
          </button>
        </div>
      </SystemCard>

      <SystemCard
        title="Backup history"
        description="Previously created database backups."
      >
        <BackupRow
          date="September 9, 2026 · 03:00"
          size="1.84 GB"
          status="Successful"
        />

        <BackupRow
          date="September 8, 2026 · 03:00"
          size="1.79 GB"
          status="Successful"
        />

        <BackupRow
          date="September 7, 2026 · 03:00"
          size="1.73 GB"
          status="Successful"
        />
      </SystemCard>

      {/* RESTORE */}
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900">
        <div className="border-b border-red-100 dark:border-red-900/40 px-5 py-5">
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={18}
              className="text-red-600 dark:text-red-400"
            />

            <h2 className="font-semibold text-slate-900 dark:text-white">
              Restore backup
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Restoring a backup can replace current platform data.
          </p>
        </div>

        <div className="p-5">
          <div className="rounded-xl bg-red-50 dark:bg-red-950/40 p-4">
            <p className="text-sm font-medium text-red-900 dark:text-red-300">
              Dangerous operation
            </p>

            <p className="mt-1 text-xs leading-5 text-red-700 dark:text-red-400/80">
              A secure implementation should require administrator
              authentication, confirmation and preferably a recent backup
              before allowing a restore.
            </p>
          </div>

          <button
            disabled
            className="mt-4 inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white opacity-50"
          >
            <RotateCcw size={16} />
            Restore Backup
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ERROR DETAILS
========================================================= */

function ErrorDetails({
  error,
  onClose,
}: {
  error: ErrorLog;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-5">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Error Details
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Technical information about this system event.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div
            className={`rounded-xl p-4 ${
              error.level === "Error"
                ? "bg-red-50 dark:bg-red-950/60 text-red-900 dark:text-red-300"
                : "bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300"
            }`}
          >
            <p className="text-sm font-semibold">
              {error.message}
            </p>

            <p className="mt-1 text-xs opacity-90">
              {error.level} · HTTP {error.statusCode}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TechnicalField
              label="Service"
              value={error.service}
            />

            <TechnicalField
              label="HTTP status"
              value={String(error.statusCode)}
            />

            <TechnicalField
              label="Endpoint"
              value={error.endpoint}
            />

            <TechnicalField
              label="Occurred"
              value={error.timestamp}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-900 dark:text-white">
              What may be happening
            </p>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              The administrator can use the service, endpoint,
              timestamp and HTTP status to investigate the problem
              in the backend logs.
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-900 dark:text-white">
              Technical log
            </p>

            <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-300">
{`[${error.timestamp}]
service=${error.service}
endpoint=${error.endpoint}
status=${error.statusCode}
message="${error.message}"`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  status,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  status: "good" | "warning" | "danger";
}) {
  const iconClass = {
    good: "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400",
    warning: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400",
    danger: "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400",
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>

          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {subtitle}
          </p>
        </div>

        <div className={`rounded-lg p-2 ${iconClass[status]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function SystemCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="border-b border-slate-200 dark:border-slate-800 px-5 py-5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {children}
      </div>
    </div>
  );
}

function HealthRow({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>

      <div className="flex items-center gap-2">
        {good && (
          <span className="h-2 w-2 rounded-full bg-green-500" />
        )}

        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {value}
        </span>
      </div>
    </div>
  );
}

function ServiceRow({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {name}
        </p>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-green-500" />

        <span className="text-xs font-medium text-green-700 dark:text-green-400">
          Operational
        </span>
      </div>
    </div>
  );
}

function StorageItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>

      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function DatabaseMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-900 p-4">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        {icon}
        <span className="text-xs">{label}</span>
      </div>

      <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function BackupRow({
  date,
  size,
  status,
}: {
  date: string;
  size: string;
  status: string;
}) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2">
          <Download size={17} className="text-slate-600 dark:text-slate-400" />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {date}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {size}
          </p>
        </div>
      </div>

      <span className="w-fit rounded-full bg-green-50 dark:bg-green-950/60 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-400">
        {status}
      </span>
    </div>
  );
}

function TechnicalField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-900 p-4">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>

      <p className="mt-1 break-all text-sm font-medium text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-medium transition ${
        active
          ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
          : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}