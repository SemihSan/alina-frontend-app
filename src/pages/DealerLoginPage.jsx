import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { dealerLogin } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function DealerLoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('semihbayi@example.com'); // test için default
  const [password, setPassword] = useState('123456');          // test için default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Eğer kullanıcı zaten giriş yapmışsa profil sayfasına yönlendir
  if (user) {
    return <Navigate to="/profile" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await dealerLogin({ email, password });
      toast.success('🎉 Hoş geldin! Profil sayfasına yönlendiriliyorsun...');
      // Biraz bekleyip bayi ödül mağazasına yönlendir
      setTimeout(() => {
        navigate('/dealer/rewards');
      }, 800);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Giriş sırasında bir hata oluştu.');
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
            Bayi Paneline Hoş Geldin
          </h1>
          <p className="text-neutral-600 leading-relaxed">
            Kazandığın AlinaPuan'ları ödül mağazasından çek, satışlarını takip et
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">
            <p className="font-semibold text-sm">❌ Giriş Başarısız</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700">
            <p className="font-semibold text-sm">✨ Başarılı!</p>
            <p className="text-sm mt-1">{success}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="bayi@example.com"
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
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="remember" className="text-sm text-neutral-600">
                Beni hatırla
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
                  Giriş yapılıyor...
                </span>
              ) : (
                'Panele Giriş Yap'
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

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-neutral-600 mb-3">
              Henüz bayi değil misin?
            </p>
            <a
              href="/dealer/register"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-primary-300 text-primary-700 font-semibold hover:bg-primary-50 transition-all"
            >
              Bayi Başvurusu Yap →
            </a>
          </div>
        </div>

        {/* Test Credentials */}
        <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-accent-900 mb-2">🧪 Test Hesabı</p>
          <div className="space-y-1 text-xs text-accent-800">
            <p>Email: <span className="font-mono font-semibold">semihbayi@example.com</span></p>
            <p>Şifre: <span className="font-mono font-semibold">123456</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
