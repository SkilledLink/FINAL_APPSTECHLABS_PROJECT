import { useState, useEffect } from 'react';
import { Project, Category } from '../types/portfolio.types';
import { portfolioService } from '../services/portfolioService';

export function usePortfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

  const fetchProjects = async () => {
    setLoading(true);
    const data = await portfolioService.getProjects();
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = selectedCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  const addProject = async (projectData: Omit<Project, 'id'>) => {
    await portfolioService.createProject(projectData);
    await fetchProjects();
  };

  return {
    projects,
    filteredProjects,
    loading,
    selectedCategory,
    setSelectedCategory,
    addProject
  };
}