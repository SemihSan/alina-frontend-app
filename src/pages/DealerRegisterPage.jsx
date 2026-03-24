import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerDealer } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function DealerRegisterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
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

    if (!fullName || !email || !password || !companyName) {
      toast.error('Ad soyad, e-posta, şifre ve firma adı zorunludur.');
      return;
    }

    if (password !== passwordAgain) {
      toast.error('Şifreler uyuşmuyor.');
      return;
    }

    setLoading(true);
    try {
      await registerDealer({
        fullName,
        email,
        password,
        companyName,
        phone,
        address,
      });
      toast.success(
        '✨ Bayi başvurun alındı! Admin onayı sonrası aktif olacaktır.',
        { duration: 5000 }
      );
      setTimeout(() => {
        navigate('/dealer/rewards');
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Bayi başvurusu sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Alina Bayi Başvurusu</h1>
      <p className="text-sm text-slate-600 mb-6">
        Mağazanda Alina ürünleri satmak ve her satıştan AlinaPuan kazanmak için bayi hesabı oluştur.
        Başvurun onaylandığında ödül mağazasından puanlarınla elektronik ve yaşam ürünleri alabileceksin.
      </p>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-5"
      >
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Ad Soyad
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            E-posta
          </label>
          <input
            type="email"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Şifre
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Şifre (Tekrar)
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={passwordAgain}
              onChange={(e) => setPasswordAgain(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Firma Adı
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Telefon
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0 555 000 00 00"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Adres
          </label>
          <textarea
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="İl / İlçe / Mahalle..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-pink-600 text-white text-sm font-medium py-2.5 hover:bg-pink-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Başvuru gönderiliyor...' : 'Bayi başvurusu yap'}
        </button>
      </form>
    </div>
  );
}
