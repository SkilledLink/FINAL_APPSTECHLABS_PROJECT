import { useMemo, useState, type ReactNode } from "react";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  Clock3,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  User,
  MapPin,
  BriefcaseBusiness,
  CalendarDays,
  Mail,
  Phone,
  X,
  AlertTriangle,
  MessageSquare,
  BadgeCheck,
} from "lucide-react";

type VerificationStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Information Required";

interface VerificationRequest {
  id: number;

  workerName: string;
  email: string;
  phone: string;

  profession: string;
  location: string;

  submittedDate: string;

  status: VerificationStatus;

  profile: {
    fullName: string;
    bio: string;
    location: string;
    experience: string;
  };

  professionalInformation: {
    profession: string;
    specialization: string;
    experience: string;
    company?: string;
  };

  documents: {
    idCard: string;
    certificate: string;
    proofOfExperience: string;
  };

  experience: {
    years: number;
    description: string;
  };

  rejectionReason?: string;
  requestedInformation?: string;

  verifiedBadge: boolean;
}

const initialRequests: VerificationRequest[] = [
  {
    id: 1,
    workerName: "John Kamga",
    email: "john@example.com",
    phone: "+237 690 000 001",

    profession: "Electrician",
    location: "Douala",

    submittedDate: "Sep 8, 2026",

    status: "Pending",

    profile: {
      fullName: "John Kamga",
      bio: "Professional electrician specialized in residential and commercial electrical installations.",
      location: "Douala, Cameroon",
      experience: "5 years",
    },

    professionalInformation: {
      profession: "Electrician",
      specialization: "Residential & Commercial Installation",
      experience: "5 years",
      company: "John Electrical Services",
    },

    documents: {
      idCard: "john-id-card.pdf",
      certificate: "electrician-certificate.pdf",
      proofOfExperience: "experience-letter.pdf",
    },

    experience: {
      years: 5,
      description:
        "Worked on residential electrical installations, commercial buildings and electrical maintenance.",
    },

    verifiedBadge: false,
  },

  {
    id: 2,
    workerName: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+237 690 000 002",

    profession: "Plumber",
    location: "Yaoundé",

    submittedDate: "Sep 7, 2026",

    status: "Approved",

    profile: {
      fullName: "Sarah Johnson",
      bio: "Experienced plumber providing residential plumbing and maintenance services.",
      location: "Yaoundé, Cameroon",
      experience: "7 years",
    },

    professionalInformation: {
      profession: "Plumber",
      specialization: "Residential Plumbing",
      experience: "7 years",
      company: "Sarah Plumbing Services",
    },

    documents: {
      idCard: "sarah-id-card.pdf",
      certificate: "plumbing-certificate.pdf",
      proofOfExperience: "experience-proof.pdf",
    },

    experience: {
      years: 7,
      description:
        "Seven years of experience working on residential plumbing installations and repairs.",
    },

    verifiedBadge: true,
  },

  {
    id: 3,
    workerName: "Daniel Mbarga",
    email: "daniel@example.com",
    phone: "+237 690 000 003",

    profession: "Carpenter",
    location: "Buea",

    submittedDate: "Sep 6, 2026",

    status: "Information Required",

    profile: {
      fullName: "Daniel Mbarga",
      bio: "Carpenter specialized in furniture production and interior woodwork.",
      location: "Buea, Cameroon",
      experience: "4 years",
    },

    professionalInformation: {
      profession: "Carpenter",
      specialization: "Furniture & Interior Woodwork",
      experience: "4 years",
    },

    documents: {
      idCard: "daniel-id-card.pdf",
      certificate: "carpentry-certificate.pdf",
      proofOfExperience: "experience-letter.pdf",
    },

    experience: {
      years: 4,
      description:
        "Four years of experience producing furniture and performing interior woodwork.",
    },

    requestedInformation:
      "Please provide a clearer copy of your professional certificate.",

    verifiedBadge: false,
  },

  {
    id: 4,
    workerName: "Michael Tchoumi",
    email: "michael@example.com",
    phone: "+237 690 000 004",

    profession: "Mechanic",
    location: "Douala",

    submittedDate: "Sep 5, 2026",

    status: "Rejected",

    profile: {
      fullName: "Michael Tchoumi",
      bio: "Automobile mechanic.",
      location: "Douala, Cameroon",
      experience: "2 years",
    },

    professionalInformation: {
      profession: "Mechanic",
      specialization: "Automobile Repair",
      experience: "2 years",
    },

    documents: {
      idCard: "michael-id-card.pdf",
      certificate: "mechanic-certificate.pdf",
      proofOfExperience: "experience-proof.pdf",
    },

    experience: {
      years: 2,
      description: "Automobile maintenance and repair.",
    },

    rejectionReason:
      "The submitted professional certificate could not be verified.",

    verifiedBadge: false,
  },
];

