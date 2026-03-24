import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchFavorites, removeFromFavorites, API_BASE_URL } from '../api/client';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { ProductCardSkeleton } from '../components/Skeleton';

function formatPrice(priceCents) {
  if (typeof priceCents !== 'number') return '-';
  return (priceCents / 100).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' TL';
}

function getEarnedCoins(priceCents) {
  if (typeof priceCents !== 'number') return 0;
  return Math.round(priceCents / 600);
}

function getProductImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }
  return `/${imageUrl}`;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const { addToCart } = useCart();
  const { dealer } = useAuth();

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      setLoading(true);
      setError('');
      const data = await fetchFavorites();
      setFavorites(data.favorites || []);
    } catch (err) {
      console.error(err);
      const errorMsg = err.message || 'Favoriler yüklenirken bir hata oluştu.';
      setError(errorMsg);
      
      // Token yoksa veya geçersizse giriş yapmamış demektir
      if (errorMsg.includes('Giriş bulunamadı') || errorMsg.includes('Oturumunuz sona erdi')) {
        // Hata mesajını gösterme, boş favoriler olarak göster
        setFavorites([]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(productId) {
    try {
      setRemovingId(productId);
      await removeFromFavorites(productId);
      
      // Listeden çıkar
      setFavorites(prev => prev.filter(p => p.id !== productId));
      toast.success('Favorilerden çıkarıldı');
      
      // Navbar'daki sayıyı güncelle
      window.dispatchEvent(new Event('alina:favorites-changed'));
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Çıkarılamadı');
    } finally {
      setRemovingId(null);
    }
  }

  async function handleAddToCart(product) {
    addToCart(product);
    toast.success(`${product.name} sepete eklendi!`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <div className="h-10 w-64 bg-neutral-200 animate-pulse rounded-lg mb-3"></div>
            <div className="h-5 w-48 bg-neutral-200 animate-pulse rounded"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 md:py-16 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">❤️</span>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 font-display">
              Favorilerim
            </h1>
          </div>
          <p className="text-neutral-600">
            {loading ? 'Yükleniyor...' : `${favorites.length} favori ürün`}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {!loading && favorites.length === 0 && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
              <span className="text-5xl">💔</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Henüz favori yok</h2>
            <p className="text-neutral-600 mb-6">
              {error && error.includes('Giriş bulunamadı') 
                ? 'Favorileri görmek için giriş yapmalısın!'
                : 'Beğendiğin ürünleri favorilere ekleyerek kolayca ulaşabilirsin!'}
            </p>
            <div className="flex items-center gap-3 justify-center">
              {error && error.includes('Giriş bulunamadı') ? (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full text-white font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Giriş Yap
                    <span>→</span>
                  </Link>
                  <Link
                    to="/store"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-neutral-300 rounded-full text-neutral-700 font-semibold hover:border-primary-500 hover:text-primary-600 transition-all duration-300"
                  >
                    Mağazaya Git
                  </Link>
                </>
              ) : (
                <Link
                  to="/store"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full text-white font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Mağazaya Git
                  <span>→</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {!loading && favorites.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <article
                key={product.id}
                className="bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all flex flex-col group"
              >
                <Link 
                  to={`/product/${product.slug}`}
                  className="relative bg-neutral-100 aspect-square overflow-hidden block"
                >
                  {product.imageUrl ? (
                    <img
                      src={getProductImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-50">
                      <span className="text-4xl">🧴</span>
                    </div>
                  )}

                  {/* Favori Badge */}
                  <div className="absolute top-3 right-3 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">❤️</span>
                  </div>

                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-lg">
                    {product.category?.name || 'Diğer'}
                  </div>
                </Link>

                <div className="p-4 flex flex-col flex-1">
                  <Link to={`/product/${product.slug}`}>
                    <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-neutral-600 line-clamp-2 mb-4">
                    {product.description}
                  </p>

                  <div className="mt-auto space-y-3">
                    {dealer && (
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-xs text-neutral-500">Fiyat</span>
                          <div className="font-bold text-lg">{formatPrice(product.priceCents)}</div>
                        </div>
                        {!product.isRewardProduct && (
                          <div className="px-2.5 py-1 bg-pink-50 border border-pink-200 rounded-lg text-pink-600 text-sm font-semibold">
                            +{getEarnedCoins(product.priceCents)} ₽
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.isRewardProduct}
                        className={`px-3 py-2 rounded-lg text-white font-semibold text-sm transition-all ${
                          product.isRewardProduct
                            ? 'bg-neutral-300 cursor-not-allowed'
                            : 'bg-primary-600 hover:bg-primary-700'
                        }`}
                      >
                        🛍️ Sepete
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(product.id)}
                        disabled={removingId === product.id}
                        className="px-3 py-2 rounded-lg border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold text-sm transition-all disabled:opacity-50"
                      >
                        {removingId === product.id ? '...' : '🗑️ Çıkar'}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
