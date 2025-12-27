import { Timestamp } from "firebase/firestore";

// ============================================
// Product Types
// ============================================

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  discount?: number;
  images: string[];
  thumbnail: string;
  category: "perfume" | "makeup" | "skincare" | "haircare" | "gift-set";
  categoryAr?: string;
  brand: string;
  brandAr: string;
  productType: string;
  productTypeAr?: string;
  gender?: "men" | "women" | "unisex";
  genderAr?: string;
  size?: string;
  sizeAr?: string;
  concentration?: string;
  concentrationAr?: string;
  inStock: boolean;
  stockQuantity?: number;
  featured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  isExclusive?: boolean;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  tagsAr?: string[];

  // Perfume specific
  fragranceFamily?: string;
  fragranceFamilyAr?: string;
  topNotes?: string[];
  topNotesAr?: string[];
  middleNotes?: string[];
  middleNotesAr?: string[];
  baseNotes?: string[];
  baseNotesAr?: string[];
  scentProfile?: string;
  scentProfileAr?: string;
  season?: string[];
  seasonAr?: string[];
  occasion?: string[];
  occasionAr?: string[];
  longevity?: "weak" | "moderate" | "long-lasting" | "very-long-lasting";
  longevityAr?: string;
  sillage?: "intimate" | "moderate" | "strong" | "enormous";
  sillageAr?: string;

  // Makeup specific
  shade?: string;
  shadeAr?: string;
  finish?: string;
  finishAr?: string;
  skinType?: string[];
  skinTypeAr?: string[];
  coverage?: string;
  coverageAr?: string;

  // Meta
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];

  // Timestamps
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  publishedAt?: Timestamp;

  // Views and interactions
  views?: number;
  wishlistCount?: number;
  purchaseCount?: number;
  totalSales?: number;
}

// ============================================
// Cart Types
// ============================================

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedShade?: string;
  addedAt?: Date;
}

// ============================================
// Order Types
// ============================================

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;

  // Shipping info
  shippingAddress: Address;
  shippingMethod: "standard" | "express" | "same-day";
  estimatedDelivery?: Date;

  // Payment info
  paymentMethod:
    | "cash-on-delivery"
    | "credit-card"
    | "paypal"
    | "bank-transfer";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentDetails?: any;

  // Order status
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  statusHistory: OrderStatusHistory[];

  // Customer info
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerNote?: string;

  // Tracking
  trackingNumber?: string;
  carrier?: string;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  confirmedAt?: Timestamp;
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;

  // Admin notes
  adminNote?: string;

  // Loyalty points
  pointsEarned?: number;
  pointsUsed?: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productNameAr: string;
  productImage: string;
  price: number;
  quantity: number;
  discount?: number;
  selectedSize?: string;
  selectedShade?: string;
  sku?: string;
}

export interface Address {
  fullName: string;
  phone: string;
  email?: string;
  country: string;
  countryAr?: string;
  city: string;
  cityAr?: string;
  state?: string;
  stateAr?: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface OrderStatusHistory {
  status: Order["status"];
  timestamp: Timestamp;
  note?: string;
  by?: string;
}

// ============================================
// Review Types
// ============================================

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  rating: number;
  qualityRating?: number;
  valueRating?: number;
  scentRating?: number;
  longevityRating?: number;
  comment: string;
  images?: string[];
  verified: boolean;
  verifiedPurchase?: boolean;
  approved: boolean;
  status: "pending" | "approved" | "rejected";
  helpful: number;
  helpfulBy?: string[];
  reply?: string;
  replyAt?: Timestamp;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp;
}

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: Date;

  // Addresses
  addresses?: Address[];
  defaultAddressId?: string;

  // Preferences
  preferredLanguage?: "ar" | "en";
  emailNotifications?: boolean;
  smsNotifications?: boolean;

  // Loyalty
  loyaltyPoints?: number;
  loyaltyTier?: "bronze" | "silver" | "gold" | "platinum";

  // Timestamps
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  lastLoginAt?: Timestamp;
}

// ============================================
// Loyalty Program Types
// ============================================

export interface LoyaltyProgram {
  userId: string;
  points: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  tierProgress: number;
  totalEarned: number;
  totalRedeemed: number;
  lifetimeValue: number;
  currentStreak?: number;
  lastEarnedDate?: Timestamp;
  joinedAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  type: "earn" | "redeem" | "bonus" | "expired";
  points: number;
  reason: string;
  reasonAr: string;
  orderId?: string;
  balance: number;
  expiresAt?: Timestamp;
  createdAt: Timestamp;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  pointsCost: number;
  discountValue: number;
  discountType: "fixed" | "percentage";
  minimumPurchase?: number;
  validFrom?: Timestamp;
  validUntil?: Timestamp;
  maxRedemptions?: number;
  currentRedemptions: number;
  active: boolean;
  tier?: LoyaltyProgram["tier"][];
}

