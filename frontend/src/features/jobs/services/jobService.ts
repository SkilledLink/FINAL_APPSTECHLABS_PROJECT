import type { Application, Comment, Job, Poster } from '../types/job.types';

const JOBS_KEY = 'workcm_jobs_v1';
const APPS_KEY = 'workcm_applications_v1';

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function makePosters(): Record<string, Poster> {
  return {
    p1: {
      id: 'p1',
      name: 'Nji Samuel',
      avatar: '',
      title: 'Engineering Manager',
      company: 'ActivEdge Technologies',
      verified: true,
      rating: 4.9,
      reviewCount: 12,
      memberSince: '2022',
      reviews: [
        { id: 'r1', authorName: 'Etienne A.', authorAvatar: '', rating: 5, comment: 'Very responsive and professional throughout the hiring process.', date: daysAgo(5) },
        { id: 'r2', authorName: 'Marie T.', authorAvatar: '', rating: 5, comment: 'Clear expectations and fair compensation. Highly recommend.', date: daysAgo(12) },
        { id: 'r3', authorName: 'Boris K.', authorAvatar: '', rating: 4, comment: 'Good experience overall, onboarding was smooth.', date: daysAgo(20) },
      ],
    },
    p2: {
      id: 'p2',
      name: 'Aïcha Bello',
      avatar: '',
      title: 'Talent Acquisition Lead',
      company: 'MTN Cameroon',
      verified: true,
      rating: 4.7,
      reviewCount: 24,
      memberSince: '2021',
      reviews: [
        { id: 'r4', authorName: 'Sandra E.', authorAvatar: '', rating: 5, comment: 'Fast response and transparent process. Got an offer within a week.', date: daysAgo(3) },
        { id: 'r5', authorName: 'Patrick N.', authorAvatar: '', rating: 4, comment: 'Professional team, good communication at every stage.', date: daysAgo(15) },
      ],
    },
    p3: {
      id: 'p3',
      name: 'Dr. Fomba Carlson',
      avatar: '',
      title: 'Founder & CTO',
      company: 'Njorka',
      verified: true,
      rating: 4.8,
      reviewCount: 8,
      memberSince: '2023',
      reviews: [
        { id: 'r6', authorName: 'Lilian D.', authorAvatar: '', rating: 5, comment: 'Great startup culture, real impact and mentorship.', date: daysAgo(7) },
        { id: 'r7', authorName: 'Gerald M.', authorAvatar: '', rating: 4, comment: 'Exciting mission, fast-paced but rewarding.', date: daysAgo(18) },
      ],
    },
    p4: {
      id: 'p4',
      name: 'Veronica Fon',
      avatar: '',
      title: 'Creative Director',
      company: 'Buea Design Studio',
      verified: false,
      rating: 4.5,
      reviewCount: 6,
      memberSince: '2023',
      reviews: [
        { id: 'r8', authorName: 'Arnold B.', authorAvatar: '', rating: 5, comment: 'Collaborative and flexible. Loved working with this team.', date: daysAgo(4) },
        { id: 'r9', authorName: 'Nancy K.', authorAvatar: '', rating: 4, comment: 'Good briefs and clear feedback on deliverables.', date: daysAgo(25) },
      ],
    },
    p5: {
      id: 'p5',
      name: 'Ousmanou Garba',
      avatar: '',
      title: 'Operations Manager',
      company: 'SODECOTON',
      verified: true,
      rating: 4.3,
      reviewCount: 15,
      memberSince: '2020',
      reviews: [
        { id: 'r10', authorName: 'Issa M.', authorAvatar: '', rating: 4, comment: 'Stable position with good benefits. Process took a while though.', date: daysAgo(10) },
        { id: 'r11', authorName: 'Hawa N.', authorAvatar: '', rating: 5, comment: 'Excellent onboarding and supportive management.', date: daysAgo(22) },
      ],
    },
    p6: {
      id: 'p6',
      name: 'Claire Atangana',
      avatar: '',
      title: 'HR Business Partner',
      company: 'UBA Cameroon',
      verified: true,
      rating: 4.6,
      reviewCount: 19,
      memberSince: '2021',
      reviews: [
        { id: 'r12', authorName: 'Junior T.', authorAvatar: '', rating: 5, comment: 'Smooth interview process, fair salary negotiation.', date: daysAgo(6) },
        { id: 'r13', authorName: 'Diane S.', authorAvatar: '', rating: 4, comment: 'Professional and organized. Would apply again.', date: daysAgo(14) },
      ],
    },
  };
}

