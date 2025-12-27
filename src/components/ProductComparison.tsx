import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Star, Check, Minus, ArrowRight } from 'lucide-react';
import { Product } from '../types/perfume-shop';
import { Link } from 'react-router-dom';
import MaterialRipple from './MaterialRipple';

interface ProductComparisonProps {
  products: Product[];
  onRemove: (productId: string) => void;
  onAddMore: () => void;
  maxProducts?: number;
}

export default function ProductComparison({ 
  products, 
  onRemove, 
  onAddMore,
  maxProducts = 4 
}: ProductComparisonProps) {
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus size={40} className="text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            لم تضف أي منتجات للمقارنة
          </h3>
          <p className="text-gray-600 mb-6">
            أضف منتجات لمقارنتها ومعرفة الفروقات بينها
          </p>
          <MaterialRipple>
            <button
              onClick={onAddMore}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              تصفح المنتجات
            </button>
          </MaterialRipple>
        </div>
      </div>
    );
  }

  const features = [
    { key: 'price', label: 'السعر', type: 'price' },
    { key: 'brand', label: 'العلامة التجارية', type: 'text' },
    { key: 'rating', label: 'التقييم', type: 'rating' },
    { key: 'size', label: 'الحجم', type: 'text' },
    { key: 'concentration', label: 'التركيز', type: 'text' },
    { key: 'gender', label: 'الجنس', type: 'text' },
    { key: 'fragranceFamily', label: 'عائلة العطر', type: 'text' },
    { key: 'longevity', label: 'الثبات', type: 'scale' },
    { key: 'sillage', label: 'الانتشار', type: 'scale' },
    { key: 'season', label: 'الموسم', type: 'text' },
    { key: 'occasion', label: 'المناسبة', type: 'text' },
    { key: 'topNotes', label: 'مكونات القمة', type: 'list' },
    { key: 'middleNotes', label: 'مكونات القلب', type: 'list' },
    { key: 'baseNotes', label: 'مكونات القاعدة', type: 'list' },
    { key: 'inStock', label: 'التوفر', type: 'boolean' }
  ].filter(feature => 
    products.some((p: any) => p[feature.key] !== undefined && p[feature.key] !== null)
  );

  const displayedFeatures = showAllFeatures ? features : features.slice(0, 8);

  const renderFeatureValue = (product: Product, feature: any) => {
    const value = (product as any)[feature.key];

    switch (feature.type) {
      case 'price':
        return (
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {product.price.toFixed(0)} د.ل
            </p>
            {product.discount && product.discount > 0 && (
              <p className="text-sm text-red-600 font-medium">
                خصم {product.discount}%
              </p>
            )}
          </div>
        );

      case 'rating':
        return value ? (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < Math.floor(value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {value.toFixed(1)}
            </span>
          </div>
        ) : (
          <span className="text-gray-400">لا يوجد تقييم</span>
        );

      case 'scale':
        return value ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${(value / 10) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {value}/10
              </span>
            </div>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        );

      case 'list':
        const arValue = (product as any)[feature.key + 'Ar'];
        return value && value.length > 0 ? (
          <ul className="space-y-1">
            {(arValue || value).slice(0, 3).map((item: string, idx: number) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
            {value.length > 3 && (
              <li className="text-xs text-gray-500">+{value.length - 3} المزيد</li>
            )}
          </ul>
        ) : (
          <span className="text-gray-400">—</span>
        );

      case 'boolean':
        return (
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            value 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {value ? <Check size={14} /> : <X size={14} />}
            {value ? 'متوفر' : 'غير متوفر'}
          </span>
        );

      default:
        const textValue = (product as any)[feature.key + 'Ar'] || value;
        return textValue ? (
          <span className="text-gray-700">{textValue}</span>
        ) : (
          <span className="text-gray-400">—</span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">مقارنة المنتجات</h2>
            <p className="text-white/80">
              مقارنة {products.length} من {maxProducts} منتجات
            </p>
          </div>
          {products.length < maxProducts && (
            <MaterialRipple>
              <button
                onClick={onAddMore}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-colors"
              >
                <Plus size={20} />
                <span>إضافة منتج</span>
              </button>
            </MaterialRipple>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky right-0 bg-gray-50 p-4 text-right font-bold text-gray-900 min-w-[150px] z-10">
                المواصفات
              </th>
              {products.map((product) => (
                <th key={product.id} className="p-4 min-w-[280px]">
                  <div className="relative">
                    {/* Remove Button */}
                    <button
                      onClick={() => onRemove(product.id)}
                      className="absolute -top-2 -left-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                    >
                      <X size={16} />
                    </button>

                    {/* Product Image */}
                    <Link to={`/product/${product.id}`}>
                      <motion.img
                        whileHover={{ scale: 1.05 }}
                        src={product.images[0] || product.thumbnail}
                        alt={product.nameAr}
                        className="w-full aspect-square object-cover rounded-xl mb-3 cursor-pointer"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">
                        {product.brandAr}
                      </p>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                          {product.nameAr}
                        </h3>
                      </Link>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {displayedFeatures.map((feature, idx) => (
              <motion.tr
                key={feature.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="sticky right-0 bg-white p-4 font-semibold text-gray-900 z-10">
                  {feature.label}
                </td>
                {products.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    {renderFeatureValue(product, feature)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show More/Less Button */}
      {features.length > 8 && (
        <div className="p-4 border-t border-gray-200 text-center">
          <MaterialRipple>
            <button
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="px-6 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
            >
              {showAllFeatures ? 'عرض أقل' : `عرض المزيد (${features.length - 8})`}
            </button>
          </MaterialRipple>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-3">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="flex-1 min-w-[200px]"
            >
              <MaterialRipple className="w-full">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                  <span>عرض {product.nameAr}</span>
                  <ArrowRight size={18} />
                </button>
              </MaterialRipple>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

