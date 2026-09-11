import { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  UserCheck,
} from "lucide-react";

interface Worker {
  id: number;
  name: string;
  email: string;
  profession: string;
  location: string;
  status: "Active" | "Suspended";
}

const initialWorkers: Worker[] = [
  {
    id: 1,
    name: "John Kamga",
    email: "john@example.com",
    profession: "Electrician",
    location: "Douala",
    status: "Active",
  },
  {
    id: 2,
    name: "Michael Brown",
    email: "michael@example.com",
    profession: "Plumber",
    location: "Yaoundé",
    status: "Active",
  },
  {
    id: 3,
    name: "Daniel Mbarga",
    email: "daniel@example.com",
    profession: "Carpenter",
    location: "Douala",
    status: "Active",
  },
  {
    id: 4,
    name: "Paul Mvondo",
    email: "paul@example.com",
    profession: "Mechanic",
    location: "Buea",
    status: "Suspended",
  },
];

export default function Workers() {
  const [workers, setWorkers] = useState(initialWorkers);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    profession: "",
    location: "",
  });

  const filteredWorkers = workers.filter((worker) =>
    `${worker.name} ${worker.email} ${worker.profession} ${worker.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const addWorker = (e: React.FormEvent) => {
    e.preventDefault();

    const newWorker: Worker = {
      id: Date.now(),
      ...form,
      status: "Active",
    };

    setWorkers((current) => [newWorker, ...current]);

    setForm({
      name: "",
      email: "",
      profession: "",
      location: "",
    });

    setShowModal(false);
  };

  const deleteWorker = (id: number) => {
    if (!window.confirm("Delete this worker?")) return;

    setWorkers((current) =>
      current.filter((worker) => worker.id !== id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Workforce
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            Workers
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage all skilled workers registered on the platform.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
        >
          <Plus size={18} />
          Add Worker
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 shadow-sm transition-colors">
        <Search size={18} className="text-slate-400 dark:text-slate-500" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search workers..."
          className="w-full py-3 text-sm bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
        />
      </div>

      {/* Workers */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Worker
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Profession
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Location
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredWorkers.map((worker) => (
                <tr
                  key={worker.id}
                  className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 font-bold text-blue-600 dark:text-blue-400">
                        {worker.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {worker.name}
                        </p>

                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {worker.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {worker.profession}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {worker.location}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        worker.status === "Active"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                      }`}
                    >
                      {worker.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors">
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => deleteWorker(worker.id)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Worker Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 dark:bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 p-5">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Add Worker
                </h2>

                <p className="text-xs text-slate-400 dark:text-slate-400">
                  Create a worker profile
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={addWorker} className="space-y-4 p-5">
              <input
                placeholder="Full name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                required
              />

              <input
                placeholder="Profession e.g. Electrician"
                value={form.profession}
                onChange={(e) =>
                  setForm({
                    ...form,
                    profession: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                required
              />

              <input
                placeholder="Location"
                value={form.location}
                onChange={(e) =>
                  setForm({
                    ...form,
                    location: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                required
              />

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors mt-2"
              >
                <UserCheck size={17} />
                Add Worker
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}