import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Briefcase, X, Sparkles, RefreshCw, ShieldAlert, Layers } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { usePortfolio } from '../../../hooks/usePortfolio';
import { useWorks } from '../../../hooks/useWorks';
import { useServices } from '../../../hooks/useServices';
import { useAvailability } from '../../../hooks/useAvailability';
import PortfolioHeader from '../components/PortfolioHeader';
import PortfolioTabs from '../components/PortfolioTabs';
import PortfolioWorks from '../components/PortfolioWorks';
import PortfolioServices from '../components/PortfolioServices';
import PortfolioAvailability from '../components/PortfolioAvailability';
import PortfolioWorkForm from '../components/PortfolioWorkForm';
import PortfolioServiceForm from '../components/PortfolioServiceForm';
import PortfolioCreateForm from '../components/PortfolioCreateForm';

// ─── Dynamic Water & Fluid Ambient Lighting Overlay ─────────────────────────
const DynamicWaterBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {/* Base Light/Dark Canvas */}
    <div className="absolute inset-0 bg-slate-50/80 dark:bg-[#070d17] transition-colors duration-700" />

    {/* Primary Hydro-Light Orb 1 */}
    <motion.div
      animate={{
        x: [0, 40, -30, 0],
        y: [0, -50, 20, 0],
        scale: [1, 1.15, 0.9, 1],
        opacity: [0.35, 0.55, 0.35],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-cyan-300/30 via-sky-200/20 to-transparent dark:from-cyan-500/15 dark:via-blue-600/10 dark:to-transparent blur-[120px]"
    />

    {/* Fluid Caustic Orb 2 */}
    <motion.div
      animate={{
        x: [0, -50, 30, 0],
        y: [0, 40, -40, 0],
        scale: [1, 1.2, 0.95, 1],
        opacity: [0.25, 0.5, 0.25],
      }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute top-1/3 -right-32 w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-teal-300/25 via-blue-300/20 to-transparent dark:from-teal-500/12 dark:via-indigo-600/15 dark:to-transparent blur-[140px]"
    />

    {/* Deep Water Refraction Orb 3 */}
    <motion.div
      animate={{
        x: [0, 30, -40, 0],
        y: [0, 60, -30, 0],
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.45, 0.3],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-sky-300/20 via-indigo-200/15 to-transparent dark:from-cyan-600/10 dark:via-blue-900/20 dark:to-transparent blur-[130px]"
    />

    {/* Subtle Water Caustic Radial Highlights */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.08),transparent_75%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.12),transparent_75%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,0.4)_100%)] dark:bg-[linear-gradient(to_bottom,transparent_0%,rgba(7,13,23,0.8)_100%)]" />
  </div>
);