export default function Verification() {
  const [requests, setRequests] =
    useState<VerificationRequest[]>(initialRequests);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<
    "All" | VerificationStatus
  >("All");

  const [selectedRequest, setSelectedRequest] =
    useState<VerificationRequest | null>(null);

  const [showDetails, setShowDetails] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);

  const [showInformationModal, setShowInformationModal] =
    useState(false);

  const [rejectReason, setRejectReason] = useState("");

  const [requestedInformation, setRequestedInformation] =
    useState("");

  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const searchText = `
        ${request.workerName}
        ${request.email}
        ${request.profession}
        ${request.location}
      `.toLowerCase();

      const matchesSearch = searchText.includes(
        search.toLowerCase(),
      );

      const matchesFilter =
        filter === "All" || request.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [requests, search, filter]);

  // =====================================================
  // APPROVE
  // =====================================================

  const approveRequest = (id: number) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id
          ? {
              ...request,
              status: "Approved",
              verifiedBadge: true,
              rejectionReason: undefined,
              requestedInformation: undefined,
            }
          : request,
      ),
    );

    setSelectedRequest((current) =>
      current?.id === id
        ? {
            ...current,
            status: "Approved",
            verifiedBadge: true,
            rejectionReason: undefined,
            requestedInformation: undefined,
          }
        : current,
    );
  };

  // =====================================================
  // REJECT
  // =====================================================

  const rejectRequest = () => {
    if (!selectedRequest || !rejectReason.trim()) return;

    const id = selectedRequest.id;

    setRequests((current) =>
      current.map((request) =>
        request.id === id
          ? {
              ...request,
              status: "Rejected",
              verifiedBadge: false,
              rejectionReason: rejectReason,
            }
          : request,
      ),
    );

    setSelectedRequest((current) =>
      current?.id === id
        ? {
            ...current,
            status: "Rejected",
            verifiedBadge: false,
            rejectionReason: rejectReason,
          }
        : current,
    );

    setRejectReason("");
    setShowRejectModal(false);
  };

  // =====================================================
  // REQUEST INFORMATION
  // =====================================================

  const requestInformation = () => {
    if (
      !selectedRequest ||
      !requestedInformation.trim()
    ) {
      return;
    }

    const id = selectedRequest.id;

    setRequests((current) =>
      current.map((request) =>
        request.id === id
          ? {
              ...request,
              status: "Information Required",
              verifiedBadge: false,
              requestedInformation:
                requestedInformation,
            }
          : request,
      ),
    );

    setSelectedRequest((current) =>
      current?.id === id
        ? {
            ...current,
            status: "Information Required",
            verifiedBadge: false,
            requestedInformation:
              requestedInformation,
          }
        : current,
    );

    setRequestedInformation("");
    setShowInformationModal(false);
  };

  // =====================================================
  // VIEW DOCUMENT
  // =====================================================

  const viewDocument = (documentName: string) => {
    alert(`Document viewer will open: ${documentName}`);
  };

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <p className="text-sm font-medium text-blue-600">
          Trust & Safety
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Worker Verification
        </h1>

        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Review professional information and submitted
          documents before granting verified status to workers.
        </p>
      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Total Requests"
          value={requests.length}
          icon={<ShieldCheck size={19} />}
        />

        <Stat
          label="Pending Review"
          value={
            requests.filter(
              (request) => request.status === "Pending",
            ).length
          }
          icon={<Clock3 size={19} />}
        />

        <Stat
          label="Approved"
          value={
            requests.filter(
              (request) => request.status === "Approved",
            ).length
          }
          icon={<CheckCircle2 size={19} />}
        />

        <Stat
          label="Needs Attention"
          value={
            requests.filter(
              (request) =>
                request.status === "Rejected" ||
                request.status === "Information Required",
            ).length
          }
          icon={<ShieldAlert size={19} />}
        />
      </div>

      {/* =====================================================
          SEARCH + FILTER
      ===================================================== */}

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
          <Search
            size={18}
            className="shrink-0 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workers, professions, email or location..."
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

        <select
          value={filter}
          onChange={(e) =>
            setFilter(
              e.target.value as
                | "All"
                | VerificationStatus,
            )
          }
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
        >
          <option value="All">All Requests</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Information Required">
            Information Required
          </option>
        </select>
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Verification Requests
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {filteredRequests.length} requests displayed
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Professional
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Profession
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Location
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Submitted
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRequests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                >
                  {/* PROFESSIONAL */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <User size={17} />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-slate-900">
                            {request.workerName}
                          </p>

                          {request.verifiedBadge && (
                            <BadgeCheck
                              size={16}
                              className="text-blue-600"
                            />
                          )}
                        </div>

                        <p className="text-xs text-slate-400">
                          {request.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* PROFESSION */}

                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                      <BriefcaseBusiness size={13} />
                      {request.profession}
                    </span>
                  </td>

                  {/* LOCATION */}

                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin size={14} />
                      {request.location}
                    </span>
                  </td>

                  {/* DATE */}

                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarDays size={14} />
                      {request.submittedDate}
                    </span>
                  </td>

                  {/* STATUS */}

                  <td className="px-5 py-4">
                    <StatusBadge
                      status={request.status}
                    />
                  </td>

                  {/* ACTION */}

                  <td className="px-5 py-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetails(true);
                        }}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                      >
                        <Eye size={15} />
                        Review
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="px-5 py-16 text-center">
            <ShieldCheck
              size={34}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-900">
              No verification requests found
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Try changing your search or filter.
            </p>
          </div>
        )}
      </div>

      {/* =====================================================
          REVIEW MODAL
      ===================================================== */}

      {showDetails && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-medium text-blue-600">
                  Verification Review
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <h2 className="font-bold text-slate-900">
                    {selectedRequest.workerName}
                  </h2>

                  {selectedRequest.verifiedBadge && (
                    <BadgeCheck
                      size={19}
                      className="text-blue-600"
                    />
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedRequest(null);
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* STATUS */}

              <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs text-slate-400">
                    Verification Status
                  </p>

                  <div className="mt-2">
                    <StatusBadge
                      status={selectedRequest.status}
                    />
                  </div>
                </div>

                {selectedRequest.verifiedBadge && (
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                    <BadgeCheck size={18} />
                    Verified Professional
                  </div>
                )}
              </div>

              {/* PROFILE INFORMATION */}

              <section>
                <SectionTitle
                  icon={<User size={17} />}
                  title="Profile Information"
                />

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Detail
                    label="Full Name"
                    value={selectedRequest.profile.fullName}
                  />

                  <Detail
                    label="Location"
                    value={selectedRequest.profile.location}
                  />

                  <Detail
                    label="Email"
                    value={selectedRequest.email}
                  />

                  <Detail
                    label="Phone"
                    value={selectedRequest.phone}
                  />
                </div>

                <div className="mt-4 rounded-xl border border-slate-100 p-4">
                  <p className="text-xs text-slate-400">
                    Professional Bio
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedRequest.profile.bio}
                  </p>
                </div>
              </section>

              {/* PROFESSIONAL INFORMATION */}

              <section>
                <SectionTitle
                  icon={<BriefcaseBusiness size={17} />}
                  title="Professional Information"
                />

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Detail
                    label="Profession"
                    value={
                      selectedRequest.professionalInformation
                        .profession
                    }
                  />

                  <Detail
                    label="Specialization"
                    value={
                      selectedRequest.professionalInformation
                        .specialization
                    }
                  />

                  <Detail
                    label="Experience"
                    value={
                      selectedRequest.professionalInformation
                        .experience
                    }
                  />

                  <Detail
                    label="Company"
                    value={
                      selectedRequest.professionalInformation
                        .company || "Independent Professional"
                    }
                  />
                </div>
              </section>

              {/* EXPERIENCE */}

              <section>
                <SectionTitle
                  icon={<BriefcaseBusiness size={17} />}
                  title="Proof of Experience"
                />

                <div className="mt-4 rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <BriefcaseBusiness size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {selectedRequest.experience.years} years
                        of experience
                      </p>

                      <p className="text-xs text-slate-400">
                        Professional experience
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {selectedRequest.experience.description}
                  </p>
                </div>
              </section>

              {/* DOCUMENTS */}

              <section>
                <SectionTitle
                  icon={<FileText size={17} />}
                  title="Submitted Documents"
                />

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <DocumentCard
                    title="ID Card"
                    fileName={
                      selectedRequest.documents.idCard
                    }
                    onView={() =>
                      viewDocument(
                        selectedRequest.documents.idCard,
                      )
                    }
                  />

                  <DocumentCard
                    title="Professional Certificate"
                    fileName={
                      selectedRequest.documents.certificate
                    }
                    onView={() =>
                      viewDocument(
                        selectedRequest.documents.certificate,
                      )
                    }
                  />

                  <DocumentCard
                    title="Proof of Experience"
                    fileName={
                      selectedRequest.documents
                        .proofOfExperience
                    }
                    onView={() =>
                      viewDocument(
                        selectedRequest.documents
                          .proofOfExperience,
                      )
                    }
                  />
                </div>
              </section>

              {/* REQUESTED INFORMATION */}

              {selectedRequest.requestedInformation && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex gap-3">
                    <AlertTriangle
                      size={18}
                      className="shrink-0 text-amber-600"
                    />

                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        Information requested
                      </p>

                      <p className="mt-1 text-sm text-amber-700">
                        {
                          selectedRequest.requestedInformation
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* REJECTION */}

              {selectedRequest.rejectionReason && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="flex gap-3">
                    <XCircle
                      size={18}
                      className="shrink-0 text-red-600"
                    />

                    <div>
                      <p className="text-sm font-semibold text-red-800">
                        Rejection reason
                      </p>

                      <p className="mt-1 text-sm text-red-700">
                        {selectedRequest.rejectionReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIONS */}

              <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                <button
                  onClick={() =>
                    approveRequest(selectedRequest.id)
                  }
                  disabled={
                    selectedRequest.status === "Approved"
                  }
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 size={17} />
                  Approve Verification
                </button>

                <button
                  onClick={() =>
                    setShowInformationModal(true)
                  }
                  className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                >
                  <MessageSquare size={17} />
                  Request Information
                </button>

                <button
                  onClick={() =>
                    setShowRejectModal(true)
                  }
                  disabled={
                    selectedRequest.status === "Rejected"
                  }
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle size={17} />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          REJECT MODAL
      ===================================================== */}

      {showRejectModal && selectedRequest && (
        <ActionModal
          title="Reject Verification"
          description="Provide a reason why this verification request is being rejected."
          icon={<XCircle size={19} />}
          iconClass="bg-red-50 text-red-600"
        >
          <textarea
            value={rejectReason}
            onChange={(e) =>
              setRejectReason(e.target.value)
            }
            placeholder="Enter rejection reason..."
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
          />

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason("");
              }}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              onClick={rejectRequest}
              disabled={!rejectReason.trim()}
              className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reject Verification
            </button>
          </div>
        </ActionModal>
      )}

      {/* =====================================================
          REQUEST INFORMATION MODAL
      ===================================================== */}

      {showInformationModal && selectedRequest && (
        <ActionModal
          title="Request More Information"
          description="Tell the professional what additional information or document is required."
          icon={<MessageSquare size={19} />}
          iconClass="bg-amber-50 text-amber-600"
        >
          <textarea
            value={requestedInformation}
            onChange={(e) =>
              setRequestedInformation(e.target.value)
            }
            placeholder="Example: Please upload a clearer copy of your professional certificate..."
            rows={5}
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
          />

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => {
                setShowInformationModal(false);
                setRequestedInformation("");
              }}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              onClick={requestInformation}
              disabled={!requestedInformation.trim()}
              className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send Request
            </button>
          </div>
        </ActionModal>
      )}
    </div>
  );
}

