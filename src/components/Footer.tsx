import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  MapPin,
  ArrowLeft,
  Youtube,
  Music,
  Shield,
  Lock,
  FileText
} from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { SiteSettings } from '../types/perfume-shop';
import BrandLogo from './BrandLogo';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'general'),
      (settingsDoc) => {
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data() as SiteSettings);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching settings:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Handle newsletter subscription
      console.log('Newsletter subscription:', email);
      setEmail('');
    }
  };

  const socialLinks = [
    settings?.facebook && { 
      icon: Facebook, 
      href: settings.facebook, 
      label: 'فيسبوك',
      color: 'hover:bg-blue-600'
    },
    settings?.instagram && { 
      icon: Instagram, 
      href: settings.instagram, 
      label: 'إنستغرام',
      color: 'hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-600 hover:to-orange-500'
    },
    settings?.twitter && { 
      icon: Twitter, 
      href: settings.twitter, 
      label: 'تويتر',
      color: 'hover:bg-blue-400'
    },
    settings?.youtube && { 
      icon: Youtube, 
      href: settings.youtube, 
      label: 'يوتيوب',
      color: 'hover:bg-red-600'
    },
    settings?.tiktok && { 
      icon: Music, 
      href: settings.tiktok, 
      label: 'تيك توك',
      color: 'hover:bg-gray-900'
    },
  ].filter(Boolean) as Array<{ icon: any; href: string; label: string; color: string }>;

  const quickLinks = [
    { path: '/', label: 'الرئيسية' },
    { path: '/products', label: 'جميع المنتجات' },
    { path: '/favorites', label: 'المفضلة' },
    { path: '/contact', label: 'اتصل بنا' },
  ];

  return (
    <footer className="hidden lg:block bg-white border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section - Material Design 3 Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1 space-y-4"
          >
            <BrandLogo size="lg" showText={true} variant="full" className="mb-4" />
            {(settings?.storeDescription || settings?.storeDescriptionAr) && (
              <p className="text-gray-600 leading-relaxed text-sm">
                {settings.storeDescriptionAr || settings.storeDescription}
              </p>
            )}
            
            {/* Social Media - Material Design 3 Surface Tint */}
            <div className="flex flex-wrap gap-3 pt-2">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-10 h-10 rounded-full bg-gray-100 ${social.color} flex items-center justify-center text-gray-600 transition-all duration-300 hover:text-white hover:shadow-lg`}
                    aria-label={social.label}
                  >
                    <Icon size={18} />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Links - Material Design 3 Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-gray-900 text-base mb-6">روابط سريعة</h4>
            <nav className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="group flex items-center gap-2 text-gray-600 hover:text-brand-maroon-600 transition-colors duration-200 py-1.5"
                >
                  <ArrowLeft 
                    size={14} 
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-brand-maroon-600" 
                  />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              ))}
            </nav>
          </motion.div>

          {/* Contact Info - Material Design 3 Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-gray-900 text-base mb-6">تواصل معنا</h4>
            <div className="space-y-4">
              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="group flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="mt-0.5 p-2 rounded-lg bg-brand-maroon-50 text-brand-maroon-600 group-hover:bg-brand-maroon-100 transition-colors">
                    <Mail size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1 font-medium">البريد الإلكتروني</p>
                    <p className="text-sm font-semibold text-gray-900 break-all">{settings.email}</p>
                  </div>
                </a>
              )}
              {settings?.address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(settings.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="mt-0.5 p-2 rounded-lg bg-brand-maroon-50 text-brand-maroon-600 group-hover:bg-brand-maroon-100 transition-colors">
                    <MapPin size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1 font-medium">العنوان</p>
                    <p className="text-sm font-semibold text-gray-900 leading-snug">{settings.address}</p>
                  </div>
                </a>
              )}
            </div>
          </motion.div>

          {/* Newsletter - Material Design 3 Input & Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-gray-900 text-base mb-6">اشترك في النشرة</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              احصل على آخر العروض والمنتجات الجديدة مباشرة في بريدك
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="بريدك الإلكتروني"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-maroon-600 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-3 rounded-xl bg-brand-maroon-600 hover:bg-brand-maroon-700 text-white font-semibold transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                اشترك الآن
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar - Material Design 3 Divider */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm text-center md:text-right">
              &copy; {currentYear} الشيخ للعطور (ALSHIEKH PARFUMES). جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link 
                to="/" 
                className="flex items-center gap-1.5 text-gray-600 hover:text-brand-maroon-600 transition-colors"
              >
                <Shield size={14} />
                <span>سياسة الخصوصية</span>
              </Link>
              <Link 
                to="/" 
                className="flex items-center gap-1.5 text-gray-600 hover:text-brand-maroon-600 transition-colors"
              >
                <FileText size={14} />
                <span>شروط الاستخدام</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
