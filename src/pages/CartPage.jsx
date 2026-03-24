// src/pages/CartPage.jsx

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { createOrder } from '../api/client';

function formatPrice(priceCents) {
  if (typeof priceCents !== 'number') return '-';
  return (priceCents / 100).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' TL';
}

function getProductImageUrl(imageUrl) {
  if (!imageUrl) return null;
  const API_BASE_URL = 'http://164.90.236.138:4000';

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  const normalizedPath = imageUrl.replace(/^\/+/, '');
  return `${API_BASE_URL}/uploads/${normalizedPath}`;
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalPriceCents, totalPrice } = useCart();
  const { user, dealer } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');
  const [dealerReferenceCode, setDealerReferenceCode] = useState('');
  
  // Normal müşteriler için referans kodu zorunlu, bayiler için değil
  const isDealer = dealer !== null;

  // Sayfa her göründüğünde localStorage'dan güncel sepeti kontrol et
  useEffect(() => {
    // useCart hook'u zaten event listener ile güncelliyor ama ekstra güvenlik için
    const handleCartChange = () => {
      // Hook zaten güncelliyor, sadece force re-render için
      window.dispatchEvent(new Event('alina:cart-changed'));
    };
    
    // Sayfa mount olduğunda bir kez kontrol et
    handleCartChange();
  }, []);

  const shippingThreshold = 15000; // 150 TL (kuruş cinsinden)
  const shippingCost = totalPriceCents >= shippingThreshold ? 0 : 2500; // 25 TL kargo
  const finalTotal = totalPriceCents + shippingCost;

  // Ödeme işlemini gerçekleştir
  async function handleCheckout() {
    setOrderError('');
    setOrderSuccess('');

    // Giriş kontrolü
    const token = localStorage.getItem('alina_token');
    if (!token) {
      toast.error('Giriş bulunamadı. Lütfen giriş yap ve tekrar dene.');
      return;
    }

    // Sepet boş mu kontrol et
    if (cart.length === 0) {
      toast.error('Sepetiniz boş. Ürün ekleyin.');
      return;
    }
    
    // Normal müşteriler için bayi referans kodu zorunlu
    if (!isDealer && !dealerReferenceCode.trim()) {
      toast.error('🏪 Bayi referans kodu girmelisiniz! Bayinizden alın.');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Sipariş oluştur (referans kodu ile)
      const result = await createOrder(cart, dealerReferenceCode || null);

      if (result.ok && result.order) {
        // localStorage'daki user bilgisini güncelle
        if (result.user) {
          localStorage.setItem('alina_user', JSON.stringify(result.user));
        }
        
        // Sepeti temizle
        await clearCart(); // ASYNC olduğu için await ekledik
        
        // Başarı mesajı göster
        toast.success(
          `🎉 Sipariş oluşturuldu! Ödeme sayfasına yönlendiriliyorsunuz...`,
          { duration: 3000 }
        );
        
        // Ödeme sayfasına yönlendir
        setTimeout(() => {
          navigate(`/odeme?order=${result.order.id}`);
        }, 1500);
      } else if (result.ok && result.user) {
        // Eski format için uyumluluk (bayi siparişleri vs.)
        localStorage.setItem('alina_user', JSON.stringify(result.user));
        await clearCart();
        toast.success(`🎉 Sipariş başarıyla oluşturuldu!`, { duration: 5000 });
        setTimeout(() => navigate('/orders'), 2000);
      } else {
        toast.error(result.message || 'Sipariş oluşturulamadı.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err.message || 'Ödeme işlemi sırasında bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 md:py-16 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 font-display mb-2">
            Sepetim
          </h1>
          <p className="text-neutral-600">
            {cart.length === 0
              ? 'Sepetiniz şu an boş'
              : `${cart.length} ürün sepetinde`}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {orderError && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-6 py-4 text-red-700">
            <p className="font-semibold">⚠️ Hata</p>
            <p className="text-sm mt-1">{orderError}</p>
          </div>
        )}

        {orderSuccess && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 px-6 py-4 text-green-800">
            <p className="font-semibold">✨ Başarılı!</p>
            <p className="text-sm mt-1">{orderSuccess}</p>
          </div>
        )}
        {cart.length === 0 ? (
          /* Boş Sepet */
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Sepetiniz boş</h2>
            <p className="text-neutral-600 mb-6">
              Henüz sepetinize ürün eklemediniz. Mağazamızı keşfedin!
            </p>
            <Link
              to="/store"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full text-white font-semibold hover:shadow-lg transition-all duration-300"
            >
              Mağazaya Git
              <span>→</span>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sepet Ürünleri */}
            <div className="lg:col-span-2 space-y-4">
              {/* Başlık ve Temizle */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-neutral-900">Sepetim</h2>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Sepeti Temizle
                </button>
              </div>

              {/* Ürün Listesi */}
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex gap-4">
                      {/* Ürün Resmi */}
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                        {item.product.imageUrl ? (
                          <img
                            src={getProductImageUrl(item.product.imageUrl)}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl">🧴</span>
                          </div>
                        )}
                      </div>

                      {/* Ürün Bilgileri */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-neutral-900 mb-1">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-neutral-600 line-clamp-2 mb-2">
                            {item.product.description}
                          </p>
                          {isDealer && (
                            <p className="text-lg font-bold text-primary-600">
                              {formatPrice(item.product.priceCents)}
                            </p>
                          )}
                        </div>

                        {/* Miktar ve Sil */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-lg border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                            >
                              −
                            </button>
                            <span className="w-12 text-center font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-lg border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Kaldır
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Özet */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-bold text-neutral-900 mb-6">Sipariş Özeti</h2>

                <div className="space-y-4 mb-6">
                  {isDealer && (
                    <>
                      <div className="flex justify-between text-neutral-600">
                        <span>Ara Toplam</span>
                        <span className="font-semibold">{formatPrice(totalPriceCents)}</span>
                      </div>
                      <div className="flex justify-between text-neutral-600">
                        <span>Kargo</span>
                        <span className="font-semibold">
                          {shippingCost === 0 ? (
                            <span className="text-green-600">Ücretsiz</span>
                          ) : (
                            formatPrice(shippingCost)
                          )}
                        </span>
                      </div>
                      {totalPriceCents < shippingThreshold && (
                        <div className="text-xs text-neutral-500 bg-neutral-50 rounded-lg p-2">
                          {formatPrice(shippingThreshold - totalPriceCents)} daha alışveriş yapın,
                          kargo ücretsiz olsun!
                        </div>
                      )}
                      <div className="border-t border-neutral-200 pt-4 flex justify-between text-lg font-bold text-neutral-900">
                        <span>Toplam</span>
                        <span>{formatPrice(finalTotal)}</span>
                      </div>
                    </>
                  )}
                  {!isDealer && (
                    <div className="text-center py-4">
                      <p className="text-neutral-600">Toplam {cart.reduce((sum, item) => sum + item.quantity, 0)} ürün</p>
                    </div>
                  )}
                </div>

                {/* Bayi Referans Kodu - Sadece Normal Müşteriler İçin */}
                {!isDealer && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🏪</span>
                      <h3 className="font-bold text-neutral-900">Bayi Referans Kodu</h3>
                    </div>
                    <p className="text-xs text-neutral-600 mb-3">
                      Bayinizden aldığınız <strong>referans kodunu</strong> girin. Bu kod olmadan sipariş veremezsiniz.
                    </p>
                    <input
                      type="text"
                      placeholder="Örn: BAY123456"
                      value={dealerReferenceCode}
                      onChange={(e) => setDealerReferenceCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 font-mono text-center text-lg font-bold placeholder-amber-300"
                    />
                    {!dealerReferenceCode.trim() && (
                      <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                        <span>⚠️</span>
                        <span>Zorunlu alan - Bayinizden kod alın</span>
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isProcessing || cart.length === 0 || (!isDealer && !dealerReferenceCode.trim())}
                  className={`w-full px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 ${
                    isProcessing || cart.length === 0 || (!isDealer && !dealerReferenceCode.trim())
                      ? 'bg-neutral-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-lg'
                  }`}
                >
                  {isProcessing ? '⏳ İşleniyor...' : '💳 Ödemeye Geç'}
                </button>

                <Link
                  to="/store"
                  className="block text-center text-sm text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  ← Alışverişe Devam Et
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

