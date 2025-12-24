import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Gift, 
  TrendingUp, 
  Award,
  Crown,
  Sparkles,
  ArrowRight,
  Calendar,
  ShoppingBag
} from 'lucide-react';
import { LoyaltyProgram, LoyaltyTransaction } from '../types/perfume-shop';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import MaterialRipple from './MaterialRipple';

interface LoyaltyProgramProps {
  loyalty: LoyaltyProgram;
  transactions: LoyaltyTransaction[];
  onRedeem?: (points: number) => void;
}

export default function LoyaltyProgramComponent({ 
  loyalty, 
  transactions,
  onRedeem 
}: LoyaltyProgramProps) {
  
  const tiers = [
    {
      name: 'برونزي',
      nameEn: 'bronze',
      minPoints: 0,
      maxPoints: 999,
      icon: Award,
      color: 'from-orange-600 to-orange-800',
      benefits: [
        'نقطة واحدة لكل 10 IQD',
        'خصم 5% على العطور',
        'هدية عيد ميلاد'
      ]
    },
    {
      name: 'فضي',
      nameEn: 'silver',
      minPoints: 1000,
      maxPoints: 2999,
      icon: Trophy,
      color: 'from-gray-400 to-gray-600',
      benefits: [
        'نقطة واحدة لكل 8 IQD',
        'خصم 10% على العطور',
        'توصيل مجاني للطلبات فوق 50 IQD',
        'دعوات حصرية للعروض',
        'هدية عيد ميلاد مميزة'
      ]
    },
    {
      name: 'ذهبي',
      nameEn: 'gold',
      minPoints: 3000,
      maxPoints: 4999,
      icon: Star,
      color: 'from-yellow-500 to-yellow-700',
      benefits: [
        'نقطة واحدة لكل 5 IQD',
        'خصم 15% على جميع المنتجات',
        'توصيل مجاني دائماً',
        'الوصول المبكر للمنتجات الجديدة',
        'هدايا شهرية مفاجئة',
        'خدمة عملاء مخصصة'
      ]
    },
    {
      name: 'بلاتيني',
      nameEn: 'platinum',
      minPoints: 5000,
      maxPoints: Infinity,
      icon: Crown,
      color: 'from-purple-600 to-pink-600',
      benefits: [
        'نقطة واحدة لكل 3 IQD',
        'خصم 20% على جميع المنتجات',
        'توصيل مجاني وسريع دائماً',
        'عينات مجانية مع كل طلب',
        'الوصول الحصري للمنتجات المحدودة',
        'حفلات VIP وفعاليات خاصة',
        'مدير حساب شخصي'
      ]
    }
  ];

  const currentTier = tiers.find(t => t.nameEn === loyalty.tier) || tiers[0];
  const currentTierIndex = tiers.findIndex(t => t.nameEn === loyalty.tier);
  const nextTier = tiers[currentTierIndex + 1];
  const progressToNextTier = nextTier 
    ? ((loyalty.points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  const redeemOptions = [
    { points: 100, discount: 5, value: 5 },
    { points: 250, discount: 15, value: 15 },
    { points: 500, discount: 35, value: 35 },
    { points: 1000, discount: 80, value: 80 }
  ];

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl shadow-2xl"
      >
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentTier.color}`} />
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full translate-x-1/2 translate-y-1/2" />
        
        {/* Content */}
        <div className="relative p-8 text-white">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <currentTier.icon size={32} />
                <h2 className="text-3xl font-bold">عضوية {currentTier.name}</h2>
              </div>
              <p className="text-white/90">برنامج الولاء المميز</p>
            </div>
            <div className="text-left">
              <p className="text-white/80 text-sm mb-1">نقاطك</p>
              <p className="text-5xl font-bold">{loyalty.points.toLocaleString()}</p>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {nextTier && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>التقدم للمستوى التالي</span>
                <span>{nextTier.minPoints - loyalty.points} نقطة متبقية</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNextTier}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-white rounded-full"
                />
              </div>
              <p className="text-xs text-white/80 mt-2">
                {Math.round(progressToNextTier)}% إلى عضوية {nextTier.name}
              </p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <ShoppingBag size={20} className="mb-2" />
              <p className="text-2xl font-bold">{loyalty.totalEarned}</p>
              <p className="text-xs text-white/80">إجمالي النقاط المكتسبة</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <TrendingUp size={20} className="mb-2" />
              <p className="text-2xl font-bold">{loyalty.lifetimeValue.toFixed(0)}</p>
              <p className="text-xs text-white/80">قيمة المشتريات (IQD)</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <Calendar size={20} className="mb-2" />
              <p className="text-2xl font-bold">
                {format(loyalty.joinedAt.toDate(), 'MMM yyyy', { locale: ar })}
              </p>
              <p className="text-xs text-white/80">عضو منذ</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Redeem Points */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-xl">
            <Gift className="text-green-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">استبدل نقاطك</h3>
            <p className="text-gray-600">احصل على خصومات فورية</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {redeemOptions.map((option, index) => {
            const canRedeem = loyalty.points >= option.points;
            return (
              <motion.div
                key={option.points}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`relative border-2 rounded-xl p-4 transition-all ${
                  canRedeem
                    ? 'border-green-500 bg-green-50 hover:shadow-lg cursor-pointer'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                {canRedeem && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                )}
                
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {option.discount} IQD
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    خصم فوري
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Star size={16} className="text-yellow-500" />
                    <span className="font-bold text-gray-700">
                      {option.points} نقطة
                    </span>
                  </div>
                  
                  {canRedeem ? (
                    <MaterialRipple className="w-full">
                      <button
                        onClick={() => onRedeem?.(option.points)}
                        className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        استبدل الآن
                      </button>
                    </MaterialRipple>
                  ) : (
                    <div className="py-2 bg-gray-300 text-gray-600 rounded-lg font-medium text-sm">
                      يحتاج {option.points - loyalty.points} نقطة
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Benefits by Tier */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">مستويات العضوية</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier, index) => {
            const isCurrentTier = tier.nameEn === loyalty.tier;
            const isAchieved = loyalty.points >= tier.minPoints;
            
            return (
              <motion.div
                key={tier.nameEn}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-xl p-6 border-2 transition-all ${
                  isCurrentTier
                    ? `border-transparent bg-gradient-to-br ${tier.color} text-white shadow-lg`
                    : isAchieved
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {isCurrentTier && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-white text-gray-900 rounded-full text-xs font-bold shadow-md">
                    مستواك الحالي
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <tier.icon 
                    size={40} 
                    className={`mx-auto mb-3 ${
                      isCurrentTier ? 'text-white' : isAchieved ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                  <h4 className={`text-xl font-bold mb-1 ${
                    isCurrentTier ? 'text-white' : 'text-gray-900'
                  }`}>
                    {tier.name}
                  </h4>
                  <p className={`text-sm ${
                    isCurrentTier ? 'text-white/80' : 'text-gray-600'
                  }`}>
                    {tier.minPoints === 0 
                      ? `0 - ${tier.maxPoints} نقطة`
                      : tier.maxPoints === Infinity
                      ? `${tier.minPoints}+ نقطة`
                      : `${tier.minPoints} - ${tier.maxPoints} نقطة`
                    }
                  </p>
                </div>

                <ul className="space-y-2">
                  {tier.benefits.map((benefit, idx) => (
                    <li 
                      key={idx} 
                      className={`text-xs flex items-start gap-2 ${
                        isCurrentTier ? 'text-white/90' : 'text-gray-700'
                      }`}
                    >
                      <span className={`mt-0.5 ${
                        isCurrentTier ? 'text-white' : 'text-green-600'
                      }`}>
                        ✓
                      </span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                {!isAchieved && !isCurrentTier && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600 text-center">
                      يحتاج {tier.minPoints - loyalty.points} نقطة للوصول
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">سجل النقاط</h3>
          
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    transaction.type === 'earn' 
                      ? 'bg-green-100' 
                      : transaction.type === 'redeem'
                      ? 'bg-red-100'
                      : 'bg-blue-100'
                  }`}>
                    {transaction.type === 'earn' ? (
                      <TrendingUp size={20} className="text-green-600" />
                    ) : transaction.type === 'redeem' ? (
                      <Gift size={20} className="text-red-600" />
                    ) : (
                      <Sparkles size={20} className="text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {transaction.reasonAr}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(transaction.createdAt.toDate(), 'd MMMM yyyy', { locale: ar })}
                    </p>
                  </div>
                </div>
                
                <div className="text-left">
                  <p className={`text-xl font-bold ${
                    transaction.type === 'earn' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'earn' ? '+' : '-'}{transaction.points}
                  </p>
                  <p className="text-xs text-gray-500">نقطة</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* How to Earn Points */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">كيف تكسب النقاط؟</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: ShoppingBag,
              title: 'تسوق',
              description: 'اكسب نقاط مع كل عملية شراء',
              points: '1 نقطة لكل 10 IQD'
            },
            {
              icon: Star,
              title: 'قيّم المنتجات',
              description: 'اترك تقييماً واكسب نقاط',
              points: '50 نقطة لكل تقييم'
            },
            {
              icon: Gift,
              title: 'دعوة الأصدقاء',
              description: 'احصل على نقاط عند تسجيل أصدقائك',
              points: '200 نقطة لكل صديق'
            }
          ].map((method, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4"
            >
              <method.icon size={32} className="text-blue-600 mb-3" />
              <h4 className="font-bold text-gray-900 mb-1">{method.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{method.description}</p>
              <p className="text-blue-600 font-bold text-sm">{method.points}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

