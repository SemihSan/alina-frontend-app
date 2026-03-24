// src/App.jsx - ✨ MODERN PREMIUM REDESIGN

import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { API_BASE_URL, fetchFavorites } from './api/client';
import { useCart } from './hooks/useCart';

import HomePage from './pages/HomePage';
import AuthChoicePage from './pages/AuthChoicePage';
import DealerRewardsPage from './pages/DealerRewardsPage';
import CustomerRewardsPage from './pages/CustomerRewardsPage';
import StorePage from './pages/StorePage';
import ProductDetailPage from './pages/ProductDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import DealerLoginPage from './pages/DealerLoginPage';
import UserLoginPage from './pages/UserLoginPage';
import UserRegisterPage from './pages/UserRegisterPage';
import DealerRegisterPage from './pages/DealerRegisterPage';
import ProfilePage from './pages/ProfilePage';
import AskAlinaPage from './pages/AskAlinaPage';
import LeaderboardPage from './pages/LeaderboardPage';
import DealerOrdersPage from './pages/DealerOrdersPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';

function App() {
  const location = useLocation();
  const { totalItems } = useCart();
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [auth, setAuth] = useState({
    isLoggedIn: false,
    user: null,
    dealer: null,
  });

  // Mobil menü açıkken body scroll'u engelle
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Arama fonksiyonu - debounce ile
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const url = `${API_BASE_URL}/api/products?search=${encodeURIComponent(searchQuery)}`;
        console.log('🔍 Arama URL:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('✅ Arama sonuçları:', data);
        console.log('📊 Sonuç sayısı:', data.length);
        
        setSearchResults(data.slice(0, 6)); // İlk 6 sonuç
      } catch (error) {
        console.error('❌ Arama hatası:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Arama dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchOpen && !e.target.closest('.search-container')) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  function readAuthFromStorage() {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('alina_token');
    const userStr = localStorage.getItem('alina_user');
    const dealerStr = localStorage.getItem('alina_dealer');

    if (token && userStr) {
      setAuth({
        isLoggedIn: true,
        user: JSON.parse(userStr),
        dealer: dealerStr ? JSON.parse(dealerStr) : null,
      });
    } else {
      setAuth({
        isLoggedIn: false,
        user: null,
        dealer: null,
      });
    }
  }

  useEffect(() => {
    readAuthFromStorage();

    function handleAuthChanged() {
      readAuthFromStorage();
    }

    window.addEventListener('alina:auth-changed', handleAuthChanged);

    return () => {
      window.removeEventListener('alina:auth-changed', handleAuthChanged);
    };
  }, []);

  // Favori sayısını yükle
  useEffect(() => {
    async function loadFavoriteCount() {
      if (!auth.isLoggedIn) {
        setFavoriteCount(0);
        return;
      }
      
      try {
        const data = await fetchFavorites();
        setFavoriteCount(data.count || 0);
      } catch (err) {
        console.error('Favori sayısı yüklenemedi:', err);
        setFavoriteCount(0);
      }
    }
    
    loadFavoriteCount();
    
    // Favori değiştiğinde güncelle
    window.addEventListener('alina:favorites-changed', loadFavoriteCount);
    return () => window.removeEventListener('alina:favorites-changed', loadFavoriteCount);
  }, [auth.isLoggedIn]);

  const isDealer = auth.isLoggedIn && auth.user?.role === 'DEALER';

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('alina_token');
      localStorage.removeItem('alina_user');
      localStorage.removeItem('alina_dealer');
      
      // Auth state'ini sıfırla
      setAuth({ isLoggedIn: false, user: null });
      
      // Event dispatch et
      window.dispatchEvent(new Event('alina:auth-changed'));
      
      // Ana sayfaya yönlendir
      window.location.href = '/';
    }
  }

  const isActive = (path) =>
    location.pathname === path
      ? 'text-primary-600 font-semibold'
      : 'text-neutral-700 hover:text-primary-600';

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1f2937',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* ✨ MODERN NAVBAR - Premium Beauty Brand */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-neutral-100 transition-colors flex-shrink-0"
            aria-label="Menu"
          >
            <svg className="w-6 h-6 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-neutral-100 shadow-lg group-hover:shadow-xl transition-all duration-300 flex items-center justify-center">
              <img
                src={`${API_BASE_URL}/uploads/Alinaurunfotograflari/thumb.jpeg`}
                alt="Alina Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg sm:text-xl font-bold text-neutral-900 hidden sm:inline">
              Alina
            </span>
          </Link>

          {/* Arama Çubuğu */}
          <div className="relative flex-1 max-w-sm search-container hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Arama Sonuçları Dropdown */}
            {searchOpen && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-neutral-100 max-h-[400px] overflow-y-auto z-50">
                {searchLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-neutral-500 mt-3">Aranıyor...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                      >
                        <img
                          src={`${API_BASE_URL}${product.imageUrl || product.image}`}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-neutral-500">
                              {product.category?.name || 'Genel'}
                            </span>
                            <span className="text-xs font-semibold text-primary-600">
                              {(product.priceCents / 100).toFixed(2)} ₺
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                    <Link
                      to={`/store?search=${encodeURIComponent(searchQuery)}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="block text-center py-3 text-sm text-primary-600 hover:text-primary-700 font-medium border-t border-neutral-100 mt-2"
                    >
                      Tüm sonuçları gör ({searchResults.length}+)
                    </Link>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <svg
                      className="w-12 h-12 text-neutral-300 mx-auto mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <p className="text-sm text-neutral-600 font-medium">Sonuç bulunamadı</p>
                    <p className="text-xs text-neutral-500 mt-1">Başka bir arama deneyin</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
            <Link
              to="/store"
              className={`text-sm font-medium transition-colors duration-200 relative whitespace-nowrap ${isActive('/store')}`}
            >
              Mağaza
              {location.pathname === '/store' && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full" />
              )}
            </Link>
            
            {/* Ödül Mağazası - Dinamik Link (Bayi/Müşteri) */}
            <Link
              to={isDealer ? '/dealer/rewards' : '/customer/rewards'}
              className={`text-sm font-medium transition-colors duration-200 relative whitespace-nowrap ${
                isActive('/dealer/rewards') || isActive('/customer/rewards') ? 'text-primary-600' : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              🎁 Ödül Mağazası
              {(location.pathname === '/dealer/rewards' || location.pathname === '/customer/rewards') && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full" />
              )}
            </Link>
            
            {/* Sıralama - Sadece Bayi için */}
            {isDealer && (
              <Link
                to="/leaderboard"
                className={`text-sm font-medium transition-colors duration-200 relative whitespace-nowrap ${isActive('/leaderboard')}`}
              >
                🏆 Sıralama
                {location.pathname === '/leaderboard' && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full" />
                )}
              </Link>
            )}
            
            <Link
              to="/ask-alina"
              className={`text-sm font-medium transition-colors duration-200 relative whitespace-nowrap ${isActive('/ask-alina')}`}
            >
              Alina'ya Sor
              {location.pathname === '/ask-alina' && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full" />
              )}
            </Link>
          </nav>

          {/* Favoriler & Sepet Icons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Mobil Arama Butonu */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-100 transition-colors duration-200"
            >
              <svg
                className="h-5 w-5 text-neutral-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            <Link
              to="/favorites"
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-100 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-neutral-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {favoriteCount}
                </span>
              )}
            </Link>

            {/* Sepet Icon */}
            <Link
              to="/cart"
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-100 transition-colors duration-200"
            >
              <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-neutral-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold rounded-full">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
          </div>

          {/* Auth Section */}
          <div className="hidden sm:flex items-center gap-3">
            {!auth.isLoggedIn ? (
              <>
                <Link
                  to="/auth"
                  className="hidden md:inline-flex px-4 py-2 rounded-full text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors duration-200"
                >
                  Giriş/Kayıt
                </Link>
                <Link
                  to="/store"
                  className="inline-flex px-4 sm:px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full text-sm font-medium text-white hover:shadow-lg transition-all duration-200"
                >
                  Mağaza
                </Link>
              </>
            ) : (
              <>
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-[11px] text-neutral-500 font-medium">
                    {auth.user?.fullName?.split(' ')[0]}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {isDealer ? 'Bayi' : 'Müşteri'}
                  </span>
                </div>

                <Link
                  to="/profile"
                  className="hidden lg:inline-flex px-4 py-2 rounded-full text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors duration-200"
                >
                  Profil
                </Link>

                <Link
                  to="/orders"
                  className="px-3 sm:px-4 py-2 rounded-full text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors duration-200"
                >
                  Siparişler
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 sm:px-4 py-2 bg-neutral-100 rounded-full text-sm font-medium text-neutral-900 hover:bg-neutral-200 transition-colors duration-200"
                >
                  Çıkış
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobil Arama Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 animate-fadeIn"
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery('');
            }}
          />
          
          {/* Modal Content */}
          <div className="absolute top-0 left-0 right-0 bg-white shadow-2xl animate-slideDown">
            <div className="p-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-neutral-100 transition-colors flex-shrink-0"
                >
                  <svg className="w-6 h-6 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Mobil Arama Sonuçları */}
            <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
              {searchQuery.trim().length < 2 ? (
                <div className="p-8 text-center">
                  <svg
                    className="w-16 h-16 text-neutral-300 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p className="text-sm text-neutral-600 font-medium">Ürün aramaya başlayın</p>
                  <p className="text-xs text-neutral-500 mt-1">En az 2 karakter girin</p>
                </div>
              ) : searchLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-neutral-500 mt-4">Aranıyor...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-neutral-100">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-4 px-4 py-4 hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
                    >
                      <img
                        src={`${API_BASE_URL}${product.imageUrl || product.image}`}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 line-clamp-2">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                            {product.category?.name || 'Genel'}
                          </span>
                          <span className="text-sm font-bold text-primary-600">
                            {(product.priceCents / 100).toFixed(2)} ₺
                          </span>
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-neutral-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                  <Link
                    to={`/store?search=${encodeURIComponent(searchQuery)}`}
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="block text-center py-4 text-sm text-primary-600 font-semibold hover:bg-primary-50 active:bg-primary-100 transition-colors"
                  >
                    Tüm sonuçları gör →
                  </Link>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <svg
                    className="w-16 h-16 text-neutral-300 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p className="text-sm text-neutral-600 font-medium">Sonuç bulunamadı</p>
                  <p className="text-xs text-neutral-500 mt-1">"{searchQuery}" için ürün bulunamadı</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Menu */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 md:hidden overflow-y-auto shadow-2xl animate-slideInLeft">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 shadow-md flex items-center justify-center">
                    <img
                      src={`${API_BASE_URL}/uploads/Alinaurunfotograflari/thumb.jpeg`}
                      alt="Alina Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-2xl font-semibold text-neutral-900">Alina</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Info */}
              {auth.isLoggedIn && (
                <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {auth.user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900">{auth.user?.fullName}</div>
                      <div className="text-sm text-neutral-600">{isDealer ? '🏆 Bayi Hesabı' : '👤 Müşteri'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="space-y-1">
                <Link
                  to="/store"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neutral-50 transition-colors text-neutral-700 hover:text-primary-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="font-medium">Mağaza</span>
                </Link>

                {/* Ödül Mağazası - Dinamik (Bayi/Müşteri) */}
                <Link
                  to={isDealer ? '/dealer/rewards' : '/customer/rewards'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neutral-50 transition-colors text-neutral-700 hover:text-primary-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  <span className="font-medium">🎁 Ödül Mağazası</span>
                </Link>

                {/* Sıralama - Sadece Bayi için */}
                {isDealer && (
                  <Link
                    to="/leaderboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neutral-50 transition-colors text-neutral-700 hover:text-primary-600"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="font-medium">🏆 Sıralama</span>
                  </Link>
                )}

                <Link
                  to="/ask-alina"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neutral-50 transition-colors text-neutral-700 hover:text-primary-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Alina'ya Sor</span>
                </Link>

                <div className="border-t border-neutral-200 my-3" />

                <Link
                  to="/favorites"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neutral-50 transition-colors text-neutral-700 hover:text-primary-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="font-medium">Favorilerim</span>
                  {favoriteCount > 0 && (
                    <span className="ml-auto px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      {favoriteCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neutral-50 transition-colors text-neutral-700 hover:text-primary-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium">Sepetim</span>
                  {totalItems > 0 && (
                    <span className="ml-auto px-2 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </nav>

              {/* User Actions */}
              {auth.isLoggedIn ? (
                <div className="space-y-1 pt-3 border-t border-neutral-200">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neutral-50 transition-colors text-neutral-700 hover:text-primary-600"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Profilim</span>
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neutral-50 transition-colors text-neutral-700 hover:text-primary-600"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span className="font-medium">Siparişlerim</span>
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-red-600 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Çıkış Yap</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-3 border-t border-neutral-200">
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-center hover:shadow-lg transition-all"
                  >
                    Giriş Yap / Kayıt Ol
                  </Link>
                  <Link
                    to="/dealer/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-6 py-3 border-2 border-primary-200 text-primary-600 rounded-xl font-semibold text-center hover:bg-primary-50 transition-all"
                  >
                    Bayi Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ✨ PAGE CONTENT */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthChoicePage />} />
          <Route path="/login" element={<UserLoginPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/dealer/rewards" element={<DealerRewardsPage />} />
          <Route path="/customer/rewards" element={<CustomerRewardsPage />} />
          <Route path="/dealer/orders" element={<DealerOrdersPage />} />
          <Route path="/dealer/login" element={<DealerLoginPage />} />
          <Route path="/register" element={<UserRegisterPage />} />
          <Route path="/dealer/register" element={<DealerRegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/ask-alina" element={<AskAlinaPage />} />
          <Route path="/odeme" element={<PaymentPage />} />
          <Route path="/odeme-basarili" element={<PaymentSuccessPage />} />
          <Route path="/odeme-hata" element={<PaymentFailurePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* ✨ MODERN FOOTER */}
      <footer className="bg-white border-t border-neutral-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900 font-display">Alina</h3>
              <p className="text-sm text-neutral-600">
                Cilt bakım ve bayilik ödül sistemi
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-neutral-900">Ürünler</h4>
              <ul className="space-y-1 text-sm text-neutral-600">
                <li><Link to="/store" className="hover:text-primary-600 transition-colors">Mağaza</Link></li>
                <li><Link to="/dealer/rewards" className="hover:text-primary-600 transition-colors">Ödül Mağazası</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-neutral-900">Şirket</h4>
              <ul className="space-y-1 text-sm text-neutral-600">
                <li><a href="#" className="hover:text-primary-600 transition-colors">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">İletişim</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-neutral-900">Yasal</h4>
              <ul className="space-y-1 text-sm text-neutral-600">
                <li><a href="#" className="hover:text-primary-600 transition-colors">Gizlilik</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Şartlar</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-neutral-500">
              © {new Date().getFullYear()} Alina. Tüm hakları saklıdır.
            </p>
            <p className="text-xs text-neutral-500">
              AlinaPuan Bayilik Sistemi · Beta v1.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
