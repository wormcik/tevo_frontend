import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getDemandsForSeller } from "../Main.crud";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function MonthlyCharts() {
  const [chartData, setChartData] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDemandsForSeller(user.userId);
        const demands = res.data.model || [];

        const now = new Date();
        const currentYear = now.getFullYear();

        const months = Array(12).fill(0);
        demands.forEach((d) => {
          const date = new Date(d.date);
          if (date.getFullYear() === currentYear) {
            months[date.getMonth()] += d.delivered || 0;
          }
        });

        setChartData({
          labels: [
            "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
            "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
          ],
          datasets: [
            {
              label: "Aylık Teslimat",
              data: months,
              fill: true,
              borderColor: "#3B82F6",
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              tension: 0.3,
            },
          ],
        });
      } catch {
        toast.error("Aylık veriler alınamadı");
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        📅 Son 12 Ay Teslimat Grafiği
      </h3>
      {chartData ? (
        <Line data={chartData} options={{ responsive: true }} />
      ) : (
        <p className="text-sm text-gray-500">Veri bulunamadı.</p>
      )}
    </div>
  );
}
