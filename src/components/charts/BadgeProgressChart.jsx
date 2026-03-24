// src/components/charts/BadgeProgressChart.jsx
import React, { useEffect } from 'react';
import { RadialBarChart, RadialBar, Legend, Tooltip, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import confetti from 'canvas-confetti';
import { FaStar, FaMedal, FaTrophy, FaCrown } from 'react-icons/fa';

const BadgeProgressChart = ({ data }) => {
  if (!data) {
    return <div className="text-center text-slate-500">İlerleme verileri yükleniyor...</div>;
  }

  const { currentReferrals, nextBadgeGoal, currentBadgeName, nextBadgeName } = data;
  const percentage = nextBadgeGoal > 0 ? (currentReferrals / nextBadgeGoal) * 100 : 100;
  const referralsNeeded = Math.max(0, nextBadgeGoal - currentReferrals);

  // Rozet ikonlarını belirle
  const badgeIcons = {
    'STANDARD': FaStar,
    'BRONZE': FaMedal,
    'GOLD': FaTrophy,
    'PLATINUM': FaCrown,
  };

  // Rozet renklerini belirle
  const badgeColors = {
    'STANDARD': '#94a3b8', // slate-400 (şeffaf/gri)
    'BRONZE': '#f97316',   // orange-500
    'GOLD': '#eab308',     // yellow-500
    'PLATINUM': '#a855f7', // purple-500
  };

  // Sonraki rozet rengini al (nextBadgeName: 'Bronz', 'Altın', 'Platin')
  const nextBadgeKey = nextBadgeName === 'Bronz' ? 'BRONZE' 
                     : nextBadgeName === 'Altın' ? 'GOLD'
                     : nextBadgeName === 'Platin' ? 'PLATINUM'
                     : 'PLATINUM';
  
  const chartColor = nextBadgeName ? badgeColors[nextBadgeKey] : badgeColors['PLATINUM'];
  const NextBadgeIcon = nextBadgeName ? badgeIcons[nextBadgeKey] : badgeIcons['PLATINUM'];

  // Konfeti patlatma fonksiyonu
  const celebrateWithConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: [chartColor, '#fbbf24', '#f472b6', '#a78bfa'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: [chartColor, '#fbbf24', '#f472b6', '#a78bfa'],
      });
    }, 250);
  };

  // Eğer hedefe ulaşıldıysa konfeti patlat
  useEffect(() => {
    if (!currentBadgeName) return;

    // LocalStorage'dan son görülen rozeti al
    const lastSeenBadge = localStorage.getItem('alina_last_seen_badge');
    
    // Eğer rozet yükselmişse (örn: STANDARD → BRONZE)
    const badgeOrder = ['STANDARD', 'BRONZE', 'GOLD', 'PLATINUM'];
    const currentBadgeKey = currentBadgeName === 'Standart' ? 'STANDARD'
                          : currentBadgeName === 'Bronz' ? 'BRONZE'
                          : currentBadgeName === 'Altın' ? 'GOLD'
                          : currentBadgeName === 'Platin' ? 'PLATINUM'
                          : 'STANDARD';
    
    // İlk kez giriş yapıyorsa veya rozet yükselmişse
    if (!lastSeenBadge || (lastSeenBadge !== currentBadgeKey && badgeOrder.indexOf(currentBadgeKey) > badgeOrder.indexOf(lastSeenBadge))) {
      // Rozet yükseldiyse konfeti patlat!
      if (lastSeenBadge && lastSeenBadge !== currentBadgeKey) {
        setTimeout(() => {
          celebrateWithConfetti();
        }, 500); // Sayfa yüklendikten 0.5 saniye sonra
      }
      // Yeni rozeti kaydet
      localStorage.setItem('alina_last_seen_badge', currentBadgeKey);
    }
    
    // Ayrıca hedefe ulaşılmışsa da göster (mevcut davranış)
    if (referralsNeeded === 0 && nextBadgeName) {
      celebrateWithConfetti();
    }
  }, [referralsNeeded, nextBadgeName, currentBadgeName]);

  const chartData = [
    {
      name: nextBadgeName || 'Son Seviye',
      uv: currentReferrals,
      pv: nextBadgeGoal,
      fill: chartColor,
    },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Badge Icon - Büyük rozet ikonu */}
      <div className="mb-6 relative">
        <div 
          className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg animate-pulse"
          style={{ backgroundColor: `${chartColor}20`, border: `3px solid ${chartColor}` }}
        >
          <NextBadgeIcon className="w-12 h-12" style={{ color: chartColor }} />
        </div>
        {referralsNeeded === 0 && nextBadgeName && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
            ✓
          </div>
        )}
      </div>

      <h3 className="font-semibold text-slate-900 mb-6 text-center">
        {nextBadgeName ? `${nextBadgeName} Rozetine İlerleme` : '✨ En Yüksek Rozet'}
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <RadialBarChart
          innerRadius="60%"
          outerRadius="90%"
          data={chartData}
          startAngle={90}
          endAngle={-270}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, nextBadgeGoal]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: '#f3f4f6' }}
            dataKey="uv"
            angleAxisId={0}
            fill={chartColor}
            cornerRadius={8}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
            labelStyle={{ color: '#1f2937' }}
            formatter={(value) => `${value} referans`}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="text-center mt-6 space-y-3 w-full">
        <p className="text-3xl font-bold" style={{ color: chartColor }}>
          {currentReferrals} / {nextBadgeGoal}
        </p>
        {nextBadgeName ? (
          <p className="text-sm text-slate-600">
            {referralsNeeded > 0 
              ? `${referralsNeeded} referans daha gerekiyor` 
              : '🎉 Rozet yükseltmeye hak kazandın!'}
          </p>
        ) : (
          <p className="text-sm text-emerald-600 font-medium">🏆 En yüksek seviyeye ulaştın!</p>
        )}
        <div className="mt-4 w-full max-w-xs mx-auto bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{ 
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: chartColor
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default BadgeProgressChart;
