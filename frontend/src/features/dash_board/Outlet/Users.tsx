import { useState } from "react";
import {
  Search,
  Eye,
  Trash2,
  UserX,
  UserCheck,
  Plus,
  X,
  Users as UsersIcon,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "User" | "Worker";
  status: "Active" | "Suspended";
  joined: string;
}

const initialUsers: User[] = [
  {
    id: 1,
    name: "John Kamga",
    email: "john@example.com",
    role: "Worker",
    status: "Active",
    joined: "Sep 8, 2026",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "User",
    status: "Active",
    joined: "Sep 7, 2026",
  },
  {
    id: 3,
    name: "Daniel Mbarga",
    email: "daniel@example.com",
    role: "Worker",
    status: "Active",
    joined: "Sep 6, 2026",
  },
  {
    id: 4,
    name: "Esther Nguema",
    email: "esther@example.com",
    role: "User",
    status: "Suspended",
    joined: "Sep 5, 2026",
  },
];

export default function Users() {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const [search, setSearch] = useState("");

  // Controls Add User modal
  const [showAddModal, setShowAddModal] = useState(false);

  // Controls View User modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // New user form
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "User" as "User" | "Worker",
  });

  // --------------------------------------------------
  // SEARCH USERS
  // --------------------------------------------------

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // --------------------------------------------------
  // ADD USER
  // --------------------------------------------------

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();

    const user: User = {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "Active",
      joined: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    setUsers((currentUsers) => [user, ...currentUsers]);

    // Reset form
    setNewUser({
      name: "",
      email: "",
      role: "User",
    });

    // Close modal
    setShowAddModal(false);
  };

  // --------------------------------------------------
  // DELETE USER
  // --------------------------------------------------

  const deleteUser = (id: number) => {
    const user = users.find((user) => user.id === id);

    if (!user) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) return;

    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== id)
    );

    // Close view modal if deleted user was open
    if (selectedUser?.id === id) {
      setSelectedUser(null);
    }
  };

  // --------------------------------------------------
  // SUSPEND / ACTIVATE USER
  // --------------------------------------------------

  const toggleStatus = (id: number) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === id
          ? {
              ...user,
              status:
                user.status === "Active"
                  ? "Suspended"
                  : "Active",
            }
          : user
      )
    );

    // Update selected user inside modal
    if (selectedUser?.id === id) {
      setSelectedUser((current) =>
        current
          ? {
              ...current,
              status:
                current.status === "Active"
                  ? "Suspended"
                  : "Active",
            }
          : null
      );
    }
  };

  return (
    <div className="space-y-6">

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div>
          <p className="text-sm font-medium text-blue-600">
            Platform Management
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Users
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage all users registered on APPSTECHLABS.
          </p>
        </div>

        {/* ADD USER BUTTON */}

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
        >
          <Plus size={18} />

          Add User
        </button>
      </div>

      {/* ==================================================
          USER SUMMARY
      ================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* Total */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Total Users
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {users.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UsersIcon size={20} />
            </div>

          </div>
        </div>

        {/* Active */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Active Users
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {users.filter(
              (user) => user.status === "Active"
            ).length}
          </p>
        </div>

        {/* Suspended */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Suspended
          </p>

          <p className="mt-2 text-2xl font-bold text-red-600">
            {users.filter(
              (user) => user.status === "Suspended"
            ).length}
          </p>
        </div>

      </div>

      {/* ==================================================
          SEARCH
      ================================================== */}

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">

        <Search
          size={19}
          className="shrink-0 text-slate-400"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or role..."
          className="w-full bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />

        {search && (
          <button
            onClick={() => setSearch("")}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        )}

      </div>

      {/* ==================================================
          USERS TABLE
      ================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* TABLE HEADER */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

          <div>
            <h2 className="font-semibold text-slate-900">
              All Users
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {filteredUsers.length} user
              {filteredUsers.length !== 1 ? "s" : ""} found
            </p>
          </div>

        </div>

        {/* DESKTOP TABLE */}

        <div className="hidden overflow-x-auto md:block">

          <table className="w-full min-w-[850px]">

            <thead>

              <tr className="border-b border-slate-100 bg-slate-50/70">

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  User
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Joined
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredUsers.map((user) => (

                <tr
                  key={user.id}
                  className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/70"
                >

                  {/* USER */}

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                        {user.name
                          .split(" ")
                          .map((name) => name[0])
                          .join("")}
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-slate-900">
                          {user.name}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                          {user.email}
                        </p>

                      </div>

                    </div>

                  </td>

                  {/* ROLE */}

                  <td className="px-5 py-4">

                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                        user.role === "Worker"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {user.role}
                    </span>

                  </td>

                  {/* STATUS */}

                  <td className="px-5 py-4">

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        user.status === "Active"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >

                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          user.status === "Active"
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }`}
                      />

                      {user.status}

                    </span>

                  </td>

                  {/* JOINED */}

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {user.joined}
                  </td>

                  {/* ACTIONS */}

                  <td className="px-5 py-4">

                    <div className="flex justify-end gap-1">

                      {/* VIEW */}

                      <button
                        onClick={() => setSelectedUser(user)}
                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                        title="View user"
                      >
                        <Eye size={17} />
                      </button>

                      {/* SUSPEND */}

                      <button
                        onClick={() => toggleStatus(user.id)}
                        className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                        title={
                          user.status === "Active"
                            ? "Suspend user"
                            : "Activate user"
                        }
                      >
                        {user.status === "Active" ? (
                          <UserX size={17} />
                        ) : (
                          <UserCheck size={17} />
                        )}
                      </button>

                      {/* DELETE */}

                      <button
                        onClick={() => deleteUser(user.id)}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                        title="Delete user"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* ==================================================
            MOBILE USERS
        ================================================== */}

        <div className="divide-y divide-slate-100 md:hidden">

          {filteredUsers.map((user) => (

            <div
              key={user.id}
              className="p-5"
            >

              <div className="flex items-start gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                  {user.name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </div>

                <div className="min-w-0 flex-1">

                  <p className="font-semibold text-slate-900">
                    {user.name}
                  </p>

                  <p className="mt-1 break-all text-xs text-slate-400">
                    {user.email}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      {user.role}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        user.status === "Active"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {user.status}
                    </span>

                  </div>

                </div>

              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">

                <button
                  onClick={() => setSelectedUser(user)}
                  className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600"
                >
                  <span className="flex items-center gap-1.5">
                    <Eye size={15} />
                    View
                  </span>
                </button>

                <button
                  onClick={() => toggleStatus(user.id)}
                  className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-600"
                >
                  {user.status === "Active"
                    ? "Suspend"
                    : "Activate"}
                </button>

                <button
                  onClick={() => deleteUser(user.id)}
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600"
                >
                  <span className="flex items-center gap-1.5">
                    <Trash2 size={15} />
                    Delete
                  </span>
                </button>

              </div>

            </div>

          ))}

        </div>

        {/* NO RESULTS */}

        {filteredUsers.length === 0 && (
          <div className="px-5 py-16 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <UsersIcon
                size={22}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No users found
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Try changing your search.
            </p>

          </div>
        )}

      </div>

      {/* ==================================================
          VIEW USER MODAL
      ================================================== */}

      {selectedUser && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>
                <p className="text-xs font-medium text-blue-600">
                  User Profile
                </p>

                <h2 className="mt-1 font-bold text-slate-900">
                  User Details
                </h2>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>

            </div>

            {/* USER PROFILE */}

            <div className="p-6">

              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-600">
                  {selectedUser.name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </div>

                <div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedUser.name}
                  </h3>

                  <p className="text-sm text-slate-400">
                    {selectedUser.email}
                  </p>

                </div>

              </div>

              <div className="mt-6 space-y-4">

                <div className="flex items-center justify-between border-b border-slate-100 pb-3">

                  <span className="text-sm text-slate-400">
                    User ID
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    #{selectedUser.id}
                  </span>

                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-3">

                  <span className="text-sm text-slate-400">
                    Role
                  </span>

                  <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                    {selectedUser.role}
                  </span>

                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-3">

                  <span className="text-sm text-slate-400">
                    Status
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedUser.status === "Active"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {selectedUser.status}
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-sm text-slate-400">
                    Joined
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    {selectedUser.joined}
                  </span>

                </div>

              </div>

              {/* MODAL ACTIONS */}

              <div className="mt-7 grid grid-cols-2 gap-3">

                <button
                  onClick={() =>
                    toggleStatus(selectedUser.id)
                  }
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {selectedUser.status === "Active"
                    ? "Suspend User"
                    : "Activate User"}
                </button>

                <button
                  onClick={() =>
                    deleteUser(selectedUser.id)
                  }
                  className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Delete User
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ==================================================
          ADD USER MODAL
      ================================================== */}

      {showAddModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <p className="text-xs font-medium text-blue-600">
                  User Management
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Add New User
                </h2>

              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleAddUser}
              className="space-y-5 p-6"
            >

              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  required
                />

              </div>

              {/* EMAIL */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      email: e.target.value,
                    })
                  }
                  placeholder="user@example.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  required
                />

              </div>

              {/* ROLE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Account Type
                </label>

                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      role: e.target.value as
                        | "User"
                        | "Worker",
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="User">
                    User
                  </option>

                  <option value="Worker">
                    Worker
                  </option>
                </select>

              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Plus size={17} />
                  Add User
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}