/* ============================================================
   STAT
============================================================ */

interface StatProps {
  label: string;
  value: number;
  icon: ReactNode;
}

function Stat({ label, value, icon }: StatProps) {
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
   STATUS BADGE
============================================================ */

function StatusBadge({
  status,
}: {
  status: VerificationStatus;
}) {
  const styles: Record<VerificationStatus, string> = {
    Pending: "bg-amber-50 text-amber-700",
    Approved: "bg-emerald-50 text-emerald-700",
    Rejected: "bg-red-50 text-red-700",
    "Information Required":
      "bg-purple-50 text-purple-700",
  };

  const icons: Record<
    VerificationStatus,
    ReactNode
  > = {
    Pending: <Clock3 size={13} />,
    Approved: <CheckCircle2 size={13} />,
    Rejected: <XCircle size={13} />,
    "Information Required": (
      <MessageSquare size={13} />
    ),
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
   DETAIL
============================================================ */

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
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

/* ============================================================
   SECTION TITLE
============================================================ */

function SectionTitle({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h3 className="text-sm font-bold text-slate-900">
        {title}
      </h3>
    </div>
  );
}

/* ============================================================
   DOCUMENT CARD
============================================================ */

function DocumentCard({
  title,
  fileName,
  onView,
}: {
  title: string;
  fileName: string;
  onView: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <FileText size={17} />
        </div>

        <button
          onClick={onView}
          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
          title={`View ${title}`}
        >
          <Eye size={16} />
        </button>
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-800">
        {title}
      </p>

      <p className="mt-1 truncate text-xs text-slate-400">
        {fileName}
      </p>

      <button
        onClick={onView}
        className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        View Document
      </button>
    </div>
  );
}

/* ============================================================
   ACTION MODAL
============================================================ */

function ActionModal({
  title,
  description,
  icon,
  iconClass,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  iconClass: string;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
          >
            {icon}
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              {title}
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}