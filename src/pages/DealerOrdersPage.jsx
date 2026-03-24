import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { fetchDealerCustomerOrders, updateOrderStatus } from '../api/client';

function formatPrice(priceCents) {
  if (typeof priceCents !== 'number') return '-';
  return (priceCents / 100).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' TL';
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusBadge(status) {
  const statusConfig = {
    PENDING: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    APPROVED: { label: 'Onaylandı', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    DELIVERED: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800 border-green-200' },
    CANCELLED: { label: 'İptal', color: 'bg-red-100 text-red-800 border-red-200' },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
      {config.label}
    </span>
  );
}

export default function DealerOrdersPage() {
  const { user, dealer } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dealerInfo, setDealerInfo] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Bayi kontrolü - localStorage'dan direkt oku (useAuth bazen geç yüklenir)
  const [isDealer, setIsDealer] = useState(() => {
    if (typeof window !== 'undefined') {
      const dealerStr = localStorage.getItem('alina_dealer');
      const userStr = localStorage.getItem('alina_user');
      
      if (dealerStr) {
        try {
          const dealerObj = JSON.parse(dealerStr);
          return dealerObj && dealerObj.id ? true : false;
        } catch (e) {
          console.error('Dealer parse error:', e);
        }
      }
      
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          return userObj?.role === 'DEALER';
        } catch (e) {
          console.error('User parse error:', e);
        }
      }
    }
    return false;
  });

  // useAuth yüklendiğinde güncelle
  useEffect(() => {
    if (dealer || user?.role === 'DEALER') {
      setIsDealer(true);
    }
  }, [dealer, user]);

  if (!isDealer) {
    return <Navigate to="/profile" replace />;
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setError('');
      const data = await fetchDealerCustomerOrders();
      setOrders(data.orders || []);
      setDealerInfo(data.dealer || null);
    } catch (err) {
      console.error('Orders load error:', err);
      setError(err.message || 'Siparişler yüklenemedi');
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(orderId, newStatus, paymentMethod = null) {
    try {
      setUpdatingOrderId(orderId);
      const result = await updateOrderStatus(orderId, newStatus, paymentMethod);
      
      toast.success(result.message || 'Sipariş durumu güncellendi');
      
      // Listeyi güncelle
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus, paymentMethod, paymentDate: newStatus === 'DELIVERED' ? new Date() : order.paymentDate } : order
      ));
      
      // Modal'ı kapat
      setPaymentModalOpen(false);
      setSelectedOrderId(null);
    } catch (err) {
      console.error('Status update error:', err);
      toast.error(err.message || 'Durum güncellenemedi');
    } finally {
      setUpdatingOrderId(null);
    }
  }
  
  // Ödeme yöntemi seçimi için modal aç
  function openPaymentModal(orderId) {
    setSelectedOrderId(orderId);
    setPaymentModalOpen(true);
  }
  
  // Ödeme yöntemi ile tamamla
  function completeOrder(paymentMethod) {
    if (selectedOrderId) {
      handleStatusUpdate(selectedOrderId, 'DELIVERED', paymentMethod);
    }
  }

  // İstatistikler
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    approved: orders.filter(o => o.status === 'APPROVED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    totalRevenue: orders
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + o.totalPrice, 0),
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 md:py-16 border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-2">
                Müşteri Siparişleri
              </h1>
              <p className="text-neutral-600">
                {dealerInfo?.companyName} - Referans Kodu: <span className="font-mono font-bold text-purple-600">{dealerInfo?.referralCode}</span>
              </p>
            </div>
            <Link
              to="/profile"
              className="px-4 py-2 bg-white border-2 border-neutral-200 rounded-xl hover:border-purple-300 transition-colors text-sm font-semibold"
            >
              ← Geri
            </Link>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl p-4 border border-neutral-200">
              <p className="text-sm text-neutral-600 mb-1">Toplam Sipariş</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <p className="text-sm text-yellow-700 mb-1">Beklemede</p>
              <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-blue-700 mb-1">Onaylandı</p>
              <p className="text-2xl font-bold text-blue-800">{stats.approved}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <p className="text-sm text-green-700 mb-1">Teslim Edildi</p>
              <p className="text-2xl font-bold text-green-800">{stats.delivered}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <p className="text-sm text-purple-700 mb-1">Toplam Ciro</p>
              <p className="text-xl font-bold text-purple-800">{formatPrice(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sipariş Listesi */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Siparişler yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-800 font-semibold mb-2">❌ Hata</p>
            <p className="text-red-700">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Henüz Sipariş Yok</h2>
            <p className="text-neutral-600">
              Müşterileriniz referans kodunuzla sipariş verdiğinde burada görünecek.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-neutral-900">
                        Sipariş #{order.id.slice(0, 8)}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="space-y-1 text-sm text-neutral-600">
                      <p>
                        <span className="font-semibold">Müşteri:</span> {order.user.fullName} ({order.user.email})
                      </p>
                      <p>
                        <span className="font-semibold">Tarih:</span> {formatDate(order.createdAt)}
                      </p>
                      <p>
                        <span className="font-semibold">Referans Kodu:</span>{' '}
                        <span className="font-mono text-purple-600">{order.dealerReferenceCode || 'Yok'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-neutral-600 mb-1">Toplam Tutar</p>
                    <p className="text-2xl font-bold text-neutral-900">{formatPrice(order.totalPrice)}</p>
                    <p className="text-sm text-green-600 font-semibold">+{order.earnedCoins} Puan</p>
                  </div>
                </div>

                {/* Ürünler */}
                <div className="bg-neutral-50 rounded-xl p-4 mb-4">
                  <p className="text-sm font-semibold text-neutral-700 mb-2">Ürünler:</p>
                  <div className="space-y-2">
                    {JSON.parse(JSON.stringify(order.items)).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-neutral-700">
                          {item.quantity}x {item.productName}
                        </span>
                        <span className="font-semibold text-neutral-900">
                          {formatPrice(item.priceCents * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Durum Güncelleme Butonları */}
                <div className="flex flex-wrap gap-2">
                  {order.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'APPROVED')}
                        disabled={updatingOrderId === order.id}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-neutral-400 transition-colors text-sm font-semibold"
                      >
                        ✓ Onayla
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                        disabled={updatingOrderId === order.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-neutral-400 transition-colors text-sm font-semibold"
                      >
                        ✗ İptal Et
                      </button>
                    </>
                  )}
                  {order.status === 'APPROVED' && (
                    <button
                      onClick={() => openPaymentModal(order.id)}
                      disabled={updatingOrderId === order.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-neutral-400 transition-colors text-sm font-semibold"
                    >
                      💳 Ödeme Al & Tamamla
                    </button>
                  )}
                  {order.status === 'DELIVERED' && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-700 font-semibold">✓ Teslim Edildi</span>
                      {order.paymentMethod && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          {order.paymentMethod === 'CASH' ? '💵 Nakit' : '💳 Kart'}
                        </span>
                      )}
                      {order.paymentDate && (
                        <span className="text-xs text-neutral-500">
                          {formatDate(order.paymentDate)}
                        </span>
                      )}
                    </div>
                  )}
                  {order.status === 'CANCELLED' && (
                    <span className="text-red-700 font-semibold">✗ İptal Edildi</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Ödeme Yöntemi Seçim Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">💳 Ödeme Yöntemi Seçin</h3>
            <p className="text-neutral-600 mb-6">
              Müşteriden ödemeyi nasıl aldınız?
            </p>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => completeOrder('CASH')}
                disabled={updatingOrderId !== null}
                className="w-full px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg transition-all disabled:bg-neutral-400 flex items-center justify-center gap-3"
              >
                <span className="text-3xl">💵</span>
                <span>Nakit</span>
              </button>
              
              <button
                onClick={() => completeOrder('CARD')}
                disabled={updatingOrderId !== null}
                className="w-full px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-lg transition-all disabled:bg-neutral-400 flex items-center justify-center gap-3"
              >
                <span className="text-3xl">💳</span>
                <span>Kart (POS)</span>
              </button>
            </div>
            
            <button
              onClick={() => {
                setPaymentModalOpen(false);
                setSelectedOrderId(null);
              }}
              disabled={updatingOrderId !== null}
              className="w-full px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
