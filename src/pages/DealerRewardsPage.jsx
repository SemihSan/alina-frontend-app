import { useEffect, useState } from 'react';
import {
  fetchRewardProducts,
  fetchDealerWallet,
  redeemReward,
  API_BASE_URL,
} from '../api/client';

function formatPuan(amount) {
  if (typeof amount !== 'number') return '0';
  // 975100 -> "975.100"
  return amount.toLocaleString('tr-TR');
}

// Ürün adına göre uygun resim URL'si döndür
function getProductImage(productName) {
  const name = productName?.toLowerCase() || '';

  // Telefon/Smartphone
  if (name.includes('iphone') || name.includes('telefon') || name.includes('phone')) {
    return 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop';
  }
  
  // Tablet
  if (name.includes('ipad') || name.includes('tablet')) {
    return 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=500&fit=crop';
  }
  
  // MacBook/Laptop
  if (name.includes('macbook') || name.includes('laptop') || name.includes('computer')) {
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop';
  }
  
  // Kulaklık/Headphones
  if (name.includes('kulaklık') || name.includes('headphone') || name.includes('airpods')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop';
  }
  
  // Watch/Saat
  if (name.includes('watch') || name.includes('saat') || name.includes('smartwatch')) {
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop';
  }
  
  // Camera
  if (name.includes('camera') || name.includes('kamera') || name.includes('dslr')) {
    return 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500&h=500&fit=crop';
  }
  
  // Gaming Console
  if (name.includes('console') || name.includes('playstation') || name.includes('xbox')) {
    return 'https://images.unsplash.com/photo-1535721471885-34882af1be4f?w=500&h=500&fit=crop';
  }
  
  // TV/Ekran
  if (name.includes('tv') || name.includes('monitor') || name.includes('screen')) {
    return 'https://images.unsplash.com/photo-1522869635100-ce75fb931e1e?w=500&h=500&fit=crop';
  }
  
  // Default/Diğer - generic ürün
  return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop';
}  export default function DealerRewardsPage() {
    const [loading, setLoading] = useState(true);
    const [walletLoading, setWalletLoading] = useState(true);
    const [error, setError] = useState('');
    const [walletError, setWalletError] = useState('');
    const [dealer, setDealer] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]);
    const [grouped, setGrouped] = useState({});
    const [redeemLoadingSlug, setRedeemLoadingSlug] = useState('');
    const [redeemMessage, setRedeemMessage] = useState('');
    const [curtainOpen, setCurtainOpen] = useState(false);

    // Ödül ürünleri + cüzdan bilgisi
    useEffect(() => {
      async function loadAll() {
        setLoading(true);
        setWalletLoading(true);
        setError('');
        setWalletError('');
        setRedeemMessage('');

        try {
          const [walletData, rewardData] = await Promise.all([
            fetchDealerWallet().catch((err) => {
              setWalletError(err.message || 'Cüzdan bilgisi alınamadı.');
              throw err;
            }),
            // DEALER ödül ürünlerini çek
            fetch(`${API_BASE_URL}/api/products/rewards/all?audience=DEALER`)
              .then(res => res.json())
              .catch((err) => {
                setError(err.message || 'Ödül ürünleri alınamadı.');
                throw err;
              }),
          ]);

          if (walletData) {
            setDealer(walletData.dealer || null);
            setWallet(walletData.wallet || null);
            setTransactions(walletData.recentTransactions || []);
          }

          const rewardProducts = rewardData?.products || [];
          
          // DEBUG: Araba ürününü kontrol et
          const carProduct = rewardProducts.find(p => p.slug === 'sifir-otomobil-reward');
          if (carProduct) {
            console.log('🚗 ARABA ÜRÜNÜ:', {
              name: carProduct.name,
              slug: carProduct.slug,
              imageUrl: carProduct.imageUrl
            });
          }
          
          setProducts(rewardProducts);

          // kategorilere göre grupla
          const byCategory = {};
          for (const p of rewardProducts) {
            const catName = p.category?.name || 'Diğer Ödüller';
            if (!byCategory[catName]) byCategory[catName] = [];
            byCategory[catName].push(p);
          }
          setGrouped(byCategory);
        } catch (err) {
          // Hata durumunda state'leri zaten üstte set ettik
          console.error('DealerRewards loadAll error:', err);
        } finally {
          setLoading(false);
          setWalletLoading(false);
        }
      }

      loadAll();
    }, []);

    const categoryNames = Object.keys(grouped);

    async function handleRedeem(product) {
      setRedeemMessage('');
      setError('');

      if (!wallet) {
        setError('Cüzdan bilgisi bulunamadı. Lütfen tekrar giriş yap.');
        return;
      }

      if (typeof product.coinPrice !== 'number') {
        setError('Bu ürün için puan fiyatı tanımlanmamış.');
        return;
      }

      if (wallet.balance < product.coinPrice) {
        setError(
          `Bu ödülü almak için yeterli AlinaPuan yok. Gerekli: ${formatPuan(
            product.coinPrice
          )}, Senin bakiyen: ${formatPuan(wallet.balance)}`
        );
        return;
      }

      try {
        setRedeemLoadingSlug(product.slug);
        const res = await redeemReward(product.slug);

        // Wallet'ı ve transaction listesini güncelle
        if (res.wallet) {
          setWallet(res.wallet);
        }
        if (res.transaction) {
          setTransactions((prev) => [res.transaction, ...prev].slice(0, 10));
        }

      setRedeemMessage(
        `Ödül başarıyla kullanıldı: ${product.name} (Kalan bakiye: ${formatPuan(
          res.wallet?.balance ?? wallet.balance
        )} AlinaPuan)`
      );
      } catch (err) {
        console.error(err);
        setError(err.message || 'Ödül ürünü kullanılırken bir hata oluştu.');
      } finally {
        setRedeemLoadingSlug('');
      }
    }

    return (
      <div className="min-h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* ✨ HERO SECTION - PREMIUM LUXURY THEME */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 py-20 md:py-28">
          {/* Animated background effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse delay-700" />
          
          <div className="relative max-w-7xl mx-auto px-6 space-y-8">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 border border-yellow-400/30 rounded-full backdrop-blur-sm">
              <span className="text-2xl animate-bounce">💎</span>
              <span className="text-sm font-bold text-yellow-300 tracking-wide">PREMIUM ÖDÜL MAĞAZASI</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight font-display">
                Lüks Ödüller
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 mt-2">
                  Sizi Bekliyor
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-purple-100 leading-relaxed">
                🏆 Satışlarınızdan kazandığınız AlinaPuan'larla tatil paketleri, premium elektronik ürünler ve <span className="font-bold text-yellow-300">hayalinizdeki arabayı</span> kazanın!
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
          {/* ✨ ERROR MESSAGES */}
          {walletError && (
            <div className="rounded-xl bg-red-900/30 border border-red-500/50 px-6 py-4 text-red-200 backdrop-blur-sm">
              <p className="font-semibold">Cüzdan Hatası</p>
              <p className="text-sm mt-1">{walletError}</p>
            </div>
          )}
          {error && (
            <div className="rounded-xl bg-amber-900/30 border border-amber-500/50 px-6 py-4 text-amber-200 backdrop-blur-sm">
              <p className="font-semibold">⚠️ Uyarı</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}
          {redeemMessage && (
            <div className="rounded-xl bg-green-900/30 border border-green-500/50 px-6 py-4 text-green-200 backdrop-blur-sm">
              <p className="font-semibold">✨ Başarılı!</p>
              <p className="text-sm mt-1">{redeemMessage}</p>
            </div>
          )}

          {/* ✨ WALLET CARD - PREMIUM LUXURY PEMBE GRADIENT */}
          <div className="grid grid-cols-1">
            {/* Main Wallet Card - Pembe-Mor Gradient */}
            <div className="relative bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden">
              {/* Parıltı Efektleri */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-300/30 rounded-full blur-2xl animate-pulse delay-75"></div>
              
              <div className="relative z-10 space-y-6">
                <div>
                  <p className="text-pink-100 text-sm font-medium mb-2 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-2xl">💎</span>
                    <span>Toplam Bakiye</span>
                  </p>
                  <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-display drop-shadow-lg">
                    {walletLoading ? '...' : wallet ? formatPuan(wallet.balance) : '0'}
                  </p>
                  <p className="text-pink-100 text-base sm:text-lg mt-2 font-semibold">AlinaPuan</p>
                </div>

                {dealer && (
                  <div className="relative border-t border-pink-300/30 pt-6 space-y-4">
                    <div>
                      <p className="text-pink-100 text-xs font-medium uppercase tracking-wide">🏢 Şirket Adı</p>
                      <p className="text-2xl font-bold mt-1">{dealer.companyName}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-pink-100 text-xs font-medium uppercase tracking-wide">✅ Durum</p>
                        <p className="text-sm font-semibold mt-1">{dealer.status}</p>
                      </div>
                      <div>
                        <p className="text-pink-100 text-xs font-medium uppercase tracking-wide">🔑 Referral Kod</p>
                        <p className="font-mono text-sm bg-white/20 px-3 py-2 rounded-lg mt-1">{dealer.referralCode}</p>
                      </div>
                    </div>
                    {dealer.badgeInfo && (
                      <div className="border-t border-pink-300/30 pt-4 space-y-3">
                        <p className="text-pink-100 text-xs font-medium uppercase tracking-wide">🎖️ Rozet</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`px-4 py-2 rounded-xl text-sm font-black shadow-lg ${
                            dealer.badge === 'PLATINUM' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white ring-2 ring-purple-300' :
                            dealer.badge === 'GOLD' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white ring-2 ring-yellow-300' :
                            dealer.badge === 'BRONZE' ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white ring-2 ring-orange-300' :
                            'bg-white/20 text-white'
                          }`}>
                            {dealer.badgeInfo.name}
                          </span>
                          <span className="text-xs text-pink-100">
                            %{dealer.badgeInfo.discountRate} indirim, {Math.round((dealer.badgeInfo.coinBonusRate - 1) * 100)}% puan bonusu
                          </span>
                        </div>
                        {dealer.badgeInfo.nextBadge && (
                          <p className="text-xs text-pink-100 bg-white/10 rounded-lg px-3 py-2">
                            🎯 Sonraki rozet ({dealer.badgeInfo.nextBadge === 'BRONZE' ? 'Bronz' : dealer.badgeInfo.nextBadge === 'GOLD' ? 'Altın' : 'Platin'}) için {dealer.badgeInfo.referralsNeeded} referans gerekiyor
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ✨ REWARD PRODUCTS - LUXURY SHOWCASE */}
          <section>
            <div className="mb-6 sm:mb-8 text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-display mb-3">
                💎 Premium Ödüller
              </h2>
              <p className="text-purple-200 text-sm sm:text-base md:text-lg">Kazandığınız AlinaPuan'larla hayalinizdeki lüks ödülleri alın</p>
            </div>

            {loading && (
              <div className="space-y-8">
                {/* Skeleton Categories */}
                {[...Array(2)].map((_, catIdx) => (
                  <div key={catIdx} className="space-y-4">
                    <div className="h-8 w-48 bg-neutral-200 animate-pulse rounded-lg"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border overflow-hidden">
                          {/* Image skeleton */}
                          <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 animate-pulse"></div>
                          
                          {/* Content skeleton */}
                          <div className="p-4 space-y-3">
                            <div className="h-5 bg-neutral-200 rounded animate-pulse"></div>
                            <div className="h-4 w-3/4 bg-neutral-200 rounded animate-pulse"></div>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-24 bg-accent-200 rounded-lg animate-pulse"></div>
                            </div>
                            <div className="h-10 bg-neutral-200 rounded-xl animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && categoryNames.length === 0 && (
              <div className="text-center py-20">
                <p className="text-purple-200 text-lg mb-4">Şu an tanımlı ödül bulunamadı</p>
                <details className="text-left max-w-2xl mx-auto bg-slate-800/50 border border-slate-700 p-4 rounded-lg text-sm backdrop-blur-sm">
                  <summary className="cursor-pointer font-bold text-yellow-300">🔍 Debug Bilgisi (Geliştiriciler için)</summary>
                  <pre className="mt-2 overflow-auto text-xs text-slate-300">
                    {JSON.stringify({ rewardProducts, grouped, categoryNames }, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {!loading &&
              categoryNames.map((catName) => {
                // Bu kategorideki ürünleri al
                const categoryProducts = grouped[catName];
                
                // Araba ürünü var mı kontrol et
                const carProduct = categoryProducts.find(p => 
                  p.name?.toLowerCase().includes('araba') || 
                  p.name?.toLowerCase().includes('car') ||
                  p.name?.toLowerCase().includes('otomobil') ||
                  p.name?.toLowerCase().includes('sıfır') ||
                  p.slug?.includes('otomobil')
                );
                
                return (
                  <div key={catName} className="mb-12">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <h3 className="text-2xl sm:text-3xl font-black text-white font-display">{catName}</h3>
                      <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg">
                        {categoryProducts.length} ödül
                      </span>
                    </div>

                    {/* ARABA ÖZEL SHOWCASE - EN ÜSTTE, PERDE AÇILMA EFEKTİ */}
                    {carProduct && (
                      <div className="relative mb-12 rounded-3xl overflow-hidden bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600 p-1 shadow-2xl">
                        <div className="relative bg-black rounded-3xl overflow-hidden min-h-[600px]">
                          {/* Animasyonlu Arka Plan */}
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-red-500/20 to-purple-500/20 animate-pulse"></div>
                          
                          {/* Yıldız Efektleri */}
                          <div className="absolute top-10 left-10 text-6xl animate-bounce">⭐</div>
                          <div className="absolute top-20 right-20 text-5xl animate-pulse delay-100">✨</div>
                          <div className="absolute bottom-10 left-1/4 text-4xl animate-bounce delay-200">🌟</div>
                          <div className="absolute bottom-20 right-1/3 text-5xl animate-pulse delay-300">💫</div>
                          
                          {/* TIKLANABILIR PERDE OVERLAY - Kapalı durumda */}
                          {!curtainOpen && (
                            <div 
                              onClick={() => setCurtainOpen(true)}
                              className="absolute inset-0 z-30 cursor-pointer group"
                            >
                              {/* Perde Dokusu - Sol */}
                              <div 
                                className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-red-900 via-red-800 to-red-900"
                                style={{
                                  backgroundImage: 'repeating-linear-gradient(90deg, #7f1d1d 0px, #991b1b 2px, #7f1d1d 4px)',
                                  boxShadow: 'inset -20px 0 30px rgba(0,0,0,0.5), 4px 0 10px rgba(0,0,0,0.3)'
                                }}
                              >
                                <div className="absolute inset-0 opacity-30" style={{
                                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
                                }}></div>
                              </div>
                              
                              {/* Perde Dokusu - Sağ */}
                              <div 
                                className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-red-900 via-red-800 to-red-900"
                                style={{
                                  backgroundImage: 'repeating-linear-gradient(90deg, #7f1d1d 0px, #991b1b 2px, #7f1d1d 4px)',
                                  boxShadow: 'inset 20px 0 30px rgba(0,0,0,0.5), -4px 0 10px rgba(0,0,0,0.3)'
                                }}
                              >
                                <div className="absolute inset-0 opacity-30" style={{
                                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
                                }}></div>
                              </div>
                              
                              {/* Altın Kordon - Üst */}
                              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-yellow-600 via-yellow-500 to-transparent">
                                <div className="absolute inset-0" style={{
                                  backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, rgba(255,255,255,0.3) 1px, transparent 2px)'
                                }}></div>
                              </div>
                              
                              {/* Altın Kordon - Alt */}
                              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-yellow-600 via-yellow-500 to-transparent">
                                <div className="absolute inset-0" style={{
                                  backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, rgba(255,255,255,0.3) 1px, transparent 2px)'
                                }}></div>
                              </div>
                              
                              {/* Merkez Tıklama Butonu */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative">
                                  {/* Pulsing Ring */}
                                  <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl animate-pulse"></div>
                                  <div className="absolute inset-0 bg-red-400/30 rounded-full blur-2xl animate-pulse delay-100"></div>
                                  
                                  {/* Button */}
                                  <button className="relative px-6 sm:px-8 md:px-12 py-4 sm:py-6 md:py-8 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 rounded-2xl sm:rounded-3xl shadow-2xl transform group-hover:scale-110 transition-all duration-300 border-2 sm:border-4 border-white/30">
                                    <div className="space-y-2 sm:space-y-3 text-center">
                                      <div className="text-3xl sm:text-4xl md:text-6xl animate-bounce">🎁</div>
                                      <p className="text-white font-black text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-wider drop-shadow-lg">
                                        BÜYÜK ÖDÜLÜ
                                      </p>
                                      <p className="text-white font-black text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-wider drop-shadow-lg">
                                        GÖRMEK İÇİN TIKLA!
                                      </p>
                                      <div className="text-2xl sm:text-3xl md:text-4xl">👇</div>
                                    </div>
                                  </button>
                                  
                                  {/* Sparkles around button */}
                                  <div className="absolute -top-4 -left-4 text-4xl animate-spin-slow">✨</div>
                                  <div className="absolute -top-4 -right-4 text-4xl animate-spin-slow delay-200">⭐</div>
                                  <div className="absolute -bottom-4 -left-4 text-4xl animate-spin-slow delay-300">🌟</div>
                                  <div className="absolute -bottom-4 -right-4 text-4xl animate-spin-slow delay-100">💫</div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* PERDE AÇILMA EFEKTİ - Sol Perde (Açılma Animasyonu) */}
                          {curtainOpen && (
                            <div 
                              className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-red-900 via-red-800 to-red-900 z-20 animate-[slideOutLeft_3s_ease-in-out_forwards]"
                              style={{
                                backgroundImage: 'repeating-linear-gradient(90deg, #7f1d1d 0px, #991b1b 2px, #7f1d1d 4px)',
                                boxShadow: 'inset -20px 0 30px rgba(0,0,0,0.5), 4px 0 10px rgba(0,0,0,0.3)'
                              }}
                            >
                              <div className="absolute inset-0 opacity-30" style={{
                                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
                              }}></div>
                            </div>
                          )}
                          
                          {/* PERDE AÇILMA EFEKTİ - Sağ Perde (Açılma Animasyonu) */}
                          {curtainOpen && (
                            <div 
                              className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-red-900 via-red-800 to-red-900 z-20 animate-[slideOutRight_3s_ease-in-out_forwards]"
                              style={{
                                backgroundImage: 'repeating-linear-gradient(90deg, #7f1d1d 0px, #991b1b 2px, #7f1d1d 4px)',
                                boxShadow: 'inset 20px 0 30px rgba(0,0,0,0.5), -4px 0 10px rgba(0,0,0,0.3)'
                              }}
                            >
                              <div className="absolute inset-0 opacity-30" style={{
                                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
                              }}></div>
                            </div>
                          )}
                          
                          {/* Altın Kordon Efekti - Üst */}
                          {curtainOpen && (
                            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-yellow-600 via-yellow-500 to-transparent z-20 animate-[fadeOut_3s_ease-in-out_forwards]">
                              <div className="absolute inset-0" style={{
                                backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, rgba(255,255,255,0.3) 1px, transparent 2px)'
                              }}></div>
                            </div>
                          )}
                          
                          {/* Altın Kordon Efekti - Alt */}
                          {curtainOpen && (
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-yellow-600 via-yellow-500 to-transparent z-20 animate-[fadeOut_3s_ease-in-out_forwards]">
                              <div className="absolute inset-0" style={{
                                backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, rgba(255,255,255,0.3) 1px, transparent 2px)'
                              }}></div>
                            </div>
                          )}
                          
                          {/* İçerik - Fade In ile beliriyor (Sadece perde açıldıysa görünür) */}
                          {curtainOpen && (
                            <div className="relative z-10 p-4 sm:p-6 md:p-12 lg:p-16 opacity-0 animate-[fadeIn_1s_ease-in-out_2.5s_forwards]">
                              <div className="text-center mb-6 sm:mb-8">
                                <p className="text-yellow-400 font-black text-lg sm:text-xl md:text-2xl mb-2 tracking-wider animate-[bounce_1s_ease-in-out_3s_infinite]">
                                  🏆 BÜYÜK ÖDÜL 🏆
                                </p>
                                <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-red-400 to-purple-400 animate-[pulse_2s_ease-in-out_3s_infinite]">
                                  {carProduct.name}
                                </h2>
                                <p className="text-white/80 text-sm sm:text-base md:text-lg lg:text-xl mt-4">{carProduct.description}</p>
                              </div>
                              
                              {/* Araba Görseli */}
                              <div className="relative h-64 sm:h-80 md:h-96 lg:h-[600px] mb-6 sm:mb-8 rounded-xl sm:rounded-2xl overflow-hidden group shadow-2xl">
                                <img
                                  src={carProduct.imageUrl || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&h=800&fit=crop'}
                                  alt={carProduct.name}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                                  onError={(e) => {
                                    console.error('Araba fotoğrafı yüklenemedi:', e);
                                    e.target.src = 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&h=800&fit=crop';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                
                                {/* Spotlight Efekti */}
                                <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50 animate-pulse"></div>
                              </div>
                              
                              {/* Puan ve Buton */}
                              <div className="text-center space-y-4 sm:space-y-6">
                                <div>
                                  <p className="text-yellow-300 text-xs sm:text-sm font-semibold mb-2">Gereken Puan</p>
                                  <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-red-400 animate-[pulse_2s_ease-in-out_infinite]">
                                    {formatPuan(carProduct.coinPrice || 0)}
                                    <span className="text-xl sm:text-2xl md:text-3xl ml-2">💎</span>
                                  </p>
                                </div>
                                
                                <button
                                  type="button"
                                  onClick={() => handleRedeem(carProduct)}
                                  disabled={
                                    !!redeemLoadingSlug ||
                                    walletLoading ||
                                    !wallet ||
                                    (wallet && wallet.balance < carProduct.coinPrice)
                                  }
                                  className={`relative px-6 sm:px-10 md:px-16 py-3 sm:py-4 md:py-6 text-base sm:text-lg md:text-xl lg:text-2xl font-black rounded-xl sm:rounded-2xl transition-all duration-300 ${
                                    wallet && wallet.balance < carProduct.coinPrice
                                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                      : 'bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 text-white hover:scale-110 hover:shadow-2xl animate-pulse'
                                  }`}
                                >
                                  {redeemLoadingSlug === carProduct.slug
                                    ? '⏳ İşleniyor...'
                                    : wallet && wallet.balance < carProduct.coinPrice
                                    ? '🔒 Yetersiz Puan'
                                    : '🚗 HEMEN AL! 🏆'}
                                </button>
                                
                                {wallet && wallet.balance < carProduct.coinPrice && (
                                  <p className="text-yellow-300 text-sm">
                                    Daha {formatPuan(carProduct.coinPrice - wallet.balance)} puan gerekli
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Normal Ürünler (araba hariç) - LUXURY CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryProducts
                        .filter(p => p.id !== carProduct?.id) // Arabayı filtrele
                        .map((product) => (
                        <article
                          key={product.id}
                          className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300"
                        >
                          {/* Image Area */}
                          <div className="relative h-56 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 overflow-hidden">
                            <img
                              src={getProductImage(product.name)}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                            <div className="absolute top-3 right-3">
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full text-xs font-black text-slate-900 shadow-lg">
                                💎 PREMIUM
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-6 space-y-4">
                            <div className="space-y-2">
                              <h4 className="font-bold text-white text-lg group-hover:text-purple-300 transition-colors">
                                {product.name}
                              </h4>
                              <p className="text-sm text-slate-400 line-clamp-2">
                                {product.description || 'Premium ödül ürünü'}
                              </p>
                            </div>

                            {/* Footer */}
                            <div className="space-y-3 border-t border-slate-700 pt-4">
                              <div className="flex items-baseline justify-between">
                                <span className="text-xs text-slate-400 uppercase tracking-wide">Gerekli Puan</span>
                                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
                                  {formatPuan(product.coinPrice || 0)}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRedeem(product)}
                                disabled={
                                  !!redeemLoadingSlug ||
                                  walletLoading ||
                                  !wallet ||
                                  (typeof product.coinPrice === 'number' &&
                                    wallet &&
                                    wallet.balance < product.coinPrice)
                                }
                                className={`w-full py-3 font-bold rounded-xl transition-all duration-300 ${
                                  redeemLoadingSlug === product.slug ||
                                  walletLoading ||
                                  !wallet ||
                                  (typeof product.coinPrice === 'number' &&
                                    wallet &&
                                    wallet.balance < product.coinPrice)
                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105'
                                }`}
                              >
                                {redeemLoadingSlug === product.slug
                                  ? '⏳ İşleniyor...'
                                  : wallet &&
                                    typeof product.coinPrice === 'number' &&
                                    wallet.balance < product.coinPrice
                                  ? '🔒 Yetersiz Puan'
                                  : '💎 Puan ile Al'}
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                );
              })}
          </section>
        </div>
      </div>
    );
  }
