// src/features/portfolio/pages/CreateProjectPage.tsx
import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Users,
  FileText,
  Tag,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  Plus,
  Trash2,
  Save,
  Send,
  Eye,
  Building,
  Phone,
  Mail,
  Info,
  Award,
  Star,
  Image,
  Video,
  Link as LinkIcon,
  DollarSign,
  Camera,
  Play,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin as MapPinIcon,
  Briefcase as BriefcaseIcon,
  Users as UsersIcon,
  FileText as FileTextIcon,
  Tag as TagIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  Upload as UploadIcon,
  X as XIcon,
  Plus as PlusIcon,
  Send as SendIcon,
  Eye as EyeIcon
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface Project {
  id?: number;
  title: string;
  category: string;
  trade: string;
  location: string;
  description: string;
  images: string[];
  beforeImage: File | null;
  afterImage: File | null;
  beforeImagePreview: string;
  afterImagePreview: string;
  completionDate: string;
  duration: string;
  budget: string;
  client: string;
  skills: string[];
  challenges: string[];
  results: string[];
  isPublished: boolean;
}

// ============================================================
// DATA
// ============================================================

const trades = [
  { id: 'electrical', label: 'Electrical' },
  { id: 'plumbing', label: 'Plumbing' },
  { id: 'carpentry', label: 'Carpentry' },
  { id: 'painting', label: 'Painting' },
  { id: 'welding', label: 'Welding' },
  { id: 'masonry', label: 'Masonry' },
  { id: 'hvac', label: 'HVAC' },
  { id: 'landscaping', label: 'Landscaping' },
  { id: 'interior-design', label: 'Interior Design' },
  { id: 'cleaning', label: 'Cleaning' },
];

const projectCategories = [
  { id: 'residential', label: 'Residential' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'industrial', label: 'Industrial' },
  { id: 'renovation', label: 'Renovation' },
  { id: 'new-construction', label: 'New Construction' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'repair', label: 'Repair' },
  { id: 'installation', label: 'Installation' },
];