const posters = makePosters();

function makeMockJobs(): Job[] {
  return [
    {
      id: 'j1',
      title: 'Full-Stack Developer',
      poster: posters.p1,
      category: 'Technology',
      location: 'Douala',
      jobType: 'Full-time',
      salaryMin: 450000,
      salaryMax: 800000,
      postedAt: daysAgo(1),
      status: 'active',
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs'],
      description:
        'We are looking for a Full-Stack Developer to join our engineering team in Douala. You will build and maintain web applications serving thousands of users across Cameroon, working with modern JavaScript frameworks and cloud infrastructure.',
      requirements: [
        '3+ years of experience with React and Node.js',
        'Strong knowledge of TypeScript',
        'Experience with PostgreSQL and REST API design',
        'Familiarity with AWS or similar cloud platforms',
        'Bachelor’s degree in Computer Science or equivalent experience',
      ],
      responsibilities: [
        'Design and develop scalable web applications',
        'Collaborate with product and design teams',
        'Write clean, tested, and maintainable code',
        'Participate in code reviews and mentor junior developers',
      ],
      likes: 34,
      likedByMe: false,
      comments: [
        { id: 'c1', authorName: 'Brice Tagne', authorAvatar: '', text: 'Is remote work an option for this role?', createdAt: daysAgo(0.5) },
        { id: 'c2', authorName: 'Nji Samuel', authorAvatar: '', text: 'Hybrid — 3 days on-site in Douala, 2 days remote.', createdAt: daysAgo(0.4) },
      ],
      shares: 12,
      matchScore: 92,
    },
    {
      id: 'j2',
      title: 'Mobile Money Systems Engineer',
      poster: posters.p2,
      category: 'Finance & Fintech',
      location: 'Yaoundé',
      jobType: 'Full-time',
      salaryMin: 600000,
      salaryMax: 1000000,
      postedAt: daysAgo(2),
      status: 'active',
      skills: ['Java', 'Spring Boot', 'Kafka', 'Microservices', 'Payment Systems'],
      description:
        'Join MTN Cameroon’s MoMo platform team to build and scale mobile money transaction systems processing millions of daily transactions. You will work on high-availability microservices and ensure system reliability and security.',
      requirements: [
        '4+ years building backend systems with Java/Spring',
        'Experience with message queues (Kafka, RabbitMQ)',
        'Understanding of payment processing and financial systems',
        'Knowledge of microservices architecture',
      ],
      responsibilities: [
        'Design and maintain high-throughput transaction services',
        'Implement monitoring, alerting, and incident response',
        'Ensure compliance with financial regulations',
        'Optimize database performance for high-volume systems',
      ],
      likes: 51,
      likedByMe: false,
      comments: [
        { id: 'c3', authorName: 'Felix N.', authorAvatar: '', text: 'What’s the tech stack for the MoMo platform?', createdAt: daysAgo(1) },
        { id: 'c4', authorName: 'Aïcha Bello', authorAvatar: '', text: 'Java 17, Spring Boot, Kafka, and Kubernetes.', createdAt: daysAgo(0.9) },
      ],
      shares: 28,
      matchScore: 88,
    },
    {
      id: 'j3',
      title: 'Graphic Designer',
      poster: posters.p4,
      category: 'Design & Creative',
      location: 'Buea',
      jobType: 'Freelance',
      salaryMin: 150000,
      salaryMax: 350000,
      postedAt: daysAgo(3),
      status: 'active',
      skills: ['Figma', 'Adobe Illustrator', 'Branding', 'Social Media Design'],
      description:
        'We need a creative Graphic Designer to produce visual assets for local businesses and international clients. You will work on branding, social media content, and print materials with a focus on clean, modern aesthetics.',
      requirements: [
        '2+ years of professional design experience',
        'Strong portfolio demonstrating branding and layout work',
        'Proficiency in Figma and Adobe Creative Suite',
        'Ability to manage multiple projects simultaneously',
      ],
      responsibilities: [
        'Create brand identities and visual systems',
        'Design social media graphics and marketing collateral',
        'Prepare print-ready files for production',
        'Collaborate with clients to refine creative direction',
      ],
      likes: 23,
      likedByMe: false,
      comments: [
        { id: 'c5', authorName: 'Esther L.', authorAvatar: '', text: 'Is this remote-friendly? I’m based in Limbe.', createdAt: daysAgo(2) },
        { id: 'c6', authorName: 'Veronica Fon', authorAvatar: '', text: 'Yes! Fully remote, with occasional in-person meetings in Buea.', createdAt: daysAgo(1.9) },
      ],
      shares: 9,
      matchScore: 76,
    },
    {
      id: 'j4',
      title: 'Mobile App Developer (Flutter)',
      poster: posters.p3,
      category: 'Technology',
      location: 'Yaoundé',
      jobType: 'Contract',
      salaryMin: 500000,
      salaryMax: 750000,
      postedAt: daysAgo(4),
      status: 'active',
      skills: ['Flutter', 'Dart', 'Firebase', 'REST APIs', 'CI/CD'],
      description:
        'Njorka is building Cameroon’s leading job search platform. We need a Flutter developer to build and ship our cross-platform mobile app, working closely with the founding team in a fast-paced startup environment.',
      requirements: [
        '2+ years building Flutter apps published to Play Store / App Store',
        'Solid understanding of Dart and state management (Riverpod/Bloc)',
        'Experience with Firebase and REST API integration',
        'Comfortable in a startup environment',
      ],
      responsibilities: [
        'Build and maintain the Njorka mobile app in Flutter',
        'Implement clean, reusable UI components',
        'Integrate backend APIs and real-time features',
        'Optimize app performance and crash reporting',
      ],
      likes: 40,
      likedByMe: false,
      comments: [
        { id: 'c7', authorName: 'Alphonse D.', authorAvatar: '', text: 'Is the contract renewable or fixed-term?', createdAt: daysAgo(3) },
        { id: 'c8', authorName: 'Dr. Fomba Carlson', authorAvatar: '', text: '6-month contract with strong possibility of full-time conversion.', createdAt: daysAgo(2.8) },
      ],
      shares: 15,
      matchScore: 84,
    },
    {
      id: 'j5',
      title: 'Civil Engineer — Road Construction',
      poster: posters.p5,
      category: 'Engineering',
      location: 'Garoua',
      jobType: 'Full-time',
      salaryMin: 700000,
      salaryMax: 1200000,
      postedAt: daysAgo(5),
      status: 'active',
      skills: ['AutoCAD', 'Site Management', 'Surveying', 'Project Planning'],
      description:
        'SODECOTON is seeking a Civil Engineer to oversee road construction and infrastructure projects in the North Region. You will manage site operations, coordinate with contractors, and ensure quality and safety standards.',
      requirements: [
        'Degree in Civil Engineering',
        '5+ years experience in road or infrastructure construction',
        'Proficiency in AutoCAD and project management tools',
        'Willingness to work on-site in the North Region',
      ],
      responsibilities: [
        'Supervise construction sites and contractor activities',
        'Conduct site surveys and quality inspections',
        'Prepare progress reports and technical documentation',
        'Ensure compliance with safety and environmental standards',
      ],
      likes: 18,
      likedByMe: false,
      comments: [
        { id: 'c9', authorName: 'Moussa A.', authorAvatar: '', text: 'Is accommodation provided for non-local engineers?', createdAt: daysAgo(4) },
        { id: 'c10', authorName: 'Ousmanou Garba', authorAvatar: '', text: 'Yes, housing allowance is included in the package.', createdAt: daysAgo(3.5) },
      ],
      shares: 7,
      matchScore: 65,
    },
    {
      id: 'j6',
      title: 'Digital Marketing Specialist',
      poster: posters.p6,
      category: 'Marketing',
      location: 'Douala',
      jobType: 'Full-time',
      salaryMin: 350000,
      salaryMax: 600000,
      postedAt: daysAgo(6),
      status: 'active',
      skills: ['SEO', 'Google Ads', 'Meta Ads', 'Content Strategy', 'Analytics'],
      description:
        'Drive digital growth for UBA Cameroon’s products and campaigns. You will manage paid media, optimize SEO, and create data-driven content strategies to grow customer acquisition across digital channels.',
      requirements: [
        '3+ years in digital marketing roles',
        'Hands-on experience with Google Ads and Meta Ads Manager',
        'Strong analytical skills and familiarity with GA4',
        'Excellent written communication in English and French',
      ],
      responsibilities: [
        'Plan and execute paid media campaigns',
        'Optimize SEO and content for web properties',
        'Analyze campaign performance and report on KPIs',
        'Coordinate with creative and product teams',
      ],
      likes: 29,
      likedByMe: false,
      comments: [
        { id: 'c11', authorName: 'Cynthia A.', authorAvatar: '', text: 'Is bilingual French/English required?', createdAt: daysAgo(5) },
        { id: 'c12', authorName: 'Claire Atangana', authorAvatar: '', text: 'Yes, bilingual proficiency is required for this role.', createdAt: daysAgo(4.8) },
      ],
      shares: 11,
      matchScore: 79,
    },
    {
      id: 'j7',
      title: 'Field Sales Representative',
      poster: posters.p5,
      category: 'Sales & Retail',
      location: 'Bamenda',
      jobType: 'Full-time',
      salaryMin: 200000,
      salaryMax: 400000,
      postedAt: daysAgo(7),
      status: 'active',
      skills: ['Sales', 'Negotiation', 'Customer Relations', 'FMCG'],
      description:
        'We are hiring Field Sales Representatives to drive distribution and sales of FMCG products across the North West Region. You will build relationships with retailers, manage territory coverage, and meet monthly sales targets.',
      requirements: [
        '2+ years in field sales or FMCG distribution',
        'Strong negotiation and relationship-building skills',
        'Valid driving license (motorbike acceptable)',
        'Familiarity with the Bamenda market',
      ],
      responsibilities: [
        'Visit retail outlets and build customer relationships',
        'Achieve monthly sales and distribution targets',
        'Collect market intelligence and competitor activity',
        'Maintain accurate sales records and reports',
      ],
      likes: 14,
      likedByMe: false,
      comments: [
        { id: 'c13', authorName: 'Tobias N.', authorAvatar: '', text: 'Is a company motorbike provided?', createdAt: daysAgo(6) },
        { id: 'c14', authorName: 'Ousmanou Garba', authorAvatar: '', text: 'Yes, a motorbike and fuel allowance are provided.', createdAt: daysAgo(5.5) },
      ],
      shares: 5,
      matchScore: 58,
    },
    {
      id: 'j8',
      title: 'Nurse — Primary Healthcare',
      poster: posters.p6,
      category: 'Healthcare',
      location: 'Limbe',
      jobType: 'Full-time',
      salaryMin: 250000,
      salaryMax: 450000,
      postedAt: daysAgo(8),
      status: 'active',
      skills: ['Patient Care', 'Triage', 'Medical Records', 'First Aid'],
      description:
        'A primary healthcare facility in Limbe is seeking a qualified Nurse to provide patient care, conduct health assessments, and support community health programs in the South West Region.',
      requirements: [
        'Registered Nurse with valid Cameroon nursing license',
        '2+ years clinical experience',
        'Strong patient communication skills',
        'Basic life support certification',
      ],
      responsibilities: [
        'Provide direct patient care and health assessments',
        'Administer medications and treatments',
        'Maintain accurate medical records',
        'Support community health outreach programs',
      ],
      likes: 21,
      likedByMe: false,
      comments: [
        { id: 'c15', authorName: 'Grace M.', authorAvatar: '', text: 'Are shift rotations involved?', createdAt: daysAgo(7) },
        { id: 'c16', authorName: 'Claire Atangana', authorAvatar: '', text: 'Yes, day and night shifts on a rotating schedule.', createdAt: daysAgo(6.8) },
      ],
      shares: 8,
      matchScore: 71,
    },
    {
      id: 'j9',
      title: 'Logistics Coordinator',
      poster: posters.p2,
      category: 'Logistics',
      location: 'Douala',
      jobType: 'Contract',
      salaryMin: 400000,
      salaryMax: 650000,
      postedAt: daysAgo(10),
      status: 'closed',
      skills: ['Supply Chain', 'Inventory Management', 'SAP', 'Customs'],
      description:
        'Coordinate logistics operations at the Douala port, managing imports, customs clearance, and warehouse distribution. This role requires strong organizational skills and knowledge of Cameroon customs procedures.',
      requirements: [
        '3+ years in logistics or supply chain management',
        'Experience with customs clearance procedures',
        'Proficiency in logistics software (SAP, Oracle)',
        'Knowledge of Douala port operations',
      ],
      responsibilities: [
        'Manage import/export documentation and customs clearance',
        'Coordinate warehouse and distribution operations',
        'Track shipments and resolve logistics issues',
        'Optimize supply chain processes and reduce costs',
      ],
      likes: 17,
      likedByMe: false,
      comments: [
        { id: 'c17', authorName: 'Emmanuel T.', authorAvatar: '', text: 'Is this position still open?', createdAt: daysAgo(8) },
        { id: 'c18', authorName: 'Aïcha Bello', authorAvatar: '', text: 'This position is now closed. Thank you for your interest.', createdAt: daysAgo(7) },
      ],
      shares: 4,
      matchScore: 0,
    },
    {
      id: 'j10',
      title: 'Primary School Teacher',
      poster: posters.p4,
      category: 'Education',
      location: 'Buea',
      jobType: 'Full-time',
      salaryMin: 180000,
      salaryMax: 300000,
      postedAt: daysAgo(12),
      status: 'active',
      skills: ['Lesson Planning', 'Classroom Management', 'English Language', 'Mathematics'],
      description:
        'A growing bilingual primary school in Buea is looking for a passionate teacher to deliver engaging lessons in English and Mathematics for upper primary classes. Strong classroom management and creativity are essential.',
      requirements: [
        'Teaching qualification or education degree',
        '2+ years teaching experience at primary level',
        'Fluency in English (French is a plus)',
        'Strong classroom management skills',
      ],
      responsibilities: [
        'Plan and deliver lessons in English and Mathematics',
        'Assess and track student progress',
        'Communicate with parents and school administration',
        'Participate in school events and extracurricular activities',
      ],
      likes: 19,
      likedByMe: false,
      comments: [
        { id: 'c19', authorName: 'Patience N.', authorAvatar: '', text: 'What curriculum does the school follow?', createdAt: daysAgo(10) },
        { id: 'c20', authorName: 'Veronica Fon', authorAvatar: '', text: 'Cameroon national curriculum with bilingual elements.', createdAt: daysAgo(9) },
      ],
      shares: 6,
      matchScore: 68,
    },
    {
      id: 'j11',
      title: 'Backend Engineer (Go)',
      poster: posters.p3,
      category: 'Technology',
      location: 'Yaoundé',
      jobType: 'Full-time',
      salaryMin: 550000,
      salaryMax: 900000,
      postedAt: daysAgo(0.3),
      status: 'active',
      skills: ['Go', 'gRPC', 'PostgreSQL', 'Docker', 'Kubernetes'],
      description:
        'Njorka is looking for a Backend Engineer to build high-performance services in Go. You will design APIs, optimize database performance, and help scale our infrastructure to serve job seekers across Cameroon.',
      requirements: [
        '3+ years building production backend systems in Go',
        'Deep knowledge of PostgreSQL and query optimization',
        'Experience with Docker and Kubernetes',
        'Understanding of gRPC and protobuf',
      ],
      responsibilities: [
        'Design and implement Go microservices',
        'Optimize database schemas and queries',
        'Build CI/CD pipelines and deployment automation',
        'Collaborate with frontend and mobile teams on API design',
      ],
      likes: 8,
      likedByMe: false,
      comments: [],
      shares: 2,
      matchScore: 90,
    },
    {
      id: 'j12',
      title: 'Electrician — Solar Installation',
      poster: posters.p5,
      category: 'Trades & Construction',
      location: 'Maroua',
      jobType: 'Contract',
      salaryMin: 300000,
      salaryMax: 500000,
      postedAt: daysAgo(9),
      status: 'active',
      skills: ['Solar PV', 'Electrical Wiring', 'Installation', 'Maintenance'],
      description:
        'Install and maintain solar power systems for rural electrification projects in the Far North Region. We need certified electricians with experience in solar PV installation and a willingness to travel to remote sites.',
      requirements: [
        'Certified electrician with solar PV experience',
        '2+ years installing solar systems',
        'Ability to travel to remote locations',
        'Knowledge of battery storage systems',
      ],
      responsibilities: [
        'Install solar panels, inverters, and battery systems',
        'Conduct site assessments and load calculations',
        'Perform maintenance and troubleshooting',
        'Train local technicians on basic maintenance',
      ],
      likes: 12,
      likedByMe: false,
      comments: [
        { id: 'c21', authorName: 'Abdoulaye B.', authorAvatar: '', text: 'Is travel allowance included?', createdAt: daysAgo(8) },
        { id: 'c22', authorName: 'Ousmanou Garba', authorAvatar: '', text: 'Yes, full travel and per diem allowances are covered.', createdAt: daysAgo(7.5) },
      ],
      shares: 3,
      matchScore: 62,
    },
  ];
}

