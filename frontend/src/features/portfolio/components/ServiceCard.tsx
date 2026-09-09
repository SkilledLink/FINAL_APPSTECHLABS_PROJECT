import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, DollarSign, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import type{ Service } from '../../../api/portfolioApi';

interface ServiceCardProps {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-blue-400/20 dark:border-blue-400/20 p-4 shadow-lg hover:shadow-xl transition-shadow relative"
    >
      <div className="absolute top-3 right-3 flex gap-2">
        <button
          onClick={onEdit}
          className="p-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 pr-16">{service.title}</h3>
      {service.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{service.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
        {service.category && (
          <span className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center gap-1">
            <Clock size={12} /> {service.category}
          </span>
        )}
        {service.starting_price && (
          <span className="flex items-center gap-1">
            <DollarSign size={12} /> {service.starting_price} {service.pricing_type || ''}
          </span>
        )}
        {service.estimated_duration && (
          <span className="flex items-center gap-1">
            <Clock size={12} /> {service.estimated_duration}
          </span>
        )}
        {service.service_area && (
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {service.service_area}
          </span>
        )}
        <span className="flex items-center gap-1">
          {service.is_active ? (
            <CheckCircle size={12} className="text-green-600" />
          ) : (
            <XCircle size={12} className="text-red-600" />
          )}
          {service.is_active ? 'Active' : 'Inactive'}
        </span>
        {service.is_emergency_service && (
          <span className="px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center gap-1">
            🚨 Emergency
          </span>
        )}
      </div>
    </motion.div>
  );
}