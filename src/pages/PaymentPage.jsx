// src/pages/PaymentPage.jsx

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { initiatePayment, checkPaymentStatus } from '../api/client';

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [iframeToken, setIframeToken] = useState('');
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!orderId) {
      setError('Sipariş ID bulunamadı');
      setLoading(false);
      return;
    }

    // Ödeme başlat
    async function startPayment() {
      try {
        const result = await initiatePayment(orderId);
        
        if (result.ok && result.token) {
          setIframeToken(result.token);
        } else {
          setError(result.message || 'Ödeme başlatılamadı');
        }
      } catch (err) {
        console.error('Payment init error:', err);
        setError(err.message || 'Ödeme başlatılamadı');
      } finally {
        setLoading(false);
      }
    }

    startPayment();
  }, [orderId]);

  // PayTR iframe mesajlarını dinle (opsiyonel)
  useEffect(() => {
    function handleMessage(event) {
      // PayTR'dan gelen mesajları dinle
      if (event.origin === 'https://www.paytr.com') {
        console.log('PayTR message:', event.data);
        // Ödeme tamamlandığında yönlendir
        if (event.data === 'payment_completed') {
          navigate(`/odeme-basarili?order=${orderId}`);
        }
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Ödeme sayfası yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Ödeme Hatası</h1>
          <p className="text-neutral-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/cart')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Sepete Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 py-4">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-2xl font-bold text-neutral-900">Güvenli Ödeme</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Sipariş No: {orderId}
          </p>
        </div>
      </div>

      {/* PayTR iFrame */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {iframeToken && (
            <iframe
              ref={iframeRef}
              src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
              id="paytriframe"
              frameBorder="0"
              scrolling="no"
              style={{ width: '100%', minHeight: '600px' }}
              title="PayTR Ödeme"
            />
          )}
        </div>

        {/* Güvenlik Bilgisi */}
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>SSL Güvenli</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <span>PayTR Güvencesi</span>
          </div>
        </div>
      </div>

      {/* PayTR iFrame scroll desteği */}
      <script dangerouslySetInnerHTML={{
        __html: `
          var defined = 0;
          window.addEventListener("message", function (event) {
            var iframe = document.getElementById('paytriframe');
            if(event.origin !== "https://www.paytr.com") return;
            if(typeof event.data === 'number' && iframe) {
              if(event.data > defined) {
                defined = event.data;
                iframe.style.height = (event.data + 30) + 'px';
              }
            }
          });
        `
      }} />
    </div>
  );
}
