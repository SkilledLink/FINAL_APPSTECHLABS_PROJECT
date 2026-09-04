// src/features/jobs/pages/CreateJobPage.tsx
import React, { useState } from 'react';
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
  Camera
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedTrade = formData.trade === 'Other (please specify)' ? formData.customTrade : formData.trade;
    
    if (!formData.title || !formData.clientName || !formData.location || !selectedTrade || !formData.description || !formData.contactPhone) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
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
      }, 3000);
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-[#64748B]">Step {currentStep} of 2</span>
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

  // ============================================================
  // JOB PREVIEW WITH IMAGES
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
      <div className="bg-white border-2 border-[#2563EB] rounded-xl p-6 space-y-4 shadow-lg">
        {/* Urgency Badge */}
        <div className={`inline-block px-3 py-1 rounded-full text-white text-xs font-medium ${urgencyColors[formData.urgency] || 'bg-gray-500'}`}>
          {urgencyLabel}
        </div>

        {/* ✅ FIXED: Images Section */}
        {formData.imagePreviews.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {formData.imagePreviews.slice(0, 3).map((preview, index) => (
              <img 
                key={index}
                src={preview} 
                alt={`Job photo ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
            ))}
            {formData.imagePreviews.length > 3 && (
              <div className="w-full h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-sm text-[#64748B]">
                +{formData.imagePreviews.length - 3}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center border border-dashed border-gray-300">
            <Camera className="w-8 h-8 text-[#64748B] mx-auto mb-2" />
            <p className="text-sm text-[#64748B]">No photos uploaded yet</p>
            <p className="text-xs text-[#64748B]">Upload photos to show the problem</p>
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold text-[#0F172A]">{formData.title || 'Job Title'}</h3>

        {/* Details */}
        <div className="space-y-2 text-sm text-[#64748B]">
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4" />
            <span>{formData.location || 'Location'}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{formData.clientName || 'Your Name'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span>{selectedTrade || 'Trade'}</span>
          </div>
          {formData.budget && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>{formData.budget} FCFA</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-[#64748B]">{formData.description || 'Description goes here...'}</p>

        {/* Contact */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-[#2563EB]" />
            <span className="font-medium text-[#0F172A]">{formData.contactPhone || 'Phone number'}</span>
            {formData.contactEmail && (
              <>
                <span className="text-[#64748B]">•</span>
                <Mail className="w-4 h-4 text-[#2563EB]" />
                <span className="text-[#64748B]">{formData.contactEmail}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 bg-[#2563EB] text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2">
            <SendIcon className="w-4 h-4" />
            Apply
          </button>
          <button className="flex-1 border-2 border-[#2563EB] text-[#2563EB] px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-[#2563EB] hover:text-white transition-colors flex items-center justify-center gap-2">
            💬 Message
          </button>
        </div>

        {/* Social */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-sm text-[#64748B]">
          <span>❤️ 0 likes</span>
          <span>💬 0 comments</span>
          <span>📤 Share</span>
        </div>
      </div>
    );
  };

  // ============================================================
  // STEP 1 - BASIC INFO
  // ============================================================

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">
          📸 Take a photo of the problem
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#2563EB] transition-colors">
          <Camera className="w-10 h-10 text-[#64748B] mx-auto mb-3" />
          <p className="text-[#64748B] text-sm">Take a photo or upload images of the problem area</p>
          <p className="text-xs text-[#64748B] mt-1">Helps professionals come prepared with the right tools</p>
          <label className="inline-block mt-3 bg-[#2563EB] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors cursor-pointer">
            <UploadIcon className="w-4 h-4 inline mr-2" />
            Upload Photos
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
        
        {formData.imagePreviews.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-3">
            {formData.imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Who are you? */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">
          Who are you? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {clientTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleClientTypeSelect(type.id as 'individual' | 'business' | 'organization')}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                formData.clientType === type.id
                  ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
                  : 'border-gray-200 hover:border-[#2563EB] text-[#64748B]'
              }`}
            >
              <span className="font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Your Name */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          placeholder={formData.clientType === 'individual' ? "e.g. John Doe" : "e.g. ABC Construction"}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
          required
        />
      </div>

      {/* What's the problem? */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">
          What's the problem? <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. My kitchen sink is leaking"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
          required
        />
      </div>

      {/* Where are you? */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">
          Where are you? <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Bonapriso, Douala"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
            required
          />
        </div>
      </div>

      {/* Tell us more */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">
          Tell us more <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Describe the problem in detail..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
          required
        />
      </div>
    </div>
  );

  // ============================================================
  // STEP 2 - DETAILS
  // ============================================================

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* What type of service? */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">
          What type of professional? <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.trade}
          onChange={handleTradeChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
        >
          <option value="">Select a service...</option>
          {trades.map((trade) => (
            <option key={trade} value={trade}>{trade}</option>
          ))}
        </select>
        
        {showCustomTrade && (
          <div className="mt-3">
            <input
              type="text"
              name="customTrade"
              value={formData.customTrade}
              onChange={handleChange}
              placeholder="e.g. Solar Panel Installation"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
              required={showCustomTrade}
            />
          </div>
        )}
        <p className="text-xs text-[#64748B] mt-1">Select from the list or choose "Other" to specify your own</p>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">
          Budget (optional)
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
          <input
            type="text"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="e.g. 50,000 - 100,000 FCFA"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* When do you need it? */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-3">
          When do you need this done?
        </label>
        <div className="flex flex-wrap gap-2">
          {urgencyOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleUrgencySelect(option.id as 'today' | 'tomorrow' | 'this-week' | 'next-week' | 'flexible')}
              className={`px-4 py-2 rounded-xl border-2 text-center transition-all ${
                formData.urgency === option.id
                  ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
                  : 'border-gray-200 hover:border-[#2563EB] text-[#64748B]'
              }`}
            >
              <span className="text-sm">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">
            Phone <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="6XX XXX XXX"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">
            Email (optional)
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Preview Toggle */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center gap-2 text-[#2563EB] font-medium hover:text-[#1D4ED8] transition-colors"
        >
          <EyeIcon className="w-5 h-5" />
          {previewMode ? 'Hide Preview' : 'Preview Job'}
        </button>
        <span className="text-sm text-[#64748B]">See how your job will look to professionals</span>
      </div>

      {/* ✅ FIXED: Preview with Images */}
      {previewMode && <JobPreview />}
    </div>
  );

  // ============================================================
  // SUCCESS SCREEN
  // ============================================================

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white rounded-2xl p-12 shadow-xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-[#0F172A] mb-4">🎉 Job Posted Successfully!</h2>
          <p className="text-[#64748B] mb-8">
            Your job has been published! Professionals will see your photos and contact you soon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#2563EB] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#1D4ED8] transition-colors">
              View My Job
            </button>
            <button className="border-2 border-[#2563EB] text-[#2563EB] px-6 py-3 rounded-xl font-medium hover:bg-[#2563EB] hover:text-white transition-colors">
              Post Another Job
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-[#64748B]" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">Post a Job</h1>
            <p className="text-[#64748B]">Find the right professional for your needs</p>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          {renderStepIndicator()}

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}

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

              {currentStep < 2 ? (
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
                      Posting...
                    </>
                  ) : (
                    <>
                      <SendIcon className="w-5 h-5" />
                      Post Job
                    </>
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