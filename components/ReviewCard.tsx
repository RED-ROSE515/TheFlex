import { NormalizedReview } from '@/lib/mockReviews';
import { format } from 'date-fns';
import { Star, Calendar, User, Building2, MessageSquare } from 'lucide-react';

interface ReviewCardProps {
  review: NormalizedReview;
  isApproved?: boolean;
  onToggleApproval?: (reviewId: number, approved: boolean) => void;
  showApprovalToggle?: boolean;
}

export default function ReviewCard({
  review,
  isApproved = false,
  onToggleApproval,
  showApprovalToggle = false,
}: ReviewCardProps) {
  const renderStars = (rating: number) => {
    // Validate and clamp rating to valid range
    const validRating = isNaN(rating) || rating < 0 ? 0 : Math.min(rating, 5);
    const fullStars = Math.max(0, Math.min(5, Math.floor(validRating)));
    const hasHalfStar = validRating % 1 >= 0.5 && validRating < 5;
    const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 opacity-50" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-gray-300" />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {validRating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-beige-200">
      <div className="flex justify-between items-start mb-5">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-beige-50 rounded-xl p-2.5">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-bold text-gray-900 text-lg">{review.guestName}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500 font-medium capitalize">{review.type.replace('-', ' ')}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2 bg-beige-50 px-3 py-1.5 rounded-xl">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{review.listingName}</span>
            </div>
            <div className="flex items-center gap-2 bg-beige-50 px-3 py-1.5 rounded-xl">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span className="font-medium capitalize">{review.channel}</span>
            </div>
            <div className="flex items-center gap-2 bg-beige-50 px-3 py-1.5 rounded-xl">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium">
                {review.date instanceof Date
                  ? format(review.date, 'MMM d, yyyy')
                  : format(new Date(review.date), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
        {showApprovalToggle && onToggleApproval && (
          <button
            onClick={() => onToggleApproval(review.id, !isApproved)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-sm ${
              isApproved
                ? 'bg-teal-50 text-teal-700 border-2 border-teal-200 hover:bg-teal-100'
                : 'bg-beige-50 text-gray-700 border-2 border-beige-200 hover:bg-beige-100'
            }`}
          >
            {isApproved ? 'Approved' : 'Approve'}
          </button>
        )}
      </div>

      <div className="mb-4">
        {renderStars(review.averageRating)}
      </div>

      <p className="text-gray-700 mb-5 leading-relaxed text-base">{review.publicReview}</p>

      {review.reviewCategory && review.reviewCategory.length > 0 && (
        <div className="border-t border-beige-200 pt-5">
          <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Category Ratings:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {review.reviewCategory.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between bg-beige-50 px-3 py-2 rounded-xl">
                <span className="text-sm text-gray-600 font-medium capitalize">
                  {cat.category.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm font-bold text-gray-900">{cat.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center gap-2">
        <span
          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide ${
            review.status === 'published'
              ? 'bg-teal-100 text-teal-700'
              : review.status === 'pending'
              ? 'bg-orange-100 text-orange-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {review.status}
        </span>
        {isApproved && (
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide bg-teal-100 text-teal-700">
            Public
          </span>
        )}
      </div>
    </div>
  );
}

