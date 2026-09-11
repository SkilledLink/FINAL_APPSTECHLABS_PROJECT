import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Eye,
  Trash2,
  UserX,
  UserCheck,
  Plus,
  X,
  Users as UsersIcon,
  Shield,
  Mail,
  Calendar
} from "lucide-react";

// --- Types & Initial Data ---
interface User {
  id: number;
  name: string;
  email: string;
  role: "User" | "Worker";
  status: "Active" | "Suspended";
  joined: string;
}

const initialUsers: User[] = [
  { id: 1, name: "John Kamga", email: "john@example.com", role: "Worker", status: "Active", joined: "Sep 8, 2026" },
  { id: 2, name: "Sarah Johnson", email: "sarah@example.com", role: "User", status: "Active", joined: "Sep 7, 2026" },
  { id: 3, name: "Daniel Mbarga", email: "daniel@example.com", role: "Worker", status: "Active", joined: "Sep 6, 2026" },
  { id: 4, name: "Esther Nguema", email: "esther@example.com", role: "User", status: "Suspended", joined: "Sep 5, 2026" },
];

// --- Helpers ---
const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border dark:border-indigo-800/50",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border dark:border-emerald-800/50",
    "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 dark:border dark:border-amber-800/50",
    "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border dark:border-blue-800/50",
    "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:border dark:border-rose-800/50"
  ];
  const charCode = name.charCodeAt(0) + (name.charCodeAt(name.length - 1) || 0);
  return colors[charCode % colors.length];
};

// --- Animations ---
const springTransition = { type: "spring", stiffness: 400, damping: 30 };
const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

