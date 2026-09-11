import React from 'react';
import { ProjectForm } from '../components/ProjectForm';
import { usePortfolio } from '../hooks/usePortfolio';
import { Project } from '../types/portfolio.types';

interface CreateProjectPageProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateProjectPage: React.FC<CreateProjectPageProps> = ({ onSuccess, onCancel }) => {
  const { addProject } = usePortfolio();

  const handleFormSubmit = async (projectData: Omit<Project, 'id'>) => {
    await addProject(projectData);
    onSuccess();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ProjectForm onSubmit={handleFormSubmit} onCancel={onCancel} />
    </div>
  );
};