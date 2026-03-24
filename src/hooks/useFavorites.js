// src/hooks/useFavorites.js
import { useState, useEffect } from 'react';
import { addToFavorites, removeFromFavorites, checkFavorite } from '../api/client';
import toast from 'react-hot-toast';

export function useFavorites() {
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState({});

  const isFavorite = (productId) => {
    return favorites.has(productId);
  };

  const toggleFavorite = async (productId, productName) => {
    const wasFavorite = isFavorite(productId);
    
    try {
      setLoading(prev => ({ ...prev, [productId]: true }));
      
      if (wasFavorite) {
        await removeFromFavorites(productId);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        toast.success('Favorilerden çıkarıldı');
      } else {
        await addToFavorites(productId);
        setFavorites(prev => new Set([...prev, productId]));
        toast.success(`${productName} favorilere eklendi!`);
      }
      
      // Favori sayısını güncelle
      window.dispatchEvent(new Event('alina:favorites-changed'));
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const checkProductFavorite = async (productId) => {
    try {
      const data = await checkFavorite(productId);
      if (data.isFavorite) {
        setFavorites(prev => new Set([...prev, productId]));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isLoading = (productId) => {
    return loading[productId] || false;
  };

  return {
    isFavorite,
    toggleFavorite,
    checkProductFavorite,
    isLoading
  };
}