export default function Users() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [newUser, setNewUser] = useState({ name: "", email: "", role: "User" as "User" | "Worker" });

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query) || 
      user.role.toLowerCase().includes(query)
    );
  }, [users, search]);

  const activeUsersCount = useMemo(() => users.filter(u => u.status === "Active").length, [users]);
  const suspendedUsersCount = useMemo(() => users.filter(u => u.status === "Suspended").length, [users]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const user: User = {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "Active",
      joined: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    
    setUsers(prev => [user, ...prev]);
    setNewUser({ name: "", email: "", role: "User" });
    setShowAddModal(false);
  };

  const deleteUser = (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    setUsers(prev => prev.filter(u => u.id !== id));
    if (selectedUser?.id === id) setSelectedUser(null);
  };

  const toggleStatus = (id: number) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, status: user.status === "Active" ? "Suspended" : "Active" } : user
    ));
    if (selectedUser?.id === id) {
      setSelectedUser(prev => prev ? { ...prev, status: prev.status === "Active" ? "Suspended" : "Active" } : null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
        
        {/* HEADER SECTION */}
        <motion.header 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="space-y-1">
            <motion.div variants={fadeUp} className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
              <Shield size={16} />
              <span>Platform Administration</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              User Directory
            </motion.h1>
            <motion.p variants={fadeUp} className="text-sm text-slate-500 dark:text-slate-400">
              Manage your team members and platform users across the application.
            </motion.p>
          </div>

          <motion.button
            variants={fadeUp}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-white dark:focus-visible:ring-offset-slate-950"
          >
            <Plus size={16} />
            <span>Add New User</span>
          </motion.button>
        </motion.header>

        {/* METRICS GRID */}
        <motion.div 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {[
            { label: "Total Users", value: users.length, icon: UsersIcon, color: "text-slate-600 dark:text-slate-400" },
            { label: "Active Now", value: activeUsersCount, icon: UserCheck, color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Suspended", value: suspendedUsersCount, icon: UserX, color: "text-rose-600 dark:text-rose-400" },
          ].map((stat, i) => (
            <motion.div key={i} variants={fadeUp} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/50">
              <dt className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                <stat.icon size={16} className={stat.color} />
                {stat.label}
              </dt>
              <dd className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {stat.value}
              </dd>
            </motion.div>
          ))}
        </motion.div>

        {/* MAIN CONTENT AREA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          
          {/* SEARCH BAR */}
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, email or role..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  <X size={14} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* DATA TABLE */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">User Details</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date Added</th>
                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <AnimatePresence mode="popLayout">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <motion.tr
                          layout
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          transition={springTransition}
                          key={user.id}
                          className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(user.name)}`}>
                                {getInitials(user.name)}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                                <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                              user.role === "Worker" 
                                ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20" 
                                : "bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${user.status === "Active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                              <span className="font-medium text-slate-700 dark:text-slate-300">{user.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            {user.joined}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                              <button onClick={() => setSelectedUser(user)} className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400" title="View details">
                                <Eye size={16} />
                              </button>
                              <button onClick={() => toggleStatus(user.id)} className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-amber-600 dark:hover:bg-slate-800 dark:hover:text-amber-400" title={user.status === "Active" ? "Suspend user" : "Activate user"}>
                                {user.status === "Active" ? <UserX size={16} /> : <UserCheck size={16} />}
                              </button>
                              <button onClick={() => deleteUser(user.id)} className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400" title="Delete user">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td colSpan={5} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                            <Search size={20} className="text-slate-400" />
                          </div>
                          <p className="text-base font-medium text-slate-900 dark:text-white">No users found</p>
                          <p className="mt-1 text-sm">We couldn't find anyone matching "{search}"</p>
                          <button onClick={() => setSearch("")} className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                            Clear search
                          </button>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* MODALS */}
        <AnimatePresence>
          {/* ADD USER MODAL */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-slate-950/70">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={springTransition}
                className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add New User</h2>
                  <button onClick={() => setShowAddModal(false)} className="rounded-md p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X size={16} />
                  </button>
                </div>
                <form onSubmit={handleAddUser} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                      <input autoFocus required type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="e.g. John Doe" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                      <input required type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="john@example.com" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(["User", "Worker"] as const).map(role => (
                          <button
                            key={role} type="button"
                            onClick={() => setNewUser({ ...newUser, role })}
                            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                              newUser.role === role 
                                ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400" 
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900"
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex gap-3">
                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900">
                      Create User
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* VIEW DETAILS MODAL */}
          {selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-slate-950/70">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={springTransition}
                className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10"
              >
                <div className="relative h-24 bg-gradient-to-r from-blue-600 to-indigo-600">
                  <button onClick={() => setSelectedUser(null)} className="absolute right-4 top-4 rounded-full bg-black/20 p-1.5 text-white backdrop-blur-md hover:bg-black/40 transition">
                    <X size={16} />
                  </button>
                </div>
                
                <div className="px-6 pb-6 pt-0">
                  <div className="relative -mt-10 mb-4 flex justify-between">
                    <div className={`flex h-20 w-20 items-center justify-center rounded-xl border-4 border-white text-2xl font-bold shadow-sm dark:border-slate-900 ${getAvatarColor(selectedUser.name)}`}>
                      {getInitials(selectedUser.name)}
                    </div>
                    <div className="mt-12">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        selectedUser.status === "Active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                      }`}>
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUser.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{selectedUser.role} Account</p>
                  </div>

                  <div className="mt-6 space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail size={16} className="text-slate-400 dark:text-slate-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar size={16} className="text-slate-400 dark:text-slate-500" />
                      <span className="text-slate-600 dark:text-slate-400">Joined <span className="font-medium text-slate-700 dark:text-slate-300">{selectedUser.joined}</span></span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button onClick={() => toggleStatus(selectedUser.id)} className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                      {selectedUser.status === "Active" ? <UserX size={16} /> : <UserCheck size={16} />}
                      {selectedUser.status === "Active" ? "Suspend" : "Activate"}
                    </button>
                    <button onClick={() => deleteUser(selectedUser.id)} className="flex items-center justify-center gap-2 rounded-lg bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20">
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}