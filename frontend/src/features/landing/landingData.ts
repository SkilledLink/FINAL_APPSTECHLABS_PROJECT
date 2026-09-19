import heroImageFile from "../../assets/heros.png";

export type Professional = {
  name: string;
  role: string;
  location: string;
  rating: string;
  projects: number;
  image: string;
  verified?: boolean;
};

export type Trade = { name: string; image: string; count: string };
export type Testimonial = { quote: string; name: string; role: string };
export type Faq = { question: string; answer: string };
export type PriceExample = { label: string; amount: number; detail: string };
export type WorkProject = {
  title: string;
  location: string;
  tags: string;
  image: string;
  alt: string;
};

const wm = (file: string, width: number) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=${width}`;

export const heroImage = heroImageFile;

export const sectionBackdrops = {
  testimonials: wm("Couturier%20ambulant%20au%20travail.jpg", 2000),
  finalCta: wm("Construction%20Workers%20in%20Douala.jpg", 2400),
};

export const heroStats = [
  { value: "08", label: "Specialties" },
  { value: "03", label: "Featured pros" },
  { value: "XAF", label: "Local pricing" },
  { value: "4.9", label: "Avg. rating" },
];

export const trades: Trade[] = [
  { name: "Electricians", count: "Wiring · Repair · Installation", image: wm("Ouvrier%20travaux%20publics%2019.jpg", 1000) },
  { name: "Builders", count: "Masonry · Structure · Finishing", image: wm("Construction%20Workers%20in%20Douala.jpg", 1000) },
  { name: "Welders", count: "Metal · Gates · Frames", image: wm("Soudeur%20au%20travail1.jpg", 1000) },
  { name: "Tailors", count: "Garments · Alterations · Design", image: wm("Couturi%C3%A8re%20dans%20son%20atelier.jpg", 1000) },
  { name: "Leather Artisans", count: "Shoes · Bags · Repairs", image: wm("Un%20artisan.jpg", 1000) },
  { name: "Road Workers", count: "Paving · Civil works", image: wm("Ouvriers%20Routiers%2025.jpg", 1000) },
  { name: "Mechanics", count: "Engine · Body · Diagnostics", image: wm("Femme%20mecanicienne.jpg", 1000) },
  { name: "Local Makers", count: "Craft · Restoration · Custom", image: wm("Couturier%20ambulant%20au%20travail.jpg", 1000) },
];

export const professionals: Professional[] = [
  { name: "Samuel N.", role: "Electrician", location: "Douala, Cameroon", rating: "4.9", projects: 128, image: wm("Ouvrier%20travaux%20publics%2019.jpg", 1400), verified: true },
  { name: "Carine M.", role: "Tailor & Designer", location: "Douala, Cameroon", rating: "4.8", projects: 76, image: wm("Couturi%C3%A8re%20dans%20son%20atelier.jpg", 1200), verified: true },
  { name: "Kondo A.", role: "Leather Artisan", location: "Maroua, Cameroon", rating: "4.9", projects: 54, image: wm("Cr%C3%A9ateur%20et%20cordonnier%20des%20chaussures%20en%20cuire.jpg", 1200), verified: true },
];

export const workProjects: WorkProject[] = [
  { title: "Residential Renovation", location: "Douala", tags: "Carpentry · Electrical · Interior", image: wm("Soudeur%20au%20travail1.jpg", 1600), alt: "Welder shaping metal on a residential renovation project in Douala" },
  { title: "Custom Leatherwork", location: "Maroua", tags: "Leather · Handmade · Repair", image: wm("Cr%C3%A9ateur%20et%20cordonnier%20des%20chaussures%20en%20cuire.jpg", 1200), alt: "Leather artisan crafting a pair of shoes by hand in Maroua" },
  { title: "Tailored Collection", location: "Douala", tags: "Tailoring · Design · Fitting", image: wm("Couturi%C3%A8re%20dans%20son%20atelier.jpg", 1200), alt: "Tailor working at her atelier on a bespoke garment" },
];

export const priceExamples: PriceExample[] = [
  { label: "Quick repair", amount: 25000, detail: "Typical starting example" },
  { label: "Home improvement", amount: 75000, detail: "Example project budget" },
  { label: "Technical installation", amount: 150000, detail: "Example project budget" },
  { label: "Larger renovation", amount: 450000, detail: "Example project budget" },
];

export const testimonials: Testimonial[] = [
  { quote: "I found a professional for a small repair in Douala without having to ask around for days. The profile made it easier to compare the work first.", name: "Amina N.", role: "Homeowner · Douala" },
  { quote: "SkilledLink gives me a place to show what I actually make. Clients can see my previous work before they contact me.", name: "Marc T.", role: "Carpenter · Buea" },
  { quote: "For our renovation in Yaoundé, having the professional, location and project details in one place made the process much clearer.", name: "Daniel K.", role: "Project manager · Yaoundé" },
];

export const faqs: Faq[] = [
  { question: "How do I find a professional in Cameroon?", answer: "Browse by trade and city, compare profiles and completed work, then contact the professional directly from SkilledLink." },
  { question: "Are professionals verified?", answer: "SkilledLink is designed around professional profiles, work history and community feedback so clients can make a more informed choice. Verification status should always be checked on the individual profile." },
  { question: "Can I join as a skilled professional?", answer: "Yes. Create your professional profile, add your trade and location, and showcase completed work so clients can discover what you do." },
  { question: "What currency does SkilledLink use?", answer: "For Cameroon-focused examples, prices are displayed in FCFA (XAF), such as 25,000 FCFA or 150,000 FCFA, instead of dollars." },
  { question: "How do I contact SkilledLink?", answer: "Send a message through the contact form or use hello@skilledlink.com. The team can help with finding professionals, joining the network or partnerships." },
];

export const navLinks = [
  { id: "trades", label: "Discover" },
  { id: "professionals", label: "Professionals" },
  { id: "work", label: "Work" },
  { id: "pricing", label: "Pricing" },
  { id: "testimonials", label: "Reviews" },
  { id: "faq", label: "FAQ" },
] as const;