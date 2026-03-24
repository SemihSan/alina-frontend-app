import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function UserRegisterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Eğer kullanıcı zaten giriş yapmışsa mağazaya yönlendir
  if (user) {
    return <Navigate to="/store" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !email || !password) {
      toast.error('Lütfen ad-soyad, e-posta ve şifreyi doldur.');
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        fullName,
        email,
        password,
        referralCode,
      });

      toast.success('✨ Kayıt başarılı! Hoş geldin!');
      setTimeout(() => {
        navigate('/store');
      }, 800);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 font-display">
            Cilt Bakım Ailesi
          </h1>
          <p className="text-neutral-600 leading-relaxed">
            Alina hesabı oluştur, premium ürünlere erişim sağla ve özel kampanyalardan yararlan
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">
            <p className="font-semibold text-sm">❌ Kayıt Hatası</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700">
            <p className="font-semibold text-sm">✨ Hoş Geldin!</p>
            <p className="text-sm mt-1">{success}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-900">
                👤 Ad Soyad
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                placeholder="Adını Soyadını Gir"
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-900">
                📧 E-posta Adresi
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="senin@email.com"
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-900">
                🔐 Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Referral Code Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-900">
                🎁 Referral Kodu (İsteğe Bağlı)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="BAYI-1234-5678"
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-neutral-600 mt-1.5">
                💡 Bir bayiden kod aldıysan buraya yaz. Bu sayede bayi da senden kazanır!
              </p>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2 py-2">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="terms" className="text-xs text-neutral-600">
                <a href="#" className="text-primary-600 font-semibold hover:underline">Kullanım Şartlarını</a> ve 
                <a href="#" className="text-primary-600 font-semibold hover:underline ml-1">Gizlilik Politikasını</a> Okudum ve Kabul Ediyorum
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                loading
                  ? 'bg-neutral-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-lg active:scale-95'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Kayıt yapılıyor...
                </span>
              ) : (
                'Ailemize Katıl'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-neutral-500">veya</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-neutral-600 mb-3">
              Zaten hesabın var mı?
            </p>
            <a
              href="/dealer/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-primary-300 text-primary-700 font-semibold hover:bg-primary-50 transition-all"
            >
              Giriş Yap →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
