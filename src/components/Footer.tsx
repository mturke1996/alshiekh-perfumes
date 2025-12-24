import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">متجر العطور</h3>
            <p className="text-gray-400">
              أفضل العطور والمكياج من العلامات التجارية العالمية
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white">الرئيسية</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-white">المنتجات</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">اتصل بنا</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">تواصل معنا</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📧 info@perfumeshop.com</li>
              <li>📱 +964 XXX XXX XXXX</li>
              <li>📍 بغداد، العراق</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bold mb-4">تابعنا</h4>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 متجر العطور. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}

