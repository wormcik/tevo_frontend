import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import toast from "react-hot-toast";
import { getDemandsForSeller } from "../Main.crud";

export default function RevenueCharts() {
  const [chartData, setChartData] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDemandsForSeller(user.userId);
        const demands = res.data.model || [];

        const now = new Date();
        const year = now.getFullYear();
        const revenue = Array(12).fill(0);

        demands.forEach((d) => {
          const date = new Date(d.date);
          if (date.getFullYear() === year) {
            revenue[date.getMonth()] += d.price || 0;
          }
        });

        setChartData({
          labels: [
            "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
            "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
          ],
          datasets: [
            {
              label: "Aylık Ciro (₺)",
              data: revenue,
              borderColor: "#F59E0B",
              backgroundColor: "rgba(245, 158, 11, 0.2)",
              fill: true,
              tension: 0.3,
            },
          ],
        });
      } catch {
        toast.error("Ciro verileri alınamadı");
      }
    };

    fetch();
  }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        💰 Aylık Ciro (₺)
      </h3>
      {chartData ? (
        <Line data={chartData} options={{ responsive: true }} />
      ) : (
        <p className="text-sm text-gray-500">Veri bulunamadı.</p>
      )}
    </div>
  );
}
