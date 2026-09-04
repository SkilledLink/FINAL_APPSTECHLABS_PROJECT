import React, { useState } from 'react';
import { Users, Search, Filter, MessageSquare, Star, Phone, Mail, MapPin, MoreVertical } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  location: string;
  projects: number;
  rating: number;
  lastActive: string;
  phone?: string;
  email?: string;
  avatar?: string;
}

export const ClientsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockClients: Client[] = [
    { 
      id: 1, 
      name: 'Marie-Claire Ngo', 
      location: 'Bonapriso, Douala', 
      projects: 3, 
      rating: 4.9, 
      lastActive: '2 days ago',
      phone: '+237 6XX XXX XXX',
      email: 'marie@email.com'
    },
    { 
      id: 2, 
      name: 'Paul Ekambi', 
      location: 'Bepanda, Douala', 
      projects: 2, 
      rating: 4.7, 
      lastActive: '5 days ago',
      phone: '+237 6XX XXX XXX',
      email: 'paul@email.com'
    },
    { 
      id: 3, 
      name: 'Fatima Aboubakar', 
      location: 'Akwa, Douala', 
      projects: 1, 
      rating: 5.0, 
      lastActive: '1 week ago',
      phone: '+237 6XX XXX XXX',
      email: 'fatima@email.com'
    },
    { 
      id: 4, 
      name: 'David Tchoumi', 
      location: 'Bonamoussadi, Douala', 
      projects: 4, 
      rating: 4.8, 
      lastActive: '3 days ago',
      phone: '+237 6XX XXX XXX',
      email: 'david@email.com'
    },
    { 
      id: 5, 
      name: 'Solange Mbia', 
      location: 'Makepe, Douala', 
      projects: 2, 
      rating: 4.6, 
      lastActive: '1 day ago',
      phone: '+237 6XX XXX XXX',
      email: 'solange@email.com'
    }
  ];

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
          <p className="text-gray-600 mt-1">Manage your client relationships</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Message All
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700">
            <Users className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Total Clients</p>
          <p className="text-2xl font-bold text-blue-600">{mockClients.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Active Clients</p>
          <p className="text-2xl font-bold text-green-600">4</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Avg. Rating</p>
          <p className="text-2xl font-bold text-yellow-600">4.8 ★</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Repeat Clients</p>
          <p className="text-2xl font-bold text-purple-600">3</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredClients.map((client) => (
            <div key={client.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900">{client.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {client.location}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                        {client.rating}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>{client.projects} projects</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                      {client.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {client.phone}
                        </span>
                      )}
                      {client.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 mr-2">
                    Active {client.lastActive}
                  </span>
                  <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Message
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};