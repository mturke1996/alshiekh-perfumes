import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useAuthStore } from '../../store/authStore';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import BrandLogo from '../../components/BrandLogo';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setIsAdmin } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user is admin, if not, add them automatically
      const adminRef = doc(db, 'admins', user.uid);
      const adminDoc = await getDoc(adminRef);
      
      if (!adminDoc.exists()) {
        // Automatically add user as admin if they don't exist
        await setDoc(adminRef, {
          email: email,
          role: 'admin',
          createdAt: Timestamp.now()
        });
        toast.success('تم إضافتك كمدير تلقائياً');
      }

      setUser(user);
      setIsAdmin(true);
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/admin');
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'auth/user-not-found') {
        toast.error('البريد الإلكتروني غير مسجل في النظام');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('كلمة المرور غير صحيحة');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('البريد الإلكتروني غير صحيح');
      } else if (error.code === 'auth/invalid-credential') {
        toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('مشكلة في الاتصال بالإنترنت');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('محاولات كثيرة، يرجى المحاولة لاحقاً');
      } else {
        toast.error(`حدث خطأ: ${error.message || 'خطأ غير معروف'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-maroon-900 via-brand-maroon-800 to-brand-maroon-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Back Button */}
      <motion.button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors z-20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft size={20} />
      </motion.button>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(212, 175, 55, 0.1) 35px, rgba(212, 175, 55, 0.1) 70px)`
        }}></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-brand-gold-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-brand-maroon-600/20 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo Card */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 text-center"
        >
          <div className="relative mb-4">
            <BrandLogo size="xl" />
            {/* Sparkle effect */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles size={20} className="text-brand-gold-300" />
            </motion.div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2" style={{
            fontFamily: 'Cairo, sans-serif'
          }}>
            ALSHIEKH PARFUMES
          </h1>
          <p className="text-brand-gold-200 text-sm">لوحة تحكم الإدارة</p>
          
          {/* EST 1999 Badge */}
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold-500/20 backdrop-blur-sm rounded-full border border-brand-gold-400/30">
            <span className="text-xs text-brand-gold-300 font-medium">EST</span>
            <span className="text-xs text-brand-gold-400 font-bold">1999</span>
          </div>
        </motion.div>

        {/* Login Form Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
        >
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@alshiekh.com"
                  className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-12 pl-12 py-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-brand-maroon-600 to-brand-maroon-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <span>تسجيل الدخول</span>
              )}
            </motion.button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500">
              هذا القسم مخصص للمديرين فقط
            </p>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-brand-gold-200 text-sm">
            تاج مول (الطابق الأرضي) - جزيرة الأندلسي - تاجوراء
          </p>
          <p className="text-brand-gold-300 text-sm font-medium mt-1">
            091 508 0707
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