const popularSkills = [
  'Electrical Wiring', 'Plumbing Installation', 'Carpentry', 'Painting',
  'Welding', 'Masonry', 'HVAC Installation', 'Landscaping',
  'Interior Design', 'Project Management', 'Team Leadership',
  'Customer Service', 'Safety Compliance', 'Blueprint Reading',
  'Construction Management', 'Quality Control'
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const CreateProject: React.FC = () => {
  // Form State
  const [formData, setFormData] = useState<Project>({
    title: '',
    category: '',
    trade: '',
    location: '',
    description: '',
    images: [],
    beforeImage: null,
    afterImage: null,
    beforeImagePreview: '',
    afterImagePreview: '',
    completionDate: '',
    duration: '',
    budget: '',
    client: '',
    skills: [],
    challenges: [],
    results: [],
    isPublished: false,
  });

  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [challengeInput, setChallengeInput] = useState('');
  const [resultInput, setResultInput] = useState('');
  const [skillInput, setSkillInput] = useState('');

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ NEW: Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'before') {
        setFormData({
          ...formData,
          beforeImage: file,
          beforeImagePreview: reader.result as string,
        });
      } else {
        setFormData({
          ...formData,
          afterImage: file,
          afterImagePreview: reader.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // ✅ NEW: Remove Image
  const removeImage = (type: 'before' | 'after') => {
    if (type === 'before') {
      setFormData({
        ...formData,
        beforeImage: null,
        beforeImagePreview: '',
      });
    } else {
      setFormData({
        ...formData,
        afterImage: null,
        afterImagePreview: '',
      });
    }
  };

  const addItem = (field: 'skills' | 'challenges' | 'results', value: string) => {
    if (!value.trim()) return;
    setFormData({
      ...formData,
      [field]: [...formData[field], value.trim()],
    });
    if (field === 'skills') setSkillInput('');
    if (field === 'challenges') setChallengeInput('');
    if (field === 'results') setResultInput('');
  };

  const removeItem = (field: 'skills' | 'challenges' | 'results', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  // ✅ NEW: Handle Submit (Publish Button)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Check if required fields are filled
    if (!formData.title || !formData.trade || !formData.category || !formData.location || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ This is where you'll connect to backend
      // const formDataToSend = new FormData();
      // formDataToSend.append('title', formData.title);
      // formDataToSend.append('trade', formData.trade);
      // formDataToSend.append('category', formData.category);
      // formDataToSend.append('location', formData.location);
      // formDataToSend.append('description', formData.description);
      // if (formData.beforeImage) formDataToSend.append('beforeImage', formData.beforeImage);
      // if (formData.afterImage) formDataToSend.append('afterImage', formData.afterImage);
      // formDataToSend.append('completionDate', formData.completionDate);
      // formDataToSend.append('duration', formData.duration);
      // formDataToSend.append('budget', formData.budget);
      // formDataToSend.append('client', formData.client);
      // formDataToSend.append('skills', JSON.stringify(formData.skills));
      // formDataToSend.append('challenges', JSON.stringify(formData.challenges));
      // formDataToSend.append('results', JSON.stringify(formData.results));
      // formDataToSend.append('isPublished', String(formData.isPublished));
      //
      // const response = await fetch('/api/projects', {
      //   method: 'POST',
      //   body: formDataToSend,
      // });
      // 
      // if (!response.ok) throw new Error('Failed to create project');

      // ✅ Simulate API call (remove this when backend is ready)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // ✅ Show success screen
      setIsSuccess(true);
      
      // ✅ Reset form after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          title: '',
          category: '',
          trade: '',
          location: '',
          description: '',
          images: [],
          beforeImage: null,
          afterImage: null,
          beforeImagePreview: '',
          afterImagePreview: '',
          completionDate: '',
          duration: '',
          budget: '',
          client: '',
          skills: [],
          challenges: [],
          results: [],
          isPublished: false,
        });
        setCurrentStep(1);
      }, 3000);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const progress = ((currentStep - 1) / 3) * 100;

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-[#64748B]">Step {currentStep} of 4</span>
        <span className="text-sm font-medium text-[#2563EB]">{Math.round(progress)}% Complete</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#2563EB] transition-all duration-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">
          Project Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Kitchen Renovation - Bonapriso"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">
            Trade <span className="text-red-500">*</span>
          </label>
          <select
            name="trade"
            value={formData.trade}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
          >
            <option value="">Select Trade</option>
            {trades.map((trade) => (
              <option key={trade.id} value={trade.id}>{trade.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
          >
            <option value="">Select Category</option>
            {projectCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">
          Location <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Douala, Cameroon"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">
            Completion Date
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
            <input
              type="date"
              name="completionDate"
              value={formData.completionDate}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">
            Duration
          </label>
          <div className="relative">
            <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g. 2 weeks"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">
            Budget (FCFA)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
            <input
              type="text"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="e.g. 1,000,000"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">
          Client Name
        </label>
        <div className="relative">
          <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
          <input
            type="text"
            name="client"
            value={formData.client}
            onChange={handleChange}
            placeholder="e.g. Sarah M."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">
          Project Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={6}
          placeholder="Describe your project in detail..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
          required
        />
      </div>

      {/* ✅ NEW: Before & After Images side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Before Image */}
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">
            Before Image
          </label>
          <div className="relative">
            {formData.beforeImagePreview ? (
              <div className="relative">
                <img 
                  src={formData.beforeImagePreview} 
                  alt="Before"
                  className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage('before')}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#2563EB] transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-10 h-10 text-[#64748B] mb-2" />
                  <p className="text-sm text-[#64748B]">Click to upload before image</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'before')}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* After Image */}
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">
            After Image
          </label>
          <div className="relative">
            {formData.afterImagePreview ? (
              <div className="relative">
                <img 
                  src={formData.afterImagePreview} 
                  alt="After"
                  className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage('after')}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#2563EB] transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-10 h-10 text-[#64748B] mb-2" />
                  <p className="text-sm text-[#64748B]">Click to upload after image</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'after')}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">
          Skills Used
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem('skills', skillInput)}
            placeholder="Add a skill (e.g. Electrical Wiring)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
          />
          <button
            onClick={() => addItem('skills', skillInput)}
            className="px-4 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {formData.skills.map((skill, index) => (
            <span key={index} className="inline-flex items-center gap-1 bg-blue-50 text-[#2563EB] px-3 py-1.5 rounded-full text-sm border border-blue-200">
              <TagIcon className="w-4 h-4" />
              {skill}
              <button onClick={() => removeItem('skills', index)} className="hover:text-red-500 ml-1">
                <XIcon className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs text-[#64748B] mb-2">Popular Skills:</p>
          <div className="flex flex-wrap gap-2">
            {popularSkills.slice(0, 8).map((skill) => (
              <button
                key={skill}
                onClick={() => {
                  if (!formData.skills.includes(skill)) {
                    setFormData({
                      ...formData,
                      skills: [...formData.skills, skill],
                    });
                  }
                }}
                className="text-xs bg-white text-[#64748B] px-3 py-1.5 rounded-full border border-gray-200 hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] transition-all"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">
          Challenges Faced
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={challengeInput}
            onChange={(e) => setChallengeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem('challenges', challengeInput)}
            placeholder="Add a challenge you overcame"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
          />
          <button
            onClick={() => addItem('challenges', challengeInput)}
            className="px-4 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {formData.challenges.map((challenge, index) => (
            <span key={index} className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-sm border border-amber-200">
              <AlertCircleIcon className="w-4 h-4" />
              {challenge}
              <button onClick={() => removeItem('challenges', index)} className="hover:text-red-500 ml-1">
                <XIcon className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">
          Results & Achievements
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={resultInput}
            onChange={(e) => setResultInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem('results', resultInput)}
            placeholder="Add a result (e.g. 100% client satisfaction)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
          />
          <button
            onClick={() => addItem('results', resultInput)}
            className="px-4 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {formData.results.map((result, index) => (
            <span key={index} className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-sm border border-green-200">
              <CheckCircleIcon className="w-4 h-4" />
              {result}
              <button onClick={() => removeItem('results', index)} className="hover:text-red-500 ml-1">
                <XIcon className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center gap-2 text-[#2563EB] font-medium hover:text-[#1D4ED8] transition-colors"
        >
          <EyeIcon className="w-5 h-5" />
          {previewMode ? 'Hide Preview' : 'Preview Project'}
        </button>
        <span className="text-sm text-[#64748B]">See how your project will look to visitors</span>
      </div>

      {previewMode && (
        <div className="bg-white border-2 border-[#2563EB] rounded-xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#0F172A]">{formData.title || 'Project Title'}</h3>
              <p className="text-[#64748B]">{formData.trade} • {formData.location || 'Location'}</p>
            </div>
            <span className="bg-blue-100 text-[#2563EB] px-3 py-1 rounded-full text-sm font-medium">
              {formData.category}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-[#64748B]">
            {formData.budget && <span>💰 {formData.budget} FCFA</span>}
            {formData.duration && <span>⏱️ {formData.duration}</span>}
            {formData.client && <span>👤 Client: {formData.client}</span>}
          </div>
          <p className="text-sm text-[#64748B]">{formData.description || 'Project description goes here...'}</p>
          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, i) => (
                <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">{skill}</span>
              ))}
            </div>
          )}
          {(formData.beforeImagePreview || formData.afterImagePreview) && (
            <div className="grid grid-cols-2 gap-4">
              {formData.beforeImagePreview && (
                <div>
                  <p className="text-xs text-[#64748B] mb-1">Before</p>
                  <img src={formData.beforeImagePreview} alt="Before" className="w-full h-32 object-cover rounded-lg" />
                </div>
              )}
              {formData.afterImagePreview && (
                <div>
                  <p className="text-xs text-[#64748B] mb-1">After</p>
                  <img src={formData.afterImagePreview} alt="After" className="w-full h-32 object-cover rounded-lg" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <input
          type="checkbox"
          name="isPublished"
          checked={formData.isPublished}
          onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
          className="w-5 h-5 text-[#2563EB] border-gray-300 rounded focus:ring-[#2563EB]"
        />
        <label className="text-sm text-[#0F172A] cursor-pointer">
          Publish this project to my portfolio
        </label>
      </div>
    </div>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white rounded-2xl p-12 shadow-xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-[#0F172A] mb-4">Project Published Successfully! 🎉</h2>
          <p className="text-[#64748B] mb-8">
            Your project has been added to your portfolio. It's now visible to potential clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#2563EB] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#1D4ED8] transition-colors">
              View Portfolio
            </button>
            <button className="border-2 border-[#2563EB] text-[#2563EB] px-6 py-3 rounded-xl font-medium hover:bg-[#2563EB] hover:text-white transition-colors">
              Add Another Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-[#64748B]" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">Add Project to Portfolio</h1>
            <p className="text-[#64748B]">Showcase your work and attract more clients</p>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          {renderStepIndicator()}

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${
                  currentStep === 1
                    ? 'text-[#64748B] cursor-not-allowed'
                    : 'border-2 border-gray-300 text-[#0F172A] hover:bg-gray-50'
                }`}
                disabled={currentStep === 1}
              >
                Back
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-[#2563EB] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#1D4ED8] transition-colors flex items-center gap-2"
                >
                  Next Step
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#2563EB] text-white px-8 py-2.5 rounded-xl font-medium hover:bg-[#1D4ED8] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <SendIcon className="w-5 h-5" />
                      Publish Project
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tips Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="w-6 h-6 text-[#2563EB]" />
            </div>
            <div>
              <h4 className="font-semibold text-[#0F172A] mb-1">Tips for a Great Portfolio Project</h4>
              <ul className="text-sm text-[#64748B] space-y-1">
                <li>• Add high-quality before/after photos</li>
                <li>• Be specific about the work you did</li>
                <li>• Mention challenges you overcame</li>
                <li>• Include client feedback if possible</li>
                <li>• Highlight your key skills used</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProject; 