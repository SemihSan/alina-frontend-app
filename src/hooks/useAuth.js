// src/hooks/useAuth.js

import { useEffect, useState } from 'react';

// Bu hook, localStorage'daki user/dealer bilgilerini React state'e çeker
// ve login / logout / register sonrası otomatik güncellenmesini sağlar.
export function useAuth() {
  const [user, setUser] = useState(null);
  const [dealer, setDealer] = useState(null);

  // localStorage'dan bilgileri okuyup state'e atan yardımcı fonksiyon
  function loadFromStorage() {
    if (typeof window === 'undefined') return;

    const userStr = localStorage.getItem('alina_user');
    const dealerStr = localStorage.getItem('alina_dealer');

    setUser(userStr ? JSON.parse(userStr) : null);
    setDealer(dealerStr ? JSON.parse(dealerStr) : null);
  }

  useEffect(() => {
    // Sayfa ilk açıldığında localStorage oku
    loadFromStorage();

    // Login / register / logout olduğunda fırlatacağımız event
    function handleAuthChanged() {
      loadFromStorage();
    }

    window.addEventListener('alina:auth-changed', handleAuthChanged);

    return () => {
      window.removeEventListener('alina:auth-changed', handleAuthChanged);
    };
  }, []);

  // Çıkış fonksiyonu
  function logout() {
    if (typeof window !== 'undefined') {
      // Önce kullanıcıya özel sepet key'ini bul ve temizle
      const userStr = localStorage.getItem('alina_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const cartKey = `alina_cart_user_${user.id}`;
          localStorage.removeItem(cartKey);
        } catch (e) {
          // Hata olursa sessizce devam et
        }
      }

      localStorage.removeItem('alina_token');
      localStorage.removeItem('alina_user');
      localStorage.removeItem('alina_dealer');

      // Navbar'a "auth değişti" diye haber ver
      window.dispatchEvent(new Event('alina:auth-changed'));
    }
  }

  return { user, dealer, logout };
}
