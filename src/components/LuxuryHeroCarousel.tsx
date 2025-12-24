import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Banner } from '../types/perfume-shop';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface HeroSlide extends Banner {
  // يمكن إضافة خصائص إضافية إذا لزم الأمر
}

// صور افتراضية عالية الجودة (4K) من Unsplash
const defaultSlides: HeroSlide[] = [
  {
    id: '1',
    title: 'Luxury Perfumes',
    titleAr: 'متجر العطور والمكياج',
    subtitle: 'Discover Our Collection',
    subtitleAr: 'اكتشف مجموعتنا',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&q=95',
    imageMobile: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=768&q=90',
    link: '/products',
    buttonText: 'Shop Now',
    buttonTextAr: 'تسوق الآن',
    position: 'hero',
    priority: 1,
    active: true,
    createdAt: null as any,
  },
  {
    id: '2',
    title: 'Beauty Collection',
    titleAr: 'مجموعة التجميل',
    subtitle: 'Explore Our Products',
    subtitleAr: 'استكشف منتجاتنا',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=1920&q=95',
    imageMobile: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=768&q=90',
    link: '/products',
    buttonText: 'View Products',
    buttonTextAr: 'عرض المنتجات',
    position: 'hero',
    priority: 2,
    active: true,
    createdAt: null as any,
  },
  {
    id: '3',
    title: 'Cosmetics Store',
    titleAr: 'متجر مستحضرات التجميل',
    subtitle: 'Browse Collection',
    subtitleAr: 'تصفح المجموعة',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1920&q=95',
    imageMobile: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=768&q=90',
    link: '/products',
    buttonText: 'Browse',
    buttonTextAr: 'تصفح',
    position: 'hero',
    priority: 3,
    active: true,
    createdAt: null as any,
  },
];

export default function LuxuryHeroCarousel() {
  const [slides, setSlides] = useState<HeroSlide[]>(defaultSlides);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const bannersRef = collection(db, 'banners');
      const q = query(
        bannersRef,
        where('position', '==', 'hero'),
        where('active', '==', true),
        orderBy('priority', 'asc')
      );

      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const bannerData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as HeroSlide[];

        setSlides(bannerData);
      }
    } catch (error) {
      console.log('Using default slides:', error);
      // في حالة عدم وجود Firebase أو خطأ، نستخدم الصور الافتراضية
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative h-screen bg-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        effect="fade"
        speed={1500}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          bulletClass: 'hero-pagination-bullet',
          bulletActiveClass: 'hero-pagination-bullet-active',
        }}
        navigation={{
          nextEl: '.hero-button-next',
          prevEl: '.hero-button-prev',
        }}
        loop={true}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <HeroSlide slide={slide} isActive={index === activeIndex} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <div className="hero-button-prev absolute left-8 top-1/2 -translate-y-1/2 z-20 cursor-pointer group">
        <div className="w-14 h-14 rounded-full border-2 border-white/30 backdrop-blur-sm bg-black/20 flex items-center justify-center transition-all duration-300 hover:bg-amber-500 hover:border-amber-500 hover:scale-110">
          <ChevronRight className="text-white group-hover:scale-110 transition-transform" size={28} />
        </div>
      </div>

      <div className="hero-button-next absolute right-8 top-1/2 -translate-y-1/2 z-20 cursor-pointer group">
        <div className="w-14 h-14 rounded-full border-2 border-white/30 backdrop-blur-sm bg-black/20 flex items-center justify-center transition-all duration-300 hover:bg-amber-500 hover:border-amber-500 hover:scale-110">
          <ChevronLeft className="text-white group-hover:scale-110 transition-transform" size={28} />
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-white/80 text-sm font-light tracking-widest">تمرير</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center pt-2"
        >
          <div className="w-1 h-2 bg-white/60 rounded-full"></div>
        </motion.div>
      </motion.div>
    </div>
  );
}

interface HeroSlideProps {
  slide: HeroSlide;
  isActive: boolean;
}

function HeroSlide({ slide, isActive }: HeroSlideProps) {
  return (
    <div className="relative h-full w-full">
      {/* Background Image with Parallax Effect */}
      <motion.div
        initial={{ scale: 1.2 }}
        animate={{ scale: isActive ? 1 : 1.2 }}
        transition={{ duration: 8, ease: 'easeOut' }}
        className="absolute inset-0"
      >
        <picture>
          <source media="(max-width: 768px)" srcSet={slide.imageMobile || slide.image} />
          <img
            src={slide.image}
            alt={slide.titleAr}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </picture>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40"></div>
      </motion.div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          <div className="max-w-3xl">
            <AnimatePresence mode="wait">
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -60 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="space-y-6"
                >
                  {/* Decorative Element */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '80px' }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="h-1 bg-gradient-to-r from-amber-400 to-amber-600"
                  />

                  {/* Subtitle */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="flex items-center gap-3"
                  >
                    <Sparkles className="text-amber-400" size={20} />
                    <span className="text-amber-100 text-sm md:text-base tracking-[0.3em] uppercase font-light">
                      {slide.subtitleAr}
                    </span>
                  </motion.div>

                  {/* Main Title */}
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight"
                    style={{ fontFamily: "'Playfair Display', 'Cairo', serif" }}
                  >
                    {slide.titleAr}
                  </motion.h1>

                  {/* Description (if exists) */}
                  {slide.subtitle && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                      className="text-white/80 text-lg md:text-xl font-light leading-relaxed max-w-2xl"
                    >
                      {slide.subtitle}
                    </motion.p>
                  )}

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                  >
                    <Link
                      to={slide.link || '/products'}
                      className="group inline-flex items-center gap-3 bg-amber-600 hover:bg-amber-500 text-white px-10 py-5 rounded-none font-medium text-lg tracking-wider transition-all duration-300 hover:gap-5 relative overflow-hidden"
                    >
                      <span className="relative z-10">{slide.buttonTextAr || 'تسوق الآن'}</span>
                      <ChevronLeft 
                        className="relative z-10 transition-transform group-hover:-translate-x-1" 
                        size={24} 
                      />
                      
                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </Link>
                  </motion.div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Luxury Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

