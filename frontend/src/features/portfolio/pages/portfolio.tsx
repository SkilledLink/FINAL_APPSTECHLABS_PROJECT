// src/features/portfolio/pages/PortfolioPage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Briefcase,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  ExternalLink,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Share2,
  Star,
  User,
  X,
} from 'lucide-react';

import {
  getProjects,
  getProject,
} from '../../../../src/services/projectServices';

interface Project {
  id: number;
  title: string;
  category: string;
  trade: string;
  location: string;
  description: string;
  before_image?: string;
  after_image?: string;
  images: string[];
  completion_date: string;
  duration?: string;
  budget?: string;
  client?: string;
  skills: string[];
  challenges: string[];
  results: string[];
  professional_id: number;
  status: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
}

type Comment = {
  user: string;
  text: string;
};

const BLUE = '#1A5CFF';
const BLUE_DARK = '#0B3FB8';
const NAVY = '#071A3D';
const TEXT = '#102A56';
const MUTED = '#6B7A99';
const BACKGROUND = '#F5F8FF';
const LIGHT_BLUE = '#EAF1FF';
const BORDER = '#DFE7F5';

const skills = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Welding',
  'Masonry',
  'HVAC',
  'Landscaping',
  'Interior Design',
  'Project Management',
];

const education = [
  {
    school: 'Harmony Institute',
    degree: 'Master in Visual Arts',
  },
  {
    school: 'Aurora Academy',
    degree: 'Master in Visual Arts',
  },
  {
    school: 'Crystalbrook',
    degree: 'Master in Visual Arts',
  },
];

const workExperience = [
  {
    company: 'Insightlancer',
    role: 'Master in Visual Arts',
  },
  {
    company: 'Self-Employed',
    role: 'Master in Visual Arts',
  },
  {
    company: 'KG Graphics Studio',
    role: 'Master in Visual Arts',
  },
];

const testimonials = [
  {
    id: 1,
    name: 'Sarah M.',
    role: 'Homeowner',
    content:
      'Amazing work. The result was clean, professional, and exactly what I hoped for.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael K.',
    role: 'Business Owner',
    content:
      'Professional, punctual, and reliable from the first discussion to delivery.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Jane D.',
    role: 'Property Manager',
    content:
      'The project was completed on time and the quality was excellent.',
    rating: 4,
  },
];

const getProjectImage = (project: Project) => {
  const baseUrl = 'http://localhost:8000';
  const image = project.after_image || project.images?.[0] || project.before_image || '';
  
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  
  return `${baseUrl}${image}`;
};

const formatDate = (date?: string) => {
  if (!date) return 'Recently added';

  const formatted = new Date(date);

  if (Number.isNaN(formatted.getTime())) {
    return 'Recently added';
  }

  return formatted.toLocaleDateString();
};

