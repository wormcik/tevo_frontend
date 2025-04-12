import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Menu(props) {
  const role = props.role;
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("mainWelcomeShown");
    if (!seen) {
      setShowModal(true);
      localStorage.setItem("mainWelcomeShown", "true");
    }
  }, []);

  const buttons = [
    { title: "👥 Müşteriler", route: "/musteri", roles: ["Admin", "Seller"] },
    {
      title: "🧾 Talep Oluştur",
      route: "/talepOlustur",
      roles: ["Admin", "Buyer"],
    },
    {
      title: "📜 Taleplerim",
      route: "/talepGecmisi",
      roles: ["Admin", "Buyer"],
    },
    {
      title: "✅ Talep Karşıla",
      route: "/talepKarsila",
      roles: ["Admin", "Seller"],
    },
    {
      title: "📋 Tüm Talepler",
      route: "/tumTalepler",
      roles: ["Admin", "Seller"],
    },
    {
      title: "📊 Grafikler",
      route: "/graph",
      roles: ["Admin", "Seller"],
    },
    {
      title: "👤 Profil",
      route: "/profile",
      roles: ["Admin", "Seller", "Buyer"],
    },

    { title: "🚫 Yasakla", route: "/yasak", roles: ["Admin", "Seller"] },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-100 flex flex-col items-center justify-center p-6 relative">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">🚀 Menü</h1>

      {/* Bilgilendirme Butonu */}
      <button
        onClick={() => setShowModal(true)}
        className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 shadow"
      >
        ℹ️ Bilgilendirme
      </button>

      {/* Menü Butonları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {buttons
          .filter((btn) => btn.roles.includes(role))
          .map((btn, idx) => (
            <button
              key={idx}
              onClick={() => navigate(btn.route)}
              className="bg-white shadow-lg rounded-2xl p-6 text-xl font-semibold text-blue-600 hover:bg-blue-50 hover:scale-105 transition-transform duration-200"
            >
              {btn.title}
            </button>
          ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">
              Hoş Geldiniz 🌸
            </h2>
            <p className="text-gray-700 mb-4">
              <strong>TurabJerseySüt'e</strong> hoş geldiniz! Buradan süt talebi
              oluşturabilir, önceki taleplerinizi görebilir ve profil
              bilgilerinizi düzenleyebilirsiniz.
            </p>
            <p className="text-sm text-gray-500 italic mb-6">
              Senin için özel hazırlandı 💖
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
