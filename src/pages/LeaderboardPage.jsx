// src/pages/LeaderboardPage.jsx
import React, { useState, useEffect } from 'react';
import { fetchLeaderboard } from '../api/client';
import { FaMedal, FaTrophy, FaCrown, FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all'); // 'week', 'month', 'all'
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [totalDealers, setTotalDealers] = useState(0);
  const { dealer } = useAuth();

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetchLeaderboard(period);
      
      if (response.ok) {
        setLeaderboard(response.leaderboard);
        setCurrentUserRank(response.currentUserRank);
        setTotalDealers(response.totalDealers);
      }
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      toast.error('Sıralama yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badge) => {
    const icons = {
      'STANDARD': <FaStar className="w-6 h-6 text-slate-400" />,
      'BRONZE': <FaMedal className="w-6 h-6 text-orange-500" />,
      'GOLD': <FaTrophy className="w-6 h-6 text-yellow-500" />,
      'PLATINUM': <FaCrown className="w-6 h-6 text-purple-500" />,
    };
    return icons[badge] || icons['STANDARD'];
  };

  const getBadgeGradient = (badge) => {
    const gradients = {
      'STANDARD': 'from-slate-400 to-slate-500',
      'BRONZE': 'from-orange-400 to-orange-600',
      'GOLD': 'from-yellow-400 to-yellow-600',
      'PLATINUM': 'from-purple-400 to-purple-600',
    };
    return gradients[badge] || gradients['STANDARD'];
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  const getRankBg = (rank, isCurrentUser) => {
    if (isCurrentUser) {
      return 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500';
    }
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-slate-300 to-slate-400';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600';
    return 'bg-gradient-to-r from-slate-600 to-slate-700';
  };

  const periodLabels = {
    week: 'Bu Hafta',
    month: 'Bu Ay',
    all: 'Tüm Zamanlar',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Sıralama yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 mb-3 drop-shadow-lg animate-pulse">
            🏆 Bayi Sıralaması
          </h1>
          <p className="text-slate-300 text-lg">
            En çok referans yapan bayiler
          </p>
        </div>

        {/* Period Selector */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 p-5 mb-6">
          <div className="flex gap-3 justify-center flex-wrap">
            {['week', 'month', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
                  period === p
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/50'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Current User Rank Card */}
        {currentUserRank && (
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl shadow-purple-500/50 p-6 mb-6 border-2 border-yellow-400">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-white">
              <div className="text-center">
                <p className="text-purple-200 text-sm mb-2">Sıralaman</p>
                <p className="text-4xl font-black">
                  {getRankMedal(currentUserRank)}
                </p>
              </div>
              <div className="text-center sm:border-x border-purple-300/30">
                <p className="text-purple-200 text-sm mb-2">Toplam Bayi</p>
                <p className="text-4xl font-black">{totalDealers}</p>
              </div>
              <div className="text-center flex flex-col items-center justify-center">
                <p className="text-purple-200 text-sm mb-2">Rozet</p>
                <p className="text-3xl flex items-center justify-center">
                  {getBadgeIcon(leaderboard.find(d => d.isCurrentUser)?.badge || 'STANDARD')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard List */}
        <div className="space-y-4">
          {leaderboard.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 text-center text-slate-400">
              Henüz sıralama verisi yok
            </div>
          ) : (
            <>
              {leaderboard.map((dealerItem) => (
                <div
                  key={dealerItem.id}
                  className={`relative rounded-2xl p-6 border-2 transition-all hover:scale-[1.02] shadow-xl ${
                    dealerItem.isCurrentUser 
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-yellow-400 shadow-purple-500/50 animate-pulse' 
                      : 'bg-slate-800/50 backdrop-blur-xl border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {/* Rank Badge */}
                  <div className={`absolute -top-3 -left-3 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black shadow-2xl border-4 ${
                    dealerItem.isCurrentUser ? 'border-yellow-300' : 'border-slate-900'
                  } ${getRankBg(dealerItem.rank, dealerItem.isCurrentUser)}`}>
                    {getRankMedal(dealerItem.rank)}
                  </div>

                  <div className="flex items-center gap-6 ml-8">
                    {/* Company Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-xl font-bold truncate ${
                          dealerItem.isCurrentUser ? 'text-white' : 'text-slate-100'
                        }`}>
                          {dealerItem.companyName}
                        </h3>
                        {dealerItem.isCurrentUser && (
                          <span className="bg-yellow-400 text-slate-900 text-xs px-3 py-1 rounded-full font-black">
                            SEN
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r ${getBadgeGradient(dealerItem.badge)} text-white font-bold shadow-lg`}>
                          {getBadgeIcon(dealerItem.badge)}
                          {dealerItem.badgeInfo.name}
                        </span>
                        <span className={`font-mono text-xs ${
                          dealerItem.isCurrentUser ? 'text-purple-200' : 'text-slate-400'
                        }`}>
                          {dealerItem.referralCode}
                        </span>
                      </div>
                    </div>

                    {/* Referral Count */}
                    <div className="text-right">
                      <div className={`text-4xl font-black ${
                        dealerItem.isCurrentUser ? 'text-yellow-300' : 'text-purple-400'
                      }`}>
                        {dealerItem.referralCount}
                      </div>
                      <div className={`text-xs font-semibold ${
                        dealerItem.isCurrentUser ? 'text-purple-200' : 'text-slate-500'
                      }`}>
                        referans
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">
                Nasıl Sıralamada Yükselirim?
              </h4>
              <p className="text-sm text-blue-800">
                Referans kodunuzu paylaşın! Her yeni kullanıcı kaydında sıralamada yükselir, 
                rozet seviyeniz artar ve daha fazla ödül kazanırsınız.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
