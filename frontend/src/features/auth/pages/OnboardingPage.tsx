import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Briefcase, 
  MapPin, 
  Phone, 
  Upload, 
  Plus, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Building2, 
  Sparkles,
  Wrench,
  Clock,
  DollarSign
} from "lucide-react";

type RoleType = "INDIVIDUAL" | "PROFESSIONAL";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Role Selection
  const [role, setRole] = useState<RoleType>("INDIVIDUAL");

  // Step 2: Individual / General Profile Details
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Step 3: Professional Specific Details
  const [profession, setProfession] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState<number | "">("");
  const [hourlyRate, setHourlyRate] = useState<number | "">("");
  const [country, setCountry] = useState("Cameroon");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [proBio, setProBio] = useState("");

  // Skills & Services state
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [serviceInput, setServiceInput] = useState("");
  const [services, setServices] = useState<string[]>([]);

  // Validation state
  const [error, setError] = useState("");

  // Image Upload Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Add Tag Handlers
  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddService = () => {
    if (serviceInput.trim() && !services.includes(serviceInput.trim())) {
      setServices([...services, serviceInput.trim()]);
      setServiceInput("");
    }
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setServices(services.filter((s) => s !== serviceToRemove));
  };

  // Step Navigation Logic
  const totalSteps = role === "PROFESSIONAL" ? 3 : 2;

  const handleNext = () => {
    setError("");

    // Step 2 Validation
    if (currentStep === 2 && role === "INDIVIDUAL") {
      // Complete individual setup
      handleSubmit();
      return;
    }

    // Step 2 Validation for Pro
    if (currentStep === 2 && role === "PROFESSIONAL") {
      setCurrentStep(3);
      return;
    }

    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (role === "PROFESSIONAL" && !profession.trim()) {
      setError("Profession is required for professional accounts.");
      return;
    }

    const payload = {
      role,
      profile: {
        phone,
        location,
        bio: role === "INDIVIDUAL" ? bio : proBio || bio,
      },
      ...(role === "PROFESSIONAL" && {
        professionalDetails: {
          profession,
          years_of_experience: Number(yearsOfExperience) || 0,
          hourly_rate: Number(hourlyRate) || 0,
          country,
          region,
          city,
          skills,
          services,
        },
      }),
    };

    console.log("Submitting Onboarding Data:", payload);
    // TODO: Connect API call here
    navigate("/");
  };

  return (
    <div className="py-1 max-w-md mx-auto">
      {/* Progress Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {currentStep === 1 && "Account Type"}
            {currentStep === 2 && "Personal Details"}
            {currentStep === 3 && "Professional Details"}
          </span>
        </div>

        {/* Step Indicator Bar */}
        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              currentStep >= 1 ? "bg-blue-600 flex-1" : "bg-transparent"
            }`}
          />
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              currentStep >= 2 ? "bg-blue-600 flex-1" : "bg-slate-300/40 dark:bg-slate-800 flex-1"
            }`}
          />
          {role === "PROFESSIONAL" && (
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                currentStep >= 3 ? "bg-blue-600 flex-1" : "bg-slate-300/40 dark:bg-slate-800 flex-1"
              }`}
            />
          )}
        </div>
      </div>

      {error && (
        <div className="mb-3 text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 font-medium">
          {error}
        </div>
      )}

      {/* STEP 1: ROLE SELECTION */}
      {currentStep === 1 && (
        <div className="space-y-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              How do you plan to use SkilledLink?
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select your primary goal on the platform. You can change this later.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2">
            {/* Individual Option */}
            <div
              onClick={() => setRole("INDIVIDUAL")}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex items-start gap-3.5 ${
                role === "INDIVIDUAL"
                  ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-500 shadow-md shadow-blue-500/10"
                  : "border-slate-200/80 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  role === "INDIVIDUAL"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <User size={20} />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Individual / Client
                  </h3>
                  {role === "INDIVIDUAL" && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check size={12} />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  I want to hire professionals, post projects, or explore local services.
                </p>
              </div>
            </div>

            {/* Professional Option */}
            <div
              onClick={() => setRole("PROFESSIONAL")}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex items-start gap-3.5 ${
                role === "PROFESSIONAL"
                  ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-500 shadow-md shadow-blue-500/10"
                  : "border-slate-200/80 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  role === "PROFESSIONAL"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Briefcase size={20} />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Professional / Service Provider
                  </h3>
                  {role === "PROFESSIONAL" && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check size={12} />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  I offer trades, technical services, or enterprise engineering solutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PERSONAL DETAILS (Both Roles) */}
      {currentStep === 2 && (
        <div className="space-y-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Complete your profile
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Help others recognize you on the platform.
            </p>
          </div>

          {/* Profile Picture Upload Optional */}
          <div className="flex items-center gap-4 py-1">
            <div className="relative w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={24} className="text-slate-400" />
              )}
            </div>

            <div className="flex-1">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-white dark:hover:bg-slate-900 transition-all">
                <Upload size={13} className="text-blue-600 dark:text-blue-400" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Optional. PNG, JPG up to 5MB.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {/* Location */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Location
              </label>
              <div className="relative flex items-center">
                <MapPin size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Douala, Littoral"
                  className="w-full bg-white/60 dark:bg-slate-950/50 border border-slate-300/80 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <Phone size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+237 6XX XXX XXX"
                  className="w-full bg-white/60 dark:bg-slate-950/50 border border-slate-300/80 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Short Bio
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a bit about yourself..."
                className="w-full bg-white/60 dark:bg-slate-950/50 border border-slate-300/80 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PROFESSIONAL DETAILS (Only for Professionals) */}
      {currentStep === 3 && role === "PROFESSIONAL" && (
        <div className="space-y-2.5">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Professional Specs
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Highlight your trade expertise and services.
            </p>
          </div>

          <div className="space-y-2">
            {/* Profession / Trade Title */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Profession / Primary Trade <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Wrench size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="e.g. Master Electrician, Civil Contractor"
                  className="w-full bg-white/60 dark:bg-slate-950/50 border border-slate-300/80 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Experience & Rate Row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Experience (Years)
                </label>
                <div className="relative flex items-center">
                  <Clock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                  <input
                    type="number"
                    min="0"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value ? Number(e.target.value) : "")}
                    placeholder="e.g. 5"
                    className="w-full bg-white/60 dark:bg-slate-950/50 border border-slate-300/80 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hourly Rate ($ / FCFA)
                </label>
                <div className="relative flex items-center">
                  <DollarSign size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value ? Number(e.target.value) : "")}
                    placeholder="e.g. 25"
                    className="w-full bg-white/60 dark:bg-slate-950/50 border border-slate-300/80 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* City / Region / Country Row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Region / State
                </label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. Littoral"
                  className="w-full bg-white/60 dark:bg-slate-950/50 border border-slate-300/80 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Douala"
                  className="w-full bg-white/60 dark:bg-slate-950/50 border border-slate-300/80 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Tag Input: Skills */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Skills
              </label>
              <div className="flex gap-1.5 mb-1.5">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                  placeholder="Add skill (e.g. Wiring, Blueprint Reading)"
                  className="flex-1 bg-white/60 dark:bg-slate-950/50 border border-slate-300/80 dark:border-slate-800 rounded-xl px-3 py-1 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-2.5 py-1 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto no-scrollbar">
                {skills.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-medium"
                  >
                    {s}
                    <X
                      size={10}
                      className="cursor-pointer hover:text-red-500"
                      onClick={() => handleRemoveSkill(s)}
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-200/60 dark:border-slate-800/60">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer"
          >
            <ChevronLeft size={14} />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20 cursor-pointer ml-auto"
          >
            <span>Continue</span>
            <ChevronRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20 cursor-pointer ml-auto"
          >
            <Sparkles size={14} />
            <span>Complete Setup</span>
          </button>
        )}
      </div>
    </div>
  );
}