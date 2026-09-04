import React, { useState } from 'react';
import { Star, Search, Filter, ThumbsUp, Calendar, MoreVertical } from 'lucide-react';

interface Review {
  id: number;
  client: string;
  clientAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
  helpful: number;
  verified: boolean;
}

export const ReviewsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockReviews: Review[] = [
    {
      id: 1,
      client: 'Marie-Claire Ngo',
      rating: 5,
      comment: 'Excellent work! Jean-Pierre was professional, punctual, and did a fantastic job with the electrical installation. Highly recommended!',
      date: '2026-09-01',
      service: 'Electrical Installation',
      helpful: 12,
      verified: true
    },
    {
      id: 2,
      client: 'Fatima Aboubakar',
      rating: 5,
      comment: 'Very satisfied with the electrical repairs. Quick response and quality work.',
      date: '2026-08-28',
      service: 'Electrical Repairs',
      helpful: 8,
      verified: true
    },
    {
      id: 3,
      client: 'Paul Ekambi',
      rating: 4,
      comment: 'Good work on the solar installation. Communication could have been better but the results are great.',
      date: '2026-08-25',
      service: 'Solar Panel Installation',
      helpful: 5,
      verified: true
    },
    {
      id: 4,
      client: 'Solange Mbia',
      rating: 5,
      comment: 'Amazing service! Came on time, finished ahead of schedule, and the quality is outstanding.',
      date: '2026-08-20',
      service: 'Electrical Maintenance',
      helpful: 15,
      verified: true
    }
  ];

  const averageRating = mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length;
  const fiveStars = mockReviews.filter(r => r.rating === 5).length;
  const fourStars = mockReviews.filter(r => r.rating === 4).length;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredReviews = mockReviews.filter(review =>
    review.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
          <p className="text-gray-600 mt-1">Manage and respond to client reviews</p>
        </div>
        <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700">
          <ThumbsUp className="w-4 h-4" />
          Request Review
        </button>
      </div>

      {/* Rating Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-sm text-gray-600 mt-1">{mockReviews.length} reviews</p>
          </div>
          <div className="flex-1 w-full">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-16">5 ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(fiveStars / mockReviews.length) * 100}%` }} />
                </div>
                <span className="text-sm text-gray-600 w-8">{fiveStars}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-16">4 ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(fourStars / mockReviews.length) * 100}%` }} />
                </div>
                <span className="text-sm text-gray-600 w-8">{fourStars}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-16">3 ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: '0%' }} />
                </div>
                <span className="text-sm text-gray-600 w-8">0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-16">2 ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: '0%' }} />
                </div>
                <span className="text-sm text-gray-600 w-8">0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-16">1 ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: '0%' }} />
                </div>
                <span className="text-sm text-gray-600 w-8">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {review.client.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{review.client}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </span>
                      <span>•</span>
                      <span>{review.service}</span>
                      {review.verified && (
                        <>
                          <span>•</span>
                          <span className="text-green-600 flex items-center gap-1">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mt-2">{review.comment}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {review.helpful} helpful
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Reply
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
  );
};