import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Eye,
  Sparkles,
  TrendingUp,
  Badge as BadgeIcon,
  ArrowRight,
} from "lucide-react";
import { Product } from "../types/perfume-shop";
import { useCartStore } from "../store/cartStore";
import { useFavoritesStore } from "../store/favoritesStore";
import { formatCurrency } from "../utils/helpers";
import toast from "react-hot-toast";
import MaterialRipple from "./MaterialRipple";

interface EnhancedProductCardProps {
  product: Product;
  view?: "grid" | "list";
  showQuickView?: boolean;
  onQuickView?: (product: Product) => void;
}

export default function EnhancedProductCard({
  product,
  view = "grid",
  showQuickView = true,
  onQuickView,
}: EnhancedProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const { addItem } = useCartStore();
  const {
    items: favorites,
    addItem: addToFavorites,
    removeItem: removeFromFavorites,
  } = useFavoritesStore();

  const isFavorite = favorites.some((fav) => fav.id === product.id);
  const hasDiscount = product.discount && product.discount > 0;
  const finalPrice = hasDiscount
    ? product.price - product.price * (product.discount / 100)
    : product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.inStock) {
      addItem({ product, quantity: 1 });
      toast.success("✅ تمت الإضافة إلى السلة", {
        icon: "🛒",
        duration: 2000,
        style: {
          fontFamily: "Cairo, sans-serif",
        },
      });
    } else {
      toast.error("المنتج غير متوفر حالياً");
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite) {
      removeFromFavorites(product.id);
      toast.success("تم الإزالة من المفضلة");
    } else {
      addToFavorites(product);
      toast.success("تمت الإضافة للمفضلة", {
        icon: "❤️",
      });
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const getBadges = () => {
    const badges = [];
    if (product.isNew)
      badges.push({ text: "جديد", color: "bg-green-500", icon: Sparkles });
    if (product.isBestSeller)
      badges.push({
        text: "الأكثر مبيعاً",
        color: "bg-yellow-500",
        icon: TrendingUp,
      });
    if (product.isExclusive)
      badges.push({ text: "حصري", color: "bg-purple-500", icon: BadgeIcon });
    if (hasDiscount)
      badges.push({
        text: `-${product.discount}%`,
        color: "bg-red-500",
        icon: null,
      });
    return badges;
  };

  const badges = getBadges();

  if (view === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-2xl shadow-sm hover:shadow-luxury transition-all duration-500 overflow-hidden border border-gray-100 hover:border-brand-maroon-200 hover:-translate-y-1"
      >
        <Link to={`/product/${product.id}`} className="flex gap-6 p-6">
          {/* Image Section */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <img
              src={product.images[0] || product.thumbnail}
              alt={product.nameAr}
              className="w-full h-full object-cover rounded-xl"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">غير متوفر</span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 right-2 flex flex-col gap-2">
              {badges.map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg`}
                >
                  {badge.icon && <badge.icon size={12} />}
                  {badge.text}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Brand */}
              <p className="text-sm text-gray-500 mb-1">{product.brandAr}</p>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                {product.nameAr}
              </h3>


              {/* Description */}
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {product.descriptionAr}
              </p>

              {/* Details */}
              <div className="flex flex-wrap gap-2 mb-3">
                {product.size && (
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs">
                    {product.sizeAr || product.size}
                  </span>
                )}
                {product.concentration && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                    {product.concentrationAr}
                  </span>
                )}
                {product.gender && (
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
                    {product.genderAr}
                  </span>
                )}
              </div>
            </div>

            {/* Price & Actions */}
            <div className="flex items-center justify-between">
              <div>
                {hasDiscount ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-red-600">
                      {formatCurrency(finalPrice, "LYD")}
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      {Math.round(product.price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(product.price, "LYD")}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <MaterialRipple>
                  <button
                    onClick={handleToggleFavorite}
                    className={`p-3 rounded-full transition-all ${
                      isFavorite
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Heart
                      size={20}
                      fill={isFavorite ? "currentColor" : "none"}
                    />
                  </button>
                </MaterialRipple>

                <MaterialRipple>
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all ${
                      product.inStock
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingCart size={20} />
                    <span>{product.inStock ? "أضف للسلة" : "غير متوفر"}</span>
                  </button>
                </MaterialRipple>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 hover:border-brand-maroon-200 transition-all duration-300 overflow-hidden"
    >
      <Link to={`/product/${product.id}`}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <AnimatePresence mode="wait">
            <motion.img
              key={imageIndex}
              src={product.images[imageIndex] || product.thumbnail}
              alt={product.nameAr}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg bg-red-600 px-4 py-2 rounded-full">
                غير متوفر
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
            {badges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, x: 20 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                className={`${badge.color} text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-md backdrop-blur-sm border border-white/20`}
              >
                {badge.icon && <badge.icon size={12} />}
                {badge.text}
              </motion.div>
            ))}
          </div>

          {/* Image Navigation Dots */}
          {product.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    setImageIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === imageIndex
                      ? "bg-white w-6"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Hover Actions */}
          <AnimatePresence>
            {isHovered && product.inStock && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
              >
                <div className="flex gap-2">
                  <MaterialRipple className="flex-1">
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-white text-gray-900 py-2.5 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} />
                      <span>أضف للسلة</span>
                    </button>
                  </MaterialRipple>

                  {showQuickView && (
                    <MaterialRipple>
                      <button
                        onClick={handleQuickView}
                        className="bg-white/20 backdrop-blur-sm text-white p-2.5 rounded-xl hover:bg-white/30 transition-colors"
                        title="معاينة سريعة"
                      >
                        <Eye size={18} />
                      </button>
                    </MaterialRipple>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Favorite Button */}
          <motion.button
            onClick={handleToggleFavorite}
            className={`absolute top-2 left-2 p-2 rounded-full backdrop-blur-sm transition-all z-10 ${
              isFavorite
                ? "bg-red-500 text-white"
                : "bg-white/80 text-gray-600 hover:bg-white"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
          </motion.button>

          {/* Quick Add to Cart Button - Always Visible on Mobile */}
          {product.inStock && (
            <motion.button
              onClick={handleAddToCart}
              className="absolute bottom-2 right-2 p-2.5 bg-gradient-to-r from-brand-maroon-600 to-brand-maroon-700 text-white rounded-full shadow-lg z-10 hover:shadow-xl transition-all md:hidden"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="أضف للسلة"
            >
              <ShoppingCart size={16} />
            </motion.button>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Brand */}
          <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">
            {product.brandAr}
          </p>

          {/* Title */}
          <h3 className="text-sm font-bold text-gray-900 mb-1.5 line-clamp-2 min-h-[2rem] leading-tight">
            {product.nameAr}
          </h3>

          {/* Details */}
          <div className="flex flex-wrap gap-1 mb-2">
            {product.size && (
              <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">
                {product.sizeAr || product.size}
              </span>
            )}
            {product.concentration && (
              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px]">
                {product.concentrationAr}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              {hasDiscount ? (
                <div className="flex flex-col">
                  <span className="text-base font-bold text-red-600">
                    {formatCurrency(finalPrice, "LYD")}
                  </span>
                  <span className="text-[10px] text-gray-400 line-through">
                    {Math.round(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-base font-bold text-gray-900">
                  {formatCurrency(product.price, "LYD")}
                </span>
              )}
            </div>

            <motion.div whileHover={{ x: -3 }} className="text-blue-600">
              <ArrowRight size={16} />
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
