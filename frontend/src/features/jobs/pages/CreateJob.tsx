// src/features/jobs/pages/CreateJob.tsx
import React, { useState } from 'react';
import { 
    uploadJobImage, 
    createJob,
    toggleJobLike,
    addJobComment,
    toggleJobShare,
    applyToJob,
    getJobComments,
    getJobLikesCount
} from '../../../../src/services/jobServices'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  MapPin,
  DollarSign,
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
  Eye as EyeIcon,
  User,
  Home,
  Store,
  Camera,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface JobPost {
  id?: number;
  title: string;
  clientType: 'individual' | 'business' | 'organization';
  clientName: string;
  location: string;
  trade: string;
  customTrade: string;
  description: string;
  budget: string;
  urgency: 'today' | 'tomorrow' | 'this-week' | 'next-week' | 'flexible';
  contactPhone: string;
  contactEmail: string;
  images: File[];
  imagePreviews: string[];
  isVerified: boolean;
}

// ============================================================
// DATA
// ============================================================

const clientTypes = [
  { id: 'individual', label: 'Individual / Homeowner' },
  { id: 'business', label: 'Business / Company' },
  { id: 'organization', label: 'Organization / NGO' },
];

const trades = [
  'Plumber',
  'Electrician', 
  'Carpenter',
  'Painter',
  'Welder',
  'Mason',
  'HVAC',
  'Landscaper',
  'Interior Designer',
  'Cleaner',
  'Tiler',
  'Roofer',
  'Mechanic',
  'Fencer',
  'Plasterer',
  'Flooring Specialist',
  'Other (please specify)'
];

