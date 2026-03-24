// src/pages/AuthChoicePage.jsx - Bayi vs Müşteri seçim sayfası

import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AuthChoicePage() {
  const { user } = useAuth();

  // Eğer kullanıcı zaten giriş yapmışsa mağazaya yönlendir
  if (user) {
    return <Navigate to="/store" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl">
            <span className="text-4xl font-bold text-white">A</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900">
            Alina'ya Hoş Geldin
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Siz kimsiniz? Seçiminize göre giriş veya kayıt işlemini gerçekleştirebilirsiniz.
          </p>
        </div>

        {/* İki Seçenek */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Müşteri Kartı */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:border-primary-400 transition-all duration-300 group">
            <div className="space-y-6">
              
              {/* İkon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 group-hover:bg-blue-200 rounded-2xl transition-colors">
                <span className="text-4xl">🛍️</span>
              </div>

              {/* Başlık */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Müşteri</h2>
                <p className="text-slate-600 mt-2">
                  Ürün satın almak, mağazada gezinmek ve referans kodu kullanmak istiyorsanız.
                </p>
              </div>

              {/* Özellikler */}
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">✓</span>
                  <span>Ürünleri görüntüle ve satın al</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">✓</span>
                  <span>Referans kodu ile kayıt ol, kazanç elde et</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">✓</span>
                  <span>Profil ve sipariş geçmişini yönet</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">✓</span>
                  <span>Alina AI asistanına sorular sor</span>
                </li>
              </ul>

              {/* Butonlar */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="w-full inline-flex items-center justify-center px-6 py-3 border-2 border-blue-500 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200"
                >
                  Kayıt Ol
                </Link>
              </div>
            </div>
          </div>

          {/* Bayi Kartı */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:border-primary-600 transition-all duration-300 group relative">
            {/* Premium Badge */}
            <div className="absolute -top-4 right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-bold">
              İş Ortağı Programı
            </div>

            <div className="space-y-6">
              
              {/* İkon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 group-hover:bg-purple-200 rounded-2xl transition-colors">
                <span className="text-4xl">🏪</span>
              </div>

              {/* Başlık */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Bayi (İş Ortağı)</h2>
                <p className="text-slate-600 mt-2">
                  Alina ile iş ortaklığına katılmak, AlinaPuan kazanmak ve ödül almak istiyorsanız.
                </p>
              </div>

              {/* Özellikler */}
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">✓</span>
                  <span>Satışlardan AlinaPuan kazan</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">✓</span>
                  <span>Referans kodunla kullanıcı getir, kazanç elde et</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">✓</span>
                  <span>Rozet sistem ile ödül mağazasında indirim al</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">✓</span>
                  <span>Satış analitiği ve performans dashboard'u</span>
                </li>
              </ul>

              {/* Butonlar */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <Link
                  to="/dealer/login"
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  Bayi Giriş
                </Link>
                <Link
                  to="/dealer/register"
                  className="w-full inline-flex items-center justify-center px-6 py-3 border-2 border-purple-500 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-200"
                >
                  Bayi Ol / Başvur
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Alt Not */}
        <div className="text-center text-sm text-slate-600">
          <p>
            Zaten hesabın var mı? Seçim yap ve {' '}
            <span className="font-semibold">giriş yap</span> butonuna tıkla.
          </p>
        </div>
      </div>
    </div>
  );
}
