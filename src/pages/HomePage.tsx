import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Truck, 
  Tag
} from 'lucide-react';
import LuxuryHeroCarousel from '../components/LuxuryHeroCarousel';
import '../components/LuxuryHeroCarousel.css';

export default function HomePage() {
  const features = [
    {
      icon: Shield,
      title: 'جودة المنتجات',
      description: 'نحرص على توفير منتجات عالية الجودة',
      color: 'amber',
      gradient: 'from-amber-500 to-amber-600'
    },
    {
      icon: Truck,
      title: 'خدمة التوصيل',
      description: 'نوفر خدمة توصيل للطلبات',
      color: 'emerald',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: Tag,
      title: 'أسعار واضحة',
      description: 'أسعار شفافة بدون رسوم مخفية',
      color: 'rose',
      gradient: 'from-rose-500 to-rose-600'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Luxury Hero Carousel */}
      <LuxuryHeroCarousel />


      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4">
              <div className="h-1 w-20 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6"></div>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-zinc-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              خدماتنا
            </h2>
            <p className="text-zinc-600 text-xl max-w-2xl mx-auto font-light">
              نسعى لتقديم تجربة تسوق مريحة ومميزة
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group relative bg-zinc-50 hover:bg-white p-10 transition-all duration-500 overflow-hidden border border-zinc-200 hover:border-amber-400/50 hover:shadow-2xl"
              >
                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/10 to-transparent"></div>

                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-none mb-8 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <feature.icon className="text-white" size={36} />
                  </div>

                  <h3 className="text-2xl font-bold mb-4 text-zinc-900 group-hover:text-amber-600 transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {feature.title}
                  </h3>

                  <p className="text-zinc-600 leading-relaxed font-light">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom Line Animation */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 w-0 group-hover:w-full transition-all duration-500"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-zinc-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-3 bg-amber-500/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-amber-500/30">
              <Sparkles className="text-amber-400" size={24} />
              <span className="text-amber-100 text-sm tracking-widest uppercase">تصفح المتجر</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              استكشف
              <span className="block text-amber-400 mt-2">منتجاتنا</span>
            </h2>

            <p className="text-2xl mb-12 text-white/80 max-w-3xl mx-auto font-light">
              تصفح مجموعتنا من العطور ومستحضرات التجميل
            </p>

            <Link
              to="/products"
              className="group inline-flex items-center gap-3 bg-amber-600 hover:bg-amber-500 text-white px-12 py-6 rounded-none font-bold text-xl tracking-wider transition-all duration-300 hover:gap-5 relative overflow-hidden"
            >
              <span className="relative z-10">عرض المنتجات</span>
              <ArrowRight 
                className="relative z-10 transition-transform group-hover:-translate-x-1" 
                size={28} 
              />
              
              <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

