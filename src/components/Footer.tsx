import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Phone, 
  Mail, 
  MapPin,
  MessageCircle,
  ArrowLeft,
  Youtube,
  Music
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SiteSettings } from '../types/perfume-shop';
import BrandLogo from './BrandLogo';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as SiteSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const socialLinks = [
    settings?.facebook && { 
      icon: Facebook, 
      href: settings.facebook, 
      label: 'فيسبوك',
      color: 'from-blue-600 to-blue-700'
    },
    settings?.instagram && { 
      icon: Instagram, 
      href: settings.instagram, 
      label: 'إنستغرام',
      color: 'from-pink-500 via-purple-500 to-orange-500'
    },
    settings?.twitter && { 
      icon: Twitter, 
      href: settings.twitter, 
      label: 'تويتر',
      color: 'from-blue-400 to-blue-500'
    },
    settings?.youtube && { 
      icon: Youtube, 
      href: settings.youtube, 
      label: 'يوتيوب',
      color: 'from-red-600 to-red-700'
    },
    settings?.tiktok && { 
      icon: Music, 
      href: settings.tiktok, 
      label: 'تيك توك',
      color: 'from-gray-900 to-gray-800'
    },
    { 
      icon: MessageCircle, 
      href: `https://wa.me/${settings?.phone?.replace(/\s/g, '') || '218915080707'}`, 
      label: 'واتساب',
      color: 'from-green-500 to-green-600'
    },
  ].filter(Boolean) as Array<{ icon: any; href: string; label: string; color: string }>;

  const quickLinks = [
    { path: '/', label: 'الرئيسية' },
    { path: '/products', label: 'جميع المنتجات' },
    { path: '/favorites', label: 'المفضلة' },
    { path: '/contact', label: 'اتصل بنا' },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-maroon-500/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <BrandLogo size="lg" showText={true} variant="light" className="mb-4" />
              <p className="text-gray-400 leading-relaxed mb-6 max-w-xs">
                أفضل العطور الفاخرة والمستحضرات التجميلية من أشهر العلامات التجارية العالمية
              </p>
              
              {/* Social Media */}
              <div className="flex gap-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${social.color} flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300`}
                      aria-label={social.label}
                    >
                      <Icon size={20} className="text-white" />
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">روابط سريعة</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <ArrowLeft 
                        size={16} 
                        className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" 
                      />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">تواصل معنا</h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="tel:+218915080707"
                    className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group"
                  >
                    <div className="mt-0.5 p-2 rounded-lg bg-brand-maroon-500/20 group-hover:bg-brand-maroon-500/30 transition-colors">
                      <Phone size={18} className="text-brand-gold-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">الهاتف</p>
                      <p className="font-medium">{settings?.phone || '091 508 0707'}</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${settings?.email || 'info@alshiekhparfumes.com'}`}
                    className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group"
                  >
                    <div className="mt-0.5 p-2 rounded-lg bg-brand-maroon-500/20 group-hover:bg-brand-maroon-500/30 transition-colors">
                      <Mail size={18} className="text-brand-gold-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">البريد الإلكتروني</p>
                      <p className="font-medium text-sm break-all">{settings?.email || 'info@alshiekhparfumes.com'}</p>
                    </div>
                  </a>
                </li>
                {settings?.address && (
                  <li>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(settings.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group"
                    >
                      <div className="mt-0.5 p-2 rounded-lg bg-brand-maroon-500/20 group-hover:bg-brand-maroon-500/30 transition-colors">
                        <MapPin size={18} className="text-brand-gold-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">العنوان</p>
                        <p className="font-medium text-sm leading-snug">{settings.address}</p>
                      </div>
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Newsletter/CTA */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">اشترك في النشرة</h4>
              <p className="text-gray-400 text-sm mb-4">
                احصل على آخر العروض والمنتجات الجديدة
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold-500 focus:ring-2 focus:ring-brand-gold-500/20 transition-all"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-brand-maroon-600 to-brand-maroon-700 hover:from-brand-maroon-700 hover:to-brand-maroon-800 text-white font-bold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                >
                  اشترك الآن
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 pb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-right">
              &copy; {currentYear} الشيخ للعطور (ALSHIEKH PARFUMES). جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link to="/" className="hover:text-white transition-colors">
                سياسة الخصوصية
              </Link>
              <Link to="/" className="hover:text-white transition-colors">
                شروط الاستخدام
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

