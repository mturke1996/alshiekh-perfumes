import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Save,
  X,
  Image as ImageIcon,
  ArrowLeft
} from 'lucide-react';
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Product } from '../../types/perfume-shop';
import toast from 'react-hot-toast';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

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
    if (isEditing && id) loadProduct();
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
    } catch {
      toast.error('حدث خطأ في تحميل المنتج');
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     إضافة صورة عبر رابط
  ===================== */
  const addImageByUrl = () => {
    if (!imageUrl.trim()) {
      toast.error('يرجى إدخال رابط الصورة');
      return;
    }

    if (!imageUrl.startsWith('http')) {
      toast.error('رابط غير صالح');
      return;
    }

    setProduct(prev => ({
      ...prev,
      images: [...(prev.images || []), imageUrl],
      thumbnail: prev.thumbnail || imageUrl
    }));

    setImageUrl('');
  };

  const removeImage = (index: number) => {
    const newImages = [...(product.images || [])];
    const removed = newImages[index];
    newImages.splice(index, 1);

    setProduct(prev => ({
      ...prev,
      images: newImages,
      thumbnail: prev.thumbnail === removed ? newImages[0] || '' : prev.thumbnail
    }));
  };

  const setThumbnail = (url: string) => {
    setProduct(prev => ({ ...prev, thumbnail: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product.name || !product.nameAr || !product.price || (product.images || []).length === 0) {
      toast.error('يرجى إدخال جميع الحقول المطلوبة');
      return;
    }

    try {
      setLoading(true);

      const productData = {
        ...product,
        price: Number(product.price),
        discount: Number(product.discount || 0),
        images: product.images || [],
        thumbnail: product.thumbnail || product.images?.[0],
        updatedAt: Timestamp.now(),
      };

      if (isEditing && id) {
        await updateDoc(doc(db, 'products', id), productData);
        toast.success('تم تحديث المنتج');
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: Timestamp.now(),
          views: 0,
          wishlistCount: 0,
          purchaseCount: 0,
        });
        toast.success('تم إضافة المنتج');
      }

      navigate('/admin/products');
    } catch {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/products')}>
          <ArrowLeft />
        </button>
        <h2 className="text-xl font-bold">
          {isEditing ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Images */}
        <div className="bg-white rounded-2xl p-4 border shadow-sm">
          <h3 className="font-bold mb-4">صور المنتج</h3>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border"
            />
            <button
              type="button"
              onClick={addImageByUrl}
              className="px-4 py-3 bg-brand-maroon-600 text-white rounded-xl font-bold"
            >
              إضافة
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(product.images || []).map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  className={`w-full h-24 object-cover rounded-xl border-2 ${
                    product.thumbnail === url
                      ? 'border-brand-maroon-600'
                      : 'border-gray-200'
                  }`}
                />

                {product.thumbnail === url && (
                  <span className="absolute top-1 right-1 text-xs bg-brand-maroon-600 text-white px-2 rounded">
                    رئيسية
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setThumbnail(url)}
                  className="absolute bottom-1 right-1 p-1 bg-brand-maroon-600 text-white rounded"
                >
                  <ImageIcon size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 left-1 p-1 bg-red-600 text-white rounded"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-brand-maroon-600 text-white rounded-xl font-bold"
        >
          {loading ? 'جاري الحفظ...' : 'حفظ المنتج'}
        </button>
      </form>
    </div>
  );
}