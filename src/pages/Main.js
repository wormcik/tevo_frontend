export default function MainPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-2xl w-full text-center border border-blue-200">
        <h1 className="text-4xl font-extrabold text-pink-600 mb-4">
          Hoş Geldiniz 🌸
        </h1>
        <p className="text-gray-700 text-lg">
        TurabJerseySüt'e hoş geldiniz!  
Yukarıdaki menüyü kullanarak liste işlemlerinizi yapabilir, yeni müşteriler ekleyebilir veya var olanları güncelleyebilirsiniz.
        </p>

        <div className="mt-8">
          <p className="text-sm text-gray-500 italic">Senin için özel hazırlandı 💖</p>
        </div>
      </div>
    </div>
  );
}
