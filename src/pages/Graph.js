import { useState } from "react";
import SellerOverviewTab from "./SellerOverviewTab";
import BuyerDetailsTab from "./BuyerDetailsTab";

export default function Graph() {
  const [activeTab, setActiveTab] = useState("seller");

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">📊 İstatistikler</h2>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("seller")}
          className={`px-4 py-2 rounded ${
            activeTab === "seller"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          📈 Bu Ay Satışlarım
        </button>
        <button
          onClick={() => setActiveTab("buyer")}
          className={`px-4 py-2 rounded ${
            activeTab === "buyer"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          🧾 Müşteri Detayları
        </button>
      </div>

      <div>
        {activeTab === "seller" && <SellerOverviewTab />}
        {activeTab === "buyer" && <BuyerDetailsTab />}
      </div>
    </div>
  );
}
