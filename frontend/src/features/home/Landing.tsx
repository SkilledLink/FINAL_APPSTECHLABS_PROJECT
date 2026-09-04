// src/features/landing/pages/LandingPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Star, 
  Users, 
  Briefcase, 
  MapPin, 
  CheckCircle,
  Rocket,
  Search,
  Play,
  ChevronRight,
  Heart,
  MessageCircle,
  Shield,
  Award,
  Zap,
  Clock,
  ThumbsUp,
  Phone,
  Mail,
  Globe,
  Building,
  FileText,
  Layers,
  Eye,
  TrendingUp,
  Lock,
  CreditCard,
  AlertCircle,
  Check,
  X,
  Menu,
  XCircle,
  UserPlus,
  Calendar,
  DollarSign
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface Stat {
  id: number;
  number: string;
  label: string;
}

interface Professional {
  id: number;
  name: string;
  profession: string;
  location: string;
  rating: number;
  reviews: number;
  verified: boolean;
  avatar: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  professional: string;
  license: string;
  price: string;
}

interface Trade {
  id: number;
  name: string;
  image: string;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
}

interface VerificationStep {
  id: number;
  step: string;
  title: string;
  description: string;
  badge: string;
}

// ============================================================
// MOCK DATA - BLACK/AFRICAN PROFESSIONALS
// ============================================================

const mockStats: Stat[] = [
  { id: 1, number: "12,400+", label: "Verified Professionals" },
  { id: 2, number: "8,500+", label: "Successful Projects" },
  { id: 3, number: "98%", label: "Satisfaction Rate" },
];

