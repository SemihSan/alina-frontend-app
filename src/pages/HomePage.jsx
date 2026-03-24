import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStoreProducts, API_BASE_URL } from '../api/client';

function getProductImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  if (imageUrl.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  const normalizedPath = imageUrl.replace(/^\/+/, '');
  return `${API_BASE_URL}/uploads/${normalizedPath}`;
}

function formatPrice(priceCents) {
  if (typeof priceCents !== 'number') return '-';
  return (priceCents / 100).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' ₺';
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [stats, setStats] = useState({ dealers: 0, products: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const products = await fetchStoreProducts();
        setFeaturedProducts(products.slice(0, 4));
        
        setStats({
          dealers: 127,
          products: products.length,
          orders: 1543
        });
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="text-white space-y-6 sm:space-y-8">
              <div className="inline-block">
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium border border-white/20">
                  🎉 Türkiye'nin En Güvenilir Kozmetik Platformu
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Premium Cilt Bakım
                <span className="block bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent">
                  Ürünleri
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-primary-100 leading-relaxed">
                Profesyonel formüllerle geliştirilmiş, dermatolojik testlerden geçmiş ürünlerle cildinize özel bakım deneyimi.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                <Link
                  to="/store"
                  className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 rounded-xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <span>Ürünleri Keşfet</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                
                <Link
                  to="/dealer/register"
                  className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-transparent text-white rounded-xl font-bold text-base sm:text-lg border-2 border-white/30 hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300"
                >
                  <span>Bayi Ol</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </Link>
              </div>
              
              <div className="flex items-center gap-8 pt-8 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-400 to-accent-500 border-2 border-white flex items-center justify-center text-white font-bold text-sm">A</div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-500 border-2 border-white flex items-center justify-center text-white font-bold text-sm">B</div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 border-2 border-white flex items-center justify-center text-white font-bold text-sm">C</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold">127+ Bayi</div>
                    <div className="text-primary-200">Bize güveniyor</div>
                  </div>
                </div>
                
                <div className="h-12 w-px bg-white/20" />
                
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-accent-300 font-semibold">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>4.9/5</span>
                  </div>
                  <div className="text-primary-200">1,543 Değerlendirme</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-400/20 to-secondary-400/20 blur-3xl" />
              <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <div className="text-4xl mb-2">✨</div>
                    <h3 className="text-white font-bold text-lg mb-1">Premium Kalite</h3>
                    <p className="text-primary-100 text-sm">Dermatolojik testli ürünler</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <div className="text-4xl mb-2">🚚</div>
                    <h3 className="text-white font-bold text-lg mb-1">Hızlı Kargo</h3>
                    <p className="text-primary-100 text-sm">1-3 iş günü teslimat</p>
                  </div>
                </div>
                <div className="space-y-4 sm:pt-8">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <div className="text-4xl mb-2">🎁</div>
                    <h3 className="text-white font-bold text-lg mb-1">Puan Kazan</h3>
                    <p className="text-primary-100 text-sm">Her alışverişte AlinaPuan</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <div className="text-4xl mb-2">🔒</div>
                    <h3 className="text-white font-bold text-lg mb-1">Güvenli Ödeme</h3>
                    <p className="text-primary-100 text-sm">SSL sertifikalı sistem</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-neutral-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-neutral-900 mb-2">{stats.dealers}+</div>
              <div className="text-neutral-600 font-medium">Aktif Bayi</div>
              <p className="text-sm text-neutral-500 mt-2">Türkiye genelinde</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-neutral-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-neutral-900 mb-2">{stats.products}+</div>
              <div className="text-neutral-600 font-medium">Premium Ürün</div>
              <p className="text-sm text-neutral-500 mt-2">Cilt bakım çözümleri</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-neutral-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-neutral-900 mb-2">{stats.orders.toLocaleString('tr-TR')}+</div>
              <div className="text-neutral-600 font-medium">Mutlu Müşteri</div>
              <p className="text-sm text-neutral-500 mt-2">Tamamlanan sipariş</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-100 text-primary-600 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              Nasıl Çalışır?
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-3 sm:mb-4">
              3 Adımda Başlayın
            </h2>
            <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto">
              Alina ile premium cilt bakım ürünlerine ulaşmak çok kolay
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-200 via-accent-200 to-secondary-200" style={{ transform: 'translateY(-50%)' }} />
            
            <div className="relative bg-white rounded-3xl p-8 shadow-lg border border-neutral-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute -top-6 left-8">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  1
                </div>
              </div>
              <div className="pt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">Üye Olun</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Hemen ücretsiz hesap oluşturun. Bayi olmak isterseniz özel başvuru formumuzu doldurun ve onay bekleyin.
                </p>
              </div>
            </div>
            
            <div className="relative bg-white rounded-3xl p-8 shadow-lg border border-neutral-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute -top-6 left-8">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  2
                </div>
              </div>
              <div className="pt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-100 to-accent-200 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">Alışveriş Yapın</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Premium cilt bakım ürünlerimizi keşfedin, sepete ekleyin ve güvenli ödeme yapın. Hızlı kargo ile kapınıza gelsin.
                </p>
              </div>
            </div>
            
            <div className="relative bg-white rounded-3xl p-8 shadow-lg border border-neutral-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute -top-6 left-8">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  3
                </div>
              </div>
              <div className="pt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">Puan Kazanın</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Her alışverişinizde AlinaPuan kazanın. Bayiyseniz referanslarınızdan da puan alın ve ödül ürünlere ulaşın.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-accent-100 text-accent-600 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
                Öne Çıkan Ürünler
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-3 sm:mb-4">
                En Çok Tercih Edilenler
              </h2>
              <p className="text-lg sm:text-xl text-neutral-600">
                Müşterilerimizin favorisi premium cilt bakım ürünleri
              </p>
            </div>
            <Link
              to="/store"
              className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-colors"
            >
              <span>Tümünü Gör</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-neutral-100 rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-neutral-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-neutral-200 rounded" />
                    <div className="h-4 w-2/3 bg-neutral-200 rounded" />
                    <div className="h-10 bg-neutral-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:border-primary-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="relative aspect-square bg-neutral-50 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={getProductImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">🧴</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg text-xs font-bold text-neutral-700 shadow-sm">
                      {product.category?.name || 'Ürün'}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white rounded-xl font-semibold text-sm group-hover:bg-primary-600 transition-colors">
                      <span>İncele</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12 md:hidden">
            <Link
              to="/store"
              className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-colors"
            >
              <span>Tüm Ürünleri Gör</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-500"></span>
            </span>
            <span>Bayi Başvuruları Açık</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Bayi Olarak
            <span className="block bg-gradient-to-r from-accent-300 to-accent-200 bg-clip-text text-transparent">
              Kazancınızı Artırın
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-primary-100 mb-8 leading-relaxed max-w-2xl mx-auto">
            Referans sistemi ile her yeni üyeden puan kazanın. Rozet sistemi ile daha fazla avantaja ulaşın.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dealer/register"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <span>Hemen Başvur</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-transparent text-white rounded-xl font-bold text-lg border-2 border-white/30 hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300"
            >
              <span>Lider Tablosu</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </Link>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-12 flex-wrap">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">Bronze</div>
              <div className="text-primary-200 text-sm">5 Referans</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">Gold</div>
              <div className="text-primary-200 text-sm">10 Referans</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">Platinum</div>
              <div className="text-primary-200 text-sm">20 Referans</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
