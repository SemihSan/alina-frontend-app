// src/pages/CustomerRewardsPage.jsx - Müşteri Ödül Mağazası
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../api/client';

function formatPrice(coinPrice) {
  return coinPrice?.toLocaleString('tr-TR') || '0';
}

export default function CustomerRewardsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    loadRewardProducts();
  }, []);

  async function loadRewardProducts() {
    try {
      setLoading(true);
      // Müşteri ödül ürünlerini getir
      const res = await fetch(`${API_BASE_URL}/api/products/rewards/all?audience=CUSTOMER`);
      const data = await res.json();
      
      if (data.ok) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Reward products load error:', error);
      toast.error('Ödül ürünleri yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(product) {
    if (!user) {
      toast.error('Lütfen giriş yapın');
      return;
    }

    if (user.coins < product.coinPrice) {
      toast.error('Yetersiz AlinaPuan bakiyesi');
      return;
    }

    // TODO: Satın alma API'si eklenecek
    toast.success('Yakında bu ödülü satın alabileceksiniz!');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      {/* Hero Section - Hediye Temalı */}
      <section className="relative py-8 sm:py-12 md:py-16 lg:py-24 overflow-hidden">
        {/* Dekoratif Elementler - Mobilde küçük */}
        <div className="absolute top-4 sm:top-10 left-4 sm:left-10 text-3xl sm:text-4xl md:text-6xl animate-bounce">🎁</div>
        <div className="absolute top-8 sm:top-20 right-4 sm:right-20 text-2xl sm:text-3xl md:text-5xl animate-pulse">✨</div>
        <div className="absolute bottom-4 sm:bottom-10 left-1/4 text-2xl sm:text-3xl md:text-4xl animate-bounce delay-100">🎉</div>
        <div className="absolute bottom-8 sm:bottom-20 right-1/3 text-2xl sm:text-3xl md:text-5xl animate-pulse delay-200">💝</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Ödül Mağazası
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-purple-700 font-semibold mb-4 sm:mb-6 px-4">
              Biriktirdiğiniz AlinaPuan'larla harika ödüller kazanın! 🌟
            </p>
            
            {/* Puan Bakiyesi Kartı */}
            <div className="inline-block bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-2 sm:border-4 border-pink-300 mx-4">
              <p className="text-xs sm:text-sm text-purple-600 font-semibold mb-1">Mevcut Bakiyeniz</p>
              <p className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {user?.coins?.toLocaleString('tr-TR') || '0'} 
                <span className="text-xl sm:text-2xl ml-2">💰</span>
              </p>
              <p className="text-xs text-purple-500 mt-2">Her ürün başı 10 AlinaPuan kazanıyorsunuz!</p>
            </div>
          </div>

          <Link
            to="/profile"
            className="absolute top-2 sm:top-4 right-2 sm:right-6 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-white/90 backdrop-blur-sm border-2 border-purple-300 rounded-xl sm:rounded-2xl hover:bg-purple-50 transition-all text-purple-700 text-sm sm:text-base font-bold shadow-lg"
          >
            ← Geri
          </Link>
        </div>
      </section>

      {/* Ürün Listesi */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12 md:pb-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-700 font-semibold">Ödüller yükleniyor...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-pink-200 p-12 text-center shadow-xl">
            <div className="text-8xl mb-6">🎁</div>
            <h2 className="text-3xl font-bold text-purple-900 mb-3">Yakında Ödüller Burada!</h2>
            <p className="text-purple-600 text-lg">
              Harika ödüller için sipariş verin ve puan biriktirin!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const canAfford = user?.coins >= product.coinPrice;
              
              return (
                <div
                  key={product.id}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 sm:border-4 border-transparent hover:border-purple-300"
                >
                  {/* Ürün Resmi */}
                  <div className="relative h-48 sm:h-52 md:h-56 bg-gradient-to-br from-pink-100 to-purple-100 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-8xl">
                        🎁
                      </div>
                    )}
                    
                    {/* Puan Badge */}
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg font-black text-xs sm:text-sm md:text-base lg:text-lg">
                      {formatPrice(product.coinPrice)} 💰
                    </div>
                  </div>

                  {/* Ürün Bilgileri */}
                  <div className="p-4 sm:p-5 md:p-6">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-purple-900 mb-2 group-hover:text-pink-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-purple-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Satın Al Butonu */}
                    <button
                      onClick={() => handlePurchase(product)}
                      disabled={!canAfford || purchasing === product.id}
                      className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all shadow-lg ${
                        canAfford
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? '🎁 Hemen Al' : '🔒 Yetersiz Bakiye'}
                    </button>

                    {!canAfford && (
                      <p className="text-xs text-center mt-2 text-pink-600 font-semibold">
                        Daha {formatPrice(product.coinPrice - (user?.coins || 0))} puan gerekli
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bilgilendirme Kutusu */}
        <div className="mt-8 sm:mt-10 md:mt-12 bg-gradient-to-r from-pink-100 to-purple-100 border-2 sm:border-4 border-pink-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-3xl sm:text-4xl md:text-5xl">💡</div>
            <div className="flex-1">
              <h4 className="font-black text-purple-900 text-base sm:text-lg md:text-xl mb-2 sm:mb-3">
                🎯 Nasıl Daha Çok Puan Kazanırım?
              </h4>
              <div className="space-y-1.5 sm:space-y-2 text-purple-700 text-sm sm:text-base">
                <p className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">🛍️</span>
                  <span className="font-semibold">Her ürün başı 10 AlinaPuan kazanıyorsunuz</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">✅</span>
                  <span className="font-semibold">Bayi siparişinizi tamamladığında puanlar otomatik eklenir</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">🎁</span>
                  <span className="font-semibold">Biriktirdiğiniz puanlarla harika ödüller alın</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
