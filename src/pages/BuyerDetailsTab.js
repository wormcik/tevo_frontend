import { useEffect, useState } from "react";
import { getDemandsForSeller } from "./Main.crud";
import { Line } from "react-chartjs-2";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function BuyerDetailsTab() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [demands, setDemands] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState("");
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDemandsForSeller(user.userId);
        setDemands(res.data.model || []);
      } catch {
        toast.error("Veri alınamadı");
      }
    };
    fetch();
  }, []);

  const buyers = [...new Set(demands.map((d) => d.recipientUserName))];

  useEffect(() => {
    if (!selectedBuyer) return setChartData(null);

    const filtered = demands.filter(
      (d) => d.recipientUserName === selectedBuyer
    );

    const monthly = Array(12).fill(0);
    filtered.forEach((d) => {
      const month = new Date(d.date).getMonth();
      monthly[month] += d.deliveredMilk || 0;
    });

    const labels = [
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

    setChartData({
      labels,
      datasets: [
        {
          label: "Alınan Süt (L)",
          data: monthly,
          borderColor: "#3B82F6",
          backgroundColor: "#93C5FD",
        },
      ],
    });
  }, [selectedBuyer, demands]);

  return (
    <div className="bg-white p-4 rounded shadow space-y-4">
      <select
        value={selectedBuyer}
        onChange={(e) => setSelectedBuyer(e.target.value)}
        className="input"
      >
        <option value="">Alıcı Seç</option>
        {buyers.map((b, i) => (
          <option key={i} value={b}>
            {b}
          </option>
        ))}
      </select>

      {chartData ? (
        <Line data={chartData} options={{ responsive: true }} />
      ) : (
        <p className="text-gray-500 text-center">
          Alıcı seçilmedi veya veri yok.
        </p>
      )}
    </div>
  );
}
