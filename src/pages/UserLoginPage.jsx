import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userLogin } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function UserLoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    if (!email || !password) {
      toast.error('Lütfen e-posta ve şifreyi doldur.');
      return;
    }

    setLoading(true);
    try {
      await userLogin({ email, password });
      toast.success('Giriş başarılı! Hoş geldin 🎉');
      setTimeout(() => {
        navigate('/store');
      }, 800);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Giriş sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl hover:shadow-lg transition-all">
            <span className="text-2xl font-bold text-white">A</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Müşteri Giriş</h1>
          <p className="text-slate-600">
            Alina'ya hoş geldin! Devam etmek için giriş yap.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
            <span className="text-lg mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex items-start gap-2">
            <span className="text-lg mt-0.5">✓</span>
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              E-posta Adresi
            </label>
            <input
              type="email"
              placeholder="ornek@email.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Şifre
            </label>
            <input
              type="password"
              placeholder="Şifrenizi girin"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 hover:shadow-lg disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? '⏳ Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-600">yada</span>
          </div>
        </div>

        {/* Alt Linkler */}
        <div className="space-y-3">
          <p className="text-center text-sm text-slate-600">
            Henüz hesabın yok mu?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Kayıt ol
            </Link>
          </p>
          <Link
            to="/"
            className="block text-center px-4 py-2 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all duration-200"
          >
            ← Geri Dön
          </Link>
        </div>

      </div>
    </div>
  );
}
