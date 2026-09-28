import { useCallback, useEffect, useRef, useState } from 'react';
import { portfolioService } from '../services/portfolioService';
import type {
  Availability,
  AvailabilityInput,
  Category,
  Portfolio,
  PortfolioCreateInput,
  PortfolioUpdateInput,
  Service,
  ServiceCreateInput,
  ServiceUpdateInput,
  Work,
  WorkCreateInput,
  WorkUpdateInput,
} from '../types/portfolio.types';

/* ── Own portfolio ──────────────────────────────────── */

export interface UsePortfolioResult {
  portfolio: Portfolio | null;
  services: Service[];
  works: Work[];
  availability: Availability[];
  categories: Category[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createPortfolio: (input: PortfolioCreateInput) => Promise<Portfolio | null>;
  updatePortfolio: (input: PortfolioUpdateInput) => Promise<Portfolio | null>;
  deletePortfolio: () => Promise<boolean>;

  createService: (input: ServiceCreateInput) => Promise<Service | null>;
  updateService: (id: string, input: ServiceUpdateInput) => Promise<Service | null>;
  deleteService: (id: string) => Promise<boolean>;
  uploadServiceBanner: (id: string, file: File) => Promise<Service | null>;
  uploadServiceGallery: (id: string, files: File[]) => Promise<Service | null>;

  createWork: (input: WorkCreateInput) => Promise<Work | null>;
  updateWork: (id: string, input: WorkUpdateInput) => Promise<Work | null>;
  deleteWork: (id: string) => Promise<boolean>;
  uploadWorkImages: (
    workId: string,
    files: { before?: File; after?: File }
  ) => Promise<Work | null>;

  setAvailability: (items: AvailabilityInput[]) => Promise<Availability[] | null>;
}

export function usePortfolio(enabled = true): UsePortfolioResult {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const [p, svc, w, av, cats] = await Promise.all([
        portfolioService.getMine(),
        portfolioService.listServices().catch(() => []),
        portfolioService.listWorks().catch(() => []),
        portfolioService.getAvailability().catch(() => []),
        portfolioService.listCategories().catch(() => []),
      ]);
      setPortfolio(p);
      setServices(svc);
      setWorks(w);
      setAvailability(av);
      setCategories(cats);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || fetchedRef.current) return;
    fetchedRef.current = true;
    refresh();
  }, [enabled, refresh]);

  /* ── Portfolio CRUD ─────────────────────────────── */

  const createPortfolio = useCallback(
    async (input: PortfolioCreateInput) => {
      setSaving(true);
      setError(null);
      try {
        const p = await portfolioService.create(input);
        setPortfolio(p);
        return p;
      } catch (err: any) {
        setError(err?.message ?? 'Failed to create portfolio');
        return null;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const updatePortfolio = useCallback(async (input: PortfolioUpdateInput) => {
    setSaving(true);
    setError(null);
    try {
      const p = await portfolioService.update(input);
      setPortfolio(p);
      return p;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update portfolio');
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const deletePortfolio = useCallback(async () => {
    setSaving(true);
    try {
      await portfolioService.remove();
      setPortfolio(null);
      setServices([]);
      setWorks([]);
      setAvailability([]);
      return true;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete portfolio');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  /* ── Services ───────────────────────────────────── */

  const createService = useCallback(async (input: ServiceCreateInput) => {
    setSaving(true);
    setError(null);
    try {
      const s = await portfolioService.createService(input);
      setServices((prev) => [s, ...prev]);
      return s;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create service');
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateService = useCallback(
    async (id: string, input: ServiceUpdateInput) => {
      setSaving(true);
      setError(null);
      try {
        const s = await portfolioService.updateService(id, input);
        setServices((prev) => prev.map((x) => (x.id === id ? s : x)));
        return s;
      } catch (err: any) {
        setError(err?.message ?? 'Failed to update service');
        return null;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const deleteService = useCallback(async (id: string) => {
    setSaving(true);
    try {
      await portfolioService.deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete service');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const uploadServiceBanner = useCallback(
    async (id: string, file: File) => {
      setSaving(true);
      setError(null);
      try {
        const s = await portfolioService.uploadServiceBanner(id, file);
        setServices((prev) => prev.map((x) => (x.id === id ? s : x)));
        return s;
      } catch (err: any) {
        setError(err?.message ?? 'Failed to upload banner');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const uploadServiceGallery = useCallback(
    async (id: string, files: File[]) => {
      setSaving(true);
      setError(null);
      try {
        const s = await portfolioService.uploadServiceGallery(id, files);
        setServices((prev) => prev.map((x) => (x.id === id ? s : x)));
        return s;
      } catch (err: any) {
        setError(err?.message ?? 'Failed to upload gallery');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  /* ── Works ──────────────────────────────────────── */

  const createWork = useCallback(async (input: WorkCreateInput) => {
    setSaving(true);
    setError(null);
    try {
      const w = await portfolioService.createWork(input);
      setWorks((prev) => [w, ...prev]);
      return w;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create work');
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateWork = useCallback(async (id: string, input: WorkUpdateInput) => {
    setSaving(true);
    setError(null);
    try {
      const w = await portfolioService.updateWork(id, input);
      setWorks((prev) => prev.map((x) => (x.id === id ? w : x)));
      return w;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update work');
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteWork = useCallback(async (id: string) => {
    setSaving(true);
    try {
      await portfolioService.deleteWork(id);
      setWorks((prev) => prev.filter((w) => w.id !== id));
      return true;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete work');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const uploadWorkImages = useCallback(
    async (workId: string, files: { before?: File; after?: File }) => {
      setSaving(true);
      try {
        const w = await portfolioService.uploadWorkImages(workId, files);
        setWorks((prev) => prev.map((x) => (x.id === workId ? w : x)));
        return w;
      } catch (err: any) {
        setError(err?.message ?? 'Failed to upload images');
        return null;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  /* ── Availability ───────────────────────────────── */

  const setAvailabilityFn = useCallback(async (items: AvailabilityInput[]) => {
    setSaving(true);
    try {
      const av = await portfolioService.setAvailability(items);
      setAvailability(av);
      return av;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save availability');
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    portfolio,
    services,
    works,
    availability,
    categories,
    loading,
    saving,
    error,
    refresh,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    createService,
    updateService,
    deleteService,
    uploadServiceBanner,
    uploadServiceGallery,
    createWork,
    updateWork,
    deleteWork,
    uploadWorkImages,
    setAvailability: setAvailabilityFn,
  };
}

/* ── Public portfolio ───────────────────────────────── */

export function usePublicPortfolio(userId: string | undefined) {
  const [data, setData] = useState<
    import('../types/portfolio.types').PublicPortfolio | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await portfolioService.getPublic(userId);
      setData(res);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  return { data, loading, error, refresh: fetch_ };
}