const Portfolio: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeImage, setActiveImage] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [likedProjects, setLikedProjects] = useState<Record<number, boolean>>(
    {},
  );
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [commentInput, setCommentInput] = useState('');
  const [commentOpen, setCommentOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');

      // CHANGE THIS USER ID TO YOUR ACTUAL USER ID
      const userId = 1;
      const data = await getProjects(userId);
      console.log('📦 Projects fetched:', data);
      setProjects(data);
    } catch (fetchError) {
      console.error('Error fetching projects:', fetchError);
      setError('Unable to load projects right now.');
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    return [
      'All',
      ...new Set(
        projects
          .map((project) => project.category)
          .filter((category) => Boolean(category)),
      ),
    ];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') {
      return projects;
    }

    return projects.filter(
      (project) => project.category === selectedCategory,
    );
  }, [projects, selectedCategory]);

  const publishedProjects = useMemo(() => {
    return projects.filter(
      (project) => project.status?.toLowerCase() === 'published',
    ).length;
  }, [projects]);

  const totalLikes = useMemo(() => {
    return projects.reduce(
      (total, project) => total + (project.likes_count || 0),
      0,
    );
  }, [projects]);

  const totalTrades = useMemo(() => {
    return new Set(
      projects.map((project) => project.trade).filter(Boolean),
    ).size;
  }, [projects]);

  const showToast = (message: string) => {
    setToast(message);

    window.setTimeout(() => {
      setToast('');
    }, 2500);
  };

  const openProject = async (project: Project) => {
    setSelectedProject(project);
    setCommentInput('');
    setCommentOpen(false);

    const fallbackImage = getProjectImage(project);
    setActiveImage(fallbackImage);

    try {
      const projectDetails = await getProject(project.id);

      if (projectDetails) {
        setSelectedProject(projectDetails);

        const detailImage =
          projectDetails.after_image ||
          projectDetails.images?.[0] ||
          projectDetails.before_image ||
          fallbackImage;

        setActiveImage(detailImage);
      }
    } catch (projectError) {
      console.error('Unable to load project details:', projectError);
    }
  };

  const closeProject = () => {
    setSelectedProject(null);
    setActiveImage('');
    setCommentInput('');
    setCommentOpen(false);
  };

  const handleLike = (projectId: number) => {
    setLikedProjects((previous) => ({
      ...previous,
      [projectId]: !previous[projectId],
    }));
  };

  const handleShare = async (project: Project) => {
    const shareUrl = `${window.location.origin}/project/${project.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: project.title,
          text: `View this completed project: ${project.title}`,
          url: shareUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Project link copied');
      } else {
        showToast('Copy this link: ' + shareUrl);
      }
    } catch {
      showToast('Sharing cancelled');
    }
  };

  const submitComment = () => {
    if (!selectedProject || !commentInput.trim()) return;

    setComments((previous) => ({
      ...previous,
      [selectedProject.id]: [
        ...(previous[selectedProject.id] || []),
        {
          user: 'You',
          text: commentInput.trim(),
        },
      ],
    }));

    setCommentInput('');
    setCommentOpen(false);
    showToast('Comment added');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F8FF]">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-[#DFE7F5] border-t-[#1A5CFF]" />

          <p className="mt-4 text-sm text-[#6B7A99]">
            Loading portfolio...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8FF] py-6 text-[#071A3D]">
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[28px] bg-[#071A3D] px-6 py-10 text-white md:px-10 md:py-12">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#1A5CFF]/35 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-52 w-52 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 text-xs font-bold text-blue-100">
                <Award className="h-4 w-4" />
                Professional portfolio
              </div>

              <h1 className="mt-5 max-w-xl text-3xl font-black leading-tight sm:text-4xl">
                Work that speaks
                <span className="block text-blue-300">for itself.</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100/75 sm:text-base">
                Explore completed projects, transformations, skills, and the
                quality delivered across every job.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#projects"
                  className="flex items-center gap-2 rounded-xl bg-[#1A5CFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0B3FB8]"
                >
                  View projects
                  <ArrowRight className="h-4 w-4" />
                </a>

                <Link
                  to="/create-project"
                  className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  Add a project
                </Link>
              </div>
            </div>

            <div className="relative hidden min-h-[220px] overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:block">
              <img
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1100&q=80"
                alt="Professional project workspace"
                className="absolute inset-0 h-full w-full object-cover opacity-75"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#071A3D]/80 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                  <p className="text-xl font-black">{projects.length}</p>
                  <p className="mt-1 text-[11px] text-blue-100/80">
                    Total projects
                  </p>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                  <p className="text-xl font-black">{totalTrades}</p>
                  <p className="mt-1 text-[11px] text-blue-100/80">
                    Trades covered
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-[#DFE7F5] bg-white p-4">
            <Briefcase className="h-5 w-5 text-[#1A5CFF]" />
            <p className="mt-3 text-2xl font-black text-[#071A3D]">
              {projects.length}
            </p>
            <p className="mt-1 text-xs text-[#6B7A99]">Total projects</p>
          </div>

          <div className="rounded-2xl border border-[#DFE7F5] bg-white p-4">
            <Check className="h-5 w-5 text-[#1A5CFF]" />
            <p className="mt-3 text-2xl font-black text-[#071A3D]">
              {publishedProjects}
            </p>
            <p className="mt-1 text-xs text-[#6B7A99]">Published</p>
          </div>

          <div className="rounded-2xl border border-[#DFE7F5] bg-white p-4">
            <Heart className="h-5 w-5 text-[#1A5CFF]" />
            <p className="mt-3 text-2xl font-black text-[#071A3D]">
              {totalLikes}
            </p>
            <p className="mt-1 text-xs text-[#6B7A99]">Total likes</p>
          </div>

          <div className="rounded-2xl border border-[#DFE7F5] bg-white p-4">
            <Award className="h-5 w-5 text-[#1A5CFF]" />
            <p className="mt-3 text-2xl font-black text-[#071A3D]">
              {totalTrades}
            </p>
            <p className="mt-1 text-xs text-[#6B7A99]">Trades</p>
          </div>
        </section>

        <section id="projects" className="mt-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1A5CFF]">
                Proof of work
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-[#071A3D]">
                Completed projects
              </h2>

              <p className="mt-2 text-sm text-[#6B7A99]">
                Browse project transformations and professional results.
              </p>
            </div>

            <Link
              to="/create-project"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#1A5CFF] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0B3FB8]"
            >
              Add project
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    isActive
                      ? 'bg-[#1A5CFF] text-white'
                      : 'bg-white text-[#6B7A99] ring-1 ring-[#DFE7F5] hover:bg-[#EAF1FF] hover:text-[#1A5CFF]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {filteredProjects.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[#AFC5F8] bg-white px-6 py-14 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-[#1A5CFF]/40" />

              <h3 className="mt-4 text-lg font-extrabold text-[#071A3D]">
                No projects found
              </h3>

              <p className="mt-2 text-sm text-[#6B7A99]">
                There are no projects in this category yet.
              </p>

              <Link
                to="/create-project"
                className="mt-5 inline-flex rounded-xl bg-[#1A5CFF] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0B3FB8]"
              >
                Add your first project
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => openProject(project)}
                  className="group overflow-hidden rounded-2xl border border-[#DFE7F5] bg-white text-left transition duration-300 hover:-translate-y-1 hover:border-[#AFC5F8] hover:shadow-[0_18px_40px_rgba(26,92,255,0.12)]"
                >
                  <div className="grid h-44 grid-cols-2 overflow-hidden bg-[#EAF1FF]">
                    <div className="relative overflow-hidden">
                      {project.before_image ? (
                        <img
                          src={project.before_image}
                          alt={`${project.title} before`}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[#EAF1FF]">
                          <Briefcase className="h-10 w-10 text-[#1A5CFF]/30" />
                        </div>
                      )}

                      <span className="absolute bottom-2 left-2 rounded-md bg-[#071A3D]/85 px-2 py-1 text-[10px] font-bold text-white">
                        BEFORE
                      </span>
                    </div>

                    <div className="relative overflow-hidden border-l border-white/40">
                      {project.after_image ? (
                        <img
                          src={project.after_image}
                          alt={`${project.title} after`}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[#DCE8FF]">
                          <Briefcase className="h-10 w-10 text-[#1A5CFF]/30" />
                        </div>
                      )}

                      <span className="absolute bottom-2 right-2 rounded-md bg-[#1A5CFF] px-2 py-1 text-[10px] font-bold text-white">
                        AFTER
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-1 text-base font-extrabold text-[#071A3D]">
                        {project.title}
                      </h3>

                      <ChevronRight className="h-4 w-4 shrink-0 text-[#1A5CFF]" />
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#EAF1FF] px-2.5 py-1 text-[10px] font-bold text-[#1A5CFF]">
                        {project.trade}
                      </span>

                      {project.category && (
                        <span className="rounded-full bg-[#F5F8FF] px-2.5 py-1 text-[10px] font-bold text-[#6B7A99]">
                          {project.category}
                        </span>
                      )}
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#6B7A99]">
                      {project.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-[#EAF0FA] pt-3 text-xs text-[#6B7A99]">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#1A5CFF]" />
                        {project.location}
                      </span>

                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" />
                        {project.likes_count || 0}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 rounded-2xl border border-[#DFE7F5] bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1A5CFF]">
            Expertise
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-[#071A3D]">
            Skills and services
          </h2>

          <p className="mt-2 text-sm text-[#6B7A99]">
            Professional abilities available for your next project.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-[#EAF1FF] px-3 py-2 text-xs font-semibold text-[#1A5CFF]"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1A5CFF]">
              Working together
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-[#071A3D]">
              Pricing model
            </h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#DFE7F5] bg-white p-6">
              <p className="text-sm font-bold text-[#071A3D]">Hourly</p>

              <p className="mt-4 text-3xl font-black text-[#1A5CFF]">80CFA</p>

              <p className="mt-1 text-sm text-[#6B7A99]">per hour</p>

              <div className="mt-5 space-y-3 text-sm text-[#6B7A99]">
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#1A5CFF]" />
                  Flexible scheduling
                </p>

                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#1A5CFF]" />
                  No long-term commitment
                </p>

                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#1A5CFF]" />
                  Ideal for small tasks
                </p>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-[#1A5CFF] bg-[#EAF1FF] p-6 shadow-[0_12px_30px_rgba(26,92,255,0.10)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#071A3D]">Monthly</p>

                <span className="rounded-full bg-[#1A5CFF] px-2.5 py-1 text-[10px] font-bold text-white">
                  Popular
                </span>
              </div>

              <p className="mt-4 text-3xl font-black text-[#1A5CFF]">
                9,600CFA
              </p>

              <p className="mt-1 text-sm text-[#6B7A99]">per month</p>

              <div className="mt-5 space-y-3 text-sm text-[#6B7A99]">
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#1A5CFF]" />
                  Priority support
                </p>

                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#1A5CFF]" />
                  Dedicated resource
                </p>

                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#1A5CFF]" />
                  Monthly reporting
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#DFE7F5] bg-white p-6">
              <p className="text-sm font-bold text-[#071A3D]">Quarterly</p>

              <p className="mt-4 text-3xl font-black text-[#1A5CFF]">
                28,800CFA
              </p>

              <p className="mt-1 text-sm text-[#6B7A99]">per quarter</p>

              <div className="mt-5 space-y-3 text-sm text-[#6B7A99]">
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#1A5CFF]" />
                  Best value option
                </p>

                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#1A5CFF]" />
                  Dedicated team
                </p>

                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#1A5CFF]" />
                  Quarterly reviews
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#DFE7F5] bg-white p-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-[#1A5CFF]" />
              <h2 className="text-xl font-extrabold text-[#071A3D]">
                Education
              </h2>
            </div>

            <div className="mt-6 space-y-5">
              {education.map((item) => (
                <div
                  key={item.school}
                  className="border-l-2 border-[#C9D9FA] pl-4"
                >
                  <h3 className="font-bold text-[#071A3D]">
                    {item.school}
                  </h3>

                  <p className="mt-1 text-sm text-[#6B7A99]">
                    {item.degree}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#DFE7F5] bg-white p-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#1A5CFF]" />
              <h2 className="text-xl font-extrabold text-[#071A3D]">
                Work experience
              </h2>
            </div>

            <div className="mt-6 space-y-5">
              {workExperience.map((item) => (
                <div
                  key={item.company}
                  className="border-l-2 border-[#C9D9FA] pl-4"
                >
                  <h3 className="font-bold text-[#071A3D]">
                    {item.company}
                  </h3>

                  <p className="mt-1 text-sm text-[#6B7A99]">
                    {item.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1A5CFF]">
            Client feedback
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-[#071A3D]">
            What clients say
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.id}
                className="rounded-2xl border border-[#DFE7F5] bg-white p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF1FF]">
                    <User className="h-5 w-5 text-[#1A5CFF]" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#071A3D]">
                      {testimonial.name}
                    </h3>

                    <p className="text-xs text-[#6B7A99]">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-[#6B7A99]">
                  “{testimonial.content}”
                </p>

                <div className="mt-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${
                        index < testimonial.rating
                          ? 'fill-[#1A5CFF] text-[#1A5CFF]'
                          : 'text-[#C9D9FA]'
                      }`}
                    />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-3xl bg-[#071A3D] p-6 text-white sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                Contact
              </p>

              <h2 className="mt-3 text-3xl font-black leading-tight">
                Let&apos;s talk about your next project.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-blue-100/70">
                Send a message to discuss the scope, timeline, budget, and the
                right approach for your project.
              </p>

              <div className="mt-6 space-y-4 text-sm text-white/85">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-blue-300" />
                  <span>+1 402 6155-0120</span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-blue-300" />
                  <span>contact@example.com</span>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-blue-300" />
                  <span>123 Main Street, City</span>
                </div>
              </div>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                showToast('Message form is ready to connect to your backend');
              }}
              className="rounded-2xl bg-white p-5 text-[#071A3D]"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold">
                    Your name
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-[#DFE7F5] px-4 py-3 text-sm outline-none transition focus:border-[#1A5CFF] focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold">
                    Email address
                  </label>

                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[#DFE7F5] px-4 py-3 text-sm outline-none transition focus:border-[#1A5CFF] focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-xs font-bold">
                  Phone number
                </label>

                <input
                  type="tel"
                  placeholder="+237 6XX XXX XXX"
                  className="w-full rounded-xl border border-[#DFE7F5] px-4 py-3 text-sm outline-none transition focus:border-[#1A5CFF] focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-xs font-bold">
                  Your message
                </label>

                <textarea
                  rows={4}
                  required
                  placeholder="Tell us about your project..."
                  className="w-full resize-none rounded-xl border border-[#DFE7F5] px-4 py-3 text-sm outline-none transition focus:border-[#1A5CFF] focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <button
                type="submit"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A5CFF] py-3 text-sm font-bold text-white transition hover:bg-[#0B3FB8]"
              >
                <Send className="h-4 w-4" />
                Send message
              </button>
            </form>
          </div>
        </section>
      </main>

      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#071A3D]/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeProject();
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="relative bg-[#EAF1FF]">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={selectedProject.title}
                  className="h-64 w-full object-cover sm:h-80"
                />
              ) : (
                <div className="flex h-64 items-center justify-center sm:h-80">
                  <Briefcase className="h-20 w-20 text-[#1A5CFF]/30" />
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#071A3D]/70 to-transparent" />

              <button
                type="button"
                onClick={closeProject}
                aria-label="Close project"
                className="absolute right-4 top-4 rounded-full bg-white p-2 text-[#071A3D] shadow-lg transition hover:bg-[#EAF1FF]"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="absolute bottom-5 left-5">
                <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                  {selectedProject.trade}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1A5CFF]">
                    {selectedProject.category}
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-[#071A3D]">
                    {selectedProject.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => handleShare(selectedProject)}
                  className="flex w-fit items-center gap-2 rounded-xl border border-[#DFE7F5] px-4 py-2.5 text-sm font-bold text-[#1A5CFF] transition hover:bg-[#EAF1FF]"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>

              <p className="mt-5 text-sm leading-7 text-[#6B7A99]">
                {selectedProject.description}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-[#F5F8FF] p-4">
                  <MapPin className="h-4 w-4 text-[#1A5CFF]" />
                  <p className="mt-2 text-[11px] text-[#8B98B2]">Location</p>
                  <p className="mt-1 text-sm font-bold text-[#102A56]">
                    {selectedProject.location}
                  </p>
                </div>

                <div className="rounded-xl bg-[#F5F8FF] p-4">
                  <Calendar className="h-4 w-4 text-[#1A5CFF]" />
                  <p className="mt-2 text-[11px] text-[#8B98B2]">Completed</p>
                  <p className="mt-1 text-sm font-bold text-[#102A56]">
                    {formatDate(
                      selectedProject.completion_date ||
                        selectedProject.created_at,
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-[#F5F8FF] p-4">
                  <Clock className="h-4 w-4 text-[#1A5CFF]" />
                  <p className="mt-2 text-[11px] text-[#8B98B2]">Duration</p>
                  <p className="mt-1 text-sm font-bold text-[#102A56]">
                    {selectedProject.duration || 'Not specified'}
                  </p>
                </div>

                <div className="rounded-xl bg-[#F5F8FF] p-4">
                  <DollarSign className="h-4 w-4 text-[#1A5CFF]" />
                  <p className="mt-2 text-[11px] text-[#8B98B2]">Budget</p>
                  <p className="mt-1 text-sm font-bold text-[#102A56]">
                    {selectedProject.budget || 'Not specified'}
                  </p>
                </div>
              </div>

              {(selectedProject.before_image ||
                selectedProject.after_image ||
                selectedProject.images?.length > 0) && (
                <div className="mt-8">
                  <h3 className="text-lg font-extrabold text-[#071A3D]">
                    Project gallery
                  </h3>

                  <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                    {selectedProject.before_image && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveImage(selectedProject.before_image || '')
                        }
                        className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 ${
                          activeImage === selectedProject.before_image
                            ? 'border-[#1A5CFF]'
                            : 'border-transparent'
                        }`}
                      >
                        <img
                          src={selectedProject.before_image}
                          alt="Project before"
                          className="h-full w-full object-cover"
                        />

                        <span className="absolute bottom-1 left-1 rounded bg-[#071A3D]/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          BEFORE
                        </span>
                      </button>
                    )}

                    {selectedProject.after_image && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveImage(selectedProject.after_image || '')
                        }
                        className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 ${
                          activeImage === selectedProject.after_image
                            ? 'border-[#1A5CFF]'
                            : 'border-transparent'
                        }`}
                      >
                        <img
                          src={selectedProject.after_image}
                          alt="Project after"
                          className="h-full w-full object-cover"
                        />

                        <span className="absolute bottom-1 left-1 rounded bg-[#1A5CFF] px-1.5 py-0.5 text-[9px] font-bold text-white">
                          AFTER
                        </span>
                      </button>
                    )}

                    {selectedProject.images?.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setActiveImage(image)}
                        className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 ${
                          activeImage === image
                            ? 'border-[#1A5CFF]'
                            : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${selectedProject.title} ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedProject.skills?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-extrabold text-[#071A3D]">
                    Skills used
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedProject.skills.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-full bg-[#EAF1FF] px-3 py-1.5 text-xs font-semibold text-[#1A5CFF]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedProject.challenges?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-extrabold text-[#071A3D]">
                    Project challenges
                  </h3>

                  <div className="mt-3 space-y-2">
                    {selectedProject.challenges.map((challenge, index) => (
                      <p
                        key={`${challenge}-${index}`}
                        className="flex gap-2 text-sm leading-6 text-[#6B7A99]"
                      >
                        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[#1A5CFF]" />
                        {challenge}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {selectedProject.results?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-extrabold text-[#071A3D]">
                    Results delivered
                  </h3>

                  <div className="mt-3 space-y-2">
                    {selectedProject.results.map((result, index) => (
                      <p
                        key={`${result}-${index}`}
                        className="flex gap-2 text-sm leading-6 text-[#6B7A99]"
                      >
                        <Check className="mt-1 h-4 w-4 shrink-0 text-[#1A5CFF]" />
                        {result}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[#EAF0FA] pt-6">
                <button
                  type="button"
                  onClick={() => handleLike(selectedProject.id)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                    likedProjects[selectedProject.id]
                      ? 'border-[#1A5CFF] bg-[#EAF1FF] text-[#1A5CFF]'
                      : 'border-[#DFE7F5] text-[#6B7A99] hover:bg-[#F5F8FF]'
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      likedProjects[selectedProject.id]
                        ? 'fill-[#1A5CFF]'
                        : ''
                    }`}
                  />
                  Like
                </button>

                <button
                  type="button"
                  onClick={() => setCommentOpen((previous) => !previous)}
                  className="flex items-center gap-2 rounded-xl border border-[#DFE7F5] px-4 py-2.5 text-sm font-bold text-[#6B7A99] transition hover:bg-[#F5F8FF]"
                >
                  <MessageCircle className="h-4 w-4" />
                  {comments[selectedProject.id]?.length || 0} comments
                </button>

                <button
                  type="button"
                  onClick={() => handleShare(selectedProject)}
                  className="flex items-center gap-2 rounded-xl border border-[#DFE7F5] px-4 py-2.5 text-sm font-bold text-[#6B7A99] transition hover:bg-[#F5F8FF]"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>

                <button
                  type="button"
                  onClick={closeProject}
                  className="ml-auto rounded-xl bg-[#1A5CFF] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0B3FB8]"
                >
                  Close
                </button>
              </div>

              {commentOpen && (
                <div className="mt-5 rounded-2xl bg-[#F5F8FF] p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(event) => setCommentInput(event.target.value)}
                      placeholder="Write a comment..."
                      className="min-w-0 flex-1 rounded-xl border border-[#DFE7F5] bg-white px-4 py-3 text-sm outline-none focus:border-[#1A5CFF]"
                    />

                    <button
                      type="button"
                      onClick={submitComment}
                      className="rounded-xl bg-[#1A5CFF] px-5 py-3 text-sm font-bold text-white hover:bg-[#0B3FB8]"
                    >
                      Post
                    </button>
                  </div>

                  {comments[selectedProject.id]?.map((comment, index) => (
                    <p
                      key={index}
                      className="mt-3 text-sm leading-6 text-[#6B7A99]"
                    >
                      <span className="font-bold text-[#071A3D]">
                        {comment.user}:
                      </span>{' '}
                      {comment.text}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;