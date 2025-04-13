import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import toast from "react-hot-toast";
import { getDemandsForSeller } from "../Main.crud";

// GRAFİK ELEMENTLERİ REGISTER EDİLİYOR
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StatusCharts() {
  const [chartData, setChartData] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDemandsForSeller(user.userId);
        const demands = res.data.model || [];

        const stateMap = {};
        demands.forEach((d) => {
          stateMap[d.state] = (stateMap[d.state] || 0) + 1;
        });

        setChartData({
          labels: Object.keys(stateMap),
          datasets: [
            {
              data: Object.values(stateMap),
              backgroundColor: [
                "#3B82F6", // Mavi
                "#10B981", // Yeşil
                "#F59E0B", // Sarı
                "#EF4444", // Kırmızı
                "#8B5CF6", // Mor
                "#6B7280", // Gri
              ],
              borderWidth: 1,
            },
          ],
        });
      } catch {
        toast.error("Durum verileri alınamadı");
      }
    };

    fetch();
  }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        📊 Talep Durum Dağılımı
      </h3>
      {chartData ? (
        <Pie
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: "bottom",
              },
            },
          }}
        />
      ) : (
        <p className="text-sm text-gray-500">Veri bulunamadı.</p>
      )}
    </div>
  );
}
