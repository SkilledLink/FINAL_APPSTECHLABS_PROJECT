import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Plus,
  Edit,
  Trash2,
  Briefcase,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  Star,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { usePortfolio } from '../../../hooks/usePortfolio';
import { useWorks } from '../../../hooks/useWorks';
import { useServices } from '../../../hooks/useServices';
import { useAvailability } from '../../../hooks/useAvailability';
import { useCategories } from '../../../hooks/useCategories';
import WorkCard from '../components/WorkCard';
import ServiceCard from '../components/ServiceCard';
import AvailabilityEditor from '../components/AvailabilityEditor';
import WorkForm from './WorkForm';
import ServiceForm from './ServiceForm';

export default function PortfolioDashboard() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    portfolio,
    loading: portfolioLoading,
    error: portfolioError,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
  } = usePortfolio();
  const { works, createWork, updateWork, deleteWork, uploadImages } = useWorks();
  const { services, createService, updateService, deleteService } = useServices();
  const { availability, setAvailabilityData } = useAvailability();
  const { categories } = useCategories();

  const [showWorkForm, setShowWorkForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingWork, setEditingWork] = useState<any>(null);
  const [editingService, setEditingService] = useState<any>(null);
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);

  // Debug log
  useEffect(() => {
    console.log('User in portfolio dashboard:', user);
  }, [user]);

  // Show loading while auth is being resolved
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is not loaded, show message
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
        Please log in to view your portfolio.
      </div>
    );
  }

  // Check if user is professional (case-insensitive)
  const isProfessional = user.account_type?.toLowerCase() === 'professional';

  if (!isProfessional) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <Briefcase size={48} className="text-slate-400 dark:text-slate-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">
          Professional Access Only
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Please upgrade your account to professional to access this feature.
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
          Your account type is: <span className="font-mono">{user.account_type}</span>
        </p>
      </div>
    );
  }

  // Show error if any
  if (portfolioError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600 dark:text-red-400">
        <p className="text-lg font-semibold">Error loading portfolio</p>
        <p className="text-sm">{portfolioError}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Loading portfolio
  if (portfolioLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No portfolio – show creation form
  if (!portfolio) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto py-12"
      >
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-blue-400/20 dark:border-blue-400/20 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Create Your Portfolio
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Showcase your skills, experience, and completed work to attract clients.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const data = {
                headline: formData.get('headline') as string,
                bio: formData.get('bio') as string,
                years_experience: parseInt(formData.get('years_experience') as string) || undefined,
                business_name: formData.get('business_name') as string,
                business_description: formData.get('business_description') as string,
                service_area: formData.get('service_area') as string,
                phone: formData.get('phone') as string,
                specialty_ids: [],
              };
              try {
                await createPortfolio(data);
                toast.success('Portfolio created successfully!');
              } catch (err: any) {
                toast.error(err.message || 'Failed to create portfolio');
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Professional Headline *
              </label>
              <input
                type="text"
                name="headline"
                required
                placeholder="e.g., Licensed Electrician"
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Bio / About
              </label>
              <textarea
                name="bio"
                rows={3}
                placeholder="Tell clients about your experience and expertise..."
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                name="years_experience"
                min="0"
                placeholder="7"
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Business Name (Optional)
              </label>
              <input
                type="text"
                name="business_name"
                placeholder="e.g., Spark Electric"
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Service Area
              </label>
              <input
                type="text"
                name="service_area"
                placeholder="e.g., Yaoundé, Douala"
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                placeholder="+237 699 123 456"
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
            >
              Create Portfolio
            </button>
          </form>
        </div>
      </motion.div>
    );
  }

  // Portfolio exists – show dashboard (unchanged)
  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      {/* Portfolio Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-blue-400/20 dark:border-blue-400/20 p-6 shadow-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg className="w-full h-full opacity-35" viewBox="0 0 800 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="header-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <rect width="800" height="200" fill="url(#header-glow)" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {portfolio.headline || 'Professional Portfolio'}
              </h1>
              {portfolio.business_name && (
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  {portfolio.business_name}
                </p>
              )}
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
                {portfolio.years_experience && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {portfolio.years_experience} years
                  </span>
                )}
                {portfolio.service_area && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {portfolio.service_area}
                  </span>
                )}
                {portfolio.is_verified && (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle size={14} /> Verified
                  </span>
                )}
                {!portfolio.is_public && (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <XCircle size={14} /> Private
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingPortfolio(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
              >
                <Edit size={16} /> Edit Portfolio
              </button>
              <button
                onClick={async () => {
                  if (window.confirm('Delete your portfolio? This action cannot be undone.')) {
                    try {
                      await deletePortfolio();
                      toast.success('Portfolio deleted');
                      navigate('/');
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to delete portfolio');
                    }
                  }
                }}
                className="px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-500/20 transition-colors border border-red-500/20"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          {portfolio.bio && (
            <p className="mt-3 text-slate-700 dark:text-slate-300 max-w-2xl">{portfolio.bio}</p>
          )}
        </div>
      </motion.div>

      {/* Works Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Briefcase size={20} /> Completed Works
          </h2>
          <button
            onClick={() => { setEditingWork(null); setShowWorkForm(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> Add Work
          </button>
        </div>
        {works.length === 0 ? (
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-blue-400/20 dark:border-blue-400/20 p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400">No completed works yet. Add your first project to showcase your skills.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {works.map((work) => (
              <WorkCard
                key={work.id}
                work={work}
                onEdit={() => { setEditingWork(work); setShowWorkForm(true); }}
                onDelete={async () => {
                  if (window.confirm('Delete this work?')) {
                    try {
                      await deleteWork(work.id);
                      toast.success('Work deleted');
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to delete work');
                    }
                  }
                }}
                onUploadImages={async (before, after) => {
                  try {
                    await uploadImages(work.id, before, after);
                    toast.success('Images uploaded');
                  } catch (err: any) {
                    toast.error(err.message || 'Failed to upload images');
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Services Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Star size={20} /> Services Offered
          </h2>
          <button
            onClick={() => { setEditingService(null); setShowServiceForm(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> Add Service
          </button>
        </div>
        {services.length === 0 ? (
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-blue-400/20 dark:border-blue-400/20 p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400">No services listed yet. Add services you offer to attract clients.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={() => { setEditingService(service); setShowServiceForm(true); }}
                onDelete={async () => {
                  if (window.confirm('Delete this service?')) {
                    try {
                      await deleteService(service.id);
                      toast.success('Service deleted');
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to delete service');
                    }
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Availability Section */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
          <Clock size={20} /> Availability
        </h2>
        <AvailabilityEditor
          availability={availability}
          onSave={async (data) => {
            try {
              await setAvailabilityData(data);
              toast.success('Availability updated');
            } catch (err: any) {
              toast.error(err.message || 'Failed to update availability');
            }
          }}
        />
      </section>

      {/* Modals for forms */}
      <AnimatePresence>
        {showWorkForm && (
          <WorkForm
            work={editingWork}
            onClose={() => setShowWorkForm(false)}
            onSave={async (data) => {
              try {
                if (editingWork) {
                  await updateWork(editingWork.id, data);
                  toast.success('Work updated');
                } else {
                  await createWork(data);
                  toast.success('Work created');
                }
                setShowWorkForm(false);
              } catch (err: any) {
                toast.error(err.message || 'Failed to save work');
              }
            }}
          />
        )}
        {showServiceForm && (
          <ServiceForm
            service={editingService}
            onClose={() => setShowServiceForm(false)}
            onSave={async (data) => {
              try {
                if (editingService) {
                  await updateService(editingService.id, data);
                  toast.success('Service updated');
                } else {
                  await createService(data);
                  toast.success('Service created');
                }
                setShowServiceForm(false);
              } catch (err: any) {
                toast.error(err.message || 'Failed to save service');
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Edit Portfolio Modal */}
      <AnimatePresence>
        {isEditingPortfolio && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsEditingPortfolio(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Edit Portfolio</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const data = {
                    headline: formData.get('headline') as string,
                    bio: formData.get('bio') as string,
                    years_experience: parseInt(formData.get('years_experience') as string) || undefined,
                    business_name: formData.get('business_name') as string,
                    business_description: formData.get('business_description') as string,
                    service_area: formData.get('service_area') as string,
                    phone: formData.get('phone') as string,
                    is_public: formData.get('is_public') === 'on',
                  };
                  try {
                    await updatePortfolio(data);
                    toast.success('Portfolio updated');
                    setIsEditingPortfolio(false);
                  } catch (err: any) {
                    toast.error(err.message || 'Failed to update portfolio');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Headline</label>
                  <input
                    type="text"
                    name="headline"
                    defaultValue={portfolio.headline || ''}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    rows={3}
                    defaultValue={portfolio.bio || ''}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Years Experience</label>
                  <input
                    type="number"
                    name="years_experience"
                    min="0"
                    defaultValue={portfolio.years_experience || ''}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business Name</label>
                  <input
                    type="text"
                    name="business_name"
                    defaultValue={portfolio.business_name || ''}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Service Area</label>
                  <input
                    type="text"
                    name="service_area"
                    defaultValue={portfolio.service_area || ''}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={portfolio.phone || ''}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_public"
                    defaultChecked={portfolio.is_public}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm text-slate-700 dark:text-slate-300">Make portfolio public</label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingPortfolio(false)}
                    className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}