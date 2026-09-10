import {
  Users,
  BriefcaseBusiness,
  FileText,
  UserCheck,
  TrendingUp,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  MapPin,
//   Clock,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const activityData = [
  {
    day: "Apr 23",
    users: 480,
    applications: 250,
    posts: 140,
  },
  {
    day: "Apr 24",
    users: 610,
    applications: 410,
    posts: 230,
  },
  {
    day: "Apr 25",
    users: 560,
    applications: 390,
    posts: 200,
  },
  {
    day: "Apr 26",
    users: 820,
    applications: 550,
    posts: 350,
  },
  {
    day: "Apr 27",
    users: 980,
    applications: 650,
    posts: 380,
  },
  {
    day: "Apr 28",
    users: 900,
    applications: 600,
    posts: 390,
  },
  {
    day: "Apr 29",
    users: 760,
    applications: 520,
    posts: 350,
  },
];

const workers = [
  {
    name: "Electrician",
    count: 231,
    percentage: 28,
  },
  {
    name: "Plumber",
    count: 181,
    percentage: 22,
  },
  {
    name: "Carpenter",
    count: 147,
    percentage: 18,
  },
  {
    name: "Mechanic",
    count: 103,
    percentage: 12,
  },
  {
    name: "Welder",
    count: 84,
    percentage: 10,
  },
  {
    name: "Painter",
    count: 56,
    percentage: 7,
  },
  {
    name: "Cleaner",
    count: 41,
    percentage: 5,
  },
];

const recentUsers = [
  {
    name: "John Kamga",
    email: "john@example.com",
    role: "Worker",
    status: "Active",
    joined: "Apr 28, 2025",
  },
  {
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "User",
    status: "Active",
    joined: "Apr 27, 2025",
  },
  {
    name: "Daniel Mbarga",
    email: "daniel@example.com",
    role: "Worker",
    status: "Active",
    joined: "Apr 26, 2025",
  },
  {
    name: "Esther Nguema",
    email: "esther@example.com",
    role: "User",
    status: "Suspended",
    joined: "Apr 25, 2025",
  },
  {
    name: "David Mvondo",
    email: "david@example.com",
    role: "Worker",
    status: "Active",
    joined: "Apr 24, 2025",
  },
];

const recentJobs = [
  {
    title: "Electrical Installation",
    category: "Electrician",
    location: "Douala",
    applicants: 12,
    status: "Open",
  },
  {
    title: "House Plumbing",
    category: "Plumber",
    location: "Yaoundé",
    applicants: 8,
    status: "Open",
  },
  {
    title: "Furniture Repair",
    category: "Carpenter",
    location: "Bonapriso",
    applicants: 5,
    status: "In Progress",
  },
  {
    title: "Vehicle Maintenance",
    category: "Mechanic",
    location: "Bastos",
    applicants: 14,
    status: "Open",
  },
  {
    title: "Wall Painting",
    category: "Painter",
    location: "Akwa",
    applicants: 9,
    status: "Open",
  },
];

