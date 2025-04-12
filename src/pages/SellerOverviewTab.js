import { useEffect, useState } from "react";
import { getDemandsForSeller } from "./Main.crud";
import { Bar, Line } from "react-chartjs-2";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function SellerOverviewTab() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [buyerChart, setBuyerChart] = useState(null);
  const [monthlyChart, setMonthlyChart] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDemandsForSeller(user.userId);
        const demands = res.data.model || [];

        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        // 📌 Bu ayki satışları buyer bazlı topla
        const buyerSummary = {};
        demands.forEach((d) => {
          const date = new Date(d.date);
          if (
            date.getMonth() === thisMonth &&
            date.getFullYear() === thisYear
          ) {
            const buyer = d.recipientUserName;
            buyerSummary[buyer] =
              (buyerSummary[buyer] || 0) + (d.deliveredMilk || 0);
          }
        });

        setBuyerChart({
          labels: Object.keys(buyerSummary),
          datasets: [
            {
              label: "Alınan Süt (L)",
              data: Object.values(buyerSummary),
              backgroundColor: "#3B82F6",
            },
          ],
        });

        // 📌 Son 12 ayın satışları
        const monthLabels = [
          "Ocak",
          "Şubat",
          "Mart",
          "Nisan",
          "Mayıs",
          "Haziran",
          "Temmuz",
          "Ağustos",
          "Eylül",
          "Ekim",
          "Kasım",
          "Aralık",
        ];

        const monthly = Array(12).fill(0);
        demands.forEach((d) => {
          const date = new Date(d.date);
          if (
            date.getFullYear() === thisYear ||
            (thisMonth < 11 && date.getFullYear() === thisYear - 1)
          ) {
            const month = date.getMonth();
            monthly[month] += d.deliveredMilk || 0;
          }
        });

        setMonthlyChart({
          labels: monthLabels,
          datasets: [
            {
              label: "Aylık Teslimat (L)",
              data: monthly,
              borderColor: "#10B981",
              backgroundColor: "#6EE7B7",
              fill: true,
              tension: 0.3,
            },
          ],
        });
      } catch {
        toast.error("Veri alınamadı");
      }
    };

    fetch();
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          📈 Bu Ay Alıcı Bazlı Satışlar
        </h3>
        {buyerChart ? (
          <Bar
            data={buyerChart}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
            }}
          />
        ) : (
          <p className="text-gray-500">Veri bulunamadı.</p>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          📅 Son 12 Ay Teslimat Grafiği
        </h3>
        {monthlyChart ? (
          <Line data={monthlyChart} options={{ responsive: true }} />
        ) : (
          <p className="text-gray-500">Veri bulunamadı.</p>
        )}
      </div>
    </div>
  );
}
