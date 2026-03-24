import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchUserOrders } from '../api/client';
import { OrderCardSkeleton } from '../components/Skeleton';
import { useAuth } from '../hooks/useAuth';

function formatPrice(priceCents) {
  if (typeof priceCents !== 'number') return '-';
  return (priceCents / 100).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' TL';
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getStatusBadge(status) {
  const statusMap = {
    'pending': { label: 'Beklemede', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
    'confirmed': { label: 'Onaylandı', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    'shipped': { label: 'Kargo da', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    'delivered': { label: 'Teslim edildi', color: 'bg-green-50 border-green-200 text-green-700' },
    'cancelled': { label: 'İptal edildi', color: 'bg-red-50 border-red-200 text-red-700' },
  };

  const info = statusMap[status] || { label: status, color: 'bg-neutral-50 border-neutral-200 text-neutral-700' };
  return info;
}

export default function OrdersPage() {
  const { dealer } = useAuth(); // Bayi mi kontrol et
  const isDealer = dealer !== null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const data = await fetchUserOrders();
        setOrders(data.orders || []);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Siparişler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 md:py-16 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 font-display mb-2">
            Siparişlerim
          </h1>
          <p className="text-neutral-600">
            {loading ? 'Yükleniyor...' : `${orders.length} sipariş`}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-6 py-4 text-red-700">
            <p className="font-semibold">⚠️ Hata</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {loading && (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && orders.length === 0 && (
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Henüz sipariş yok</h2>
            <p className="text-neutral-600 mb-6">
              Henüz bir sipariş vermediniz. Mağazamızı keşfedin!
            </p>
            <Link
              to="/store"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full text-white font-semibold hover:shadow-lg transition-all duration-300"
            >
              Mağazaya Git
              <span>→</span>
            </Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              const orderDate = new Date(order.createdAt);
              const totalPrice = isDealer ? order.items.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0) : 0;
              const totalProducts = order.items.reduce((sum, item) => sum + item.quantity, 0);
              const earnedCoins = isDealer ? totalProducts * 25 : 0; // Bayi için ürün başı 25 puan

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                  {/* Header - Sipariş No ve Durum */}
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 px-6 py-4 border-b border-neutral-200 flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-neutral-600">Sipariş No</p>
                      <p className="font-mono font-bold text-neutral-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Tarih</p>
                      <p className="font-semibold text-neutral-900">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Content - Ürünler */}
                  <div className="p-6 space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                        <div className="flex-1">
                          <p className="font-semibold text-neutral-900">{item.productName}</p>
                          <p className="text-sm text-neutral-600">
                            Adet: {item.quantity}
                            {isDealer && ` × ${formatPrice(item.priceCents)}`}
                          </p>
                        </div>
                        {isDealer && (
                          <div className="text-right">
                            <p className="font-bold text-neutral-900">
                              {formatPrice(item.priceCents * item.quantity)}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  {isDealer ? (
                    // BAYİ İÇİN: Toplam TL ve Kazanılan Puan
                    <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200 flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="text-sm text-neutral-600 mb-1">Toplam Tutar</p>
                        <p className="text-2xl font-bold text-neutral-900">
                          {formatPrice(totalPrice)}
                        </p>
                      </div>
                      {order.status === 'DELIVERED' && (
                        <div className="text-right">
                          <p className="text-sm text-neutral-600 mb-1">Kazandığınız AlinaPuan</p>
                          <div className="flex items-center justify-end gap-1">
                            <p className="text-2xl font-bold text-accent-600">
                              +{earnedCoins}
                            </p>
                            <span className="text-xl">₽</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // MÜŞTERİ İÇİN: Sadece Durum Bilgisi
                    <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200">
                      <p className="text-sm text-neutral-600">
                        {order.status === 'PENDING' && 'Siparişiniz bayi tarafından onaylanmayı bekliyor.'}
                        {order.status === 'APPROVED' && 'Siparişiniz onaylandı, hazırlanıyor.'}
                        {order.status === 'DELIVERED' && 'Siparişiniz teslim edildi. AlinaPuan hesabınıza eklendi!'}
                        {order.status === 'CANCELLED' && 'Sipariş iptal edildi.'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
