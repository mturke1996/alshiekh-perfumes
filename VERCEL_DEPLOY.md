# 🚀 نشر المشروع على Vercel

## الخطوات السريعة

### 1. رفع المشروع على GitHub

```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/mturke1996/alshiekh-perfumes.git
git push -u origin main
```

### 2. النشر على Vercel

#### الطريقة الأولى: من الموقع (الأسهل)

1. اذهب إلى: https://vercel.com
2. سجّل الدخول بحساب GitHub
3. اضغط **"Add New Project"**
4. اختر repository: `alshiekh-perfumes`
5. Vercel سيكتشف الإعدادات تلقائياً:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. أضف متغيرات البيئة (Environment Variables):
   
   ```
   VITE_FIREBASE_API_KEY=AIzaSyAzTBsrJRo3C6ib7TF4hJAeGoxgBk94j8c
   VITE_FIREBASE_AUTH_DOMAIN=alshikekh-perfumes.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=alshikekh-perfumes
   VITE_FIREBASE_STORAGE_BUCKET=alshikekh-perfumes.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=593386317856
   VITE_FIREBASE_APP_ID=1:593386317856:web:e18735e110ef0884fdf445
   VITE_FIREBASE_MEASUREMENT_ID=G-Y55KP3VZMR
   ```

7. اضغط **"Deploy"**

#### الطريقة الثانية: من Terminal (CLI)

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel

# اتباع التعليمات على الشاشة
```

---

## ⚙️ إعدادات Vercel

تم إنشاء ملف `vercel.json` مع الإعدادات الصحيحة:
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

---

## 📝 ملاحظات مهمة

1. **متغيرات البيئة**: تأكد من إضافة جميع متغيرات Firebase في Vercel Dashboard
2. **Domain**: Vercel سيعطيك رابط تلقائي، يمكنك إضافة domain مخصص لاحقاً
3. **Auto Deploy**: كل مرة تدفع فيها تغييرات على GitHub، Vercel سينشر تلقائياً

---

## ✅ بعد النشر

1. الموقع سيكون متاح على: `https://your-project.vercel.app`
2. يمكنك إضافة domain مخصص من Vercel Dashboard
3. كل commit جديد سيسبب deploy تلقائي

---

**بعد النشر، الموقع سيكون متاح للجميع! 🎉**

