import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import toast from "react-hot-toast";
import { getDemandsForSeller } from "../Main.crud";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


export default function BuyerCharts() {
  const [chartData, setChartData] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDemandsForSeller(user.userId);
        const demands = res.data.model || [];

        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        const buyerMap = {};
        demands.forEach((d) => {
          const date = new Date(d.date);
          if (date.getFullYear() === year && date.getMonth() === month) {
            buyerMap[d.recipientUserName] =
              (buyerMap[d.recipientUserName] || 0) + (d.delivered || 0);
          }
        });

        setChartData({
          labels: Object.keys(buyerMap),
          datasets: [
            {
              label: "Bu Ay Teslim Edilen (L)",
              data: Object.values(buyerMap),
              backgroundColor: "#10B981",
            },
          ],
        });
      } catch {
        toast.error("Alıcı verileri alınamadı");
      }
    };

    fetch();
  }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        👥 Bu Ay Alıcı Bazlı Teslimatlar
      </h3>
      {chartData ? (
        <Bar
          data={chartData}
          options={{ responsive: true, plugins: { legend: { display: false } } }}
        />
      ) : (
        <p className="text-sm text-gray-500">Veri bulunamadı.</p>
      )}
    </div>
  );
}
