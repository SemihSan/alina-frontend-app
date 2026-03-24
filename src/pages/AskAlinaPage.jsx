import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function AskAlinaPage() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'alina',
      text: '✨ Merhaba! Ben Alina, kişisel güzellik asistanın. Cilt bakımı ve ürün önerileri hakkında sana yardımcı olmak için buradayım.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedUser = localStorage.getItem('alina_user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  const isLoggedIn = !!user;

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    // Simulated Alina response
    setTimeout(() => {
      const alinaResponse = {
        id: messages.length + 2,
        sender: 'alina',
        text: '💬 Bu soru hakkında düşünüyorum... Yakında daha detaylı cevap verebileceğim!',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, alinaResponse]);
    }, 800);
  };

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-2xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full mb-4">
              <span className="text-2xl">✨</span>
              <span className="text-sm font-semibold text-primary-700">AI Güzellik Asistanı</span>
            </div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-3 font-display">
              Alina'ya Sor 💬
            </h1>
            <p className="text-lg text-neutral-600">
              Kişisel güzellik danışmanın sana her zaman yardımcı olmaya hazır
            </p>
          </div>

          {/* Benefits Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold text-neutral-900 mb-2">Kişisel Tavsiyeler</h3>
              <p className="text-sm text-neutral-600">Cilt tipin ve rutinine uygun öneriler</p>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center">
              <div className="text-4xl mb-3">💾</div>
              <h3 className="font-semibold text-neutral-900 mb-2">Geçmiş Hatırlaması</h3>
              <p className="text-sm text-neutral-600">Alina tüm konuşmalarını hatırlıyor</p>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center">
              <div className="text-4xl mb-3">🛍️</div>
              <h3 className="font-semibold text-neutral-900 mb-2">Ürün Önerileri</h3>
              <p className="text-sm text-neutral-600">Mağazamızdan en uygun ürünleri öner</p>
            </div>
          </div>

          {/* Why Register Box */}
          <div className="bg-accent-50 border border-accent-200 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Neden Kayıt Olmalısın?</h2>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <span className="text-accent-600 mt-1">✓</span>
                <span className="text-neutral-700">Alina cilt profilini öğrenip özel tavsiyeler verir</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-600 mt-1">✓</span>
                <span className="text-neutral-700">Geçmiş soruların ve cevapların kaydedilir</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-600 mt-1">✓</span>
                <span className="text-neutral-700">Önerilen ürünleri direkt mağazamızdan satın al</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-600 mt-1">✓</span>
                <span className="text-neutral-700">AlinaCoin kazan ve ödül mağazasında kullan</span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link
              to="/register"
              className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl text-white font-semibold hover:shadow-lg transition-all"
            >
              🌸 Müşteri Olarak Kayıt Ol
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/dealer/register"
                className="inline-flex items-center justify-center px-4 py-3 bg-white border border-neutral-300 rounded-xl text-neutral-900 font-semibold hover:bg-neutral-50 transition-all"
              >
                💼 Bayi Ol
              </Link>
              <Link
                to="/dealer/login"
                className="inline-flex items-center justify-center px-4 py-3 bg-white border border-neutral-300 rounded-xl text-neutral-900 font-semibold hover:bg-neutral-50 transition-all"
              >
                🔑 Giriş Yap
              </Link>
            </div>
          </div>

          {/* Bottom CTA */}
          <p className="text-center text-sm text-neutral-600 mt-6">
            Zaten hesabın var mı?{' '}
            <Link to="/dealer/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Giriş yap →
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Logged in - Chat interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-3xl mx-auto px-6 h-screen flex flex-col">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between py-6 border-b border-neutral-200">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 font-display">✨ Alina</h1>
            <p className="text-sm text-neutral-600">Kişisel güzellik asistanın</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-accent-100 rounded-full">
            <span className="w-2 h-2 bg-accent-600 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-accent-700">Aktif</span>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">💬</div>
                <p className="text-neutral-600">Sohbet başlatmak için aşağıya mesaj yaz</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-none'
                      : 'bg-white border border-neutral-200 text-neutral-900 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-primary-100' : 'text-neutral-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="py-6 border-t border-neutral-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Sorun var mı? Alina'ya sor..."
              className="flex-1 px-4 py-3 bg-white border border-neutral-300 rounded-full text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✉️
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-3">
            💡 Alina hakkında daha fazla bilgi için iletişime geç
          </p>
        </div>
      </div>
    </div>
  );
}

export default AskAlinaPage;
