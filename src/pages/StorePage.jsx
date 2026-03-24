import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchStoreProducts, API_BASE_URL } from '../api/client';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
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

  export default function StorePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { addToCart } = useCart();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { user, dealer } = useAuth();
    const [addedProductId, setAddedProductId] = useState(null);
    
    // Bayilere fiyat göster, normal müşterilere gösterme
    const canSeePrices = dealer !== null;

    // 🔍 Filtreleme ve Arama State'leri
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [sortBy, setSortBy] = useState('name');
    const [categories, setCategories] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
      async function load() {
        try {
          setLoading(true);
          setError('');
          const data = await fetchStoreProducts();
          setProducts(data);

          const uniqueCategories = new Set(['Tümü']);
          for (const p of data) {
            const catName = p.category?.name || 'Diğer';
            uniqueCategories.add(catName);
          }
          setCategories(Array.from(uniqueCategories));
          
          const maxPrice = Math.max(...data.map(p => p.priceCents || 0));
          setPriceRange([0, maxPrice]);
        } catch (err) {
          console.error(err);
          setError(err.message || 'Mağaza ürünleri yüklenirken bir hata oluştu.');
        } finally {
          setLoading(false);
        }
      }
      load();
    }, []);

    const getFilteredAndSortedProducts = () => {
      let filtered = [...products];

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category?.name.toLowerCase().includes(query)
        );
      }

      if (selectedCategory !== 'Tümü') {
        filtered = filtered.filter(p => p.category?.name === selectedCategory);
      }

      filtered = filtered.filter(p => {
        const price = p.priceCents || 0;
        return price >= priceRange[0] && price <= priceRange[1];
      });

      switch (sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => (a.priceCents || 0) - (b.priceCents || 0));
          break;
        case 'price-desc':
          filtered.sort((a, b) => (b.priceCents || 0) - (a.priceCents || 0));
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          break;
        case 'name':
        default:
          filtered.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
          break;
      }
      return filtered;
    };

    const displayedProducts = getFilteredAndSortedProducts();

    const resetFilters = () => {
      setSearchQuery('');
      setSelectedCategory('Tümü');
      const maxPrice = Math.max(...products.map(p => p.priceCents || 0));
      setPriceRange([0, maxPrice]);
      setSortBy('name');
    };

  return (
    <div className="min-h-full bg-neutral-50">
      {/* 🎉 BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 py-4 md:py-5 shadow-lg">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-2xl">🎉</span>
              <span className="text-white font-bold">İLK AYA ÖZEL</span>
              <p className="text-white text-sm md:text-base">
                %30'a varan indirim + Ücretsiz kargo!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-16">
        <div className="relative max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold text-neutral-900 mb-4">
            Ciltinin <span className="text-primary-600">ideal rutini</span>
          </h1>
          <p className="text-lg text-neutral-600">
            Serum, temizleyici, nemlendirici ve güneş kremi.
          </p>
        </div>
      </section>

      {/* İÇERİK */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="space-y-6">
            {/* Skeleton Filter Button */}
            <div className="flex items-center justify-between">
              <div className="h-12 w-48 bg-neutral-200 animate-pulse rounded-xl"></div>
              <div className="h-6 w-24 bg-neutral-200 animate-pulse rounded"></div>
            </div>

            {/* Skeleton Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-sm text-slate-500">Ürün bulunamadı.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            {/* 🔍 FİLTRE BUTONU */}
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white border-2 border-neutral-200 hover:border-primary-500 rounded-xl font-semibold text-neutral-700 hover:text-primary-600 transition-all shadow-sm hover:shadow-md"
              >
                <span className="text-xl">{isFilterOpen ? '✕' : '🔍'}</span>
                <span>{isFilterOpen ? 'Filtreleri Kapat' : 'Filtrele & Ara'}</span>
                {!isFilterOpen && (searchQuery || selectedCategory !== 'Tümü') && (
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">
                    Aktif
                  </span>
                )}
              </button>
              <div className="text-sm text-neutral-600">
                <span className="font-semibold text-neutral-900">{displayedProducts.length}</span> ürün
              </div>
            </div>

            {/* 🔍 FİLTRE PANELİ */}
            {isFilterOpen && (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 mb-8 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Arama */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-2">
                    🔍 Ürün Ara
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ürün adı, kategori..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-2">
                    📂 Kategori
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Sıralama */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-2">
                    ⚡ Sırala
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="name">İsme Göre (A-Z)</option>
                    <option value="price-asc">Fiyat (Düşük → Yüksek)</option>
                    <option value="price-desc">Fiyat (Yüksek → Düşük)</option>
                    <option value="newest">Yeni Eklenenler</option>
                  </select>
                </div>
              </div>

              {/* Fiyat Aralığı */}
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <label className="block text-xs font-semibold text-neutral-700 mb-3">
                  💰 Fiyat Aralığı
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max={Math.max(...products.map(p => p.priceCents || 0))}
                      step="1000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="flex-1 h-2 bg-neutral-200 rounded-lg accent-primary-600"
                    />
                    <input
                      type="range"
                      min="0"
                      max={Math.max(...products.map(p => p.priceCents || 0))}
                      step="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="flex-1 h-2 bg-neutral-200 rounded-lg accent-primary-600"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-neutral-700">{formatPrice(priceRange[0])}</span>
                    <span className="text-neutral-400">—</span>
                    <span className="font-semibold text-neutral-700">{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* Bilgi */}
              <div className="mt-6 pt-6 border-t border-neutral-200 flex items-center justify-between">
                <div className="text-sm text-neutral-600">
                  <span className="font-semibold text-neutral-900">{displayedProducts.length}</span> ürün bulundu
                </div>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  🔄 Sıfırla
                </button>
              </div>
            </div>
              )
            }

            {/* ÜRÜN LİSTESİ */}
            {displayedProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">Ürün Bulunamadı</h3>
                <p className="text-sm text-neutral-600 mb-4">Arama kriterlerinize uygun ürün yok.</p>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl"
                >
                  🔄 Filtreleri Sıfırla
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedProducts.map((product) => (
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
                          className="w-full h-full object-cover hover:scale-110 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-50">
                          <span className="text-4xl">🧴</span>
                        </div>
                      )}
                      {product.isRewardProduct && (
                        <div className="absolute top-3 right-3 px-3 py-1.5 bg-accent-500 text-white text-xs font-bold rounded-full">
                          ⭐ Ödül
                        </div>
                      )}
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-lg">
                        {product.category?.name || 'Diğer'}
                      </div>
                      
                      {/* Favori Butonu */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(product.id, product.name);
                        }}
                        className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
                      >
                        {isFavorite(product.id) ? (
                          <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        )}
                      </button>
                    </Link>

                    <div className="p-4 flex flex-col flex-1">
                      <Link to={`/product/${product.slug}`}>
                        <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      
                      {/* ⭐ Yıldız Değerlendirme */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${
                                star <= 4.7 ? 'text-yellow-400 fill-current' : 'text-neutral-300'
                              }`}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-neutral-600">4.7</span>
                        <span className="text-xs text-neutral-400">(142)</span>
                      </div>

                      <p className="text-xs text-neutral-600 line-clamp-2 mb-4">
                        {product.description}
                      </p>

                      <div className="mt-auto space-y-3">
                        {canSeePrices ? (
                          <>
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
                            <button
                              type="button"
                              onClick={() => {
                                if (!product.isRewardProduct) {
                                  addToCart(product);
                                  setAddedProductId(product.id);
                                  toast.success(`${product.name} sepete eklendi!`);
                                  setTimeout(() => setAddedProductId(null), 2000);
                                }
                              }}
                              disabled={product.isRewardProduct}
                              className={`w-full px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all ${
                            product.isRewardProduct
                              ? 'bg-neutral-300 cursor-not-allowed'
                              : addedProductId === product.id
                              ? 'bg-green-500'
                              : 'bg-primary-600 hover:bg-primary-700'
                          }`}
                        >
                          {addedProductId === product.id ? '✓ Eklendi!' : product.isRewardProduct ? '🎁 Ödül' : '🛍️ Sepete Ekle'}
                        </button>
                          </>
                        ) : (
                          <>
                            <div className="text-center py-3 px-3 bg-amber-50 border border-amber-200 rounded-xl">
                              <p className="text-xs text-amber-800 font-semibold mb-1">🏪 Bayinizden Fiyat Alın</p>
                              <p className="text-xs text-amber-700">Fiyat bilgisi için bayinizle iletişime geçin</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (!product.isRewardProduct) {
                                  addToCart(product);
                                  setAddedProductId(product.id);
                                  toast.success(`${product.name} sepete eklendi! Ödeme sırasında bayi referans kodu gerekecek.`);
                                  setTimeout(() => setAddedProductId(null), 2000);
                                }
                              }}
                              disabled={product.isRewardProduct}
                              className={`w-full px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all ${
                                product.isRewardProduct
                                  ? 'bg-neutral-300 cursor-not-allowed'
                                  : addedProductId === product.id
                                  ? 'bg-green-500'
                                  : 'bg-primary-600 hover:bg-primary-700'
                              }`}
                            >
                              {addedProductId === product.id ? '✓ Eklendi!' : product.isRewardProduct ? '🎁 Ödül' : '🛍️ Sepete Ekle'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
