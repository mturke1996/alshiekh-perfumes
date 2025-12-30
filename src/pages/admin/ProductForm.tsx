import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Upload,
  X,
  Image as ImageIcon,
  ArrowLeft,
  Loader2,
  Check,
  Trash2,
  Sparkles,
} from "lucide-react";
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Product } from "../../types/perfume-shop";
import {
  uploadImageToImgBB,
  uploadMultipleImagesToImgBB,
} from "../../utils/imgbb";
import { fetchPerfumeData, getApiKey } from "../../utils/perfume-api-real";
import toast from "react-hot-toast";

// أشهر شركات العطور العالمية
const POPULAR_BRANDS = [
  { en: "Tom Ford", ar: "توم فورد" },
  { en: "Chanel", ar: "شانيل" },
  { en: "Dior", ar: "ديور" },
  { en: "Versace", ar: "فيرساتشي" },
  { en: "Prada", ar: "برادا" },
  { en: "Armani", ar: "أرماني" },
  { en: "Dolce & Gabbana", ar: "دولتشي أند جابانا" },
  { en: "Gucci", ar: "غوتشي" },
  { en: "Hermès", ar: "هيرميس" },
  { en: "Yves Saint Laurent", ar: "إيف سان لوران" },
  { en: "Burberry", ar: "بوربري" },
  { en: "Calvin Klein", ar: "كالفن كلاين" },
  { en: "Hugo Boss", ar: "هوجو بوس" },
  { en: "Jean Paul Gaultier", ar: "جان بول غوتييه" },
  { en: "Issey Miyake", ar: "ايسي مياكي" },
  { en: "Marc Jacobs", ar: "مارك جاكوبس" },
  { en: "Ralph Lauren", ar: "رالف لورين" },
  { en: "Viktor & Rolf", ar: "فيكتور أند رولف" },
  { en: "Thierry Mugler", ar: "تييري موغلر" },
  { en: "Creed", ar: "كريد" },
  { en: "Byredo", ar: "بيريدو" },
  { en: "Le Labo", ar: "للابو" },
  { en: "Maison Margiela", ar: "مايزون مارجيلا" },
  { en: "Maison Francis Kurkdjian", ar: "مايزون فرانسيس كيركديجان" },
  { en: "Amouage", ar: "أمواج" },
  { en: "Acqua di Parma", ar: "أكوا دي بارما" },
  { en: "Lancôme", ar: "لانكوم" },
  { en: "Estée Lauder", ar: "إستي لودر" },
  { en: "Clinique", ar: "كلينيك" },
  { en: "L'Occitane", ar: "لوكسيتان" },
];

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetchingPerfumeData, setFetchingPerfumeData] = useState(false);
  const [product, setProduct] = useState<Partial<Product>>({
    name: "",
    nameAr: "",
    price: 0,
    discount: 0,
    images: [],
    thumbnail: "",
    brand: "",
    brandAr: "",
    category: "perfume",
    categoryAr: "عطور",
    gender: "unisex",
    genderAr: "للجنسين",
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
      const productDoc = await getDoc(doc(db, "products", id!));
      if (productDoc.exists()) {
        setProduct({ id: productDoc.id, ...productDoc.data() } as Product);
      } else {
        toast.error("المنتج غير موجود");
        navigate("/admin/products");
      }
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("حدث خطأ في تحميل المنتج");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    try {
      setUploading(true);
      toast.loading("جاري رفع الصور إلى imgBB...", { id: "upload" });

      // Upload all images to imgBB
      const urls = await uploadMultipleImagesToImgBB(files);

      setProduct((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...urls],
        thumbnail: prev.thumbnail || urls[0] || "",
      }));

      toast.success(`تم رفع ${urls.length} صورة بنجاح`, { id: "upload" });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "فشل رفع الصور", { id: "upload" });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(product.images || [])];
    const removedUrl = newImages[index];
    newImages.splice(index, 1);

    setProduct((prev) => ({
      ...prev,
      images: newImages,
      thumbnail:
        prev.thumbnail === removedUrl ? newImages[0] || "" : prev.thumbnail,
    }));
  };

  const setThumbnail = (url: string) => {
    setProduct((prev) => ({ ...prev, thumbnail: url }));
  };

  const handleFetchPerfumeData = async () => {
    if (!product.name || !product.name.trim()) {
      toast.error("يرجى إدخال اسم العطر أولاً");
      return;
    }

    try {
      setFetchingPerfumeData(true);
      toast.loading("جاري جلب بيانات العطر من Gemini AI...", { id: "fetch-perfume" });

      // Get API key from Firestore
      const geminiApiKey = await getApiKey("gemini");

      if (!geminiApiKey) {
        toast.error("يرجى إضافة Gemini API Key من الإعدادات أولاً", { id: "fetch-perfume" });
        return;
      }

      const perfumeData = await fetchPerfumeData(product.name.trim(), geminiApiKey);

      if (perfumeData) {
        setProduct((prev) => ({
          ...prev,
          name: perfumeData.name || prev.name,
          nameAr: perfumeData.nameAr || prev.nameAr,
          brand: perfumeData.brand || prev.brand,
          brandAr: perfumeData.brandAr || prev.brandAr,
          description: perfumeData.description || prev.description,
          descriptionAr: perfumeData.descriptionAr || prev.descriptionAr,
          gender: perfumeData.gender || prev.gender,
          genderAr: perfumeData.genderAr || prev.genderAr,
          concentration: perfumeData.concentration || prev.concentration,
          concentrationAr: perfumeData.concentrationAr || prev.concentrationAr,
          topNotes: perfumeData.topNotes || prev.topNotes,
          topNotesAr: perfumeData.topNotesAr || prev.topNotesAr,
          middleNotes: perfumeData.middleNotes || prev.middleNotes,
          middleNotesAr: perfumeData.middleNotesAr || prev.middleNotesAr,
          baseNotes: perfumeData.baseNotes || prev.baseNotes,
          baseNotesAr: perfumeData.baseNotesAr || prev.baseNotesAr,
          fragranceFamily: perfumeData.fragranceFamily || prev.fragranceFamily,
          fragranceFamilyAr: perfumeData.fragranceFamilyAr || prev.fragranceFamilyAr,
        }));
        toast.success("تم جلب بيانات العطر بنجاح!", { id: "fetch-perfume" });
      } else {
        toast.error("لم يتم العثور على بيانات للعطر", { id: "fetch-perfume" });
      }
    } catch (error: any) {
      console.error("Error fetching perfume data:", error);
      toast.error(error.message || "حدث خطأ في جلب بيانات العطر", { id: "fetch-perfume" });
    } finally {
      setFetchingPerfumeData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !product.nameAr ||
      !product.name ||
      !product.price ||
      (product.images || []).length === 0
    ) {
      toast.error("يرجى إدخال جميع الحقول المطلوبة");
      return;
    }

    try {
      setLoading(true);
      const productData = {
        name: product.name,
        nameAr: product.nameAr,
        description: product.description || "",
        descriptionAr: product.descriptionAr || "",
        price: Number(product.price),
        discount: Number(product.discount || 0),
        images: product.images || [],
        thumbnail: product.thumbnail || product.images?.[0] || "",
        brand: product.brand || "",
        brandAr: product.brandAr || "",
        category: product.category || "perfume",
        categoryAr: product.categoryAr || "عطور",
        gender: product.gender || "unisex",
        genderAr: product.genderAr || "للجنسين",
        inStock: true,
        stockQuantity: 100,
        featured: false,
        isNew: false,
        tags: product.tags || [],
        tagsAr: product.tagsAr || [],
        productType: product.productType || product.category || "perfume",
        productTypeAr: product.productTypeAr || product.categoryAr || "عطر",
        rating: 0,
        reviewCount: 0,
        updatedAt: Timestamp.now(),
      };

      if (isEditing && id) {
        await updateDoc(doc(db, "products", id), productData);
        toast.success("تم تحديث المنتج بنجاح");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: Timestamp.now(),
          views: 0,
          wishlistCount: 0,
          purchaseCount: 0,
        });
        toast.success("تم إضافة المنتج بنجاح");
      }

      navigate("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("حدث خطأ في حفظ المنتج");
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
            onClick={() => navigate("/admin/products")}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? "تعديل المنتج" : "إضافة منتج جديد"}
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
          <h3 className="text-base font-bold text-gray-900 mb-4">
            المعلومات الأساسية
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المنتج (عربي) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={product.nameAr || ""}
                onChange={(e) =>
                  setProduct({ ...product, nameAr: e.target.value })
                }
                placeholder="عطر توم فورد - بلاك أوركيد"
                required
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المنتج (إنجليزي) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={product.name || ""}
                  onChange={(e) =>
                    setProduct({ ...product, name: e.target.value })
                  }
                  placeholder="Tom Ford Black Orchid"
                  required
                  className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
                />
                <motion.button
                  type="button"
                  onClick={handleFetchPerfumeData}
                  disabled={fetchingPerfumeData || !product.name?.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                  title="جلب بيانات العطر تلقائياً من Gemini AI"
                >
                  {fetchingPerfumeData ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span className="hidden sm:inline">جاري الجلب...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span className="hidden sm:inline">جلب البيانات</span>
                    </>
                  )}
                </motion.button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💡 أدخل اسم العطر ثم اضغط "جلب البيانات" لملء الحقول تلقائياً
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف (عربي)
              </label>
              <textarea
                value={product.descriptionAr || ""}
                onChange={(e) =>
                  setProduct({ ...product, descriptionAr: e.target.value })
                }
                placeholder="وصف المنتج باللغة العربية..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف (إنجليزي)
              </label>
              <textarea
                value={product.description || ""}
                onChange={(e) =>
                  setProduct({ ...product, description: e.target.value })
                }
                placeholder="Product description in English..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العلامة التجارية <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <select
                  value={
                    POPULAR_BRANDS.some((b) => b.en === product.brand)
                      ? product.brand
                      : product.brand
                      ? "custom"
                      : ""
                  }
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setProduct({
                        ...product,
                        brand: "",
                        brandAr: "",
                      });
                    } else if (e.target.value) {
                      const selectedBrand = POPULAR_BRANDS.find(
                        (b) => b.en === e.target.value
                      );
                      if (selectedBrand) {
                        setProduct({
                          ...product,
                          brand: selectedBrand.en,
                          brandAr: selectedBrand.ar,
                        });
                      }
                    } else {
                      setProduct({
                        ...product,
                        brand: "",
                        brandAr: "",
                      });
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
                  required
                >
                  <option value="">اختر العلامة التجارية</option>
                  {POPULAR_BRANDS.map((brand) => (
                    <option key={brand.en} value={brand.en}>
                      {brand.ar} - {brand.en}
                    </option>
                  ))}
                  <option value="custom">أخرى (أدخل يدوياً)</option>
                </select>
                {(!product.brand ||
                  (!POPULAR_BRANDS.some((b) => b.en === product.brand) &&
                    product.brand !== "")) && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input
                      type="text"
                      value={
                        POPULAR_BRANDS.some((b) => b.en === product.brand)
                          ? ""
                          : product.brand || ""
                      }
                      onChange={(e) =>
                        setProduct({ ...product, brand: e.target.value })
                      }
                      placeholder="اسم العلامة (إنجليزي)"
                      required={
                        !POPULAR_BRANDS.some((b) => b.en === product.brand)
                      }
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
                    />
                    <input
                      type="text"
                      value={product.brandAr || ""}
                      onChange={(e) =>
                        setProduct({ ...product, brandAr: e.target.value })
                      }
                      placeholder="اسم العلامة (عربي)"
                      required={
                        !POPULAR_BRANDS.some((b) => b.en === product.brand)
                      }
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة
                </label>
                <select
                  value={product.category || "perfume"}
                  onChange={(e) => {
                    const value = e.target.value as
                      | "perfume"
                      | "makeup"
                      | "skincare"
                      | "haircare"
                      | "gift-set";
                    setProduct({
                      ...product,
                      category: value,
                      categoryAr:
                        value === "perfume"
                          ? "عطور"
                          : value === "makeup"
                          ? "مكياج"
                          : value === "skincare"
                          ? "العناية بالبشرة"
                          : value === "haircare"
                          ? "العناية بالشعر"
                          : "طقم هدايا",
                    });
                  }}
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
                  value={product.gender || "unisex"}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      gender: e.target.value as any,
                      genderAr:
                        e.target.value === "unisex"
                          ? "للجنسين"
                          : e.target.value === "men"
                          ? "رجالي"
                          : "نسائي",
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
                >
                  <option value="unisex">للجنسين</option>
                  <option value="men">رجالي</option>
                  <option value="women">نسائي</option>
                </select>
              </div>
            </div>

            {/* Product Tags/Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التصنيفات الإضافية (اختياري)
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {product.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-maroon-50 text-brand-maroon-700 rounded-full text-xs font-medium"
                    >
                      {product.tagsAr?.[index] || tag}
                      <button
                        type="button"
                        onClick={() => {
                          const newTags = [...(product.tags || [])];
                          const newTagsAr = [...(product.tagsAr || [])];
                          newTags.splice(index, 1);
                          newTagsAr.splice(index, 1);
                          setProduct({
                            ...product,
                            tags: newTags,
                            tagsAr: newTagsAr,
                          });
                        }}
                        className="hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="أضف تصنيف جديد (عربي)"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const value = input.value.trim();
                        if (value) {
                          setProduct({
                            ...product,
                            tags: [...(product.tags || []), value],
                            tagsAr: [...(product.tagsAr || []), value],
                          });
                          input.value = "";
                        }
                      }
                    }}
                    className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-500"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  اضغط Enter لإضافة تصنيف. مثال: عطور رجالية، عطور نسائية، عطور فاخرة، إلخ
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر (د.ل) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={product.price || ""}
                  onChange={(e) =>
                    setProduct({ ...product, price: Number(e.target.value) })
                  }
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
                  value={product.discount || ""}
                  onChange={(e) =>
                    setProduct({ ...product, discount: Number(e.target.value) })
                  }
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
          <h3 className="text-base font-bold text-gray-900 mb-4">
            صور المنتج <span className="text-red-500">*</span>
          </h3>

          <div className="mb-4">
            <label className="flex items-center justify-center w-full min-h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-brand-maroon-500 transition-colors bg-gray-50 hover:bg-gray-100">
              <div className="text-center p-4">
                {uploading ? (
                  <>
                    <Loader2
                      className="mx-auto text-brand-maroon-600 mb-2 animate-spin"
                      size={24}
                    />
                    <p className="text-sm text-gray-600">جاري رفع الصور...</p>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      اضغط لرفع الصور
                    </p>
                    <p className="text-xs text-gray-500">
                      يمكنك رفع أكثر من صورة
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      سيتم رفع الصور على imgBB
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    handleImageUpload(files);
                  }
                }}
              />
            </label>
          </div>

          {product.images && product.images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  تم رفع{" "}
                  <span className="font-bold text-brand-maroon-600">
                    {product.images.length}
                  </span>{" "}
                  صورة
                </p>
                {product.thumbnail && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Check size={14} />
                    صورة رئيسية محددة
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {product.images.map((url, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl border-2 border-gray-200 hover:border-brand-maroon-500 transition-colors">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className={`w-full h-full object-cover ${
                          product.thumbnail === url
                            ? "ring-2 ring-brand-maroon-500 ring-offset-2"
                            : ""
                        }`}
                      />

                      {/* Thumbnail Badge */}
                      {product.thumbnail === url && (
                        <div className="absolute top-1 right-1 px-2 py-0.5 bg-brand-maroon-600 text-white text-xs rounded-full font-bold flex items-center gap-1 shadow-lg">
                          <ImageIcon size={12} />
                          رئيسية
                        </div>
                      )}

                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <motion.button
                          type="button"
                          onClick={() => setThumbnail(url)}
                          className="p-2 bg-white text-brand-maroon-600 rounded-lg hover:bg-brand-maroon-50 transition-colors"
                          title="تعيين كصورة رئيسية"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ImageIcon size={16} />
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          title="حذف الصورة"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
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
                <span>{isEditing ? "حفظ التغييرات" : "إضافة المنتج"}</span>
              </>
            )}
          </motion.button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
