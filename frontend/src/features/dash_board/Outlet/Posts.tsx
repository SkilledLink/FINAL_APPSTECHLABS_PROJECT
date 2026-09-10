import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  FileText,
  MapPin,
  X,
  Eye,
  EyeOff,
  RotateCcw,
  MessageCircle,
  Flag,
  User,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  location: string;
  type: "Job" | "Announcement";
  date: string;

  // Admin moderation information
  author: string;
  authorEmail: string;
  status: "Published" | "Hidden";
  reported: boolean;
  reportReason?: string;
  comments: Comment[];
}

const initialPosts: Post[] = [
  {
    id: 1,
    title: "Electrical Installation Job",
    content:
      "We are looking for an experienced electrician for a residential installation.",
    category: "Electrician",
    location: "Douala",
    type: "Job",
    date: "Sep 8, 2026",
    author: "John Kamga",
    authorEmail: "john@example.com",
    status: "Published",
    reported: false,
    comments: [
      {
        id: 1,
        author: "Daniel Mbarga",
        content: "Is this job still available?",
        date: "Sep 8, 2026",
      },
      {
        id: 2,
        author: "Sarah Johnson",
        content: "I am interested in this opportunity.",
        date: "Sep 8, 2026",
      },
    ],
  },

  {
    id: 2,
    title: "Plumbing Work Available",
    content:
      "Experienced plumbers are needed for a new building project.",
    category: "Plumber",
    location: "Yaoundé",
    type: "Job",
    date: "Sep 7, 2026",
    author: "Sarah Johnson",
    authorEmail: "sarah@example.com",
    status: "Published",
    reported: true,
    reportReason: "Suspicious job information",
    comments: [
      {
        id: 3,
        author: "John Kamga",
        content: "How can I apply?",
        date: "Sep 7, 2026",
      },
    ],
  },

  {
    id: 3,
    title: "Carpenter Needed",
    content:
      "A skilled carpenter is required for furniture production.",
    category: "Carpenter",
    location: "Buea",
    type: "Job",
    date: "Sep 6, 2026",
    author: "Daniel Mbarga",
    authorEmail: "daniel@example.com",
    status: "Hidden",
    reported: true,
    reportReason: "Inappropriate content",
    comments: [],
  },
];

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<
    "All" | "Published" | "Hidden" | "Reported"
  >("All");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [selectedPost, setSelectedPost] =
    useState<Post | null>(null);

  const [showComments, setShowComments] = useState(false);

  const [showReportModal, setShowReportModal] =
    useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "",
    location: "",
  });

  // =====================================================
  // FILTER + SEARCH
  // =====================================================

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        `${post.title}
        ${post.content}
        ${post.category}
        ${post.location}
        ${post.author}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "All"
          ? true
          : filter === "Reported"
          ? post.reported
          : post.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [posts, search, filter]);

  // =====================================================
  // CREATE JOB
  // =====================================================

  const publishPost = (e: React.FormEvent) => {
    e.preventDefault();

    const newPost: Post = {
      id: Date.now(),

      title: form.title,

      content: form.content,

      category: form.category,

      location: form.location,

      type: "Job",

      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),

      author: "Administrator",

      authorEmail: "admin@appstechlabs.com",

      status: "Published",

      reported: false,

      comments: [],
    };

    setPosts((current) => [newPost, ...current]);

    setForm({
      title: "",
      content: "",
      category: "",
      location: "",
    });

    setShowCreateModal(false);
  };

  // =====================================================
  // DELETE POST
  // =====================================================

  const deletePost = (id: number) => {
    const post = posts.find((item) => item.id === id);

    if (!post) return;

    const confirmed = window.confirm(
      `Delete "${post.title}" permanently?`
    );

    if (!confirmed) return;

    setPosts((current) =>
      current.filter((post) => post.id !== id)
    );

    setSelectedPost(null);
  };

  // =====================================================
  // HIDE POST
  // =====================================================

  const hidePost = (id: number) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === id
          ? {
              ...post,
              status: "Hidden",
            }
          : post
      )
    );

    if (selectedPost?.id === id) {
      setSelectedPost({
        ...selectedPost,
        status: "Hidden",
      });
    }
  };

  // =====================================================
  // RESTORE POST
  // =====================================================

  const restorePost = (id: number) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === id
          ? {
              ...post,
              status: "Published",
            }
          : post
      )
    );

    if (selectedPost?.id === id) {
      setSelectedPost({
        ...selectedPost,
        status: "Published",
      });
    }
  };

  // =====================================================
  // MARK REPORT AS HANDLED
  // =====================================================

  const handleReport = (id: number) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === id
          ? {
              ...post,
              reported: false,
              reportReason: undefined,
            }
          : post
      )
    );

    setSelectedPost(null);

    setShowReportModal(false);
  };

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

        <div>
          <p className="text-sm font-medium text-blue-600">
            Content Management
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Posts
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Review, moderate and manage jobs and posts
            published on the platform.
          </p>
        </div>

       

      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <Stat
          label="Total Posts"
          value={posts.length}
          icon={<FileText size={18} />}
        />

        <Stat
          label="Published"
          value={
            posts.filter(
              (post) => post.status === "Published"
            ).length
          }
          icon={<CheckCircle2 size={18} />}
        />

        <Stat
          label="Hidden"
          value={
            posts.filter(
              (post) => post.status === "Hidden"
            ).length
          }
          icon={<EyeOff size={18} />}
        />

        <Stat
          label="Reported"
          value={
            posts.filter((post) => post.reported).length
          }
          icon={<Flag size={18} />}
        />

      </div>

      {/* =================================================
          SEARCH + FILTER
      ================================================= */}

      <div className="flex flex-col gap-3 lg:flex-row">

        {/* SEARCH */}

        <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">

          <Search
            size={18}
            className="shrink-0 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts, jobs, categories or authors..."
            className="w-full py-3.5 text-sm outline-none"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-slate-400 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          )}

        </div>

        {/* FILTER */}

        <select
          value={filter}
          onChange={(e) =>
            setFilter(
              e.target.value as
                | "All"
                | "Published"
                | "Hidden"
                | "Reported"
            )
          }
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
        >
          <option value="All">
            All Posts
          </option>

          <option value="Published">
            Published
          </option>

          <option value="Hidden">
            Hidden
          </option>

          <option value="Reported">
            Reported
          </option>
        </select>

      </div>

      {/* =================================================
          POSTS TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

          <div>
            <h2 className="font-semibold text-slate-900">
              All Posts
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {filteredPosts.length} posts displayed
            </p>
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1000px]">

            <thead>

              <tr className="border-b border-slate-100 bg-slate-50/70">

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Post
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Created By
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Location
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reports
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredPosts.map((post) => (

                <tr
                  key={post.id}
                  className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/70"
                >

                  {/* POST */}

                  <td className="px-5 py-4">

                    <div className="flex max-w-[280px] items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <FileText size={17} />
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-slate-900">
                          {post.title}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-400">
                          {post.date}
                        </p>

                      </div>

                    </div>

                  </td>

                  {/* AUTHOR */}

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2">

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                        <User
                          size={14}
                          className="text-slate-500"
                        />
                      </div>

                      <div>

                        <p className="text-xs font-semibold text-slate-800">
                          {post.author}
                        </p>

                        <p className="text-[11px] text-slate-400">
                          {post.authorEmail}
                        </p>

                      </div>

                    </div>

                  </td>

                  {/* CATEGORY */}

                  <td className="px-5 py-4">

                    <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                      {post.category}
                    </span>

                  </td>

                  {/* LOCATION */}

                  <td className="px-5 py-4">

                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={13} />
                      {post.location}
                    </span>

                  </td>

                  {/* STATUS */}

                  <td className="px-5 py-4">

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        post.status === "Published"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >

                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          post.status === "Published"
                            ? "bg-emerald-500"
                            : "bg-slate-400"
                        }`}
                      />

                      {post.status}

                    </span>

                  </td>

                  {/* REPORT */}

                  <td className="px-5 py-4">

                    {post.reported ? (

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                        <Flag size={12} />
                        Reported
                      </span>

                    ) : (

                      <span className="text-xs text-slate-400">
                        None
                      </span>

                    )}

                  </td>

                  {/* ACTIONS */}

                  <td className="px-5 py-4">

                    <div className="flex justify-end gap-1">

                      {/* VIEW */}

                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setShowComments(false);
                        }}
                        title="View post"
                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                      >
                        <Eye size={17} />
                      </button>

                      {/* COMMENTS */}

                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setShowComments(true);
                        }}
                        title="View comments"
                        className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
                      >
                        <MessageCircle size={17} />
                      </button>

                      {/* HIDE / RESTORE */}

                      {post.status === "Published" ? (

                        <button
                          onClick={() =>
                            hidePost(post.id)
                          }
                          title="Hide post"
                          className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                        >
                          <EyeOff size={17} />
                        </button>

                      ) : (

                        <button
                          onClick={() =>
                            restorePost(post.id)
                          }
                          title="Restore post"
                          className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                        >
                          <RotateCcw size={17} />
                        </button>

                      )}

                      {/* DELETE */}

                      <button
                        onClick={() =>
                          deletePost(post.id)
                        }
                        title="Delete post"
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
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

        {/* NO RESULTS */}

        {filteredPosts.length === 0 && (

          <div className="px-5 py-16 text-center">

            <FileText
              size={32}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-900">
              No posts found
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Try changing your search or filter.
            </p>

          </div>

        )}

      </div>

      {/* =================================================
          VIEW POST / COMMENTS MODAL
      ================================================= */}

      {selectedPost && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">

              <div>

                <p className="text-xs font-medium text-blue-600">
                  Post Management
                </p>

                <h2 className="mt-1 font-bold text-slate-900">
                  {showComments
                    ? "Comments"
                    : "Post Details"}
                </h2>

              </div>

              <button
                onClick={() => {
                  setSelectedPost(null);
                  setShowComments(false);
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>

            </div>

            {/* POST INFORMATION */}

            {!showComments ? (

              <div className="p-6">

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText size={21} />
                  </div>

                  <div className="min-w-0 flex-1">

                    <h3 className="text-xl font-bold text-slate-900">
                      {selectedPost.title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Posted {selectedPost.date}
                    </p>

                  </div>

                </div>

                {/* CONTENT */}

                <div className="mt-6 rounded-xl bg-slate-50 p-4">

                  <p className="text-sm leading-7 text-slate-600">
                    {selectedPost.content}
                  </p>

                </div>

                {/* DETAILS */}

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <Detail
                    label="Created By"
                    value={selectedPost.author}
                  />

                  <Detail
                    label="Email"
                    value={selectedPost.authorEmail}
                  />

                  <Detail
                    label="Category"
                    value={selectedPost.category}
                  />

                  <Detail
                    label="Location"
                    value={selectedPost.location}
                  />

                  <Detail
                    label="Type"
                    value={selectedPost.type}
                  />

                  <Detail
                    label="Status"
                    value={selectedPost.status}
                  />

                </div>

                {/* REPORT */}

                {selectedPost.reported && (

                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">

                    <div className="flex gap-3">

                      <AlertTriangle
                        size={19}
                        className="shrink-0 text-red-600"
                      />

                      <div>

                        <p className="text-sm font-semibold text-red-700">
                          This post has been reported
                        </p>

                        <p className="mt-1 text-xs text-red-600">
                          Reason:{" "}
                          {selectedPost.reportReason}
                        </p>

                      </div>

                    </div>

                  </div>

                )}

                {/* ACTIONS */}

                <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">

                  {selectedPost.status ===
                  "Published" ? (

                    <button
                      onClick={() =>
                        hidePost(selectedPost.id)
                      }
                      className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <EyeOff size={16} />
                      Hide Post
                    </button>

                  ) : (

                    <button
                      onClick={() =>
                        restorePost(selectedPost.id)
                      }
                      className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700"
                    >
                      <RotateCcw size={16} />
                      Restore Post
                    </button>

                  )}

                  <button
                    onClick={() => {
                      setShowComments(true);
                    }}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <MessageCircle size={16} />
                    Comments ({selectedPost.comments.length})
                  </button>

                  {selectedPost.reported && (

                    <button
                      onClick={() =>
                        setShowReportModal(true)
                      }
                      className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
                    >
                      <Flag size={16} />
                      Handle Report
                    </button>

                  )}

                  <button
                    onClick={() =>
                      deletePost(selectedPost.id)
                    }
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                    Delete Post
                  </button>

                </div>

              </div>

            ) : (

              /* =================================================
                 COMMENTS
              ================================================= */

              <div className="p-6">

                {selectedPost.comments.length === 0 ? (

                  <div className="py-10 text-center">

                    <MessageCircle
                      size={32}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-600">
                      No comments yet
                    </p>

                  </div>

                ) : (

                  <div className="space-y-4">

                    {selectedPost.comments.map(
                      (comment) => (

                        <div
                          key={comment.id}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                        >

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                              <User size={15} />
                            </div>

                            <div>

                              <p className="text-sm font-semibold text-slate-800">
                                {comment.author}
                              </p>

                              <p className="text-[11px] text-slate-400">
                                {comment.date}
                              </p>

                            </div>

                          </div>

                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {comment.content}
                          </p>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            )}

          </div>

        </div>

      )}

      {/* =================================================
          REPORT MODAL
      ================================================= */}

      {showReportModal && selectedPost && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Flag size={19} />
              </div>

              <div>

                <h2 className="font-bold text-slate-900">
                  Handle Report
                </h2>

                <p className="text-xs text-slate-400">
                  Review the reported post.
                </p>

              </div>

            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">

              <p className="text-sm font-semibold text-slate-800">
                {selectedPost.title}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {selectedPost.reportReason}
              </p>

            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">

              <button
                onClick={() => {
                  hidePost(selectedPost.id);
                  setShowReportModal(false);
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-100"
              >
                <EyeOff size={16} />
                Hide Post & Resolve
              </button>

              <button
                onClick={() =>
                  deletePost(selectedPost.id)
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                <Trash2 size={16} />
                Delete Post
              </button>

              <button
                onClick={() =>
                  handleReport(selectedPost.id)
                }
                className="rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Dismiss Report
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =================================================
          CREATE JOB MODAL
      ================================================= */}

      {showCreateModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <p className="text-xs font-medium text-blue-600">
                  Content Management
                </p>

                <h2 className="mt-1 font-bold text-slate-900">
                  Post a Job
                </h2>

              </div>

              <button
                onClick={() =>
                  setShowCreateModal(false)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>

            </div>

            <form
              onSubmit={publishPost}
              className="space-y-4 p-6"
            >

              <input
                placeholder="Job title"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                required
              />

              <textarea
                placeholder="Describe the job..."
                value={form.content}
                onChange={(e) =>
                  setForm({
                    ...form,
                    content: e.target.value,
                  })
                }
                rows={5}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                required
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <input
                  placeholder="Category e.g. Electrician"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  required
                />

                <input
                  placeholder="Location e.g. Douala"
                  value={form.location}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      location: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  required
                />

              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={17} />
                Publish Job
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


/* ============================================================
   STAT COMPONENT
============================================================ */

interface StatProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

function Stat({
  label,
  value,
  icon,
}: StatProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>

        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

      </div>

    </div>
  );
}


/* ============================================================
   DETAIL COMPONENT
============================================================ */

interface DetailProps {
  label: string;
  value: string;
}

function Detail({
  label,
  value,
}: DetailProps) {
  return (
    <div className="rounded-xl border border-slate-100 p-4">

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}