// src/pages/ProfilePage.jsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchCurrentUser,
  fetchDealerWallet,
  fetchDealerReferrals,
  fetchDealerAnalytics,
  fetchUserOrders,
} from '../api/client';
import PerformanceComparisonChart from '../components/charts/PerformanceComparisonChart';
import BadgeProgressChart from '../components/charts/BadgeProgressChart';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [dealer, setDealer] = useState(null);

  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [referralStats, setReferralStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  
  const [analyticsData, setAnalyticsData] = useState(null);

  const [copyText, setCopyText] = useState('Kodu kopyala');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [badgeInfo, setBadgeInfo] = useState(null);
  const [lastOrderDate, setLastOrderDate] = useState(null);

  // LocalStorage'dan temel user + dealer bilgilerini oku
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userStr = localStorage.getItem('alina_user');
    const dealerStr = localStorage.getItem('alina_dealer');

    try {
      const parsedUser = userStr ? JSON.parse(userStr) : null;
      const parsedDealer = dealerStr ? JSON.parse(dealerStr) : null;
      setUser(parsedUser);
      setDealer(parsedDealer);
      
      // Avatar'ı yükle
      if (parsedUser?.id) {
        const savedAvatar = localStorage.getItem(`alina_avatar_${parsedUser.id}`);
        if (savedAvatar) {
          setAvatarUrl(savedAvatar);
        }
      }
    } catch (e) {
      console.error("localStorage'dan veri okunamadı:", e);
      // Hatalı veriyi temizle
      localStorage.removeItem('alina_user');
      localStorage.removeItem('alina_dealer');
    }
  }, []);

  // Backend'den güncel kullanıcı bilgilerini çek (coins dahil)
  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        setError('');

        // Güncel kullanıcı bilgisini al
        const currentUserData = await fetchCurrentUser();
        
        // User bilgisini güncelle (coins dahil)
        if (currentUserData.user) {
          setUser(prevUser => ({ ...prevUser, ...currentUserData.user }));
          // localStorage'ı da güncelle
          localStorage.setItem('alina_user', JSON.stringify(currentUserData.user));
        }
        
        // Son sipariş tarihini al
        try {
          const ordersData = await fetchUserOrders();
          if (ordersData.orders && ordersData.orders.length > 0) {
            // En son sipariş (ilk eleman, çünkü desc sıralı)
            setLastOrderDate(ordersData.orders[0].createdAt);
          }
        } catch (err) {
          console.log('Siparişler alınamadı:', err);
        }

        // Eğer dealer ise ek verileri de çek
        if (currentUserData.dealer) {
          const [walletData, refData, analytics] = await Promise.all([
            fetchDealerWallet(),
            fetchDealerReferrals(),
            fetchDealerAnalytics(),
          ]);
          
          setDealer(prevDealer => ({ ...prevDealer, ...walletData.dealer }));
          setWallet(walletData.wallet);
          setTransactions(walletData.recentTransactions || []);

          setReferralStats(refData.stats || null);
          setReferrals(refData.referrals || []);
          
          setAnalyticsData(analytics.data);
          
          // Badge bilgisini al
          if (walletData.dealer?.badgeInfo) {
            setBadgeInfo(walletData.dealer.badgeInfo);
          }
        }

      } catch (err) {
        console.error('Profile load error:', err);
        setError(err.message || 'Profil verileri alınırken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }

    // Sadece user varsa API çağrısı yap
    if (user && user.id) {
      loadUserData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // user.id değiştiğinde bu effect'i tekrar çalıştır

  const handleCopyReferral = () => {
    if (!dealer?.referralCode || typeof navigator === 'undefined') return;

    navigator.clipboard
      .writeText(dealer.referralCode)
      .then(() => {
        setCopyText('Kopyalandı!');
        setTimeout(() => setCopyText('Kodu kopyala'), 2000);
      })
      .catch(() => {
        setCopyText('Kopyalanamadı');
        setTimeout(() => setCopyText('Kodu kopyala'), 2000);
      });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu 5MB\'den küçük olmalıdır.');
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir resim dosyası seçin.');
      return;
    }

    setUploadingAvatar(true);

    try {
      // Şimdilik local preview göster (backend endpoint hazır olunca API'ye gönderilecek)
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        localStorage.setItem(`alina_avatar_${user.id}`, reader.result);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Avatar yüklenemedi:', err);
      alert('Avatar yüklenirken bir hata oluştu.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h1 className="text-2xl font-semibold mb-2">Profil</h1>
            <p className="text-slate-600">
              Profil bilgilerini görmek için önce giriş yapman gerekiyor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isDealer = !!dealer;

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-50 py-10">
        <div className="max-w-5xl mx-auto px-4 space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-3">
            <div className="h-9 w-64 bg-neutral-200 animate-pulse rounded-lg"></div>
            <div className="h-5 w-96 bg-neutral-200 animate-pulse rounded"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border p-6 space-y-3">
                <div className="h-4 w-24 bg-neutral-200 animate-pulse rounded"></div>
                <div className="h-8 w-32 bg-neutral-200 animate-pulse rounded"></div>
                <div className="h-3 w-20 bg-neutral-200 animate-pulse rounded"></div>
              </div>
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border p-6 space-y-4">
                <div className="h-6 w-40 bg-neutral-200 animate-pulse rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-neutral-200 animate-pulse rounded"></div>
                  <div className="h-4 w-5/6 bg-neutral-200 animate-pulse rounded"></div>
                  <div className="h-4 w-4/6 bg-neutral-200 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements - PASTEL COLORS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 -left-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-60 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-rose-200/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12 space-y-8">
        {/* Premium Header - LIGHT THEME WITH AVATAR & BADGE */}
        <header className="backdrop-blur-xl bg-white/80 border-2 border-pink-200 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl shadow-pink-200/50">
          <div className="flex flex-col gap-6">
            {/* Üst kısım: Avatar ve İsim */}
            <div className="flex items-start gap-4 sm:gap-6">
              {/* Avatar with upload button */}
              <div className="relative group flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-pink-400 via-purple-400 to-rose-400 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-lg ring-4 ring-pink-200 overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.fullName.charAt(0).toUpperCase()
                  )}
                </div>
                {/* Upload button overlay */}
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                  <span className="text-white text-2xl sm:text-3xl mb-1">
                    {uploadingAvatar ? '⏳' : '📷'}
                  </span>
                  <span className="text-white text-xs font-semibold">
                    {uploadingAvatar ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
                  </span>
                </label>
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 tracking-tight mb-2 break-words">
                  Hoş geldin, {user.fullName.split(' ')[0]} 👋
                </h1>
                <p className="text-slate-600 text-base sm:text-lg font-medium">
                  {isDealer ? '🏆 Premium Bayi Paneli' : '💎 Müşteri Paneli'}
                </p>
              </div>
            </div>

            {/* Rozet - Tam genişlik */}
            {badgeInfo && (
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg border-2 border-amber-200 animate-pulse self-start">
                <span className="text-xl">⭐</span>
                <span className="font-black text-sm">{badgeInfo.name}</span>
              </div>
            )}

            {/* Alt kısım: Durum bilgileri */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
                {isDealer ? 'Bayi Hesabı Aktif' : 'Müşteri Hesabı'}
              </span>
              <span className="text-xs sm:text-sm text-slate-500">
                ID: <span className="font-mono font-semibold text-slate-700">#{user.id}</span>
              </span>
              {lastOrderDate && (
                <div className="text-xs sm:text-sm text-slate-600 bg-white/60 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-pink-200">
                  <span className="font-semibold text-slate-500">Son Sipariş:</span>{' '}
                  <span className="font-bold text-slate-700">{formatDate(lastOrderDate)}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Ana grid - LIGHT THEME */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sol: Premium Kullanıcı Kartı - WHITE */}
          <section className="lg:col-span-2 backdrop-blur-xl bg-white/90 border-2 border-pink-200 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl shadow-pink-100/50">
            <div className="flex items-center justify-between mb-6 gap-4">
              <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Hesap Özeti</h2>
              <span className="text-xs text-slate-400 font-mono flex-shrink-0">ID #{user.id}</span>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border-2 border-pink-200">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-lg sm:text-xl text-slate-800 break-words">{user.fullName}</p>
                  <p className="text-slate-600 text-sm sm:text-base break-all">{user.email}</p>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Rol</p>
                  <p className="text-sm font-bold text-slate-700">
                    {user.role === 'DEALER' ? '👨‍💼 Bayi' : user.role === 'ADMIN' ? '⚡ Admin' : '👤 Müşteri'}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 hover:scale-105 transition-transform shadow-lg">
                  <p className="text-xs uppercase tracking-wider text-blue-700 mb-2 font-bold">
                    🎯 Hesap Tipi
                  </p>
                  <p className="text-2xl font-black text-blue-800">
                    {user.role === 'DEALER' ? 'Alina Bayisi' : user.role === 'ADMIN' ? 'Yönetici' : 'Premium Müşteri'}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 hover:scale-105 transition-transform shadow-lg">
                  <p className="text-xs uppercase tracking-wider text-emerald-700 mb-2 font-bold">
                    ⚡ Durum
                  </p>
                  <p className="text-2xl font-black text-emerald-800">
                    {isDealer ? '✓ Aktif Bayi' : '✓ Aktif Kullanıcı'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sağ: Premium Stats Card - PINK GRADIENT */}
          <aside className="backdrop-blur-xl bg-white/90 border-2 border-pink-200 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl shadow-pink-100/50 flex flex-col justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-6">📊 Hızlı İstatistikler</h3>
              <ul className="space-y-4">
                
                {/* MÜŞTERİLER İÇİN ALINAPUAN - MEGA PREMIUM */}
                {!isDealer && user?.coins !== undefined && (
                  <li className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 rounded-2xl blur-sm group-hover:blur-md transition-all"></div>
                    <div className="relative bg-gradient-to-br from-pink-500 to-purple-600 p-4 sm:p-6 rounded-2xl border-2 border-pink-200 hover:scale-105 transition-transform shadow-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-black text-xs sm:text-sm uppercase tracking-wider">💰 AlinaPuan</span>
                        <span className="text-2xl sm:text-3xl animate-pulse">✨</span>
                      </div>
                      <span className="block text-3xl sm:text-4xl lg:text-5xl font-black text-white drop-shadow-lg break-words">
                        {user.coins.toLocaleString('tr-TR')}
                      </span>
                      <p className="text-white/90 text-xs mt-2 font-semibold">Premium bakiyeniz</p>
                    </div>
                  </li>
                )}
                
                {/* BAYİLER İÇİN WALLET - ULTRA PREMIUM */}
                {wallet && isDealer && (
                  <li className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 rounded-2xl blur-sm group-hover:blur-md transition-all"></div>
                    <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 p-4 sm:p-6 rounded-2xl border-2 border-yellow-200 hover:scale-105 transition-transform shadow-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-black text-xs sm:text-sm uppercase tracking-wider">🏆 AlinaPuan</span>
                        <span className="text-2xl sm:text-3xl animate-bounce">💎</span>
                      </div>
                      <span className="block text-3xl sm:text-4xl lg:text-5xl font-black text-white drop-shadow-lg break-words">
                        {wallet.balance.toLocaleString('tr-TR')}
                      </span>
                      <p className="text-white text-xs mt-2 font-bold">Toplam kazancınız</p>
                    </div>
                  </li>
                )}
                
                {referralStats && (
                  <li className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 p-4 rounded-xl hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-sm font-semibold">👥 Toplam Referans</span>
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                        {referralStats.totalReferrals}
                      </span>
                    </div>
                  </li>
                )}

                <li className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 p-4 rounded-xl hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 text-sm font-semibold">🎯 Hesap Tipi</span>
                    <span className="text-lg font-black text-blue-700">
                      {isDealer ? 'Bayi' : 'Müşteri'}
                    </span>
                  </div>
                </li>
                
                {dealer?.status && (
                  <li className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 p-4 rounded-xl hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-sm font-semibold">⚡ Durum</span>
                      <span className={`text-sm font-black px-3 py-1 rounded-full ${
                        dealer.status === 'APPROVED' 
                          ? 'bg-emerald-500 text-white' 
                          : dealer.status === 'REJECTED'
                          ? 'bg-red-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}>
                        {dealer.status}
                      </span>
                    </div>
                  </li>
                )}
              </ul>
            </div>
            
            {/* Bayi için Müşteri Siparişleri Butonu - ULTRA PREMIUM */}
            {isDealer && (
              <Link
                to="/dealer/orders"
                className="mt-8 relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-2xl hover:scale-105 transition-transform text-center flex items-center justify-center gap-3 shadow-xl border-2 border-pink-200">
                  <span className="text-2xl">📦</span>
                  <span className="text-lg">Müşteri Siparişlerim</span>
                </div>
              </Link>
            )}
          </aside>
        </div>

        {/* BAYİ BLOKLARI */}
        {isDealer && (
          <>
            {error && (
              <div className="mb-3 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                <strong>Hata:</strong> {error}
              </div>
            )}

            {/* Analiz Paneli - LIGHT COLORFUL THEME */}
            {analyticsData && (
              <section className="space-y-8">
                {/* PREMIUM KPI Kartları - PASTEL COLORS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Toplam Puan - SOFT BLUE */}
                  <div className="group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-cyan-200 to-blue-300 rounded-3xl blur opacity-50 group-hover:opacity-75 transition-all"></div>
                    <div className="relative backdrop-blur-xl bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-300 rounded-3xl p-6 shadow-xl hover:scale-105 transition-transform">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs uppercase tracking-widest text-blue-700 font-black">Toplam Kazanç</p>
                        <span className="text-4xl filter drop-shadow-lg">💎</span>
                      </div>
                      <p className="text-5xl font-black text-blue-700 mb-2 drop-shadow-lg">{wallet?.balance.toLocaleString('tr-TR') || '0'}</p>
                      <p className="text-sm text-blue-600 font-bold">AlinaPuan Bakiye</p>
                    </div>
                  </div>

                  {/* Toplam Referans - SOFT EMERALD */}
                  <div className="group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 via-teal-200 to-emerald-300 rounded-3xl blur opacity-50 group-hover:opacity-75 transition-all"></div>
                    <div className="relative backdrop-blur-xl bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-300 rounded-3xl p-6 shadow-xl hover:scale-105 transition-transform">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs uppercase tracking-widest text-emerald-700 font-black">Referanslar</p>
                        <span className="text-4xl filter drop-shadow-lg">👥</span>
                      </div>
                      <p className="text-5xl font-black text-emerald-700 mb-2 drop-shadow-lg">{analyticsData.performanceComparison?.myReferrals || '0'}</p>
                      <p className="text-sm text-emerald-600 font-bold">Toplam Davet</p>
                    </div>
                  </div>

                  {/* Performans - SOFT PURPLE */}
                  <div className="group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-pink-200 to-purple-300 rounded-3xl blur opacity-50 group-hover:opacity-75 transition-all"></div>
                    <div className="relative backdrop-blur-xl bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 rounded-3xl p-6 shadow-xl hover:scale-105 transition-transform">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs uppercase tracking-widest text-purple-700 font-black">Performans</p>
                        <span className="text-4xl filter drop-shadow-lg">📊</span>
                      </div>
                      <p className="text-5xl font-black text-purple-700 mb-2 drop-shadow-lg">
                        {(analyticsData.performanceComparison?.myReferrals || 0) > (analyticsData.performanceComparison?.averageReferrals || 0) ? '⬆' : '⬇'}
                      </p>
                      <p className="text-sm text-purple-600 font-bold">
                        Sen {analyticsData.performanceComparison?.myReferrals || '0'} vs Ort {analyticsData.performanceComparison?.averageReferrals || '0'}
                      </p>
                    </div>
                  </div>

                  {/* Bayi Rozeti - SOFT AMBER */}
                  <div className="group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-200 via-orange-200 to-amber-300 rounded-3xl blur opacity-50 group-hover:opacity-75 transition-all"></div>
                    <div className="relative backdrop-blur-xl bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300 rounded-3xl p-6 shadow-xl hover:scale-105 transition-transform">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs uppercase tracking-widest text-amber-700 font-black">Rozet</p>
                        <span className="text-4xl filter drop-shadow-lg animate-pulse">⭐</span>
                      </div>
                      <p className="text-3xl font-black text-amber-700 mb-2 drop-shadow-lg">{dealer?.badgeInfo?.name || 'Yok'}</p>
                      <p className="text-sm text-amber-600 font-bold">{dealer?.badgeInfo?.discountRate || '0'}% İndirim</p>
                    </div>
                  </div>
                </div>

                {/* Leaderboard Kısayol - LIGHT THEME */}
                <Link 
                  to="/leaderboard"
                  className="group relative overflow-hidden block"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 via-orange-200 to-rose-200 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-all"></div>
                  <div className="relative backdrop-blur-xl bg-gradient-to-r from-yellow-100 via-orange-100 to-rose-100 border-2 border-orange-300 rounded-3xl p-8 shadow-2xl hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-5xl animate-bounce">🏆</span>
                          <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-600 drop-shadow-lg">
                            Bayi Liderlik Tablosu
                          </h3>
                        </div>
                        <p className="text-slate-700 text-lg mb-3 font-bold">
                          Sıralamadaki yerini gör ve en iyi bayilerle yarış!
                        </p>
                        {referralStats && (
                          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-2 rounded-full border-2 border-orange-300">
                            <span className="text-2xl">📊</span>
                            <span className="text-orange-700 font-black">
                              Sen: {referralStats.totalReferrals} referans
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-8xl opacity-50 group-hover:opacity-100 transition-opacity">
                        👑
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
                  </div>
                </Link>

                {/* Grafikleri içeren PREMIUM kart - LIGHT */}
                <div className="backdrop-blur-xl bg-white/90 border-2 border-purple-200 rounded-3xl p-8 shadow-2xl shadow-purple-100/50">
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-8 flex items-center gap-3">
                    <span className="text-4xl">📈</span>
                    Performans Analizi
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 hover:shadow-lg transition-all">
                      <PerformanceComparisonChart data={analyticsData.performanceComparison} />
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 hover:shadow-lg transition-all">
                      <BadgeProgressChart data={analyticsData.badgeProgress} />
                    </div>
                  </div>
                </div>

                {/* İlerleme Göstergesi - LIGHT THEME */}
                {dealer?.badgeInfo?.nextBadge && referralStats && (
                  <div className="group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-all"></div>
                    <div className="relative backdrop-blur-xl bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 border-2 border-purple-300 rounded-3xl p-8 shadow-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">Sonraki Rozet Hedefi</h3>
                          <p className="text-slate-700 text-lg font-bold">
                            {dealer.badgeInfo.nextBadge === 'BRONZE' ? '🥉 Bronz' : dealer.badgeInfo.nextBadge === 'GOLD' ? '🥇 Altın' : '💎 Platin'} rozetine ulaşmak için devam et!
                          </p>
                        </div>
                        <span className="text-7xl animate-pulse filter drop-shadow-2xl">🏆</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700 font-bold text-lg">İlerleme Durumu</span>
                          <span className="text-2xl font-black text-purple-700">
                            {referralStats.totalReferrals} / {dealer.badgeInfo.referralsNeeded}
                          </span>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-purple-200 rounded-full h-6 overflow-hidden border-2 border-purple-300">
                            <div 
                              className="relative h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                              style={{ width: `${Math.min((referralStats.totalReferrals / dealer.badgeInfo.referralsNeeded) * 100, 100)}%` }}
                            >
                              <span className="text-xs font-bold text-white drop-shadow">
                                {Math.round((referralStats.totalReferrals / dealer.badgeInfo.referralsNeeded) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/70 backdrop-blur rounded-xl p-4 border-2 border-purple-200">
                          <p className="text-purple-700 text-center font-black text-lg">
                            {dealer.badgeInfo.referralsNeeded - referralStats.totalReferrals > 0 
                              ? `🎯 ${dealer.badgeInfo.referralsNeeded - referralStats.totalReferrals} referans daha gerekiyor!`
                              : '🎉 Tebrikler! Rozet yükseltme şartları karşılandı!'}
                          </p>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    </div>
                  </div>
                )}
              </section>
            )}
            
            {/* Bayi Bilgileri + Referans Kodu + Cüzdan - LIGHT THEME */}
            <section className="backdrop-blur-xl bg-white/90 border-2 border-pink-200 rounded-3xl p-8 shadow-2xl shadow-pink-100/50 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-2 flex items-center gap-3">
                    <span className="text-4xl">🏢</span>
                    Bayi Bilgilerin
                  </h2>
                  <p className="text-slate-600 text-lg font-semibold">
                    Bayilik bilgileri, AlinaPuan cüzdanı ve referans kodun
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold px-6 py-3 shadow-lg border-2 border-pink-200">
                  <span className="text-xl mr-2">✨</span>
                  AlinaPuan Programı
                </span>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border-2 border-pink-200 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-purple-700 font-black mb-2">
                      🏢 Bayi Firma Adı
                    </p>
                    <p className="text-2xl font-black text-purple-800">
                      {dealer.companyName}
                    </p>
                  </div>
                  {dealer.address && (
                    <div className="bg-white/70 rounded-xl p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-600 font-bold mb-2">
                        📍 Adres
                      </p>
                      <p className="text-slate-700 font-medium">{dealer.address}</p>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                  <p className="text-xs uppercase tracking-widest text-blue-700 font-black mb-3">
                    ⚡ Bayi Durumu
                  </p>
                  <div className="inline-flex items-center rounded-full px-5 py-3 text-lg font-bold border-2 shadow-lg">
                    <span
                      className={`w-3 h-3 rounded-full mr-3 animate-pulse ${
                        dealer.status === 'APPROVED'
                          ? 'bg-emerald-400 shadow-emerald-400/50 shadow-lg'
                          : dealer.status === 'REJECTED'
                          ? 'bg-red-400 shadow-red-400/50 shadow-lg'
                          : 'bg-amber-400 shadow-amber-400/50 shadow-lg'
                      }`}
                    />
                    <span className={`${
                      dealer.status === 'APPROVED'
                        ? 'text-emerald-400'
                        : dealer.status === 'REJECTED'
                        ? 'text-red-400'
                        : 'text-amber-400'
                    }`}>
                      {dealer.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* ULTRA PREMIUM Cüzdan Kartı - LIGHT */}
              {wallet && (
                <div className="mt-6 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-300 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-all animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 rounded-3xl p-8 shadow-2xl overflow-hidden border-4 border-pink-200">
                    {/* Animated Background Orbs */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl animate-pulse delay-500"></div>
                    
                    {/* Wallet Content */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-4xl filter drop-shadow-lg">💎</span>
                            <p className="text-white/90 text-lg uppercase tracking-widest font-black">
                              AlinaPuan Cüzdanı
                            </p>
                          </div>
                          <div className="flex items-baseline gap-3">
                            <p className="text-7xl font-black text-white drop-shadow-2xl">
                              {wallet.balance.toLocaleString('tr-TR')}
                            </p>
                            <span className="text-3xl font-bold text-white/80">₽</span>
                          </div>
                          <p className="text-white/70 text-sm mt-2 font-semibold">Premium Bakiyeniz</p>
                        </div>
                        <div className="text-8xl animate-bounce filter drop-shadow-2xl">
                          🏆
                        </div>
                      </div>
                      
                      <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/30 hover:bg-white/20 transition-all">
                        <div className="flex items-center gap-4">
                          <span className="text-4xl">✨</span>
                          <p className="text-white text-lg leading-relaxed font-medium">
                            Bu bakiye ile <span className="font-black text-yellow-300">ödül mağazasından</span> özel ürünleri satın alabilirsin!
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
                  </div>
                </div>
              )}

              {/* PREMIUM Rozet Bilgisi */}
              {dealer.badgeInfo && (
                <div className="mt-6 bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl border-2 border-amber-400/30 rounded-3xl p-6">
                  <p className="text-xs uppercase tracking-widest text-white/70 font-bold mb-4 flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    Mevcut Rozetiniz
                  </p>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <span className={`px-6 py-3 rounded-2xl text-xl font-black shadow-2xl border-2 ${
                        dealer.badge === 'PLATINUM' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-white/30' :
                        dealer.badge === 'GOLD' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-white/30' :
                        dealer.badge === 'BRONZE' ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-white/30' :
                        'bg-gradient-to-r from-slate-600 to-slate-700 text-white border-white/30'
                      }`}>
                        {dealer.badgeInfo.name}
                      </span>
                      <div>
                        <p className="text-white font-bold text-lg">🎁 {dealer.badgeInfo.discountRate}% İndirim</p>
                        <p className="text-white/70 text-sm font-semibold">
                          ✨ {Math.round((dealer.badgeInfo.coinBonusRate - 1) * 100)}% Puan Bonusu
                        </p>
                      </div>
                    </div>
                    {dealer.badgeInfo.nextBadge && referralStats && (
                      <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 border border-white/20 flex-1">
                        <p className="font-bold text-white mb-1 text-sm">
                          🎯 Sonraki: {dealer.badgeInfo.nextBadge === 'BRONZE' ? '🥉 Bronz' : dealer.badgeInfo.nextBadge === 'GOLD' ? '🥇 Altın' : '💎 Platin'}
                        </p>
                        <p className="text-white/80 text-xs">
                          {dealer.badgeInfo.referralsNeeded - referralStats.totalReferrals > 0
                            ? `${dealer.badgeInfo.referralsNeeded - referralStats.totalReferrals} referans daha!`
                            : '✅ Rozet şartları karşılandı!'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ULTRA PREMIUM Referans Kodu - LIGHT */}
              {dealer.referralCode && (
                <div className="mt-6 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-all"></div>
                  <div className="relative backdrop-blur-xl bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
                    {/* Header */}
                    <div className="flex items-start gap-3 sm:gap-4 mb-6">
                      <span className="text-3xl sm:text-4xl lg:text-5xl filter drop-shadow-lg flex-shrink-0">🏪</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-1 break-words">
                          Bayi Referans Kodun
                        </h3>
                        <p className="text-slate-700 text-sm sm:text-base lg:text-lg font-bold break-words">
                          Müşterilerine ver - Kayıt ve sipariş için kullanılır
                        </p>
                      </div>
                    </div>
                    
                    {/* Kod Kutusu - MEGA */}
                    <div className="bg-white/20 backdrop-blur-xl border-2 border-white/40 rounded-2xl p-4 sm:p-6 mb-4 hover:scale-105 transition-transform">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex-1 min-w-0 w-full">
                          <p className="text-xs sm:text-sm text-white/80 font-bold mb-2 uppercase tracking-wider">📌 Sipariş ve Kayıt Kodu</p>
                          <code className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-mono font-black text-white drop-shadow-2xl tracking-widest block break-all">
                            {dealer.referralCode}
                          </code>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyReferral}
                          className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-white text-purple-600 font-black text-base sm:text-lg hover:bg-purple-50 transition-all hover:scale-110 shadow-2xl border-2 border-white/50 flex-shrink-0"
                        >
                          {copyText === 'Kodu kopyala' ? '📋 Kopyala' : '✅ Kopyalandı!'}
                        </button>
                      </div>
                    </div>

                    {/* Kullanım Talimatları - PREMIUM */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-200">
                        <span className="text-2xl">✅</span>
                        <p className="text-slate-700 font-bold">
                          <strong className="font-black text-emerald-700">Yeni Müşteri Kaydı:</strong> Müşterileriniz kayıt olurken bu kodu girebilir
                        </p>
                      </div>
                      <div className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                        <span className="text-2xl">🛒</span>
                        <p className="text-slate-700 font-bold">
                          <strong className="font-black text-blue-700">Sipariş Verme:</strong> Müşterileriniz sepette ödeme yaparken bu kodu kullanacak (zorunlu)
                        </p>
                      </div>
                      <div className="flex items-start gap-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                        <span className="text-2xl">💰</span>
                        <p className="text-slate-700 font-bold">
                          <strong className="font-black text-purple-700">Kazanç:</strong> Bu kod ile gelen siparişlerden ve kayıtlardan AlinaPuan kazanırsınız
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info Footer */}
                  <div className="text-center bg-white/70 backdrop-blur rounded-xl p-3 border-2 border-purple-200">
                    <p className="text-purple-700 font-black">
                      💡 Müşterilerinize WhatsApp, SMS veya yüz yüze bu kodu verin
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                </div>
              )}
            </section>

            {/* PREMIUM REFERANS LİSTESİ - LIGHT */}
            <section className="backdrop-blur-xl bg-white/90 border-2 border-purple-200 rounded-3xl p-8 shadow-2xl shadow-purple-100/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2 flex items-center gap-3">
                    <span className="text-4xl">👥</span>
                    Referans Kodunla Kayıt Olanlar
                  </h2>
                  <p className="text-slate-600 text-lg font-semibold">
                    Hangi kullanıcı ne zaman senin kodunla kayıt olmuş burada görebilirsin.
                  </p>
                </div>
                {referralStats && (
                  <span className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 px-6 py-3 rounded-2xl font-black text-purple-700 text-lg">
                    Toplam: {referralStats.totalReferrals} kullanıcı
                  </span>
                )}
              </div>

              {referrals.length === 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200 text-center">
                  <span className="text-6xl mb-4 block">🔍</span>
                  <p className="text-slate-700 text-lg font-bold">
                    Şu an için referans kodunla kayıt olan kullanıcı bulunmuyor.
                  </p>
                </div>
              )}

              {referrals.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-purple-300">
                        <th className="text-left px-4 py-3 text-purple-700 font-black uppercase tracking-wider">👤 Kullanıcı</th>
                        <th className="text-left px-4 py-3 text-purple-700 font-black uppercase tracking-wider">📧 Email</th>
                        <th className="text-left px-4 py-3 text-purple-700 font-black uppercase tracking-wider">🏷️ Rol</th>
                        <th className="text-left px-4 py-3 text-purple-700 font-black uppercase tracking-wider">📅 Kayıt Tarihi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((r, idx) => (
                        <tr
                          key={r.id}
                          className="border-b border-purple-200 hover:bg-purple-100 transition-all"
                        >
                          <td className="px-4 py-4 font-black text-slate-800">
                            {r.user.fullName}
                          </td>
                          <td className="px-4 py-4 text-slate-600 font-medium">
                            {r.user.email}
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 text-xs font-bold shadow-lg">
                              {r.user.role}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-600 font-mono font-semibold">
                            {formatDate(r.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {/* PREMIUM Müşteri Bayi CTA - LIGHT */}
        {!isDealer && (
          <section className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-all"></div>
            <div className="relative backdrop-blur-xl bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 border-2 border-pink-300 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-6xl filter drop-shadow-lg">🚀</span>
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  Bayi Olmak İster misin?
                </h2>
              </div>
              <p className="text-slate-700 text-xl mb-6 leading-relaxed font-bold">
                Alina bayisi olarak <span className="font-black text-purple-700">AlinaPuan</span> kazanabilir, ödül mağazasından
                elektronik ve günlük yaşam ürünlerini çekebilirsin.
              </p>
              <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border-2 border-purple-300 shadow-lg">
                <p className="text-slate-800 text-lg font-black">
                  📋 Başvuru için üst menüden <span className="text-purple-700">Bayi Başvurusu</span> sayfasını kullanabilirsin.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