export default function Overview() {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600" />

            <span className="text-sm font-medium text-slate-500">
              Platform Overview
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Good morning, Administrator
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here's what's happening on your platform today.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
            Apr 23, 2025 - Apr 29, 2025
          </button>

          <button className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm sm:block">
            Last 7 days
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value="2,540"
          change="+12.5%"
          icon={Users}
        />

        <StatCard
          title="Total Workers"
          value="820"
          change="+8.2%"
          icon={UserCheck}
        />

        <StatCard
          title="Active Jobs"
          value="1,245"
          change="+15.4%"
          icon={BriefcaseBusiness}
        />

        <StatCard
          title="Total Posts"
          value="386"
          change="+6.8%"
          icon={FileText}
        />
      </section>

      {/* Charts + activity */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Activity chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-7">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp
                  size={18}
                  className="text-blue-600"
                />

                <h2 className="font-semibold text-slate-900">
                  Platform Activity
                </h2>
              </div>

              <p className="mt-1 text-xs text-slate-400">
                User signups, job applications and post engagement
                over time.
              </p>
            </div>

            <button className="w-fit rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
              Last 7 days
            </button>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient
                    id="usersGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#2563eb"
                      stopOpacity={0.22}
                    />

                    <stop
                      offset="100%"
                      stopColor="#2563eb"
                      stopOpacity={0}
                    />
                  </linearGradient>

                  <linearGradient
                    id="applicationsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#8b5cf6"
                      stopOpacity={0.15}
                    />

                    <stop
                      offset="100%"
                      stopColor="#8b5cf6"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#eef2f7"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                    fill: "#94a3b8",
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                    fill: "#94a3b8",
                  }}
                />

                <Tooltip
                  contentStyle={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow:
                      "0 10px 30px rgba(15,23,42,0.08)",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="users"
                  name="New Users"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="url(#usersGradient)"
                />

                <Area
                  type="monotone"
                  dataKey="applications"
                  name="Job Applications"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#applicationsGradient)"
                />

                <Area
                  type="monotone"
                  dataKey="posts"
                  name="Post Engagement"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-5 text-xs text-slate-500">
            <Legend color="bg-blue-600" label="New Users" />
            <Legend color="bg-violet-500" label="Job Applications" />
            <Legend color="bg-teal-500" label="Post Engagement" />
          </div>
        </div>

        {/* Worker categories */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-5">
            <h2 className="font-semibold text-slate-900">
              Worker Categories
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Distribution of skilled workers
            </p>
          </div>

          <div className="space-y-4">
            {workers.map((worker) => (
              <div key={worker.name}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">
                    {worker.name}
                  </span>

                  <span className="text-slate-400">
                    {worker.percentage}%
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{
                      width: `${worker.percentage * 3.5}%`,
                    }}
                  />
                </div>

                <p className="mt-1 text-[10px] text-slate-400">
                  {worker.count} workers
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Recent Activity
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Latest platform events
              </p>
            </div>

            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
              View all
            </button>
          </div>

          <div className="space-y-5">
            <ActivityItem
              icon={<UserPlus size={15} />}
              title="New user registered"
              description="John Mba joined the platform"
              time="2m ago"
            />

            <ActivityItem
              icon={<BriefcaseBusiness size={15} />}
              title="New job posted"
              description="Electrical installation"
              time="12m ago"
            />

            <ActivityItem
              icon={<FileText size={15} />}
              title="New post published"
              description="Tips for home electrical safety"
              time="28m ago"
            />

            <ActivityItem
              icon={<CheckCircle2 size={15} />}
              title="Worker verified"
              description="Michael Brown · Plumber"
              time="45m ago"
            />

            <ActivityItem
              icon={<AlertTriangle size={15} />}
              title="Report submitted"
              description="Inappropriate content"
              time="1h ago"
              danger
            />

            <ActivityItem
              icon={<BriefcaseBusiness size={15} />}
              title="New job posted"
              description="House wiring · Yaoundé"
              time="2h ago"
            />
          </div>
        </div>
      </section>

      {/* Tables */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <RecentUsers />

        <RecentJobs />
      </section>
    </div>
  );
}

/* ---------------- STAT CARD ---------------- */

function StatCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={19} />
        </div>

        <span className="text-slate-300">⋮</span>
      </div>

      <p className="mt-5 text-xs font-medium text-slate-500">
        {title}
      </p>

      <div className="mt-1 flex items-end justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </h2>

        <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-emerald-500">
          <TrendingUp size={13} />
          {change}
        </div>
      </div>

      <p className="mt-2 text-[10px] text-slate-400">
        vs. previous 7 days
      </p>
    </div>
  );
}

/* ---------------- LEGEND ---------------- */

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}

/* ---------------- ACTIVITY ---------------- */

function ActivityItem({
  icon,
  title,
  description,
  time,
  danger = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  danger?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={`
          flex h-9 w-9 shrink-0 items-center justify-center rounded-full
          ${
            danger
              ? "bg-red-50 text-red-500"
              : "bg-blue-50 text-blue-600"
          }
        `}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold text-slate-800">
            {title}
          </p>

          <span className="whitespace-nowrap text-[9px] text-slate-400">
            {time}
          </span>
        </div>

        <p className="mt-0.5 truncate text-[10px] text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ---------------- RECENT USERS ---------------- */

function RecentUsers() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
          <h2 className="font-semibold text-slate-900">
            Recent Users
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Recently registered members
          </p>
        </div>

        <button className="text-xs font-medium text-blue-600">
          View all
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Name
              </th>

              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Role
              </th>

              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Status
              </th>

              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Joined
              </th>

              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {recentUsers.map((user) => (
              <tr
                key={user.email}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {user.name}
                      </p>

                      <p className="text-[10px] text-slate-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-3">
                  <span
                    className={`
                    rounded-full px-2 py-1 text-[9px] font-semibold
                    ${
                      user.role === "Worker"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-violet-50 text-violet-600"
                    }
                  `}
                  >
                    {user.role}
                  </span>
                </td>

                <td className="px-5 py-3">
                  <span
                    className={`
                    inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold
                    ${
                      user.status === "Active"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }
                  `}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {user.status}
                  </span>
                </td>

                <td className="px-5 py-3 text-[10px] text-slate-500">
                  {user.joined}
                </td>

                <td className="px-5 py-3 text-slate-400">
                  ⋯
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- RECENT JOBS ---------------- */

function RecentJobs() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
          <h2 className="font-semibold text-slate-900">
            Recent Jobs
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Latest jobs posted on the platform
          </p>
        </div>

        <button className="text-xs font-medium text-blue-600">
          View all
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {recentJobs.map((job) => (
          <div
            key={job.title}
            className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <BriefcaseBusiness size={16} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800">
                {job.title}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-[9px] text-slate-400">
                <span>{job.category}</span>

                <span>•</span>

                <span className="flex items-center gap-1">
                  <MapPin size={9} />
                  {job.location}
                </span>
              </div>
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-[10px] font-semibold text-slate-600">
                {job.applicants}
              </p>

              <p className="text-[9px] text-slate-400">
                applicants
              </p>
            </div>

            <span
              className={`
              rounded-full px-2 py-1 text-[9px] font-semibold
              ${
                job.status === "Open"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-blue-50 text-blue-600"
              }
            `}
            >
              {job.status}
            </span>

            <span className="text-slate-300">⋯</span>
          </div>
        ))}
      </div>
    </div>
  );
}