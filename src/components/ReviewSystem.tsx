import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown,
  Check,
  X,
  Image as ImageIcon,
  Send,
  Filter,
  ChevronDown
} from 'lucide-react';
import { Review } from '../types/perfume-shop';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import MaterialRipple from './MaterialRipple';
import toast from 'react-hot-toast';

interface ReviewSystemProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
  onAddReview?: (review: Partial<Review>) => void;
  onHelpful?: (reviewId: string) => void;
}

export default function ReviewSystem({ 
  productId, 
  reviews, 
  averageRating,
  onAddReview,
  onHelpful
}: ReviewSystemProps) {
  const [showAddReview, setShowAddReview] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');
  
  // Add Review Form State
  const [newReview, setNewReview] = useState({
    rating: 5,
    qualityRating: 5,
    valueRating: 5,
    scentRating: 5,
    longevityRating: 5,
    comment: '',
    userName: '',
    userEmail: ''
  });

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => Math.floor(r.rating) === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => Math.floor(r.rating) === rating).length / reviews.length) * 100 
      : 0
  }));

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(r => !filterRating || Math.floor(r.rating) === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'helpful':
          return b.helpful - a.helpful;
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
        default:
          const dateA = a.createdAt instanceof Timestamp 
            ? a.createdAt.toMillis() 
            : (a.createdAt instanceof Date ? a.createdAt.getTime() : 0);
          const dateB = b.createdAt instanceof Timestamp 
            ? b.createdAt.toMillis() 
            : (b.createdAt instanceof Date ? b.createdAt.getTime() : 0);
          return dateB - dateA;
      }
    });

  const handleSubmitReview = () => {
    if (!newReview.userName || !newReview.comment) {
      toast.error('يرجى إدخال الاسم والتعليق');
      return;
    }

    if (onAddReview) {
      onAddReview({
        productId,
        ...newReview,
        verified: false,
        approved: false,
        helpful: 0,
        status: 'pending',
        createdAt: new Date()
      });
      
      // Reset form
      setNewReview({
        rating: 5,
        qualityRating: 5,
        valueRating: 5,
        scentRating: 5,
        longevityRating: 5,
        comment: '',
        userName: '',
        userEmail: ''
      });
      setShowAddReview(false);
      toast.success('تم إرسال تقييمك بنجاح! سيتم مراجعته قريباً.');
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    readonly = false,
    size = 24 
  }: { 
    value: number; 
    onChange?: (value: number) => void;
    readonly?: boolean;
    size?: number;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          disabled={readonly}
          className={`transition-transform ${!readonly && 'hover:scale-110'}`}
        >
          <Star
            size={size}
            className={star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Ratings Summary */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="text-center md:text-right">
            <div className="mb-2">
              <span className="text-6xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-2xl text-gray-400 mr-2">/ 5</span>
            </div>
            <div className="flex justify-center md:justify-start items-center gap-2 mb-2">
              <StarRating value={Math.round(averageRating)} readonly size={20} />
            </div>
            <p className="text-gray-600">
              بناءً على {reviews.length} تقييم
            </p>
            
            <MaterialRipple className="mt-6">
              <button
                onClick={() => setShowAddReview(!showAddReview)}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                اكتب تقييماً
              </button>
            </MaterialRipple>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <button
                key={rating}
                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  filterRating === rating ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1 min-w-[80px]">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: (5 - rating) * 0.1 }}
                    className="h-full bg-yellow-400"
                  />
                </div>
                <span className="text-sm text-gray-600 min-w-[40px] text-left">
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Review Form */}
      <AnimatePresence>
        {showAddReview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-md p-8 overflow-hidden"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">أضف تقييمك</h3>
            
            <div className="space-y-6">
              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التقييم العام *
                </label>
                <StarRating 
                  value={newReview.rating} 
                  onChange={(value) => setNewReview({ ...newReview, rating: value })}
                />
              </div>

              {/* Detailed Ratings */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الجودة
                  </label>
                  <StarRating 
                    value={newReview.qualityRating} 
                    onChange={(value) => setNewReview({ ...newReview, qualityRating: value })}
                    size={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    القيمة مقابل السعر
                  </label>
                  <StarRating 
                    value={newReview.valueRating} 
                    onChange={(value) => setNewReview({ ...newReview, valueRating: value })}
                    size={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الرائحة
                  </label>
                  <StarRating 
                    value={newReview.scentRating} 
                    onChange={(value) => setNewReview({ ...newReview, scentRating: value })}
                    size={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الثبات
                  </label>
                  <StarRating 
                    value={newReview.longevityRating} 
                    onChange={(value) => setNewReview({ ...newReview, longevityRating: value })}
                    size={20}
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم *
                </label>
                <input
                  type="text"
                  value={newReview.userName}
                  onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل اسمك"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني (اختياري)
                </label>
                <input
                  type="email"
                  value={newReview.userEmail}
                  onChange={(e) => setNewReview({ ...newReview, userEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تعليقك *
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="شاركنا تجربتك مع هذا المنتج..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <MaterialRipple className="flex-1">
                  <button
                    onClick={handleSubmitReview}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                  >
                    <Send size={20} />
                    <span>إرسال التقييم</span>
                  </button>
                </MaterialRipple>
                <MaterialRipple>
                  <button
                    onClick={() => setShowAddReview(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                </MaterialRipple>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        {/* Filter & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            التقييمات ({filteredReviews.length})
          </h3>
          
          <div className="flex items-center gap-3">
            {filterRating && (
              <button
                onClick={() => setFilterRating(null)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                <span>{filterRating} نجوم</span>
                <X size={16} />
              </button>
            )}
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">الأحدث</option>
              <option value="helpful">الأكثر فائدة</option>
              <option value="rating">الأعلى تقييماً</option>
            </select>
          </div>
        </div>

        {/* Reviews */}
        <div className="space-y-6">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900">{review.userName}</h4>
                          {review.verifiedPurchase && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                              <Check size={12} />
                              <span>عملية شراء موثقة</span>
                            </span>
                          )}
                        </div>
                        <StarRating value={review.rating} readonly size={16} />
                      </div>
                      <span className="text-sm text-gray-500">
                        {review.createdAt && format(
                          review.createdAt instanceof Timestamp 
                            ? review.createdAt.toDate() 
                            : (review.createdAt instanceof Date ? review.createdAt : new Date()),
                          'd MMMM yyyy',
                          { locale: ar }
                        )}
                      </span>
                    </div>

                    {/* Detailed Ratings */}
                    {(review.qualityRating || review.valueRating || review.scentRating || review.longevityRating) && (
                      <div className="flex flex-wrap gap-4 mb-3 text-sm">
                        {review.qualityRating && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">الجودة:</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={i < review.qualityRating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {review.scentRating && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">الرائحة:</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={i < review.scentRating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Comment */}
                    <p className="text-gray-700 mb-3">{review.comment}</p>

                    {/* Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {review.images.map((image, idx) => (
                          <img
                            key={idx}
                            src={image}
                            alt="Review"
                            className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </div>
                    )}

                    {/* Admin Reply */}
                    {review.reply && (
                      <div className="mt-3 p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          رد من الإدارة:
                        </p>
                        <p className="text-sm text-gray-700">{review.reply}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => onHelpful?.(review.id)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <ThumbsUp size={16} />
                        <span>مفيد ({review.helpful})</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <Star size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">
                {filterRating 
                  ? `لا توجد تقييمات بـ ${filterRating} نجوم`
                  : 'لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

