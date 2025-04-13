import { useState } from "react";
import MonthlyCharts from "./MonthlyCharts";
import BuyerCharts from "./BuyerCharts";
import ProductCharts from "./ProductCharts";
import RevenueCharts from "./RevenueCharts";
import StatusCharts from "./StatusCharts";

export default function Graph() {
  const [activeTab, setActiveTab] = useState("monthly");

  const tabs = [
    {
      id: "monthly",
      label: "Aylık",
      icon: "📅",
      description: "Aylara göre teslimat hacmi",
    },
    {
      id: "buyer",
      label: "Alıcılar",
      icon: "👥",
      description: "Alıcı bazlı teslimat analizi",
    },
    {
      id: "product",
      label: "Ürünler",
      icon: "📦",
      description: "Ürün bazlı teslimat grafikleri",
    },
    {
      id: "revenue",
      label: "Ciro",
      icon: "💰",
      description: "Toplam kazanç dağılımı",
    },
    {
      id: "status",
      label: "Durumlar",
      icon: "📊",
      description: "Talep durumu oranları",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-2xl font-bold text-blue-700 text-center">
        📈 Grafiksel Görünüm
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`cursor-pointer p-4 rounded-lg border shadow-sm hover:shadow-md transition ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            <div className="text-3xl text-center mb-2">{tab.icon}</div>
            <p className="font-semibold text-center">{tab.label}</p>
            <p className="text-xs text-center mt-1 opacity-70">
              {tab.description}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded shadow min-h-[300px]">
        {activeTab === "monthly" && <MonthlyCharts />}
        {activeTab === "buyer" && <BuyerCharts />}
        {activeTab === "product" && <ProductCharts />}
        {activeTab === "revenue" && <RevenueCharts />}
        {activeTab === "status" && <StatusCharts />}
      </div>
    </div>
  );
}
