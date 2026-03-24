// src/pages/PaymentSuccessPage.jsx

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { checkPaymentStatus } from '../api/client';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const result = await checkPaymentStatus(orderId);
        if (result.ok) {
          setOrderStatus(result.order);
        }
      } catch (err) {
        console.error('Status check error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-primary-50 flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-neutral-900 font-display mb-4">
          Ödeme Başarılı! 🎉
        </h1>

        {/* Description */}
        <p className="text-lg text-neutral-600 mb-8">
          Siparişiniz başarıyla alındı ve ödemeniz onaylandı. 
          Teşekkür ederiz!
        </p>

        {/* Order Info */}
        {orderId && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between py-3 border-b border-neutral-100">
              <span className="text-neutral-500">Sipariş No</span>
              <span className="font-mono text-neutral-900">{orderId}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-neutral-500">Durum</span>
              <span className="inline-flex items-center gap-2 text-green-600 font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {loading ? 'Kontrol ediliyor...' : (orderStatus?.isPaid ? 'Ödeme Onaylandı' : 'İşleniyor')}
              </span>
            </div>
          </div>
        )}

        {/* Reward Info */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-8 border border-amber-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">✨</span>
            <span className="font-semibold text-amber-800">AlinaPuan Kazandınız!</span>
          </div>
          <p className="text-amber-700 text-sm">
            Bu alışverişinizden kazandığınız puanlar hesabınıza eklendi.
            Puanlarınızı ödül marketinde kullanabilirsiniz!
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Siparişlerime Git
          </Link>
          <Link
            to="/store"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 text-neutral-700 px-6 py-3 rounded-xl font-medium border border-neutral-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Alışverişe Devam Et
          </Link>
        </div>

        {/* Customer Support */}
        <p className="text-neutral-400 text-sm mt-8">
          Bir sorun mu yaşıyorsunuz? 
          <a href="mailto:destek@alina.com" className="text-primary-500 hover:underline ml-1">
            Destek ekibimize yazın
          </a>
        </p>
      </div>
    </div>
  );
}
