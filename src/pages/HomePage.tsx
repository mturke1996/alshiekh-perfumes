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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Luxury Hero Carousel */}
      <LuxuryHeroCarousel />


      {/* Features Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 80 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="h-1 bg-gradient-to-r from-brand-maroon-600 via-brand-gold-500 to-brand-maroon-600 mx-auto mb-6 rounded-full"
            />
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
              <span className="bg-gradient-to-r from-brand-maroon-600 to-brand-gold-600 bg-clip-text text-transparent">
                خدماتنا
              </span>
            </h2>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              نسعى لتقديم تجربة تسوق مريحة ومميزة
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group relative bg-white p-8 md:p-10 transition-all duration-300 overflow-hidden rounded-2xl border border-gray-100 hover:border-brand-gold-300/50 hover:shadow-xl"
              >
                {/* Decorative Corner Gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-gold-100/30 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  >
                    <feature.icon className="text-white" size={28} />
                  </motion.div>

                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-900 group-hover:text-brand-maroon-600 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom Line Animation */}
                <motion.div
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.5 }}
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-brand-maroon-600 via-brand-gold-500 to-brand-maroon-600"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-gray-900 via-brand-maroon-900 to-gray-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Decorative Orbs */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-brand-gold-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-brand-maroon-500/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 bg-brand-gold-500/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-brand-gold-500/30"
            >
              <Sparkles className="text-brand-gold-400" size={24} />
              <span className="text-brand-gold-100 text-sm tracking-widest uppercase font-medium">تصفح المتجر</span>
            </motion.div>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 leading-tight">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="block"
              >
                استكشف
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="block text-brand-gold-400 mt-2 bg-gradient-to-r from-brand-gold-400 to-brand-gold-300 bg-clip-text text-transparent"
              >
                منتجاتنا
              </motion.span>
            </h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed"
            >
              تصفح مجموعتنا من العطور الفاخرة ومستحضرات التجميل
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Link
                to="/products"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-brand-maroon-600 to-brand-maroon-700 hover:from-brand-maroon-700 hover:to-brand-maroon-800 text-white px-8 md:px-12 py-4 md:py-6 rounded-2xl font-bold text-lg md:text-xl tracking-wide transition-all duration-300 hover:gap-5 relative overflow-hidden shadow-2xl hover:shadow-brand-maroon-500/50"
              >
                <span className="relative z-10">عرض المنتجات</span>
                <ArrowRight 
                  className="relative z-10 transition-transform group-hover:-translate-x-1" 
                  size={24} 
                />
                
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-brand-gold-600 to-brand-gold-500"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

