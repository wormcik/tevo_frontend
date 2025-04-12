import { useNavigate } from 'react-router-dom';

export default function MainPage() {
  const navigate = useNavigate();

  const actions = [
    { title: '🧾 Süt Talebi Oluştur', route: '/talepOlustur' },
    { title: '📜 Taleplerim', route: '/talepGecmisi' },
    { title: '👤 Profilim', route: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-100 flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-2xl w-full text-center border border-blue-200">
        <h1 className="text-4xl font-extrabold text-pink-600 mb-4">
          Hoş Geldiniz 🌸
        </h1>
        <p className="text-gray-700 text-lg mb-6">
          <strong>TurabJerseySüt'e</strong> hoş geldiniz! Buradan süt talebi oluşturabilir, önceki taleplerinizi görebilir ve profil bilgilerinizi düzenleyebilirsiniz.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 mt-6">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => navigate(action.route)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-lg shadow-md transition-transform hover:scale-105"
            >
              {action.title}
            </button>
          ))}
        </div>

        <p className="mt-8 text-sm text-gray-500 italic">
          Senin için özel hazırlandı 💖
        </p>
      </div>
    </div>
  );
}
