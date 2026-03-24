        // src/api/client.js

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.aliozdemir.tr';

// Tarayıcıdan token okumak için helper
        function getAuthToken() {
          if (typeof window === 'undefined') return null;
          return localStorage.getItem('alina_token');
        }

        // ---------------------
        // AUTH - Kullanıcı Bilgileri
        // ---------------------

        // Güncel kullanıcı bilgilerini al (coins dahil)
        export async function fetchCurrentUser() {
          const token = getAuthToken();
          if (!token) {
            throw new Error('Token bulunamadı. Lütfen giriş yapın.');
          }

          const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const data = await res.json();
          if (!data.ok) {
            throw new Error(data.message || 'Kullanıcı bilgileri alınamadı.');
          }

          return data; // { ok: true, user: {..., coins}, dealer: {...} }
        }

        // ---------------------
        // KAYIT (REGISTER)
        // ---------------------

        // Normal kullanıcı kayıt
        export async function registerUser({ fullName, email, password, referralCode }) {
          const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fullName,
              email,
              password,
              isDealer: false,
              // referans kodu varsa backend'e gönder
              referralCode: referralCode || null,
            }),
          });

          const data = await res.json();

          if (!res.ok || data.ok === false) {
            throw new Error(data.message || 'Kayıt başarısız. Lütfen bilgilerini kontrol et.');
          }

          // Kayıttan sonra otomatik login gibi token'ı saklayalım
          if (typeof window !== 'undefined') {
            localStorage.setItem('alina_token', data.token);
            localStorage.setItem('alina_user', JSON.stringify(data.user || null));
            localStorage.setItem('alina_dealer', JSON.stringify(data.dealer || null));

            // 🔔 Tüm uygulamaya "auth değişti" diye haber ver
            window.dispatchEvent(new Event('alina:auth-changed'));
          }

          return data;
        }

        // Bayi kayıt / başvuru
        export async function registerDealer({
          fullName,
          email,
          password,
          companyName,
          phone,
          address,
          referralCode,
        }) {
          const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fullName,
              email,
              password,
              isDealer: true,
              companyName,
              phone,
              address,
              referralCode: referralCode || null,
            }),
          });

          const data = await res.json();

          if (!res.ok || data.ok === false) {
            throw new Error(
              data.message || 'Bayi başvurusu başarısız. Lütfen bilgilerini kontrol et.'
            );
          }

          // Bayi kaydı sonrası da token + user + dealer bilgilerini saklayalım
          if (typeof window !== 'undefined') {
            localStorage.setItem('alina_token', data.token);
            localStorage.setItem('alina_user', JSON.stringify(data.user || null));
            localStorage.setItem('alina_dealer', JSON.stringify(data.dealer || null));

            // 🔔 auth değişti
            window.dispatchEvent(new Event('alina:auth-changed'));
          }

          return data;
        }

        // ---------------------
        // GİRİŞ (LOGIN)
        // ---------------------

        export async function userLogin({ email, password }) {
          const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (!res.ok || data.ok === false) {
            throw new Error(data.message || 'Giriş başarısız. Lütfen bilgilerini kontrol et.');
          }

          if (typeof window !== 'undefined') {
            localStorage.setItem('alina_token', data.token);
            localStorage.setItem('alina_user', JSON.stringify(data.user || null));
            localStorage.setItem('alina_dealer', JSON.stringify(data.dealer || null));

            // 🔔 auth değişti
            window.dispatchEvent(new Event('alina:auth-changed'));
          }

          return data;
        }

        export async function dealerLogin({ email, password }) {
          const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (!res.ok || data.ok === false) {
            throw new Error(data.message || 'Giriş başarısız. Lütfen bilgilerini kontrol et.');
          }

          if (typeof window !== 'undefined') {
            localStorage.setItem('alina_token', data.token);
            localStorage.setItem('alina_user', JSON.stringify(data.user || null));
            localStorage.setItem('alina_dealer', JSON.stringify(data.dealer || null));

            // 🔔 auth değişti
            window.dispatchEvent(new Event('alina:auth-changed'));
          }

          return data;
        }

        // ---------------------
        // Public ürünler (normal mağaza)
        // ---------------------

        export async function fetchStoreProducts() {
          const res = await fetch(`${API_BASE_URL}/api/products`);
          if (!res.ok) {
            throw new Error('Mağaza ürünleri alınamadı');
          }
          const data = await res.json();
          // Backend artık direkt array dönüyor
          const storeProducts = (Array.isArray(data) ? data : data.products || []).filter(
            (p) => !p.isRewardProduct
          );
          return storeProducts;
        }

        // ---------------------
        // Bayi cüzdanı / ödül API'leri (auth gerekiyor)
        // ---------------------

        export async function fetchRewardProducts() {
          const res = await fetch(`${API_BASE_URL}/api/products/rewards/all`);
          if (!res.ok) {
            throw new Error('Ödül ürünleri alınamadı');
          }
          const data = await res.json();
          return data.products || [];
        }

        export async function fetchDealerWallet() {
          const token = getAuthToken();
          if (!token) {
            throw new Error('Giriş bulunamadı. Lütfen tekrar giriş yap.');
          }

          const res = await fetch(`${API_BASE_URL}/api/dealers/me/wallet`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (!res.ok || data.ok === false) {
            throw new Error(data.message || 'Cüzdan bilgisi alınamadı');
          }

          return data;
        }

        export async function redeemReward(productSlug) {
          const token = getAuthToken();
          if (!token) {
            throw new Error('Giriş bulunamadı. Lütfen tekrar giriş yap.');
          }

          const res = await fetch(`${API_BASE_URL}/api/dealers/me/rewards/redeem`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productSlug }),
          });

          const data = await res.json();

          if (!res.ok || data.ok === false) {
            throw new Error(data.message || 'Ödül ürünü kullanılamadı');
          }

          return data;
        }
          // --- Bayi referansları (auth gerekiyor) ---

        export async function fetchDealerReferrals() {
          const token = getAuthToken();
          if (!token) {
            throw new Error('Giriş bulunamadı. Lütfen tekrar giriş yap.');
          }

          const res = await fetch(`${API_BASE_URL}/api/dealers/me/referrals`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (!res.ok || data.ok === false) {
            throw new Error(data.message || 'Referans listesi alınamadı');
          }

          return data; // { ok, dealer, stats, referrals: [...] }
        }

        // --- Bayi analitikleri (auth gerekiyor) ---

        export async function fetchDealerAnalytics() {
          const token = getAuthToken();
          if (!token) {
            throw new Error('Giriş bulunamadı. Lütfen tekrar giriş yap.');
          }

          const res = await fetch(`${API_BASE_URL}/api/dealers/me/analytics`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (!res.ok || data.ok === false) {
            throw new Error(data.message || 'Analitikler alınamadı');
          }

          return data;
        }

        // --- Siparişler (Kullanıcı - Auth gerekiyor) ---

        export async function createOrder(cartItems, dealerReferenceCode = null) {
          const token = getAuthToken();
          if (!token) {
            throw new Error('Giriş bulunamadı. Lütfen tekrar giriş yap.');
          }

          const res = await fetch(`${API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              items: cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                priceCents: item.product.priceCents,
              })),
              dealerReferenceCode: dealerReferenceCode, // Bayi referans kodu
            }),
          });

          const data = await res.json();

          if (!res.ok || data.ok === false) {
            throw new Error(data.message || 'Sipariş oluşturulamadı');
          }

          return data; // { ok, order, user, earnedCoins }
        }

        export async function fetchUserOrders() {
          const token = getAuthToken();
          if (!token) {
            throw new Error('Giriş bulunamadı. Lütfen tekrar giriş yap.');
          }

          const res = await fetch(`${API_BASE_URL}/api/orders`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (!res.ok || data.ok === false) {
            throw new Error(data.message || 'Siparişler alınamadı');
          }

          return data; // { ok, orders: [...] }
        }

        // Bayinin müşteri siparişlerini getir
        export async function fetchDealerCustomerOrders() {
          const token = getAuthToken();
          if (!token) {
            throw new Error('Giriş bulunamadı. Lütfen tekrar giriş yap.');
          }

          const res = await fetch(`${API_BASE_URL}/api/orders/dealer/my-customer-orders`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (!res.ok || data.ok === false) {
            throw new Error(data.message || 'Müşteri siparişleri alınamadı');
          }

          return data; // { ok, orders: [...], dealer: {...} }
        }

        // Sipariş durumunu güncelle (bayiler için)
        // Sipariş durumu güncelle (bayiler için) + Ödeme yöntemi
        export async function updateOrderStatus(orderId, status, paymentMethod = null) {
          const token = getAuthToken();
          if (!token) {
            throw new Error('Giriş bulunamadı. Lütfen tekrar giriş yap.');
          }

          const body = { status };
          
          // Eğer DELIVERED ise paymentMethod ekle
          if (status === 'DELIVERED' && paymentMethod) {
            body.paymentMethod = paymentMethod;
          }

          const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          });

          const data = await res.json();

          if (!res.ok || data.ok === false) {
            throw new Error(data.message || 'Sipariş durumu güncellenemedi');
          }

          return data; // { ok, order, message }
        }

        // ---------------------
        // LEADERBOARD
        // ---------------------
        export async function fetchLeaderboard(period = 'all') {
          const token = getAuthToken();
          if (!token) {
            throw new Error('Giriş bulunamadı. Lütfen tekrar giriş yap.');
          }

          const res = await fetch(`${API_BASE_URL}/api/dealers/leaderboard?period=${period}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (!res.ok || data.ok === false) {
            throw new Error(data.message || 'Sıralama alınamadı');
          }

          return data; // { ok, leaderboard, currentUserRank, totalDealers }
        }

        // ---------------------
        // FAVORİLER
        // ---------------------
        export async function fetchFavorites() {
          const token = getAuthToken();
          if (!token) {
            throw new Error('Giriş bulunamadı. Lütfen tekrar giriş yap.');
          }

          const res = await fetch(`${API_BASE_URL}/api/favorites`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          // 401 durumunda oturumu sonlandır
          if (res.status === 401) {
            localStorage.removeItem('alina_token');
            localStorage.removeItem('alina_user');
            localStorage.removeItem('alina_dealer');
            window.dispatchEvent(new Event('alina:auth-changed'));
            throw new Error('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
          }

          if (!res.ok || data.ok === false) {
            throw new Error(data.message || 'Favoriler alınamadı');
          }

          return data; // { ok, favorites: [...], count }
        }

        export async function addToFavorites(productId) {
          const token = getAuthToken();
          if (!token) {
            throw new Error('Giriş bulunamadı. Lütfen tekrar giriş yap.');
          }

          const res = await fetch(`${API_BASE_URL}/api/favorites/${productId}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (!res.ok || data.ok === false) {
            throw new Error(data.error || 'Favorilere eklenemedi');
          }

          return data; // { ok, message, favorite }
        }

        export async function removeFromFavorites(productId) {
          const token = getAuthToken();
          if (!token) {
            throw new Error('Giriş bulunamadı. Lütfen tekrar giriş yap.');
          }

          const res = await fetch(`${API_BASE_URL}/api/favorites/${productId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (!res.ok || data.ok === false) {
            throw new Error(data.error || 'Favorilerden çıkarılamadı');
          }

          return data; // { ok, message }
        }

        export async function checkFavorite(productId) {
          const token = getAuthToken();
          if (!token) {
            return { isFavorite: false };
          }

          const res = await fetch(`${API_BASE_URL}/api/favorites/check/${productId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (!res.ok) {
            return { isFavorite: false };
          }

        return data; // { ok, isFavorite }
      }

        // ---------------------
        // PAYTR - ÖDEME İŞLEMLERİ
        // ---------------------

        // Ödeme başlat - iFrame token al
        export async function initiatePayment(orderId) {
          const token = getAuthToken();
          if (!token) {
            throw new Error('Token bulunamadı. Lütfen giriş yapın.');
          }

          const res = await fetch(`${API_BASE_URL}/api/paytr/create-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ orderId }),
          });

          const data = await res.json();

          if (!res.ok || data.ok === false) {
            throw new Error(data.message || 'Ödeme başlatılamadı');
          }

          return data; // { ok, token, iframeUrl }
        }

        // Sipariş ödeme durumunu kontrol et
        export async function checkPaymentStatus(orderId) {
          const token = getAuthToken();
          if (!token) {
            throw new Error('Token bulunamadı. Lütfen giriş yapın.');
          }

          const res = await fetch(`${API_BASE_URL}/api/paytr/order-status/${orderId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (!res.ok || data.ok === false) {
            throw new Error(data.message || 'Durum alınamadı');
          }

          return data; // { ok, order: { id, status, isPaid } }
        }