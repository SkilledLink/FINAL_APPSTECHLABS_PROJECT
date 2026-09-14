import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
} from 'lucide-react';
import type { Service } from '../types/admin.types';

interface ServicesTabProps {
  services: Service[];
}

const ServicesTab: React.FC<ServicesTabProps> = ({ services }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Services</h2>
          <p className="text-gray-500 mt-1">Manage your service catalog</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 md:mt-0 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Service
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Image */}
            <div className="h-48 bg-gray-100 relative">
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon size={48} />
                </div>
              )}
              <div
                className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
                  service.available
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {service.available ? 'Available' : 'Unavailable'}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">{service.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description}</p>

              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1 text-gray-600">
                  <DollarSign size={16} className="text-gray-400" />
                  {service.price.toLocaleString()} FCFA
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  <Clock size={16} className="text-gray-400" />
                  {service.duration}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                  {service.category}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button className="flex-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                  <Edit size={14} />
                  Edit
                </button>
                <button className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Service Modal (placeholder) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Service</h3>
            <p className="text-gray-500">This feature will be available soon.</p>
            <button
              onClick={() => setShowAddModal(false)}
              className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesTab;