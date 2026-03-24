// src/hooks/useCart.js

import { useState, useEffect } from 'react';
import * as api from '../api/client';
import { useAuth } from './useAuth';

export function useCart() {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sepeti yükle
  const fetchCart = async () => {
    if (!user) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${api.API_BASE_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('alina_token')}`,
        },
      });
      
      const data = await response.json();
      
      if (data.ok) {
        setCart(data.cart.items || []);
      }
    } catch (err) {
      console.error('Sepet yüklenemedi:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı değiştiğinde sepeti yükle
  useEffect(() => {
    fetchCart();
  }, [user?.id]);

  // Cart changed eventini dinle (diğer componentlerden gelen değişiklikler için)
  useEffect(() => {
    const handleCartChanged = () => {
      fetchCart();
    };

    window.addEventListener('alina:cart-changed', handleCartChanged);
    return () => window.removeEventListener('alina:cart-changed', handleCartChanged);
  }, [user?.id]);

  // Sepete ürün ekle
  const addToCart = async (product) => {
    if (!user) {
      throw new Error('Sepete ürün eklemek için giriş yapmalısınız.');
    }

    if (product.isRewardProduct) {
      // Ödül ürünleri sepete eklenmez
      return;
    }

    try {
      const response = await fetch(`${api.API_BASE_URL}/api/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('alina_token')}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setCart(data.cart.items || []);
        
        // Global event dispatch et (header badge için)
        window.dispatchEvent(new Event('alina:cart-changed'));
      }
    } catch (err) {
      console.error('Sepete eklenemedi:', err);
      throw err;
    }
  };

  // Sepetten ürün çıkar
  const removeFromCart = async (itemId) => {
    if (!user) return;

    try {
      const response = await fetch(`${api.API_BASE_URL}/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('alina_token')}`,
        },
      });

      const data = await response.json();

      if (data.ok) {
        setCart(data.cart.items || []);
        window.dispatchEvent(new Event('alina:cart-changed'));
      }
    } catch (err) {
      console.error('Sepetten çıkarılamadı:', err);
      throw err;
    }
  };

  // Ürün miktarını güncelle
  const updateQuantity = async (itemId, quantity) => {
    if (!user) return;

    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    try {
      const response = await fetch(`${api.API_BASE_URL}/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('alina_token')}`,
        },
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();

      if (data.ok) {
        setCart(data.cart.items || []);
        window.dispatchEvent(new Event('alina:cart-changed'));
      }
    } catch (err) {
      console.error('Miktar güncellenemedi:', err);
      throw err;
    }
  };

  // Sepeti temizle
  const clearCart = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${api.API_BASE_URL}/api/cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('alina_token')}`,
        },
      });

      const data = await response.json();

      if (data.ok) {
        setCart([]);
        window.dispatchEvent(new Event('alina:cart-changed'));
      }
    } catch (err) {
      console.error('Sepet temizlenemedi:', err);
      throw err;
    }
  };

  // Toplam ürün sayısı
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Toplam fiyat (kuruş cinsinden)
  const totalPriceCents = cart.reduce(
    (sum, item) => {
      // Ürün silinmişse 0 döner
      if (!item.product) return sum;
      return sum + item.product.priceCents * item.quantity;
    },
    0
  );

  // Toplam fiyat (TL)
  const totalPrice = totalPriceCents / 100;

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPriceCents,
    totalPrice,
    loading,
    error,
    refetch: fetchCart, // Manuel yenileme için
  };
}

