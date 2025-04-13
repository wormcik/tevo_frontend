import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import toast from "react-hot-toast";
import { getAllProducts, getDemandsForSeller } from "../Main.crud";

export default function ProductCharts() {
  const [chartData, setChartData] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetch = async () => {
      try {
        const [resDemands, resProducts] = await Promise.all([
          getDemandsForSeller(user.userId),
          getAllProducts(),
        ]);
        const demands = resDemands.data.model || [];
        const products = resProducts.data.model || [];

        const productMap = {};
        demands.forEach((d) => {
          const product = products.find((p) => p.productId === d.productId);
          if (product) {
            const name = `${product.productName} (${product.unit})`;
            productMap[name] = (productMap[name] || 0) + (d.delivered || 0);
          }
        });

        setChartData({
          labels: Object.keys(productMap),
          datasets: [
            {
              label: "Teslimat",
              data: Object.values(productMap),
              backgroundColor: "#3B82F6",
            },
          ],
        });
      } catch {
        toast.error("Ürün verileri alınamadı");
      }
    };

    fetch();
  }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        📦 Ürün Bazlı Teslimatlar
      </h3>
      {chartData ? (
        <Bar data={chartData} options={{ responsive: true }} />
      ) : (
        <p className="text-sm text-gray-500">Veri bulunamadı.</p>
      )}
    </div>
  );
}
