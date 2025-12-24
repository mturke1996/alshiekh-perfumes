/**
 * مجموعة من الدوال المساعدة المستخدمة في المشروع
 */

// ============================================
// تنسيق الأرقام والعملات
// ============================================

/**
 * تنسيق السعر بالدينار الليبي
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ar-LY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * تنسيق السعر مع العملة
 */
export const formatCurrency = (price: number, currency: string = 'LYD'): string => {
  return `${formatPrice(price)} ${currency}`;
};

/**
 * حساب السعر بعد الخصم
 */
export const calculateDiscountedPrice = (price: number, discount: number): number => {
  return price - (price * discount) / 100;
};

/**
 * حساب نسبة الخصم
 */
export const calculateDiscountPercentage = (originalPrice: number, discountedPrice: number): number => {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

// ============================================
// معالجة النصوص
// ============================================

/**
 * قص النص إلى عدد معين من الكلمات
 */
export const truncateText = (text: string, maxWords: number): string => {
  const words = text.split(' ');
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
};

/**
 * قص النص إلى عدد معين من الحروف
 */
export const truncateChars = (text: string, maxChars: number): string => {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '...';
};

/**
 * تحويل النص إلى slug
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * تكبير أول حرف
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// ============================================
// التواريخ والأوقات
// ============================================

/**
 * تنسيق التاريخ بالعربية
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

/**
 * تنسيق التاريخ والوقت
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * حساب الوقت المنقضي (منذ كم)
 */
export const timeAgo = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);

  const intervals = {
    سنة: 31536000,
    شهر: 2592000,
    أسبوع: 604800,
    يوم: 86400,
    ساعة: 3600,
    دقيقة: 60,
    ثانية: 1,
  };

  for (const [name, value] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / value);
    if (interval >= 1) {
      return `منذ ${interval} ${name}${interval > 1 ? '' : ''}`;
    }
  }

  return 'الآن';
};

// ============================================
// التحقق من الصحة
// ============================================

/**
 * التحقق من صحة البريد الإلكتروني
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * التحقق من صحة رقم الهاتف العراقي
 */
export const isValidIraqiPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+964|964|0)?(7[3-9])\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * تنسيق رقم الهاتف
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{4})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return phone;
};

// ============================================
// معالجة المصفوفات
// ============================================

/**
 * خلط عناصر المصفوفة عشوائياً
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * إزالة التكرارات من المصفوفة
 */
export const uniqueArray = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

/**
 * تقسيم المصفوفة إلى chunks
 */
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// ============================================
// معالجة الكائنات
// ============================================

/**
 * إزالة القيم الفارغة من الكائن
 */
export const removeEmpty = <T extends Record<string, any>>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== null && value !== undefined && value !== '')
  ) as Partial<T>;
};

/**
 * نسخ عميق للكائن
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// ============================================
// الألوان
// ============================================

/**
 * تحويل HEX إلى RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * الحصول على لون عشوائي
 */
export const getRandomColor = (): string => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

// ============================================
// التخزين المحلي
// ============================================

/**
 * حفظ في Local Storage
 */
export const saveToStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * القراءة من Local Storage
 */
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

/**
 * حذف من Local Storage
 */
export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// ============================================
// متنوعة
// ============================================

/**
 * تأخير التنفيذ (للأنيميشن مثلاً)
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * debounce للبحث
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * throttle للأحداث المتكررة
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * نسخ النص إلى الحافظة
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

/**
 * التحقق من نوع الجهاز
 */
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * الحصول على حجم الشاشة
 */
export const getScreenSize = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * التمرير إلى عنصر بسلاسة
 */
export const scrollToElement = (elementId: string, offset: number = 0): void => {
  const element = document.getElementById(elementId);
  if (element) {
    const top = element.offsetTop - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

/**
 * توليد ID عشوائي
 */
export const generateId = (length: number = 10): string => {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
};

/**
 * ضغط الصورة
 */
export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('فشل ضغط الصورة'));
          },
          'image/jpeg',
          quality
        );
      };
    };
    reader.onerror = reject;
  });
};