const mockTrades: Trade[] = [
  { id: 1, name: "Electrician", image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=300&q=80" },
  { id: 2, name: "Plumber", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80" },
  { id: 3, name: "Carpenter", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" },
  { id: 4, name: "Painter", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80" },
  { id: 5, name: "Welder", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" },
  { id: 6, name: "Mason", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" },
  { id: 7, name: "HVAC", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80" },
  { id: 8, name: "Landscaper", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80" },
];

const mockProfessionals: Professional[] = [
  {
    id: 1,
    name: "Jean-Pierre Nkolo",
    profession: "Master Electrician",
    location: "Douala, Cameroon",
    rating: 4.9,
    reviews: 128,
    verified: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: 2,
    name: "Marie-Claire Ngo",
    profession: "Interior Designer",
    location: "Yaoundé, Cameroon",
    rating: 4.8,
    reviews: 95,
    verified: true,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: 3,
    name: "Paul Ekambi",
    profession: "Plumbing Expert",
    location: "Buea, Cameroon",
    rating: 4.7,
    reviews: 76,
    verified: false,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
  },
];

const mockProjects: Project[] = [
  {
    id: 1,
    title: "Commercial Electrical Installation",
    description: "Full electrical installation for a new office building in Douala.",
    professional: "Jean-Pierre Nkolo",
    license: "EL-29485-CM",
    price: "8,500,000 FCFA",
  },
  {
    id: 2,
    title: "Luxury Apartment Renovation",
    description: "Full interior renovation of a luxury apartment in Bonapriso.",
    professional: "Marie-Claire Ngo",
    license: "ID-18472-CM",
    price: "14,000,000 FCFA",
  },
  {
    id: 3,
    title: "Plumbing Installation",
    description: "Complete plumbing installation for a residential complex in Yaoundé.",
    professional: "Paul Ekambi",
    license: "PL-38621-CM",
    price: "6,500,000 FCFA",
  },
];

const mockTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "David Sorensen",
    role: "Director of Facilities",
    content: "We dispatched a verified industrial electrician within 40 minutes. The escrow milestone system made immediate capital release seamless.",
    rating: 5,
  },
  {
    id: 2,
    name: "Elena Rostova",
    role: "Principal, Rostova Modern Residential",
    content: "Finding master plumbers who hold true liability coverages is nearly impossible. Fieldworks' verification filter has saved us months of delays.",
    rating: 5,
  },
  {
    id: 3,
    name: "Torin Holmgren",
    role: "Master Timber Finisher",
    content: "On Fieldwork, because my master ticket and clean bond are front and center, I close high spec architectural timber work at full rates.",
    rating: 5,
  },
];

const mockVerificationSteps: VerificationStep[] = [
  {
    id: 1,
    step: "STAGE 01",
    title: "State License Validation",
    description: "Automated continuous query directly against state licensing registries.",
    badge: "24/7 API Registry Sync",
  },
  {
    id: 2,
    step: "STAGE 02",
    title: "Liability & Bond Audit",
    description: "Every trade pro must maintain active General Liability coverage.",
    badge: "Direct Indemnitor Verification",
  },
  {
    id: 3,
    step: "STAGE 03",
    title: "Documentary Job Audit",
    description: "Client testimonial must correlate with registered escrow contracts.",
    badge: "Insurable Ledger Reviews",
  },
  {
    id: 4,
    step: "STAGE 04",
    title: "Escrow Milestone Payout",
    description: "Project funds rest in an institutional escrow vault.",
    badge: "FIDIC-Insured Escrow Trust",
  },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const Landing: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>(mockStats);
  const [trades, setTrades] = useState<Trade[]>(mockTrades);
  const [professionals, setProfessionals] = useState<Professional[]>(mockProfessionals);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(mockTestimonials);
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>(mockVerificationSteps);
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto"></div>
          <p className="mt-4 text-[#64748B]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* ===== HERO SECTION - IMAGE AS BACKGROUND ===== */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image with Low Opacity */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1920&q=80" 
            alt="Skilled tradespeople at work"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#F59E0B]/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium mb-4 border border-[#F59E0B]/30">
              <Shield className="w-3 h-3 text-[#F59E0B]" />
              <span className="text-[#F59E0B] text-xs">Hire Verified Skilled Trades with Certainty</span>
            </div>
            
            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white mb-4">
              <span className="text-[#F59E0B]">Verify</span> and Connect with 
              <br />
              Skilled Tradespeople
            </h1>
            
            {/* Subtitle */}
            <p className="text-base text-white/80 mb-6 max-w-lg leading-relaxed">
              The trusted marketplace for businesses to hire vetted professionals and 
              for tradespeople to grow their career. Quality, speed, and transparency guaranteed.
            </p>
            
            {/* Buttons - Smaller */}
            <div className="flex flex-wrap gap-3">
              <button className="bg-[#F59E0B] text-[#0F172A] px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#D97706] transition-all hover:scale-105 flex items-center gap-1.5 shadow-lg">
                Find a verified professional
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="border-2 border-white/30 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-white/10 transition-all flex items-center gap-1.5">
                Join as a professional
              </button>
            </div>
            
            {/* Trust Badges - Smaller */}
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-xs text-white/80">Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-xs text-white/80">Fast Response</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-xs text-white/80">Escrow Protection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ThumbsUp className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-xs text-white/80">Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 40L60 46.7C120 53.3 240 66.7 360 66.7C480 66.7 600 53.3 720 46.7C840 40 960 40 1080 46.7C1200 53.3 1320 66.7 1380 73.3L1440 80V80H0V40Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.id} className="text-center">
                <div className="text-2xl font-bold text-[#0F172A]">{stat.number}</div>
                <div className="text-xs text-[#64748B]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRADES SECTION ===== */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#2563EB] font-semibold text-xs uppercase tracking-wider">Trades</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-2 mb-3">
              Find Skilled Workers Near You
            </h2>
            <p className="text-sm text-[#64748B] max-w-2xl mx-auto">
              Connect with trusted professionals in Douala, Yaoundé, and across Cameroon
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {trades.map((trade) => (
              <div 
                key={trade.id}
                className="group relative overflow-hidden rounded-xl cursor-pointer shadow-sm hover:shadow-lg transition-all"
              >
                <img 
                  src={trade.image} 
                  alt={trade.name}
                  className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-semibold text-sm">{trade.name}</p>
                  <p className="text-white/70 text-xs">Available in Cameroon</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <button className="text-[#2563EB] font-semibold text-sm hover:text-[#1D4ED8] flex items-center gap-1 mx-auto">
              View All Trades <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PROFESSIONALS ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#2563EB] font-semibold text-xs uppercase tracking-wider">Professionals</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-2 mb-3">
              Featured Skilled Workers
            </h2>
            <p className="text-sm text-[#64748B] max-w-2xl mx-auto">
              Top-rated professionals in Douala, Yaoundé, and across Cameroon
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {professionals.map((pro) => (
              <div key={pro.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={pro.avatar} alt={pro.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#2563EB]/20" />
                    <div>
                      <h4 className="font-semibold text-[#0F172A]">{pro.name}</h4>
                      <p className="text-xs text-[#64748B]">{pro.profession}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {pro.location}</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" /> {pro.rating}</span>
                    <span>({pro.reviews})</span>
                  </div>
                  {pro.verified && (
                    <div className="mt-2 inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </div>
                  )}
                  <button className="w-full mt-3 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROOF OF CRAFT ===== */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#2563EB] font-semibold text-xs uppercase tracking-wider">Projects</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-2 mb-3">
              Recent Work
            </h2>
            <p className="text-sm text-[#64748B] max-w-2xl mx-auto">
              Real projects completed by verified professionals in Cameroon
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-lg transition-all">
                <h3 className="font-semibold text-[#0F172A] text-base mb-2">{project.title}</h3>
                <p className="text-sm text-[#64748B] mb-3">{project.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-[#0F172A]">{project.professional}</p>
                    <p className="text-xs text-[#64748B]">{project.license}</p>
                  </div>
                  <span className="text-[#2563EB] font-semibold text-sm">{project.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VERIFICATION PROTOCOL ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#2563EB] font-semibold text-xs uppercase tracking-wider">Verification</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-2 mb-3">
              The Fieldwork 4-Step Verification Protocol
            </h2>
            <p className="text-sm text-[#64748B] max-w-2xl mx-auto">
              Institutional background validation directly through state databases
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {verificationSteps.map((step) => (
              <div key={step.id} className="bg-[#F8FAFC] rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-[#2563EB]/10 rounded-lg flex items-center justify-center">
                      <span className="text-[#2563EB] font-bold text-xs">{step.step.split(' ')[1]}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded-full">
                        {step.step}
                      </span>
                      <span className="text-xs text-[#64748B]">{step.badge}</span>
                    </div>
                    <h3 className="text-base font-semibold text-[#0F172A] mb-1">{step.title}</h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#2563EB] font-semibold text-xs uppercase tracking-wider">Testimonials</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-2 mb-3">
              What Our Clients Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                  ))}
                </div>
                <p className="text-sm text-[#0F172A] leading-relaxed mb-3">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-[#0F172A] text-sm">{testimonial.name}</p>
                  <p className="text-xs text-[#64748B]">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-16 bg-[#2563EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-sm text-white/80 mb-6 max-w-2xl mx-auto">
            Join thousands of verified professionals and businesses already on Fieldwork Social
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="bg-[#F59E0B] text-[#0F172A] px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#D97706] transition-all hover:scale-105 flex items-center gap-2 justify-center shadow-lg">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="border-2 border-white/30 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-white/10 transition-all flex items-center gap-2 justify-center">
              Learn More
            </button>
          </div>
          
          <p className="text-xs text-white/60 mt-4">
            No credit card required • Free forever • Join 10,000+ professionals
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;