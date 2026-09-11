import { useMemo, useState, type ReactNode } from "react";
import {
  Search,
  Flag,
  Eye,
  X,
  User,
  FileText,
  BriefcaseBusiness,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  XCircle,
  ShieldAlert,
  Ban,
  Trash2,
  MessageSquare,
  UserX,
  MoreVertical,
} from "lucide-react";

type ReportStatus =
  | "Pending"
  | "Investigating"
  | "Resolved"
  | "Dismissed";

type ReportType =
  | "Post"
  | "Worker"
  | "User"
  | "Inappropriate Content"
  | "Spam"
  | "Fraud / Scam"
  | "Harassment"
  | "Fake Profile";

interface Report {
  id: number;
  type: ReportType;
  reason: string;
  description: string;
  status: ReportStatus;
  reportedBy: string;
  reporterEmail: string;
  reportedUser: string;
  reportedUserEmail: string;
  reportedContent: string;
  date: string;
  location: string;
  evidence?: string;
  previousReports: number;
}

const initialReports: Report[] = [
  {
    id: 1,
    type: "Fraud / Scam",
    reason: "Suspicious job request",
    description:
      "This user is asking workers to send money before they can start the job.",
    status: "Pending",
    reportedBy: "Daniel Mbarga",
    reporterEmail: "daniel@example.com",
    reportedUser: "Sarah Johnson",
    reportedUserEmail: "sarah@example.com",
    reportedContent:
      "Send 50,000 FCFA before coming to the work location.",
    date: "Sep 8, 2026",
    location: "Douala",
    evidence: "screenshot-scam-message.png",
    previousReports: 2,
  },
  {
    id: 2,
    type: "Fake Profile",
    reason: "Profile information appears false",
    description:
      "The reported user appears to be using professional information that does not belong to them.",
    status: "Investigating",
    reportedBy: "John Kamga",
    reporterEmail: "john@example.com",
    reportedUser: "Michael Tchoumi",
    reportedUserEmail: "michael@example.com",
    reportedContent:
      "Profile claims to have 15 years of experience but provides no proof.",
    date: "Sep 7, 2026",
    location: "Yaoundé",
    previousReports: 1,
  },
  {
    id: 3,
    type: "Spam",
    reason: "Repeated promotional posts",
    description:
      "The same promotional message has been posted multiple times.",
    status: "Pending",
    reportedBy: "Sarah Johnson",
    reporterEmail: "sarah@example.com",
    reportedUser: "Paul Ngassa",
    reportedUserEmail: "paul@example.com",
    reportedContent:
      "Get cheap services today! Contact us now! Get cheap services today!",
    date: "Sep 6, 2026",
    location: "Buea",
    previousReports: 4,
  },
  {
    id: 4,
    type: "Harassment",
    reason: "Offensive messages",
    description:
      "The reported user repeatedly sent offensive messages to another user.",
    status: "Resolved",
    reportedBy: "Emmanuel Foko",
    reporterEmail: "emmanuel@example.com",
    reportedUser: "Kevin Mbi",
    reportedUserEmail: "kevin@example.com",
    reportedContent:
      "Multiple offensive and threatening messages were reported.",
    date: "Sep 5, 2026",
    location: "Douala",
    evidence: "chat-evidence.png",
    previousReports: 0,
  },
  {
    id: 5,
    type: "Post",
    reason: "Inappropriate content",
    description:
      "The post contains content that violates the platform community rules.",
    status: "Dismissed",
    reportedBy: "Alice Mba",
    reporterEmail: "alice@example.com",
    reportedUser: "John Kamga",
    reportedUserEmail: "john@example.com",
    reportedContent:
      "Post containing inappropriate information.",
    date: "Sep 4, 2026",
    location: "Limbe",
    previousReports: 0,
  },
];

