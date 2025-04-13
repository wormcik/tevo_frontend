import { useEffect, useState } from "react";
import {
  getMyDemands,
  approveDemand,
  cancelDemand,
  getAllProducts,
} from "./Main.crud";
import toast from "react-hot-toast";
import MapView from "./MapView";

export default function DemandHistory() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [demands, setDemands] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(""); // 🆕 Ürün filtresi
  const [expanded, setExpanded] = useState(null);
  const [products, setProducts] = useState([]);

  const stateOptions = [
    "Talep Oluşturuldu",
    "Teklif Verildi",
    "Alıcı Onayladı",
    "Teslim Edildi",
    "Tamamlandı",
    "İptal Edildi",
  ];

  const fetchDemands = async () => {
    try {
      const res = await getMyDemands(user.userId);
      setDemands(res.data.model || []);
      const resProducts = await getAllProducts();
      setProducts(resProducts.data.model || []);
    } catch {
      toast.error("Talepler alınamadı");
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  const filteredDemands = demands.filter((d) => {
    const stateMatch = selectedState ? d.state === selectedState : true;
    const productMatch = selectedProduct ? d.productId === parseInt(selectedProduct) : true;
    return stateMatch && productMatch;
  });

  const sortedDemands = [...filteredDemands].sort((a, b) => {
    if (a.state === "Teklif Verildi" && b.state !== "Teklif Verildi") return -1;
    if (b.state === "Teklif Verildi" && a.state !== "Teklif Verildi") return 1;
    return new Date(b.date) - new Date(a.date);
  });

  const handleApprove = async (id) => {
    try {
      await approveDemand(id);
      toast.success("Talep onaylandı");
      fetchDemands();
    } catch {
      toast.error("Onay başarısız");
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelDemand(id);
      toast.success("Talep iptal edildi");
      fetchDemands();
    } catch {
      toast.error("İptal başarısız");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-bold text-blue-600">📜 Taleplerim</h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-60"
        >
          <option value="">Tüm Durumlar</option>
          {stateOptions.map((s, i) => (
            <option key={i} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-60"
        >
          <option value="">Tüm Ürünler</option>
          {products.map((p) => (
            <option key={p.productId} value={p.productId}>
              {p.productName} ({p.unit})
            </option>
          ))}
        </select>
      </div>

      {sortedDemands.map((d, i) => (
        <div
          key={d.demandId}
          className={`rounded border p-4 shadow transition hover:shadow-md ${
            d.state === "Teklif Verildi"
              ? "border-yellow-400 bg-yellow-50"
              : "bg-white"
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-blue-700">
                #{i + 1} - {d.delivererUserName}
              </p>
              <p className="text-sm text-gray-600">
                Ürün:{" "}
                <span className="font-medium">
                  {
                    products.find((p) => p.productId === d.productId)
                      ?.productName
                  }
                </span>{" "}
                (
                <span className="italic text-gray-500">
                  {products.find((p) => p.productId === d.productId)?.unit}
                </span>
                )
              </p>
              <p className="text-sm text-gray-500">
                {d.state} - {new Date(d.date).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="text-sm text-blue-600 underline"
            >
              {expanded === i ? "Gizle" : "Detay"}
            </button>
          </div>

          {expanded === i && (
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <p>
                <strong>İstenen:</strong> {d.demanded}
              </p>
              <p>
                <strong>Teslim:</strong> {d.delivered || "-"}
              </p>
              <p>
                <strong>Fiyat:</strong> {d.price} {d.currency}
              </p>

              <p>
                <strong>📞 Alıcı:</strong>{" "}
                <a
                  href={`tel:${d.contactInfoModel?.value}`}
                  className="text-blue-600 hover:underline"
                >
                  {d.contactInfoModel?.value}
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      d.contactInfoModel?.value || ""
                    );
                    toast.success("Alıcı numarası kopyalandı");
                  }}
                  className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                >
                  Kopyala
                </button>
              </p>

              <p>
                <strong>📞 Satıcı:</strong>{" "}
                <a
                  href={`tel:${d.sellerContactInfoModel?.value}`}
                  className="text-blue-600 hover:underline"
                >
                  {d.sellerContactInfoModel?.value}
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      d.sellerContactInfoModel?.value || ""
                    );
                    toast.success("Satıcı numarası kopyalandı");
                  }}
                  className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                >
                  Kopyala
                </button>
              </p>

              <p>
                <strong>📍 Adres:</strong> {d.addressInfoModel?.value}
              </p>

              <MapView
                lat={d.addressInfoModel?.latitude}
                lng={d.addressInfoModel?.longitude}
              />

              {d.state === "Teklif Verildi" && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleApprove(d.demandId)}
                    className="btn-green"
                  >
                    Onayla
                  </button>
                  <button
                    onClick={() => handleCancel(d.demandId)}
                    className="btn-red"
                  >
                    İptal Et
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
