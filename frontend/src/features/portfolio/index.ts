// src/features/portfolio/index.ts

/* Pages */
export { default as PortfolioDashboard } from './pages/PortfolioDashboard';

/* Components */
export { default as PortfolioHeader } from './components/PortfolioHeader';
export { default as PortfolioStats } from './components/PortfolioStats';
export { default as PortfolioTabs } from './components/PortfolioTabs';
export { default as PortfolioServices } from './components/PortfolioServices';
export { default as PortfolioServiceForm } from './components/PortfolioServiceForm';
export { default as PortfolioWorks } from './components/PortfolioWorks';
export { default as PortfolioWorkForm } from './components/PortfolioWorkForm';
export { default as PortfolioAvailability } from './components/PortfolioAvailability';
export { default as PortfolioAboutTab } from './components/PortfolioAboutTab';
export { default as PortfolioCreateForm } from './components/PortfolioCreateForm';
export { default as EditPortfolioModal } from './components/EditPortfolioModal';
export { default as LoadingState } from './components/LoadingState';
export { default as ErrorState } from './components/ErrorState';
export { default as ProfessionalRequired } from './components/ProfessionalRequired';


/* UI-only types — live with their components */
export type { PortfolioTab } from './components/PortfolioTabs';

/* Hooks */
export { usePortfolio, usePublicPortfolio } from './hooks/usePortfolio';

/* Service */
export { portfolioService } from './services/portfolioService';

/* Backend types */
export type {
  Availability,
  AvailabilityDay,
  AvailabilityInput,
  Category,
  ClientType,
  DurationUnit,
  Portfolio,
  PortfolioAuthor,
  PortfolioCreateInput,
  PortfolioUpdateInput,
  PricingType,
  PublicPortfolio,
  Service,
  ServiceCreateInput,
  ServiceFAQ,
  ServiceUpdateInput,
  Specialty,
  Work,
  WorkCreateInput,
  WorkUpdateInput,
} from './types/portfolio.types';