export default function Reports() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | ReportStatus>("All");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<
    "warning" | "suspend" | "remove" | "dismiss" | null
  >(null);
  const [actionReason, setActionReason] = useState("");

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const searchableText = `
        ${report.type}
        ${report.reason}
        ${report.description}
        ${report.reportedBy}
        ${report.reportedUser}
        ${report.location}
        ${report.reportedContent}
      `.toLowerCase();

      const matchesSearch = searchableText.includes(search.toLowerCase());
      const matchesFilter = filter === "All" || report.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [reports, search, filter]);

  const startInvestigation = (id: number) => {
    setReports((current) =>
      current.map((report) =>
        report.id === id ? { ...report, status: "Investigating" } : report
      )
    );
    setSelectedReport((current) =>
      current?.id === id ? { ...current, status: "Investigating" } : current
    );
  };

  const openActionModal = (
    type: "warning" | "suspend" | "remove" | "dismiss"
  ) => {
    setActionType(type);
    setActionReason("");
    setShowActionModal(true);
  };

  const takeAction = () => {
    if (!selectedReport || !actionType) return;

    let newStatus: ReportStatus = "Resolved";
    if (actionType === "dismiss") {
      newStatus = "Dismissed";
    }

    setReports((current) =>
      current.map((report) =>
        report.id === selectedReport.id
          ? { ...report, status: newStatus }
          : report
      )
    );
    setSelectedReport((current) =>
      current ? { ...current, status: newStatus } : null
    );

    setShowActionModal(false);
    setActionType(null);
    setActionReason("");
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
          Trust & Safety
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Reports
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
          Review reports submitted by users, investigate violations and take appropriate moderation actions.
        </p>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Total Reports"
          value={reports.length}
          icon={<Flag size={18} />}
        />
        <Stat
          label="Pending"
          value={reports.filter((report) => report.status === "Pending").length}
          icon={<Clock3 size={18} />}
        />
        <Stat
          label="Investigating"
          value={reports.filter((report) => report.status === "Investigating").length}
          icon={<ShieldAlert size={18} />}
        />
        <Stat
          label="Resolved"
          value={reports.filter((report) => report.status === "Resolved").length}
          icon={<CheckCircle2 size={18} />}
        />
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 shadow-sm focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-colors">
          <Search size={18} className="shrink-0 text-slate-400 dark:text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports, users, reasons or content..."
            className="w-full py-3.5 text-sm bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "All" | ReportStatus)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 transition-colors"
        >
          <option value="All">All Reports</option>
          <option value="Pending">Pending</option>
          <option value="Investigating">Investigating</option>
          <option value="Resolved">Resolved</option>
          <option value="Dismissed">Dismissed</option>
        </select>
      </div>

      {/* REPORT TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-colors">
        <div className="border-b border-slate-100 dark:border-slate-700 px-5 py-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            User Reports
          </h2>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {filteredReports.length} reports displayed
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Report
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Reported User
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Reported By
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Reason
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Status
                </th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition hover:bg-slate-50/70 dark:hover:bg-slate-700/30"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                        <Flag size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {report.type}
                        </p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          #{report.id} · {report.date}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                        <User size={14} className="text-slate-500 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {report.reportedUser}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          {report.reportedUserEmail}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {report.reportedBy}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {report.reporterEmail}
                    </p>
                  </td>

                  <td className="max-w-[230px] px-5 py-4">
                    <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {report.reason}
                    </p>
                    <p className="mt-1 truncate text-[11px] text-slate-400 dark:text-slate-500">
                      {report.description}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={report.status} />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowDetails(true);
                        }}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                      >
                        <Eye size={15} />
                        Investigate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="px-5 py-16 text-center">
            <Flag size={34} className="mx-auto text-slate-300 dark:text-slate-600" />
            <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
              No reports found
            </h3>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
              Try changing your search or filter.
            </p>
          </div>
        )}
      </div>

      {/* INVESTIGATION MODAL */}
      {showDetails && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 dark:bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 shadow-2xl transition-colors">
            {/* HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-5">
              <div>
                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                  Trust & Safety Investigation
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Report #{selectedReport.id}
                  </h2>
                  <StatusBadge status={selectedReport.status} />
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedReport(null);
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* REPORT SUMMARY */}
              <section>
                <SectionTitle icon={<Flag size={17} />} title="Report Details" />
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Detail label="Report Type" value={selectedReport.type} />
                  <Detail label="Reason" value={selectedReport.reason} />
                  <Detail label="Date Reported" value={selectedReport.date} />
                  <Detail label="Location" value={selectedReport.location} />
                </div>
                <div className="mt-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 transition-colors">
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Report Description
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {selectedReport.description}
                  </p>
                </div>
              </section>

              {/* REPORTED USER */}
              <section>
                <SectionTitle icon={<User size={17} />} title="Reported Account" />
                <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 p-5 bg-white dark:bg-slate-900/50 transition-colors">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <User size={21} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {selectedReport.reportedUser}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {selectedReport.reportedUserEmail}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800 px-4 py-2 transition-colors">
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        Previous Reports
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                        {selectedReport.previousReports}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* REPORTER */}
              <section>
                <SectionTitle icon={<User size={17} />} title="Reported By" />
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Detail label="Reporter" value={selectedReport.reportedBy} />
                  <Detail label="Email" value={selectedReport.reporterEmail} />
                </div>
              </section>

              {/* REPORTED CONTENT */}
              <section>
                <SectionTitle icon={<FileText size={17} />} title="Reported Content" />
                <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-5 transition-colors">
                  <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
                    {selectedReport.reportedContent}
                  </p>
                </div>
              </section>

              {/* EVIDENCE */}
              {selectedReport.evidence && (
                <section>
                  <SectionTitle icon={<FileText size={17} />} title="Evidence" />
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <FileText size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          Evidence File
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {selectedReport.evidence}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Opening ${selectedReport.evidence}`)}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </section>
              )}

              {/* INVESTIGATION ALERT */}
              {selectedReport.status === "Pending" && (
                <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-4 transition-colors">
                  <div className="flex gap-3">
                    <ShieldAlert size={19} className="shrink-0 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                        Investigation required
                      </p>
                      <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-400/90">
                        Review the reported content and account before taking moderation action.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIONS */}
              <div className="border-t border-slate-100 dark:border-slate-700 pt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Moderation Actions
                </p>
                <div className="flex flex-wrap gap-3">
                  {selectedReport.status === "Pending" && (
                    <button
                      onClick={() => startInvestigation(selectedReport.id)}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                    >
                      <ShieldAlert size={16} />
                      Start Investigation
                    </button>
                  )}
                  <button
                    onClick={() => openActionModal("warning")}
                    className="flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5 text-sm font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                  >
                    <AlertTriangle size={16} />
                    Warn User
                  </button>
                  <button
                    onClick={() => openActionModal("suspend")}
                    className="flex items-center gap-2 rounded-xl border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/30 px-4 py-2.5 text-sm font-semibold text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
                  >
                    <Ban size={16} />
                    Suspend User
                  </button>
                  <button
                    onClick={() => openActionModal("remove")}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                    Remove Content
                  </button>
                  <button
                    onClick={() => openActionModal("dismiss")}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <XCircle size={16} />
                    Dismiss Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTION MODAL */}
      {showActionModal && selectedReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 dark:bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                <ShieldAlert size={19} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  {actionType === "warning" && "Warn User"}
                  {actionType === "suspend" && "Suspend User"}
                  {actionType === "remove" && "Remove Content"}
                  {actionType === "dismiss" && "Dismiss Report"}
                </h2>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Record the reason for this moderation action.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter action reason..."
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
              />
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setActionType(null);
                  setActionReason("");
                }}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={takeAction}
                disabled={!actionReason.trim()}
                className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   STAT
============================================================ */

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }: { status: ReportStatus }) {
  const styles: Record<ReportStatus, string> = {
    Pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    Investigating: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    Resolved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    Dismissed: "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400",
  };

  const icons: Record<ReportStatus, ReactNode> = {
    Pending: <Clock3 size={13} />,
    Investigating: <ShieldAlert size={13} />,
    Resolved: <CheckCircle2 size={13} />,
    Dismissed: <XCircle size={13} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${styles[status]}`}
    >
      {icons[status]}
      {status}
    </span>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
        {title}
      </h3>
    </div>
  );
}

/* ============================================================
   DETAIL
============================================================ */

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 transition-colors">
      <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}