function loadJobs(): Job[] {
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    if (raw) return JSON.parse(raw) as Job[];
  } catch {
    // fall through to seed
  }
  const seed = makeMockJobs();
  saveJobs(seed);
  return seed;
}

function saveJobs(jobs: Job[]): void {
  try {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  } catch {
    // ignore quota errors
  }
}

function loadApplications(): Application[] {
  try {
    const raw = localStorage.getItem(APPS_KEY);
    if (raw) return JSON.parse(raw) as Application[];
  } catch {
    // fall through
  }
  return [];
}

function saveApplications(apps: Application[]): void {
  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(apps));
  } catch {
    // ignore
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchJobs(): Promise<Job[]> {
  await delay(500);
  return loadJobs();
}

export async function fetchJobById(id: string): Promise<Job | undefined> {
  await delay(300);
  return loadJobs().find((j) => j.id === id);
}

export async function toggleLike(jobId: string): Promise<Job[]> {
  await delay(150);
  const jobs = loadJobs().map((j) =>
    j.id === jobId
      ? { ...j, likedByMe: !j.likedByMe, likes: j.likedByMe ? j.likes - 1 : j.likes + 1 }
      : j,
  );
  saveJobs(jobs);
  return jobs;
}

export async function addComment(jobId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Job[]> {
  await delay(200);
  const jobs = loadJobs().map((j) =>
    j.id === jobId
      ? {
          ...j,
          comments: [
            ...j.comments,
            { ...comment, id: `c${Date.now()}`, createdAt: new Date().toISOString() },
          ],
        }
      : j,
  );
  saveJobs(jobs);
  return jobs;
}

export async function shareJob(jobId: string): Promise<Job[]> {
  await delay(100);
  const jobs = loadJobs().map((j) => (j.id === jobId ? { ...j, shares: j.shares + 1 } : j));
  saveJobs(jobs);
  return jobs;
}

export async function postJob(
  data: Omit<Job, 'id' | 'postedAt' | 'status' | 'likes' | 'likedByMe' | 'comments' | 'shares' | 'matchScore' | 'poster'> & {
    posterName: string;
    posterTitle: string;
    posterCompany: string;
  },
): Promise<Job[]> {
  await delay(400);
  const jobs = loadJobs();
  const poster: Poster = {
    id: `p${Date.now()}`,
    name: data.posterName,
    avatar: '',
    title: data.posterTitle,
    company: data.posterCompany,
    verified: false,
    rating: 0,
    reviewCount: 0,
    reviews: [],
    memberSince: new Date().getFullYear().toString(),
  };
  const newJob: Job = {
    id: `j${Date.now()}`,
    title: data.title,
    poster,
    category: data.category,
    location: data.location,
    jobType: data.jobType,
    salaryMin: data.salaryMin,
    salaryMax: data.salaryMax,
    postedAt: new Date().toISOString(),
    status: 'active',
    skills: data.skills,
    description: data.description,
    requirements: data.requirements,
    responsibilities: data.responsibilities,
    likes: 0,
    likedByMe: false,
    comments: [],
    shares: 0,
    matchScore: Math.floor(Math.random() * 30) + 60,
  };
  const updated = [newJob, ...jobs];
  saveJobs(updated);
  return updated;
}

export async function fetchApplications(): Promise<Application[]> {
  await delay(200);
  return loadApplications();
}

export async function createApplication(app: Omit<Application, 'id' | 'appliedAt' | 'status'>): Promise<Application[]> {
  await delay(300);
  const apps = loadApplications();
  const newApp: Application = {
    ...app,
    id: `a${Date.now()}`,
    appliedAt: new Date().toISOString(),
    status: 'sent',
  };
  const updated = [newApp, ...apps];
  saveApplications(updated);
  return updated;
}

export function resetJobs(): void {
  localStorage.removeItem(JOBS_KEY);
  localStorage.removeItem(APPS_KEY);
}