// ============================================
// Filter Types
// ============================================

export interface ProductFilters {
  category?: string[];
  brand?: string[];
  priceRange?: [number, number];
  gender?: string[];
  size?: string[];
  concentration?: string[];
  fragranceFamily?: string[];
  productType?: string[];
  rating?: number;
  inStock?: boolean;
  featured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  discount?: boolean;
  onSale?: boolean;

  // Perfume specific
  occasion?: string[];
  season?: string[];
  longevity?: string[];
  sillage?: string[];

  // Makeup specific
  skinType?: string[];
  finish?: string[];
  shade?: string[];

  // Search & Sort
  searchQuery?: string;
  sortBy?:
    | "newest"
    | "price-asc"
    | "price-desc"
    | "rating"
    | "popular"
    | "name";

  // Pagination
  page?: number;
  limit?: number;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  // Revenue
  totalRevenue: number;
  revenueGrowth: number;
  monthlyRevenue: number;

  // Orders
  totalOrders: number;
  ordersGrowth: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;

  // Products
  totalProducts: number;
  productsGrowth: number;
  lowStockProducts: number;
  outOfStockProducts: number;

  // Customers
  totalCustomers: number;
  customersGrowth: number;
  newCustomers: number;
  activeCustomers: number;

  // Reviews
  totalReviews: number;
  averageRating: number;
  pendingReviews: number;

  // Top performing
  topProducts?: Product[];
  popularProducts?: Product[];
  topCategories?: { category: string; sales: number; revenue: number }[];
  topBrands?: { brand: string; sales: number; revenue: number }[];
  recentOrders?: Order[];
  recentReviews?: Review[];
  todayRevenue?: number;
  todayOrders?: number;
  monthlyOrders?: number;

  // Charts data
  revenueChart?: { date: string; revenue: number }[];
  ordersChart?: { date: string; orders: number }[];
  categoriesChart?: { category: string; count: number; revenue: number }[];

  // Period comparison
  period: "today" | "week" | "month" | "year";
  lastUpdated?: Timestamp;
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: string;
  userId?: string;
  type: "order" | "review" | "product" | "system" | "promotion";
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  read: boolean;
  link?: string;
  actionLabel?: string;
  actionLabelAr?: string;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

// ============================================
// Coupon Types
// ============================================

export interface Coupon {
  id: string;
  code: string;
  type: "fixed" | "percentage" | "free-shipping";
  value: number;
  minimumPurchase?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  validFrom: Timestamp;
  validUntil: Timestamp;
  active: boolean;
  products?: string[];
  categories?: string[];
  brands?: string[];
  excludeProducts?: string[];
  firstOrderOnly?: boolean;
  loyaltyTierRequired?: LoyaltyProgram["tier"];
  createdAt: Timestamp;
}

// ============================================
// Wishlist Types
// ============================================

export interface Wishlist {
  userId: string;
  items: WishlistItem[];
  updatedAt: Timestamp;
}

export interface WishlistItem {
  productId: string;
  addedAt: Timestamp;
  notifyOnSale?: boolean;
  notifyOnRestock?: boolean;
}

// ============================================
// Banner Types
// ============================================

export interface Banner {
  id: string;
  title: string;
  titleAr: string;
  subtitle?: string;
  subtitleAr?: string;
  image: string;
  imageMobile?: string;
  link?: string;
  buttonText?: string;
  buttonTextAr?: string;
  position: "hero" | "top" | "middle" | "bottom" | "sidebar";
  priority: number;
  active: boolean;
  validFrom?: Timestamp;
  validUntil?: Timestamp;
  clicks?: number;
  views?: number;
  createdAt: Timestamp;
}

// ============================================
// Settings Types
// ============================================

export interface SiteSettings {
  // Store info
  storeName: string;
  storeNameAr: string;
  storeDescription?: string;
  storeDescriptionAr?: string;
  logo?: string;
  favicon?: string;

  // Contact
  email: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  addressAr?: string;

  // Social media
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;

  // Business
  taxRate?: number;
  currency: string;
  currencySymbol: string;
  shippingCost?: number;
  freeShippingThreshold?: number;

  // Features
  enableReviews?: boolean;
  enableLoyalty?: boolean;
  enableCoupons?: boolean;
  enableWishlist?: boolean;
  enableCompare?: boolean;

  // Notifications
  telegramBotToken?: string;
  telegramChatId?: string;
  emailNotifications?: boolean;
  telegramChats?: TelegramChat[];
  
  // Hero Images
  heroImages?: string[];

  // Maintenance
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  maintenanceMessageAr?: string;

  updatedAt?: Timestamp;
}

// ============================================
// Telegram Chat Types
// ============================================

export interface TelegramChat {
  id: string;
  name: string;
  chatId: string;
  active: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ============================================
// Contact Message Types
// ============================================

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  read: boolean;
  replied?: boolean;
  replyMessage?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
