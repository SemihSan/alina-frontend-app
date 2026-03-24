        import { useEffect, useState } from 'react';
        import { useParams, Link, useNavigate } from 'react-router-dom';
        import toast from 'react-hot-toast';
        import { fetchStoreProducts, API_BASE_URL } from '../api/client';
        import { useCart } from '../hooks/useCart';
        import { useFavorites } from '../hooks/useFavorites';
        import { useAuth } from '../hooks/useAuth';
        import { ProductDetailSkeleton } from '../components/Skeleton';

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

        export default function ProductDetailPage() {
          const { slug } = useParams();
          const navigate = useNavigate();
          const { addToCart } = useCart();
          const { isFavorite, toggleFavorite } = useFavorites();
          const { user, dealer } = useAuth();
          
          // Bayilere fiyat göster, normal müşterilere gösterme
          const canSeePrices = dealer !== null;
          
          const [product, setProduct] = useState(null);
          const [relatedProducts, setRelatedProducts] = useState([]);
          const [loading, setLoading] = useState(true);
          const [error, setError] = useState('');
          const [selectedImage, setSelectedImage] = useState(0);
          const [quantity, setQuantity] = useState(1);
          const [isZoomed, setIsZoomed] = useState(false);
          const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
          const [reviews, setReviews] = useState([]);
          const [reviewStats, setReviewStats] = useState({
            average: 0,
            total: 0,
            distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
          });

          useEffect(() => {
            async function load() {
              try {
                setLoading(true);
                setError('');
                const data = await fetchStoreProducts();
                
                // Slug ile ürünü bul
                const foundProduct = data.find(p => p.slug === slug);
                
                if (!foundProduct) {
                  setError('Ürün bulunamadı');
                  return;
                }
                
                setProduct(foundProduct);
                
                // İlgili ürünler - aynı kategoriden
                const related = data.filter(p => 
                  p.category?.slug === foundProduct.category?.slug && 
                  p.id !== foundProduct.id
                ).slice(0, 4);
                
                setRelatedProducts(related);
                
                // Yorumları API'den çek
                await loadReviews(foundProduct.id);
              } catch (err) {
                console.error(err);
                setError(err.message || 'Ürün yüklenirken bir hata oluştu.');
              } finally {
                setLoading(false);
              }
            }
            load();
          }, [slug]);

          // Yorumları yükle
          const loadReviews = async (productId) => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/products/${productId}/reviews`);
              const data = await response.json();
              
              if (data.ok) {
                setReviews(data.reviews || []);
                setReviewStats(data.stats || {
                  average: 0,
                  total: 0,
                  distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
                });
              }
            } catch (error) {
              console.error('Yorumlar yüklenemedi:', error);
              setReviews([]);
            }
          };

          const handleAddToCart = () => {
            if (!product) return;
            
            for (let i = 0; i < quantity; i++) {
              addToCart(product);
            }
            
            toast.success(`${quantity} adet ${product.name} sepete eklendi!`);
          };

          const handleMouseMove = (e) => {
            if (!isZoomed) return;
            
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            setZoomPosition({ x, y });
          };

          const handleZoomToggle = () => {
            setIsZoomed(!isZoomed);
            if (!isZoomed) {
              setZoomPosition({ x: 50, y: 50 });
            }
          };

          if (loading) {
            return (
              <div className="min-h-screen bg-neutral-50">
                <ProductDetailSkeleton />
              </div>
            );
          }

          if (error || !product) {
            return (
              <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">😕</div>
                  <h1 className="text-2xl font-bold mb-2">Ürün Bulunamadı</h1>
                  <p className="text-neutral-600 mb-6">{error || 'Bu ürün mevcut değil.'}</p>
                  <Link
                    to="/store"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700"
                  >
                    ← Mağazaya Dön
                  </Link>
                </div>
              </div>
            );
          }

          // Galeri için resimler (şimdilik tek resim)
          const images = product.imageUrl ? [product.imageUrl] : [];

          return (
            <div className="min-h-screen bg-neutral-50">
              {/* Breadcrumb */}
              <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Link to="/store" className="text-neutral-600 hover:text-primary-600">Mağaza</Link>
                    <span className="text-neutral-400">/</span>
                    <Link to="/store" className="text-neutral-600 hover:text-primary-600">
                      {product.category?.name || 'Ürünler'}
                    </Link>
                    <span className="text-neutral-400">/</span>
                    <span className="text-neutral-900 font-medium">{product.name}</span>
                  </div>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                  
                  {/* Sol: Resim Galerisi */}
                  <div className="space-y-4">
                    {/* Ana Resim */}
                    <div 
                      className={`relative bg-neutral-100 rounded-2xl overflow-hidden ${isZoomed ? 'cursor-move' : 'cursor-zoom-in'}`}
                      onClick={handleZoomToggle}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={() => !isZoomed && setZoomPosition({ x: 50, y: 50 })}
                    >
                      {images.length > 0 ? (
                        <img
                          src={getProductImageUrl(images[selectedImage])}
                          alt={product.name}
                          className="w-full aspect-square object-cover transition-transform duration-200"
                          style={isZoomed ? {
                            transform: 'scale(2.5)',
                            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                          } : {}}
                        />
                      ) : (
                        <div className="w-full aspect-square flex items-center justify-center">
                          <span className="text-8xl">🧴</span>
                        </div>
                      )}
                      
                      {/* Zoom İkonu */}
                      <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-semibold flex items-center gap-1 pointer-events-none">
                        <span>🔍</span>
                        <span>{isZoomed ? 'Hareket ettir' : 'Tıkla & Yakınlaştır'}</span>
                      </div>

                      {/* Kategori Badge */}
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-lg">
                        {product.category?.name || 'Ürün'}
                      </div>
                    </div>

                    {/* Küçük Resimler (Gelecekte çoklu resim için) */}
                    {images.length > 1 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImage(idx)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImage === idx 
                                ? 'border-primary-600 ring-2 ring-primary-200' 
                                : 'border-neutral-200 hover:border-primary-300'
                            }`}
                          >
                            <img
                              src={getProductImageUrl(img)}
                              alt={`${product.name} ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sağ: Ürün Bilgileri */}
                  <div className="space-y-6">
                    {/* Başlık */}
                    <div>
                      <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                        {product.name}
                      </h1>
                      
                      {/* ⭐ Rating */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-5 h-5 ${
                                star <= Math.round(reviewStats.average)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-neutral-300'
                              }`}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          ))}
                        </div>
                        <span className="font-bold text-lg text-neutral-900">{reviewStats.average}</span>
                        <span className="text-sm text-neutral-500">({reviewStats.total} değerlendirme)</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-600">
                          Kategori: <span className="font-semibold text-neutral-900">{product.category?.name}</span>
                        </span>
                        {product.isRewardProduct && (
                          <span className="px-2.5 py-1 bg-accent-100 text-accent-700 text-xs font-bold rounded-full">
                            ⭐ Ödül Ürünü
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fiyat - Sadece Bayiler Görebilir */}
                    {canSeePrices ? (
                      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6 border border-primary-100">
                        <div className="flex items-baseline justify-between mb-4">
                          <div>
                            <p className="text-sm text-neutral-600 mb-1">Fiyat</p>
                            <p className="text-4xl font-bold text-neutral-900">
                              {formatPrice(product.priceCents)}
                            </p>
                          </div>
                          {!product.isRewardProduct && (
                            <div className="text-right">
                              <p className="text-sm text-neutral-600 mb-1">Kazanılan Puan</p>
                              <div className="flex items-center gap-1">
                                <p className="text-3xl font-bold text-accent-600">
                                  +{getEarnedCoins(product.priceCents)}
                                </p>
                                <span className="text-2xl">₽</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Miktar Seçici */}
                        <div className="flex items-center gap-4 mb-4">
                        <label className="text-sm font-semibold text-neutral-700">Miktar:</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 rounded-lg border-2 border-neutral-300 hover:border-primary-500 font-semibold text-neutral-700 hover:text-primary-600 transition-colors"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 h-10 text-center border-2 border-neutral-300 rounded-lg font-semibold focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                          />
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-10 h-10 rounded-lg border-2 border-neutral-300 hover:border-primary-500 font-semibold text-neutral-700 hover:text-primary-600 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Sepete Ekle ve Favori Butonları */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleAddToCart}
                          disabled={product.isRewardProduct}
                          className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                            product.isRewardProduct
                              ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                              : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg'
                          }`}
                        >
                          {product.isRewardProduct ? '🎁 Sadece Ödül Olarak' : '🛍️ Sepete Ekle'}
                        </button>
                        
                        <button
                          onClick={() => toggleFavorite(product.id, product.name)}
                          className="w-14 h-14 rounded-xl border-2 border-neutral-300 hover:border-red-500 flex items-center justify-center transition-all hover:scale-105"
                        >
                          {isFavorite(product.id) ? (
                            <svg className="w-7 h-7 text-red-500 fill-current" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                          ) : (
                            <svg className="w-7 h-7 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          )}
                        </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-5xl mb-3">🏪</div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-2">Bayinizden Fiyat Alın</h3>
                            <p className="text-sm text-neutral-700">
                              Fiyat bilgisi ve özel teklifler için bayiniz ile iletişime geçin.
                            </p>
                          </div>
                          
                          <div className="bg-white rounded-xl p-4 border border-amber-200">
                            <p className="text-sm text-neutral-600 mb-2">💡 <strong>Bilgi:</strong></p>
                            <p className="text-sm text-neutral-600">
                              Ürünü sepete ekleyebilirsiniz. Ödeme sırasında bayinizden aldığınız referans kodunu girmeniz gerekecek.
                            </p>
                          </div>

                          {/* Miktar Seçici */}
                          <div className="flex items-center gap-4">
                            <label className="text-sm font-semibold text-neutral-700">Miktar:</label>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-10 h-10 rounded-lg border-2 border-neutral-300 hover:border-amber-500 font-semibold text-neutral-700 hover:text-amber-600 transition-colors"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-16 h-10 text-center border-2 border-neutral-300 rounded-lg font-semibold focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                              />
                              <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-10 h-10 rounded-lg border-2 border-neutral-300 hover:border-amber-500 font-semibold text-neutral-700 hover:text-amber-600 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Sepete Ekle ve Favori Butonları */}
                          <div className="flex gap-3">
                            <button
                              onClick={handleAddToCart}
                              disabled={product.isRewardProduct}
                              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                                product.isRewardProduct
                                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                                  : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg'
                              }`}
                            >
                              {product.isRewardProduct ? '🎁 Sadece Ödül Olarak' : '🛍️ Sepete Ekle'}
                            </button>
                            
                            <button
                              onClick={() => toggleFavorite(product.id, product.name)}
                              className="w-14 h-14 rounded-xl border-2 border-neutral-300 hover:border-red-500 flex items-center justify-center transition-all hover:scale-105"
                            >
                              {isFavorite(product.id) ? (
                                <svg className="w-7 h-7 text-red-500 fill-current" viewBox="0 0 24 24">
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                              ) : (
                                <svg className="w-7 h-7 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Özellikler */}
                    <div className="bg-white rounded-2xl border p-6 space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <span>✨</span>
                        Ürün Özellikleri
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <span className="text-primary-600">✓</span>
                          <div>
                            <p className="font-semibold text-neutral-900">Ücretsiz Kargo</p>
                            <p className="text-neutral-600">150 TL ve üzeri siparişlerde</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-primary-600">✓</span>
                          <div>
                            <p className="font-semibold text-neutral-900">Hızlı Teslimat</p>
                            <p className="text-neutral-600">1-3 iş günü içinde kapınızda</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-primary-600">✓</span>
                          <div>
                            <p className="font-semibold text-neutral-900">AlinaPuan Kazan</p>
                            <p className="text-neutral-600">Her alışverişte puan biriktir</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-primary-600">✓</span>
                          <div>
                            <p className="font-semibold text-neutral-900">Güvenli Ödeme</p>
                            <p className="text-neutral-600">SSL ile şifreli ödeme sistemi</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detaylı Açıklama */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                  {/* Açıklama */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border p-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <span>📝</span>
                      Ürün Açıklaması
                    </h2>
                    <div className="prose max-w-none">
                      <p className="text-neutral-700 leading-relaxed mb-4">
                        {product.description || 'Bu ürün için henüz detaylı açıklama eklenmemiş.'}
                      </p>
                      
                      {/* Placeholder içerik - gerçek veriden gelecek */}
                      <div className="space-y-4 text-neutral-700">
                        <h3 className="text-lg font-semibold text-neutral-900 mt-6">Ürün Hakkında</h3>
                        <p>
                          {product.category?.name === 'Serum' && 'Bu serum, cildinize derinlemesine nüfuz ederek etkili sonuçlar sağlar. Günlük kullanıma uygundur ve tüm cilt tiplerine uyarlanabilir.'}
                          {product.category?.name === 'Krem' && 'Bu nemlendirici krem, cildinizi derinlemesine besler ve nem dengesini korur. Hafif yapısı sayesinde hızlıca emilir ve yapışkan his bırakmaz.'}
                          {product.category?.name === 'Tonik' && 'Cildinizi temizledikten sonra kullanılacak bu tonik, gözenekleri sıkılaştırır ve cildi dengelemeye yardımcı olur.'}
                          {product.category?.name === 'Temizleyici' && 'Nazik formülü ile cildinizi temizlerken doğal nem dengesini korur. Makyaj kalıntılarını ve kirleri etkili şekilde temizler.'}
                          {(!product.category?.name || !['Serum', 'Krem', 'Tonik', 'Temizleyici'].includes(product.category?.name)) && 
                            'Profesyonel formülü ile cildinize özel bakım sağlar. Düzenli kullanımda görünür sonuçlar elde edebilirsiniz.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Kullanım Talimatları */}
                  <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl border border-primary-100 p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <span>📋</span>
                      Kullanım Talimatları
                    </h2>
                    <ol className="space-y-4">
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center">1</span>
                        <div>
                          <p className="font-semibold text-neutral-900">Temizlik</p>
                          <p className="text-sm text-neutral-600">Cildinizi temizleyici ile yıkayın ve kurulayın.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center">2</span>
                        <div>
                          <p className="font-semibold text-neutral-900">Uygulama</p>
                          <p className="text-sm text-neutral-600">Birkaç damla alın ve yüzünüze hafifçe masaj yaparak uygulayın.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center">3</span>
                        <div>
                          <p className="font-semibold text-neutral-900">Bekleme</p>
                          <p className="text-sm text-neutral-600">Ürünün tamamen emilmesini bekleyin (1-2 dakika).</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center">4</span>
                        <div>
                          <p className="font-semibold text-neutral-900">Tamamlama</p>
                          <p className="text-sm text-neutral-600">Nemlendiricinizi uygulayın ve rutin bakımınıza devam edin.</p>
                        </div>
                      </li>
                    </ol>

                    <div className="mt-6 pt-6 border-t border-primary-200">
                      <p className="text-xs text-neutral-600">
                        <span className="font-semibold">💡 İpucu:</span> En iyi sonuçlar için günde 2 kez (sabah ve akşam) kullanın.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ⭐ YORUMLAR VE DEĞERLENDİRMELER */}
                <div className="mb-16">
                  <div className="bg-white rounded-2xl border p-8">
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                      <span>⭐</span>
                      Müşteri Değerlendirmeleri
                    </h2>

                    {/* İstatistikler */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 pb-8 border-b">
                      {/* Sol: Ortalama Puan */}
                      <div className="text-center lg:border-r">
                        <div className="text-6xl font-bold text-primary-600 mb-2">
                          {reviewStats.average}
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-6 h-6 ${
                                star <= Math.round(reviewStats.average)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-neutral-300'
                              }`}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-neutral-600 text-sm">
                          {reviewStats.total} değerlendirme
                        </p>
                      </div>

                      {/* Orta: Dağılım Çubukları */}
                      <div className="lg:col-span-2 space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = reviewStats.distribution[rating] || 0;
                          const percentage = reviewStats.total > 0 
                            ? Math.round((count / reviewStats.total) * 100) 
                            : 0;

                          return (
                            <div key={rating} className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-neutral-700 w-8">
                                {rating} ⭐
                              </span>
                              <div className="flex-1 bg-neutral-100 rounded-full h-3 overflow-hidden">
                                <div
                                  className="bg-yellow-400 h-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-neutral-600 w-12 text-right">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Yorum Listesi */}
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="border-b pb-6 last:border-b-0 last:pb-0"
                        >
                          {/* Kullanıcı Bilgisi */}
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl flex-shrink-0">
                              {review.userName?.charAt(0).toUpperCase() || '👤'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-neutral-900">
                                  {review.userName}
                                </span>
                                {review.verified && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded flex items-center gap-1">
                                    ✓ Onaylanmış Alıcı
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= review.rating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-neutral-300'
                                      }`}
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-sm text-neutral-500">
                                  {new Date(review.date).toLocaleDateString('tr-TR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Yorum Başlığı */}
                          <h4 className="font-bold text-neutral-900 mb-2">
                            {review.title}
                          </h4>

                          {/* Yorum İçeriği */}
                          <p className="text-neutral-700 leading-relaxed mb-4">
                            {review.comment}
                          </p>

                          {/* Fotoğraflar */}
                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 mb-4">
                              {review.images.map((img, idx) => (
                                <div
                                  key={idx}
                                  className="w-24 h-24 rounded-lg overflow-hidden border-2 border-neutral-200 hover:border-primary-500 transition-all cursor-pointer"
                                >
                                  <img
                                    src={img.startsWith('http') ? img : `${API_BASE_URL}${img}`}
                                    alt={`Kullanıcı fotoğrafı ${idx + 1}`}
                                    className="w-full h-full object-cover hover:scale-110 transition-transform"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Yardımcı Butonları */}
                          <div className="flex items-center gap-4 text-sm">
                            <button className="flex items-center gap-1.5 text-neutral-600 hover:text-primary-600 transition-colors">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                              <span>Yardımcı ({review.helpful})</span>
                            </button>
                            <button className="text-neutral-600 hover:text-primary-600 transition-colors">
                              Yanıtla
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Daha Fazla Yükle Butonu */}
                    <div className="mt-8 text-center">
                      <button className="px-8 py-3 border-2 border-primary-600 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors">
                        Tüm Yorumları Gör ({reviewStats.total})
                      </button>
                    </div>
                  </div>
                </div>

                {/* İlgili Ürünler */}
                {relatedProducts.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-bold">İlgili Ürünler</h2>
                      <Link
                        to="/store"
                        className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1"
                      >
                        Tümünü Gör
                        <span>→</span>
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {relatedProducts.map((relatedProduct) => (
                        <Link
                          key={relatedProduct.id}
                          to={`/product/${relatedProduct.slug}`}
                          className="bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all flex flex-col group"
                        >
                          <div className="relative bg-neutral-100 aspect-square overflow-hidden rounded-t-2xl">
                            {relatedProduct.imageUrl ? (
                              <img
                                src={getProductImageUrl(relatedProduct.imageUrl)}
                                alt={relatedProduct.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-4xl">🧴</span>
                              </div>
                            )}
                            <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-lg">
                              {relatedProduct.category?.name || 'Ürün'}
                            </div>
                          </div>

                          <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                              {relatedProduct.name}
                            </h3>
                            {canSeePrices && (
                              <div className="mt-auto">
                                <p className="font-bold text-lg text-neutral-900">
                                  {formatPrice(relatedProduct.priceCents)}
                                </p>
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }
