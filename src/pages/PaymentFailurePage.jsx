// src/pages/PaymentFailurePage.jsx

import { useSearchParams, Link, useNavigate } from 'react-router-dom';

export default function PaymentFailurePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-neutral-50 flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Error Icon */}
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-neutral-900 font-display mb-4">
          Ödeme Başarısız 😔
        </h1>

        {/* Description */}
        <p className="text-lg text-neutral-600 mb-8">
          Ödemeniz işlenirken bir hata oluştu.
          Lütfen tekrar deneyin veya farklı bir ödeme yöntemi kullanın.
        </p>

        {/* Common Issues */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-neutral-900 mb-4">Olası Sebepler:</h3>
          <ul className="space-y-3 text-neutral-600">
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1">•</span>
              <span>Kart limitiniz yetersiz olabilir</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1">•</span>
              <span>Kartınız online alışverişe kapalı olabilir</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1">•</span>
              <span>3D Secure doğrulaması başarısız olmuş olabilir</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1">•</span>
              <span>Banka tarafından işlem reddedilmiş olabilir</span>
            </li>
          </ul>
        </div>

        {/* Order Info */}
        {orderId && (
          <div className="bg-neutral-100 rounded-xl p-4 mb-8">
            <span className="text-neutral-500 text-sm">Sipariş No: </span>
            <span className="font-mono text-neutral-700">{orderId}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {orderId && (
            <button
              onClick={() => navigate(`/odeme?order=${orderId}`)}
              className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Tekrar Dene
            </button>
          )}
          <Link
            to="/cart"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 text-neutral-700 px-6 py-3 rounded-xl font-medium border border-neutral-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Sepete Dön
          </Link>
        </div>

        {/* Customer Support */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-blue-800 text-sm">
            <strong>Yardıma mı ihtiyacınız var?</strong><br />
            Sorun devam ederse 
            <a href="mailto:destek@alina.com" className="text-blue-600 hover:underline ml-1 font-medium">
              destek@alina.com
            </a>
            adresinden bize ulaşabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
