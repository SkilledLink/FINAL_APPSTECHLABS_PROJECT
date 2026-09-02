import { useMarketplace } from '../../services/hooks/useMarketplace';
import ServiceGrid from '../../services/ServiceGrid';
import ServiceSearch from '../../services/ServiceSearch';
import ServiceFilters from '../../services/Servicefilter';
import { Sparkles } from 'lucide-react';

interface MarketplacePageProps {
  onSelectService: (id: string) => void;
}

export default function MarketplacePage({ onSelectService }: MarketplacePageProps) {
  const { services, filters, setFilters, loading } = useMarketplace();

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading marketplace...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-xl relative z-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-purple-200">
            <Sparkles size={14} className="text-blue-400" /> Professional Marketplace
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Discover Expert Services</h1>
          <p className="text-purple-200 text-sm leading-relaxed">
            Hire verified professionals for full-stack development, design systems, and advanced digital solutions.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-96">
          <ServiceSearch value={filters.search} onChange={(search: string) => setFilters({ ...filters, search })} />
        </div>
        <div className="w-full md:w-auto">
          <ServiceFilters filters={filters} onChange={setFilters} />
        </div>
      </div>

      <ServiceGrid services={services} onSelectService={onSelectService} />
    </div>
  );
}