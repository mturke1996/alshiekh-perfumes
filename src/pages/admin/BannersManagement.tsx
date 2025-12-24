import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Save,
  X,
  Upload,
  ExternalLink,
} from 'lucide-react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Banner } from '../../types/perfume-shop';
import toast from 'react-hot-toast';

export default function BannersManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<Banner>>({
    title: '',
    titleAr: '',
    subtitle: '',
    subtitleAr: '',
    image: '',
    imageMobile: '',
    link: '/products',
    buttonText: 'Shop Now',
    buttonTextAr: 'تسوق الآن',
    position: 'hero',
    priority: 1,
    active: true,
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const bannersRef = collection(db, 'banners');
      const q = query(bannersRef, orderBy('priority', 'asc'));
      const snapshot = await getDocs(q);

      const bannersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Banner[];

      setBanners(bannersData);
    } catch (error) {
      console.error('Error loading banners:', error);
      toast.error('فشل تحميل البنرات');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (
    file: File,
    field: 'image' | 'imageMobile'
  ) => {
    try {
      setUploading(true);
      const storageRef = ref(storage, `banners/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      setFormData((prev) => ({ ...prev, [field]: url }));
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titleAr || !formData.image) {
      toast.error('يرجى إدخال العنوان والصورة على الأقل');
      return;
    }

    try {
      if (editingBanner) {
        // Update existing banner
        await updateDoc(doc(db, 'banners', editingBanner.id), {
          ...formData,
          updatedAt: Timestamp.now(),
        });
        toast.success('تم تحديث البنر بنجاح');
      } else {
        // Create new banner
        await addDoc(collection(db, 'banners'), {
          ...formData,
          createdAt: Timestamp.now(),
          clicks: 0,
          views: 0,
        });
        toast.success('تم إضافة البنر بنجاح');
      }

      resetForm();
      loadBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('فشل حفظ البنر');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا البنر؟')) return;

    try {
      await deleteDoc(doc(db, 'banners', id));
      toast.success('تم حذف البنر بنجاح');
      loadBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('فشل حذف البنر');
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await updateDoc(doc(db, 'banners', banner.id), {
        active: !banner.active,
      });
      toast.success(`تم ${banner.active ? 'إخفاء' : 'إظهار'} البنر`);
      loadBanners();
    } catch (error) {
      console.error('Error toggling banner:', error);
      toast.error('فشل تحديث حالة البنر');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleAr: '',
      subtitle: '',
      subtitleAr: '',
      image: '',
      imageMobile: '',
      link: '/products',
      buttonText: 'Shop Now',
      buttonTextAr: 'تسوق الآن',
      position: 'hero',
      priority: 1,
      active: true,
    });
    setEditingBanner(null);
    setShowForm(false);
  };

  const startEdit = (banner: Banner) => {
    setFormData(banner);
    setEditingBanner(banner);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة البنرات</h1>
          <p className="text-gray-600 mt-2">
            تحكم في البنرات المعروضة في الصفحة الرئيسية
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus size={20} />
          <span>إضافة بنر جديد</span>
        </button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !uploading && resetForm()}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBanner ? 'تعديل البنر' : 'إضافة بنر جديد'}
                </h2>
                <button
                  onClick={resetForm}
                  disabled={uploading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title Arabic */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العنوان بالعربية *
                    </label>
                    <input
                      type="text"
                      value={formData.titleAr}
                      onChange={(e) =>
                        setFormData({ ...formData, titleAr: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Title English */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العنوان بالإنجليزية
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  {/* Subtitle Arabic */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العنوان الفرعي بالعربية
                    </label>
                    <input
                      type="text"
                      value={formData.subtitleAr}
                      onChange={(e) =>
                        setFormData({ ...formData, subtitleAr: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  {/* Subtitle English */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العنوان الفرعي بالإنجليزية
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) =>
                        setFormData({ ...formData, subtitle: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Main Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الصورة الرئيسية (Desktop - 1920x1080) *
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                    <label className="relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleImageUpload(e.target.files[0], 'image')
                        }
                        className="hidden"
                        disabled={uploading}
                      />
                      <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors">
                        <Upload size={20} />
                        <span>رفع</span>
                      </div>
                    </label>
                  </div>
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="mt-4 w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>

                {/* Mobile Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صورة الموبايل (768x1024) - اختياري
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="url"
                      value={formData.imageMobile}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          imageMobile: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="https://example.com/image-mobile.jpg"
                    />
                    <label className="relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleImageUpload(e.target.files[0], 'imageMobile')
                        }
                        className="hidden"
                        disabled={uploading}
                      />
                      <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors">
                        <Upload size={20} />
                        <span>رفع</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الرابط
                    </label>
                    <input
                      type="text"
                      value={formData.link}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="/products"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الأولوية
                    </label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      min="1"
                    />
                  </div>

                  {/* Active */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الحالة
                    </label>
                    <select
                      value={formData.active ? 'true' : 'false'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          active: e.target.value === 'true',
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="true">نشط</option>
                      <option value="false">غير نشط</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Button Text Arabic */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نص الزر بالعربية
                    </label>
                    <input
                      type="text"
                      value={formData.buttonTextAr}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buttonTextAr: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  {/* Button Text English */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نص الزر بالإنجليزية
                    </label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buttonText: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={20} />
                    <span>{editingBanner ? 'تحديث' : 'حفظ'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={uploading}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner, index) => (
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
          >
            <div className="relative aspect-video">
              <img
                src={banner.image}
                alt={banner.titleAr}
                className="w-full h-full object-cover"
              />
              {!banner.active && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold">غير نشط</span>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                أولوية: {banner.priority}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                {banner.titleAr}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {banner.subtitleAr}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(banner)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit size={16} />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => handleToggleActive(banner)}
                  className={`p-2 rounded-lg transition-colors ${
                    banner.active
                      ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {banner.active ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
                {banner.link && (
                  <a
                    href={banner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ExternalLink size={20} />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-20">
          <ImageIcon className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            لا توجد بنرات بعد
          </h3>
          <p className="text-gray-600 mb-6">ابدأ بإضافة بنر جديد للصفحة الرئيسية</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Plus size={20} />
            <span>إضافة بنر</span>
          </button>
        </div>
      )}
    </div>
  );
}

