import { useEffect, useState } from "react";
import { getMyDemands, approveDemand, cancelDemand } from "./Main.crud";
import toast from "react-hot-toast";
import MapView from "./MapView";

export default function DemandHistory() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [demands, setDemands] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [expanded, setExpanded] = useState(null);

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
    } catch {
      toast.error("Talepler alınamadı");
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  const filteredDemands = selectedState
    ? demands.filter((d) => d.state === selectedState)
    : demands;

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

  const sortedDemands = [...filteredDemands].sort((a, b) => {
    if (a.state === "Teklif Verildi" && b.state !== "Teklif Verildi") return -1;
    if (b.state === "Teklif Verildi" && a.state !== "Teklif Verildi") return 1;
  
    return new Date(b.date) - new Date(a.date);
  });
  

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-bold text-blue-600">📜 Taleplerim</h2>

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
              <p className="text-sm text-gray-500">{d.state} - {new Date(d.date).toLocaleDateString()}</p>
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
                <strong>İstenen:</strong> {d.demandedMilk} L
              </p>
              <p>
                <strong>Teslim:</strong> {d.deliveredMilk || "-"} L
              </p>
              <p>
                <strong>Fiyat:</strong> {d.price} {d.currency}
              </p>

              {/* Alıcı İletişimi */}
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

              {/* Satıcı İletişimi */}
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

              {/* Adres */}
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
