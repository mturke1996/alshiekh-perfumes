import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// إعدادات Firebase لمشروع Al Sheikh Perfumes
// استخدام القيم من .env فقط إذا كانت صحيحة (ليست القيم الافتراضية)
const getEnvVar = (envVar: string | undefined, defaultValue: string): string => {
  if (!envVar || envVar.includes('your-') || envVar === '123456789' || envVar.includes('abcdef')) {
    return defaultValue;
  }
  return envVar;
};

const firebaseConfig = {
  apiKey: getEnvVar(import.meta.env.VITE_FIREBASE_API_KEY, "AIzaSyAzTBsrJRo3C6ib7TF4hJAeGoxgBk94j8c"),
  authDomain: getEnvVar(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, "alshikekh-perfumes.firebaseapp.com"),
  projectId: getEnvVar(import.meta.env.VITE_FIREBASE_PROJECT_ID, "alshikekh-perfumes"),
  storageBucket: getEnvVar(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, "alshikekh-perfumes.firebasestorage.app"),
  messagingSenderId: getEnvVar(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, "593386317856"),
  appId: getEnvVar(import.meta.env.VITE_FIREBASE_APP_ID, "1:593386317856:web:e18735e110ef0884fdf445"),
  measurementId: getEnvVar(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, "G-Y55KP3VZMR")
};

// Check if Firebase is properly configured
const isFirebaseConfigured = firebaseConfig.apiKey !== "AIzaSyDemoKey-Replace-With-Your-Key";

if (!isFirebaseConfigured) {
  console.warn(
    '⚠️ Firebase غير مُعد بشكل صحيح!\n' +
    'المشروع يعمل في وضع العرض التوضيحي.\n' +
    'لتفعيل جميع الميزات، يرجى إعداد Firebase في ملف .env أو src/firebase.ts\n' +
    'راجع README.md للمزيد من التفاصيل.'
  );
}

// Initialize Firebase
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';
import type { Analytics } from 'firebase/analytics';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | undefined;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  console.log('✅ Firebase تم تهيئته بنجاح');
  console.log('✅ Firestore Database متصل:', db.app.name);
  console.log('✅ Authentication جاهز');
  console.log('✅ Storage جاهز');

  // Initialize Analytics only in browser environment
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        try {
          analytics = getAnalytics(app);
          console.log('✅ Firebase Analytics initialized');
        } catch (analyticsError) {
          console.warn('⚠️ Firebase Analytics initialization failed:', analyticsError);
        }
      }
    }).catch((error) => {
      console.warn('⚠️ Firebase Analytics not supported:', error);
    });
  }

  // في حالة التطوير المحلي، يمكنك استخدام Firebase Emulators
  // قم بإزالة التعليق من الأسطر التالية لاستخدام Emulators:
  /*
  if (import.meta.env.DEV) {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8080);
    connectStorageEmulator(storage, "localhost", 9199);
  }
  */
} catch (error) {
  console.error('خطأ في تهيئة Firebase:', error);
  throw error;
}

export { auth, db, storage, analytics, isFirebaseConfigured };
export default app;

