import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Save,
  Upload,
  X,
  Image as ImageIcon,
  ArrowLeft
} from 'lucide-react';
import { doc, getDoc, addDoc, updateDoc, collection, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { Product } from '../../types/perfume-shop';
import toast from 'react-hot-toast';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    nameAr: '',
    price: 0,
    discount: 0,
    images: [],
    thumbnail: '',
    brand: '',
    brandAr: '',
    category: 'perfume',
    categoryAr: 'عطور',
    gender: 'unisex',
    genderAr: 'للجنسين',
    inStock: true,
    stockQuantity: 100,
    featured: false,
    isNew: false,
    rating: 0,
    reviewCount: 0,
  });

  useEffect(() => {
    if (isEditing && id) {
      loadProduct();
    }
  }, [id, isEditing]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productDoc = await getDoc(doc(db, 'products', id!));
      if (productDoc.exists()) {
        setProduct({ id: productDoc.id, ...productDoc.data() } as Product);
      } else {
        toast.error('المنتج غير موجود');
        navigate('/admin/products');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('حدث خطأ في تحميل المنتج');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      setProduct(prev => ({
        ...prev,
        images: [...(prev.images || []), url],
        thumbnail: prev.thumbnail || url
      }));
      
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(product.images || [])];
    const removedUrl = newImages[index];
    newImages.splice(index, 1);
    
    setProduct(prev => ({
      ...prev,
      images: newImages,
      thumbnail: prev.thumbnail === removedUrl ? (newImages[0] || '') : prev.thumbnail
    }));
  };

  const setThumbnail = (url: string) => {
    setProduct(prev => ({ ...prev, thumbnail: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product.nameAr || !product.name || !product.price || (product.images || []).length === 0) {
      toast.error('يرجى إدخال جميع الحقول المطلوبة');
      return;
    }

    try {
      setLoading(true);
      const productData = {
        name: product.name,
        nameAr: product.nameAr,
        price: Number(product.price),
        discount: Number(product.discount || 0),
        images: product.images || [],
        thumbnail: product.thumbnail || product.images?.[0] || '',
        brand: product.brand || '',
        brandAr: product.brandAr || '',
        category: product.category || 'perfume',
        categoryAr: product.categoryAr || 'عطور',
        gender: product.gender || 'unisex',
        genderAr: product.genderAr || 'للجنسين',
        inStock: true,
        stockQuantity: 100,
        featured: false,
        isNew: false,
        rating: 0,
        reviewCount: 0,
        updatedAt: Timestamp.now(),
      };

      if (isEditing && id) {
        await updateDoc(doc(db, 'products', id), productData);
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: Timestamp.now(),
          views: 0,
          wishlistCount: 0,
          purchaseCount: 0,
        });
        toast.success('تم إضافة المنتج بنجاح');
      }
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('حدث خطأ في حفظ المنتج');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-maroon-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">جاري تحميل المنتج...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </h2>
          </div>
        </motion.div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
        >
          <h3 className="text-base font-bold text-gray-900 mb-4">المعلومات الأساسية</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المنتج (عربي) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={product.nameAr || ''}
                onChange={(e) => setProduct({ ...product, nameAr: e.target.value })}
                placeholder="عطر توم فورد - بلاك أوركيد"
                required
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المنتج (إنجليزي) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={product.name || ''}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                placeholder="Tom Ford Black Orchid"
                required
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العلامة التجارية (عربي) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={product.brandAr || ''}
                onChange={(e) => setProduct({ ...product, brandAr: e.target.value })}
                placeholder="توم فورد"
                required
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة
                </label>
                <select
                  value={product.category || 'perfume'}
                  onChange={(e) => setProduct({ 
                    ...product, 
                    category: e.target.value,
                    categoryAr: e.target.value === 'perfume' ? 'عطور' : 
                               e.target.value === 'makeup' ? 'مكياج' : 
                               e.target.value === 'skincare' ? 'العناية بالبشرة' : 
                               e.target.value === 'haircare' ? 'العناية بالشعر' : 'طقم هدايا'
                  })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
                >
                  <option value="perfume">عطور</option>
                  <option value="makeup">مكياج</option>
                  <option value="skincare">العناية بالبشرة</option>
                  <option value="haircare">العناية بالشعر</option>
                  <option value="gift-set">طقم هدايا</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  النوع
                </label>
                <select
                  value={product.gender || 'unisex'}
                  onChange={(e) => setProduct({ 
                    ...product, 
                    gender: e.target.value as any,
                    genderAr: e.target.value === 'unisex' ? 'للجنسين' :
                              e.target.value === 'men' ? 'رجالي' : 'نسائي'
                  })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
                >
                  <option value="unisex">للجنسين</option>
                  <option value="men">رجالي</option>
                  <option value="women">نسائي</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر (IQD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={product.price || ''}
                  onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                  placeholder="350000"
                  required
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الخصم (%)
                </label>
                <input
                  type="number"
                  value={product.discount || ''}
                  onChange={(e) => setProduct({ ...product, discount: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
        >
          <h3 className="text-base font-bold text-gray-900 mb-4">صور المنتج <span className="text-red-500">*</span></h3>
          
          <div className="mb-4">
            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-brand-maroon-500 transition-colors">
              <div className="text-center">
                <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                <p className="text-sm text-gray-600">
                  {uploading ? 'جاري الرفع...' : 'اضغط لرفع الصور'}
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(file => handleImageUpload(file));
                }}
              />
            </label>
          </div>

          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {product.images.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Product ${index + 1}`}
                    className={`w-full h-24 object-cover rounded-xl border-2 ${
                      product.thumbnail === url ? 'border-brand-maroon-500' : 'border-gray-200'
                    }`}
                  />
                  {product.thumbnail === url && (
                    <div className="absolute top-1 right-1 px-2 py-0.5 bg-brand-maroon-600 text-white text-xs rounded">
                      رئيسية
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setThumbnail(url)}
                    className="absolute bottom-1 right-1 p-1 bg-brand-maroon-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="تعيين كصورة رئيسية"
                  >
                    <ImageIcon size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 left-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <div className="flex items-center gap-3 sticky bottom-0 bg-white pt-4 pb-2">
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className="flex-1 py-3.5 bg-brand-maroon-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>{isEditing ? 'حفظ التغييرات' : 'إضافة المنتج'}</span>
              </>
            )}
          </motion.button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
