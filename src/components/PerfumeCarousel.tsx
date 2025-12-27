import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './PerfumeCarousel.css';

interface CarouselSlide {
  id: string;
  image: string;
  title?: string;
  link?: string;
}

// صور عالية الجودة للعطور والمكياج 2026 - Full HD/4K
const carouselSlides: CarouselSlide[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&q=95&auto=format&fit=crop',
    title: 'عطور فاخرة 2026',
    link: '/products?category=perfume'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1595425970377-c97002967f21?w=1920&q=95&auto=format&fit=crop',
    title: 'مجموعة المكياج المميزة',
    link: '/products?category=makeup'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1920&q=95&auto=format&fit=crop',
    title: 'عطور جديدة 2026',
    link: '/products?isNew=true'
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=1920&q=95&auto=format&fit=crop',
    title: 'مجموعة العناية بالبشرة',
    link: '/products?category=skincare'
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1920&q=95&auto=format&fit=crop',
    title: 'عروض حصرية 2026',
    link: '/products?discount=true'
  }
];

export default function PerfumeCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slides, setSlides] = useState<CarouselSlide[]>(carouselSlides);
  const [loading, setLoading] = useState(true);
  const [swiperKey, setSwiperKey] = useState(0);

  useEffect(() => {
    loadHeroImages();
    
    // Listen for hero images updates
    const handleHeroImagesUpdate = () => {
      console.log('Hero images updated event received');
      loadHeroImages();
    };
    
    window.addEventListener('heroImagesUpdated', handleHeroImagesUpdate);
    
    return () => {
      window.removeEventListener('heroImagesUpdated', handleHeroImagesUpdate);
    };
  }, []);

  const loadHeroImages = async () => {
    try {
      setLoading(true);
      
      // Load hero images from settings first
      const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
      if (settingsDoc.exists()) {
        const settingsData = settingsDoc.data();
        const heroImages = settingsData.heroImages || [];
        
        if (heroImages && heroImages.length > 0) {
          console.log('Loading hero images from settings:', heroImages.length);
          
          // Convert hero images to slides
          const heroSlides: CarouselSlide[] = heroImages.map((image: string, index: number) => ({
            id: `hero-${index}`,
            image: image,
            title: '',
            link: '/products',
          }));
          
          setSlides(heroSlides);
          setSwiperKey(prev => prev + 1); // Force Swiper re-render
          setLoading(false);
          return;
        }
      }

      console.log('No hero images in settings, using default slides');
      setSlides(carouselSlides);
    } catch (error) {
      console.error('Error loading hero images:', error);
      setSlides(carouselSlides);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get image path with fallback
  const getImagePath = (path: string) => {
    try {
      // Try to encode the path properly
      if (path.includes(' ')) {
        return path.replace(' ', '%20');
      }
      return path;
    } catch {
      return path;
    }
  };

  if (loading) {
    return (
      <div className="relative w-screen h-[75vh] min-h-[550px] max-h-[850px] overflow-hidden mt-0 shadow-2xl bg-gray-100" style={{ marginLeft: 'calc(-50vw + 50%)', width: '100vw', position: 'relative', left: '50%', right: '50%', marginRight: '-50vw' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-maroon-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-[75vh] min-h-[550px] max-h-[850px] overflow-hidden mt-0 shadow-2xl" style={{ marginLeft: 'calc(-50vw + 50%)', width: '100vw', position: 'relative', left: '50%', right: '50%', marginRight: '-50vw' }}>
      <Swiper
        key={swiperKey}
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        effect="fade"
        speed={1000}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          bulletClass: 'carousel-pagination-bullet',
          bulletActiveClass: 'carousel-pagination-bullet-active',
          renderBullet: (index, className) => {
            return `<span class="${className}"></span>`;
          },
        }}
        navigation={{
          nextEl: '.carousel-button-next',
          prevEl: '.carousel-button-prev',
        }}
        loop={slides.length > 1}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full group">
              {/* Background Image - Full Screen, No Overlays */}
              <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: activeIndex === index ? 1 : 1.1 }}
                transition={{ duration: 12, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <img
                  src={getImagePath(slide.image)}
                  alt={slide.title || 'Luxury Perfumes'}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  style={{
                    objectPosition: 'center center',
                  }}
                  onError={(e) => {
                    // Fallback if image doesn't load
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&q=95';
                  }}
                />
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Minimal Navigation Buttons - Hidden on Mobile */}
      <div className="carousel-button-prev absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 cursor-pointer group hidden md:block">
        <motion.div
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/30 backdrop-blur-md bg-black/20 flex items-center justify-center transition-all duration-300 hover:bg-black/40 shadow-lg"
        >
          <ChevronRight className="text-white" size={22} />
        </motion.div>
      </div>

      <div className="carousel-button-next absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 cursor-pointer group hidden md:block">
        <motion.div
          whileHover={{ scale: 1.1, x: 5 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/30 backdrop-blur-md bg-black/20 flex items-center justify-center transition-all duration-300 hover:bg-black/40 shadow-lg"
        >
          <ChevronLeft className="text-white" size={22} />
        </motion.div>
      </div>

    </div>
  );
}