export default function PortfolioPage() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();
  const { portfolio, loading, error, createPortfolio, updatePortfolio, deletePortfolio } = usePortfolio();
  const { works, createWork, updateWork, deleteWork, uploadImages } = useWorks();
  const { services, createService, updateService, deleteService } = useServices();
  const { availability, setAvailabilityData } = useAvailability();

  const [activeTab, setActiveTab] = useState<'overview' | 'works' | 'services' | 'availability'>('overview');
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingWork, setEditingWork] = useState<any>(null);
  const [editingService, setEditingService] = useState<any>(null);
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);

  // ─── Loading State ────────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <DynamicWaterBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-cyan-500/20 shadow-2xl"
        >
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 dark:border-cyan-400/10" />
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
            <Sparkles className="w-6 h-6 text-cyan-500 animate-pulse" />
          </div>
          <p className="text-sm font-medium tracking-wide text-slate-600 dark:text-cyan-200/80 animate-pulse">
            Loading Hydro Space...
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── Unauthenticated State ────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <DynamicWaterBackground />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-md w-full p-8 text-center bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-cyan-500/20 shadow-[0_20px_50px_rgba(0,150,255,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-cyan-500/10 dark:bg-cyan-400/10 text-cyan-600 dark:text-cyan-300 flex items-center justify-center border border-cyan-500/20">
            <ShieldAlert size={30} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Access Restricted</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Please log in to manage and customize your portfolio.
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── Non-Professional Account State ────────────────────────────────────────
  const isProfessional = user.account_type?.toLowerCase() === 'professional';
  if (!isProfessional) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <DynamicWaterBackground />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-xl w-full p-8 text-center bg-white/75 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-amber-500/20 shadow-2xl"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-inner">
            <Briefcase size={38} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Professional Account Required</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-3 text-sm leading-relaxed">
            Your current account type is <span className="px-2.5 py-1 rounded-md bg-amber-500/10 dark:bg-amber-400/10 font-mono text-amber-600 dark:text-amber-300 font-semibold">{user.account_type}</span>. Upgrade to a professional account to unlock your portfolio workspace.
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <DynamicWaterBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-lg w-full p-8 text-center bg-red-500/10 dark:bg-red-950/30 backdrop-blur-2xl rounded-3xl border border-red-500/20 shadow-2xl"
        >
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <ShieldAlert size={28} />
          </div>
          <p className="text-red-600 dark:text-red-300 font-medium mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-red-500/20 transition-all active:scale-95"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── Portfolio Creation View ──────────────────────────────────────────────
  if (!portfolio) {
    return (
      <div className="relative min-h-screen py-10 px-4">
        <DynamicWaterBackground />
        <div className="relative z-10 max-w-4xl mx-auto">
          <PortfolioCreateForm onCreate={createPortfolio} />
        </div>
      </div>
    );
  }

  // ─── Portfolio Handlers ───────────────────────────────────────────────────
  const handleDeletePortfolio = async () => {
    if (window.confirm('Delete your entire portfolio? This cannot be undone.')) {
      try {
        await deletePortfolio();
        toast.success('Portfolio deleted');
        navigate('/');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete portfolio');
      }
    }
  };

  const handleEditPortfolio = () => setIsEditingPortfolio(true);

  return (
    <div className="relative min-h-screen">
      {/* Ambient Water & Lighting Effect Layer */}
      <DynamicWaterBackground />

      {/* Main Content Dashboard */}
      <div className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
        {/* Header Component Wrapper with Soft Glass Effect */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/80 dark:border-cyan-500/15 shadow-[0_10px_30px_-5px_rgba(0,150,255,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-2"
        >
          <PortfolioHeader
            portfolio={portfolio}
            user={user}
            onEdit={handleEditPortfolio}
            onDelete={handleDeletePortfolio}
          />
        </motion.div>

        {/* Navigation Tabs */}
        <div className="relative z-10">
          <PortfolioTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Animated Main Content View */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative z-10 rounded-3xl bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/80 dark:border-cyan-500/10 p-6 md:p-8 shadow-[0_15px_35px_-5px_rgba(0,100,200,0.05)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
          >
            {activeTab === 'overview' && (
              <div className="space-y-12">
                <PortfolioWorks
                  works={works}
                  onAdd={() => { setEditingWork(null); setShowWorkForm(true); }}
                  onEdit={(work) => { setEditingWork(work); setShowWorkForm(true); }}
                  onDelete={deleteWork}
                  onUploadImages={uploadImages}
                />
                <hr className="border-slate-200/80 dark:border-cyan-900/20" />
                <PortfolioServices
                  services={services}
                  onAdd={() => { setEditingService(null); setShowServiceForm(true); }}
                  onEdit={(service) => { setEditingService(service); setShowServiceForm(true); }}
                  onDelete={deleteService}
                />
                <hr className="border-slate-200/80 dark:border-cyan-900/20" />
                <PortfolioAvailability availability={availability} onSave={setAvailabilityData} />
              </div>
            )}
            {activeTab === 'works' && (
              <PortfolioWorks
                works={works}
                onAdd={() => { setEditingWork(null); setShowWorkForm(true); }}
                onEdit={(work) => { setEditingWork(work); setShowWorkForm(true); }}
                onDelete={deleteWork}
                onUploadImages={uploadImages}
              />
            )}
            {activeTab === 'services' && (
              <PortfolioServices
                services={services}
                onAdd={() => { setEditingService(null); setShowServiceForm(true); }}
                onEdit={(service) => { setEditingService(service); setShowServiceForm(true); }}
                onDelete={deleteService}
              />
            )}
            {activeTab === 'availability' && (
              <PortfolioAvailability availability={availability} onSave={setAvailabilityData} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Work & Service Modals */}
        <AnimatePresence>
          {showWorkForm && (
            <PortfolioWorkForm
              work={editingWork}
              onClose={() => setShowWorkForm(false)}
              onSave={async (data, files) => {
                try {
                  if (editingWork) {
                    await updateWork(editingWork.id, data, files);
                    toast.success('Work updated');
                  } else {
                    await createWork(data, files);
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
            <PortfolioServiceForm
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

        {/* Portfolio Edit Modal with Refined Fluid Aesthetics */}
        <AnimatePresence>
          {isEditingPortfolio && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
                onClick={() => setIsEditingPortfolio(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/80 dark:border-cyan-500/20 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,150,255,0.25)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] max-w-xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                      <Layers size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Edit Portfolio Details</h3>
                  </div>
                  <button
                    onClick={() => setIsEditingPortfolio(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full transition"
                  >
                    <X size={20} />
                  </button>
                </div>

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
                      toast.success('Portfolio updated successfully');
                      setIsEditingPortfolio(false);
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to update portfolio');
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-cyan-200/70 mb-1.5">
                      Headline
                    </label>
                    <input
                      type="text"
                      name="headline"
                      defaultValue={portfolio.headline || ''}
                      placeholder="e.g. Senior Full Stack Developer & UI Designer"
                      className="w-full px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-cyan-900/30 rounded-xl focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-cyan-400/50 focus:outline-none dark:text-slate-100 transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-cyan-200/70 mb-1.5">
                        Business Name
                      </label>
                      <input
                        type="text"
                        name="business_name"
                        defaultValue={portfolio.business_name || ''}
                        className="w-full px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-cyan-900/30 rounded-xl focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-cyan-400/50 focus:outline-none dark:text-slate-100 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-cyan-200/70 mb-1.5">
                        Years Experience
                      </label>
                      <input
                        type="number"
                        name="years_experience"
                        min="0"
                        defaultValue={portfolio.years_experience || ''}
                        className="w-full px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-cyan-900/30 rounded-xl focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-cyan-400/50 focus:outline-none dark:text-slate-100 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-cyan-200/70 mb-1.5">
                        Service Area
                      </label>
                      <input
                        type="text"
                        name="service_area"
                        defaultValue={portfolio.service_area || ''}
                        className="w-full px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-cyan-900/30 rounded-xl focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-cyan-400/50 focus:outline-none dark:text-slate-100 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-cyan-200/70 mb-1.5">
                        Phone
                      </label>
                      <input
                        type="text"
                        name="phone"
                        defaultValue={portfolio.phone || ''}
                        className="w-full px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-cyan-900/30 rounded-xl focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-cyan-400/50 focus:outline-none dark:text-slate-100 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-cyan-200/70 mb-1.5">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      rows={3}
                      defaultValue={portfolio.bio || ''}
                      className="w-full px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-cyan-900/30 rounded-xl focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-cyan-400/50 focus:outline-none dark:text-slate-100 transition resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 py-2">
                    <input
                      type="checkbox"
                      id="edit_is_public"
                      name="is_public"
                      defaultChecked={portfolio.is_public}
                      className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500 dark:bg-slate-800 dark:border-slate-700"
                    />
                    <label htmlFor="edit_is_public" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Make portfolio publicly visible
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-2.5 rounded-xl font-semibold shadow-md shadow-cyan-500/20 active:scale-95 transition"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingPortfolio(false)}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}