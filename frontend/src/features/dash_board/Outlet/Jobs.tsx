import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Search,
  MapPin,
  Users,
  Trash2,
  Eye,
  X,
  Filter,
} from "lucide-react";

interface Job {
  id: number;
  title: string;
  category: string;
  location: string;
  description: string;
  applicants: number;
  status: "Open" | "In Progress" | "Completed";
  postedBy: string;
  date: string;
}

const initialJobs: Job[] = [
  {
    id: 1,
    title: "Electrical Installation",
    category: "Electrician",
    location: "Douala",
    description:
      "Installation of electrical wiring for a residential building.",
    applicants: 12,
    status: "Open",
    postedBy: "John Kamga",
    date: "Sep 8, 2026",
  },
  {
    id: 2,
    title: "House Plumbing",
    category: "Plumber",
    location: "Yaoundé",
    description:
      "Complete plumbing installation for a new house.",
    applicants: 8,
    status: "Open",
    postedBy: "Sarah Johnson",
    date: "Sep 7, 2026",
  },
  {
    id: 3,
    title: "Furniture Repair",
    category: "Carpenter",
    location: "Bonapriso",
    description:
      "Repair and restoration of wooden furniture.",
    applicants: 5,
    status: "In Progress",
    postedBy: "Daniel Mbarga",
    date: "Sep 6, 2026",
  },
  {
    id: 4,
    title: "Vehicle Maintenance",
    category: "Mechanic",
    location: "Bastos",
    description:
      "General maintenance and mechanical inspection.",
    applicants: 14,
    status: "Open",
    postedBy: "Paul Mvondo",
    date: "Sep 5, 2026",
  },
];

export default function Jobs() {
  const [jobs, setJobs] = useState(initialJobs);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filter, setFilter] = useState("All");

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.category.toLowerCase().includes(search.toLowerCase()) ||
        job.location.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || job.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [jobs, search, filter]);

  const deleteJob = (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) return;

    setJobs((current) =>
      current.filter((job) => job.id !== id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-blue-600">
          Marketplace
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Jobs
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View and manage all jobs available on the platform.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 px-3">
          <Search size={18} className="text-slate-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs, categories or locations..."
            className="w-full py-2.5 text-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={17} className="text-slate-400" />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
          >
            <option>All</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>
      </div>

      {/* Jobs */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Available Jobs
          </h2>

          <p className="text-xs text-slate-400">
            {filteredJobs.length} jobs found
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 lg:flex-row lg:items-center"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BriefcaseBusiness size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900">
                  {job.title}
                </h3>

                <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                  <span>{job.category}</span>

                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {job.location}
                  </span>

                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {job.applicants} applicants
                  </span>
                </div>
              </div>

              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                  job.status === "Open"
                    ? "bg-emerald-50 text-emerald-600"
                    : job.status === "In Progress"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {job.status}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedJob(job)}
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100"
                  title="View"
                >
                  <Eye size={17} />
                </button>

                <button
                  onClick={() => deleteJob(job.id)}
                  className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Job details */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="font-bold text-slate-900">
                Job Details
              </h2>

              <button
                onClick={() => setSelectedJob(null)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="text-xs text-slate-400">Job title</p>
                <p className="mt-1 font-semibold">
                  {selectedJob.title}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Category</p>
                <p className="mt-1">{selectedJob.category}</p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Location</p>
                <p className="mt-1">{selectedJob.location}</p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Description
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {selectedJob.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">
                    Applicants
                  </p>

                  <p className="mt-1 font-semibold">
                    {selectedJob.applicants}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Posted by
                  </p>

                  <p className="mt-1 font-semibold">
                    {selectedJob.postedBy}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}