const urgencyOptions = [
  { id: 'today', label: 'Today - Urgent!' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'this-week', label: 'This Week' },
  { id: 'next-week', label: 'Next Week' },
  { id: 'flexible', label: 'Flexible' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const CreateJob: React.FC = () => {
  const [formData, setFormData] = useState<JobPost>({
    title: '',
    clientType: 'individual',
    clientName: '',
    location: '',
    trade: '',
    customTrade: '',
    description: '',
    budget: '',
    urgency: 'flexible',
    contactPhone: '',
    contactEmail: '',
    images: [],
    imagePreviews: [],
    isVerified: false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showCustomTrade, setShowCustomTrade] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<number | null>(null);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, trade: value });
    if (value === 'Other (please specify)') {
      setShowCustomTrade(true);
    } else {
      setShowCustomTrade(false);
      setFormData({ ...formData, customTrade: '' });
    }
  };

  const handleUrgencySelect = (urgency: 'today' | 'tomorrow' | 'this-week' | 'next-week' | 'flexible') => {
    setFormData({ ...formData, urgency });
  };

  const handleClientTypeSelect = (type: 'individual' | 'business' | 'organization') => {
    setFormData({ ...formData, clientType: type });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));

    setFormData({
      ...formData,
      images: [...formData.images, ...newFiles],
      imagePreviews: [...formData.imagePreviews, ...newPreviews],
    });
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = formData.imagePreviews.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: newImages,
      imagePreviews: newPreviews,
    });
  };

  // ============================================================
  // ✅ SUBMIT (with proper trade handling)
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedTrade = formData.trade === 'Other (please specify)' ? formData.customTrade : formData.trade;
    
    // Validate
    const missingFields = [];
    if (!formData.title) missingFields.push('Title');
    if (!formData.clientName) missingFields.push('Client Name');
    if (!formData.location) missingFields.push('Location');
    if (!selectedTrade) missingFields.push('Trade');
    if (!formData.description) missingFields.push('Description');
    if (!formData.contactPhone) missingFields.push('Phone');
    
    if (missingFields.length > 0) {
        alert(`❌ Please fill in these required fields:\n- ${missingFields.join('\n- ')}`);
        return;
    }

    if (formData.trade === 'Other (please specify)' && !formData.customTrade.trim()) {
      alert('❌ Please specify your custom trade');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images
      const uploadedFilenames: string[] = [];
      for (const image of formData.images) {
        const filename = await uploadJobImage(image);
        uploadedFilenames.push(filename);
      }

      // Create job
      const jobData = {
        title: formData.title,
        client_type: formData.clientType,
        client_name: formData.clientName,
        location: formData.location,
        trade: selectedTrade,
        custom_trade: formData.trade === 'Other (please specify)' ? formData.customTrade : undefined,
        description: formData.description,
        budget: formData.budget || undefined,
        urgency: formData.urgency,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail || undefined,
        images: uploadedFilenames,
      };

      console.log('📤 Sending job data:', jobData);
      const result = await createJob(jobData);
      console.log('✅ Job created:', result);
      
      setIsSuccess(true);
      
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          title: '',
          clientType: 'individual',
          clientName: '',
          location: '',
          trade: '',
          customTrade: '',
          description: '',
          budget: '',
          urgency: 'flexible',
          contactPhone: '',
          contactEmail: '',
          images: [],
          imagePreviews: [],
          isVerified: false,
        });
        setShowCustomTrade(false);
        setCurrentStep(1);
        setPreviewMode(false);
        setCreatedJobId(null);
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error posting job:', error);
      alert('Failed to post job. Please try again. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // JOB INTERACTIONS (for preview - placeholder)
  // ============================================================

  const handleLike = async (jobId: number) => {
    alert('Like functionality will be available on the feed page.');
  };

  const handleComment = async (jobId: number, content: string) => {
    alert('Comment functionality will be available on the feed page.');
  };

  const handleShare = async (jobId: number) => {
    alert('Share functionality will be available on the feed page.');
  };

  const handleApply = async (jobId: number) => {
    alert('Apply functionality will be available on the feed page.');
  };

  const nextStep = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const progress = ((currentStep - 1) / 1) * 100;

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  const renderStepIndicator = () => (
    <div className="mb-6 sm:mb-8">
      <div className="flex justify-between items-center mb-2 sm:mb-4">
        <span className="text-xs sm:text-sm text-[#64748B]">Step {currentStep} of 2</span>
        <span className="text-xs sm:text-sm font-medium text-[#2563EB]">{Math.round(progress)}% Complete</span>
      </div>
      <div className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-[#2563EB] transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );

  // ============================================================
  // JOB PREVIEW - Fully responsive
  // ============================================================

  const JobPreview = () => {
    const selectedTrade = formData.trade === 'Other (please specify)' ? formData.customTrade : formData.trade;
    const urgencyLabel = urgencyOptions.find(u => u.id === formData.urgency)?.label || 'Flexible';
    const urgencyColors: Record<string, string> = {
      'today': 'bg-red-600',
      'tomorrow': 'bg-orange-500',
      'this-week': 'bg-yellow-500',
      'next-week': 'bg-blue-500',
      'flexible': 'bg-gray-500',
    };

    return (
      <div className="bg-white border-2 border-[#2563EB] rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-lg">
        <div className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-white text-[10px] sm:text-xs font-medium ${urgencyColors[formData.urgency] || 'bg-gray-500'}`}>
          {urgencyLabel}
        </div>

        {formData.imagePreviews.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {formData.imagePreviews.slice(0, 3).map((preview, index) => (
              <img key={index} src={preview} alt={`Job photo ${index + 1}`} className="w-full h-16 sm:h-24 object-cover rounded-lg border border-gray-200" />
            ))}
            {formData.imagePreviews.length > 3 && (
              <div className="w-full h-16 sm:h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs sm:text-sm text-[#64748B]">
                +{formData.imagePreviews.length - 3}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 text-center border border-dashed border-gray-300">
            <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-[#64748B] mx-auto mb-1 sm:mb-2" />
            <p className="text-xs sm:text-sm text-[#64748B]">No photos uploaded yet</p>
            <p className="text-[10px] sm:text-xs text-[#64748B]">Upload photos to show the problem</p>
          </div>
        )}

        <h3 className="text-base sm:text-xl font-bold text-[#0F172A]">{formData.title || 'Job Title'}</h3>

        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-[#64748B]">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <MapPinIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{formData.location || 'Location'}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{formData.clientName || 'Your Name'}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="font-semibold text-[#2563EB]">{selectedTrade || 'Trade'}</span>
          </div>
          {formData.budget && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{formData.budget} FCFA</span>
            </div>
          )}
        </div>

        <p className="text-xs sm:text-sm text-[#64748B] line-clamp-3">{formData.description || 'Description goes here...'}</p>

        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2563EB]" />
            <span className="font-medium text-[#0F172A]">{formData.contactPhone || 'Phone number'}</span>
            {formData.contactEmail && (
              <>
                <span className="text-[#64748B]">•</span>
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2563EB]" />
                <span className="text-[#64748B] truncate max-w-[120px] sm:max-w-none">{formData.contactEmail}</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-2 pt-2">
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4">
            <button onClick={() => handleLike(1)} className="flex items-center gap-1 text-xs sm:text-sm text-[#64748B] hover:text-red-500 transition-colors">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Like</span>
              <span className="text-[10px] sm:text-xs">0</span>
            </button>
            <button onClick={() => handleComment(1, '')} className="flex items-center gap-1 text-xs sm:text-sm text-[#64748B] hover:text-blue-500 transition-colors">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Comment</span>
              <span className="text-[10px] sm:text-xs">0</span>
            </button>
            <button onClick={() => handleShare(1)} className="flex items-center gap-1 text-xs sm:text-sm text-[#64748B] hover:text-green-500 transition-colors">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Share</span>
              <span className="text-[10px] sm:text-xs">0</span>
            </button>
          </div>
          <button onClick={() => handleApply(1)} className="bg-[#2563EB] text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-1">
            <SendIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Apply
          </button>
        </div>
      </div>
    );
  };

  // ============================================================
  // STEP 1 - BASIC INFO (Responsive)
  // ============================================================

  const renderStep1 = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-1.5 sm:mb-2">📸 Take a photo of the problem</label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center hover:border-[#2563EB] transition-colors">
          <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-[#64748B] mx-auto mb-2 sm:mb-3" />
          <p className="text-xs sm:text-sm text-[#64748B]">Take a photo or upload images of the problem area</p>
          <p className="text-[10px] sm:text-xs text-[#64748B] mt-1">Helps professionals come prepared with the right tools</p>
          <label className="inline-block mt-2 sm:mt-3 bg-[#2563EB] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-[#1D4ED8] transition-colors cursor-pointer">
            <UploadIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" /> Upload Photos
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
        {formData.imagePreviews.length > 0 && (
          <div className="mt-2 sm:mt-3 grid grid-cols-3 gap-2 sm:gap-3">
            {formData.imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img src={preview} alt={`Upload ${index + 1}`} className="w-full h-16 sm:h-24 object-cover rounded-lg border border-gray-200" />
                <button type="button" onClick={() => removeImage(index)} className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full p-0.5 sm:p-1 hover:bg-red-600 transition-colors"><XIcon className="w-3 h-3 sm:w-4 sm:h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Who are you? */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-1.5 sm:mb-2">Who are you? <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          {clientTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleClientTypeSelect(type.id as 'individual' | 'business' | 'organization')}
              className={`p-2 sm:p-4 rounded-xl border-2 text-center transition-all text-sm sm:text-base ${
                formData.clientType === type.id ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]' : 'border-gray-200 hover:border-[#2563EB] text-[#64748B]'
              }`}
            >
              <span className="font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Your Name */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-1.5 sm:mb-2">Your Name <span className="text-red-500">*</span></label>
        <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} placeholder={formData.clientType === 'individual' ? "e.g. John Doe" : "e.g. ABC Construction"} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all text-sm sm:text-base" required />
      </div>

      {/* What's the problem? */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-1.5 sm:mb-2">What's the problem? <span className="text-red-500">*</span></label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. My kitchen sink is leaking" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all text-sm sm:text-base" required />
      </div>

      {/* Where are you? */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-1.5 sm:mb-2">Where are you? <span className="text-red-500">*</span></label>
        <div className="relative">
          <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#64748B]" />
          <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Bonapriso, Douala" className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all text-sm sm:text-base" required />
        </div>
      </div>

      {/* Tell us more */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-1.5 sm:mb-2">Tell us more <span className="text-red-500">*</span></label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe the problem in detail..." className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none text-sm sm:text-base" required />
      </div>

      <div className="flex justify-end pt-2 sm:pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => {
            if (!formData.title || !formData.clientName || !formData.location || !formData.description) {
              alert('Please fill in all required fields');
              return;
            }
            setCurrentStep(2);
          }}
          className="bg-[#2563EB] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium hover:bg-[#1D4ED8] transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
        >
          Next Step <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );

  // ============================================================
  // STEP 2 - DETAILS (Responsive)
  // ============================================================

  const renderStep2 = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* What type of service? */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-1.5 sm:mb-2">What type of professional? <span className="text-red-500">*</span></label>
        <select
          value={formData.trade}
          onChange={handleTradeChange}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all text-sm sm:text-base"
        >
          <option value="">Select a service...</option>
          {trades.map((trade) => (
            <option key={trade} value={trade}>{trade}</option>
          ))}
        </select>
        {showCustomTrade && (
          <div className="mt-2 sm:mt-3">
            <input
              type="text"
              name="customTrade"
              value={formData.customTrade}
              onChange={handleChange}
              placeholder="e.g. Solar Panel Installation"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all text-sm sm:text-base"
              required={showCustomTrade}
            />
          </div>
        )}
        <p className="text-[10px] sm:text-xs text-[#64748B] mt-1">Select from the list or choose "Other" to specify your own</p>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-1.5 sm:mb-2">Budget (optional)</label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#64748B]" />
          <input type="text" name="budget" value={formData.budget} onChange={handleChange} placeholder="e.g. 50,000 - 100,000 FCFA" className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all text-sm sm:text-base" />
        </div>
      </div>

      {/* When do you need it? */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2 sm:mb-3">When do you need this done?</label>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {urgencyOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleUrgencySelect(option.id as 'today' | 'tomorrow' | 'this-week' | 'next-week' | 'flexible')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border-2 text-center transition-all text-xs sm:text-sm ${
                formData.urgency === option.id ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]' : 'border-gray-200 hover:border-[#2563EB] text-[#64748B]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-1.5 sm:mb-2">Phone <span className="text-red-500">*</span></label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#64748B]" />
            <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="6XX XXX XXX" className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all text-sm sm:text-base" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-1.5 sm:mb-2">Email (optional)</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#64748B]" />
            <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} placeholder="your@email.com" className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all text-sm sm:text-base" />
          </div>
        </div>
      </div>

      {/* Preview Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center gap-1.5 sm:gap-2 text-[#2563EB] font-medium hover:text-[#1D4ED8] transition-colors text-sm sm:text-base"
        >
          <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" /> {previewMode ? 'Hide Preview' : 'Preview Job'}
        </button>
        <span className="text-xs sm:text-sm text-[#64748B]">See how your job will look to professionals</span>
      </div>

      {previewMode && <JobPreview />}
    </div>
  );

  // ============================================================
  // SUCCESS SCREEN
  // ============================================================

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="text-center max-w-md bg-white rounded-2xl p-8 sm:p-12 shadow-xl w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <CheckCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2 sm:mb-4">🎉 Job Posted Successfully!</h2>
          <p className="text-sm sm:text-base text-[#64748B] mb-6 sm:mb-8">Your job has been published! Professionals will see your photos and contact you soon.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button className="bg-[#2563EB] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium hover:bg-[#1D4ED8] transition-colors text-sm sm:text-base">View My Job</button>
            <button className="border-2 border-[#2563EB] text-[#2563EB] px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium hover:bg-[#2563EB] hover:text-white transition-colors text-sm sm:text-base">Post Another Job</button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-4 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-8">
          <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#64748B]" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0F172A]">Post a Job</h1>
            <p className="text-xs sm:text-sm text-[#64748B]">Find the right professional for your needs</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
          {renderStepIndicator()}
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}

            <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3 sm:gap-0">
              <button
                type="button"
                onClick={prevStep}
                className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium transition-colors text-sm sm:text-base ${
                  currentStep === 1 ? 'text-[#64748B] cursor-not-allowed' : 'border-2 border-gray-300 text-[#0F172A] hover:bg-gray-50'
                }`}
                disabled={currentStep === 1}
              >
                Back
              </button>

              {currentStep < 2 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full sm:w-auto bg-[#2563EB] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                >
                  Next Step <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-[#2563EB] text-white px-4 sm:px-8 py-2 sm:py-2.5 rounded-xl font-medium hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <><div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Posting...</>
                  ) : (
                    <><SendIcon className="w-4 h-4 sm:w-5 sm:h-5" /> Post Job</>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;