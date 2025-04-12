import { useEffect, useState } from "react";
import { getDemandsForSeller, updateDemandBySeller } from "./Main.crud";
import toast from "react-hot-toast";
import MapView from "./MapView";

export default function DemandSatisfy() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [demands, setDemands] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [selectedBuyer, setSelectedBuyer] = useState("");

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
      const res = await getDemandsForSeller(user.userId);
      setDemands(res.data.model || []);
    } catch {
      toast.error("Talepler alınamadı");
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  const uniqueBuyers = [...new Set(demands.map((d) => d.recipientUserName))];

  const filtered = demands.filter((d) => {
    const matchState = selectedState ? d.state === selectedState : true;
    const matchBuyer = selectedBuyer
      ? d.recipientUserName === selectedBuyer
      : true;
    return matchState && matchBuyer;
  });

  const handleAction = async (demandId, updates) => {
    try {
      const payload = { demandId, ...updates };
      const res = await updateDemandBySeller(payload);
      toast.success("Talep güncellendi");
      fetchDemands();
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const priorityOrder = {
    "Talep Oluşturuldu": 1,
    "Alıcı Onayladı": 2,
    "Teslim Edildi": 3,
    "Teklif Verildi": 4,
  };

  const sortedFiltered = [...filtered].sort((a, b) => {
    const isACompleted = ["Tamamlandı", "İptal Edildi"].includes(a.state);
    const isBCompleted = ["Tamamlandı", "İptal Edildi"].includes(b.state);

    // Eğer ikisi de tamamlandı/iptal → tarihe göre sırala (son tarih önce)
    if (isACompleted && isBCompleted) {
      return new Date(b.date) - new Date(a.date);
    }

    // Sadece biri tamamlandıysa, tamamlanan alta gitsin
    if (isACompleted) return 1;
    if (isBCompleted) return -1;

    // Diğer durumlar → öncelik sırasına göre
    return (priorityOrder[a.state] || 99) - (priorityOrder[b.state] || 99);
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-bold text-blue-600">
        ✅ Taleplerim (Satıcı)
      </h2>

      {/* Filtreler */}
      <div className="grid sm:grid-cols-2 gap-4">
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="input"
        >
          <option value="">Tüm Durumlar</option>
          {stateOptions.map((s, i) => (
            <option key={i} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={selectedBuyer}
          onChange={(e) => setSelectedBuyer(e.target.value)}
          className="input"
        >
          <option value="">Tüm Alıcılar</option>
          {uniqueBuyers.map((name, idx) => (
            <option key={idx} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Liste */}
      {sortedFiltered.map((d, i) => (
        <div
          key={d.demandId}
          className={`rounded border p-4 shadow transition hover:shadow-md ${
            ["Talep Oluşturuldu", "Alıcı Onayladı"].includes(d.state)
              ? "bg-green-50"
              : "bg-white"
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-blue-700">
                #{i + 1} - {d.recipientUserName}
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
              {/* Adres */}
              <p>
                <strong>📍 Adres:</strong> {d.addressInfoModel?.value}
              </p>
              <MapView
                lat={d.addressInfoModel?.latitude}
                lng={d.addressInfoModel?.longitude}
              />

              {d.addressInfoModel?.latitude &&
                d.addressInfoModel?.longitude && (
                  <div className="mt-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${d.addressInfoModel.latitude},${d.addressInfoModel.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      📍 Yol Tarifi ile Git
                    </a>
                  </div>
                )}

              {/* Butonlar */}
              {d.state === "Talep Oluşturuldu" && (
                <div className="space-y-2">
                  <div className="grid sm:grid-cols-2 gap-2">
                    <input
                      placeholder="Fiyat ₺"
                      type="number"
                      className="input"
                      onChange={(e) => (d._price = e.target.value)}
                    />
                    <input
                      placeholder="Teslim Süt (L)"
                      type="number"
                      className="input"
                      onChange={(e) => (d._delivered = e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        handleAction(d.demandId, {
                          price: parseFloat(d._price || 0),
                          deliveredMilk: parseFloat(d._delivered || 0),
                          state: "Teklif Verildi",
                        })
                      }
                      className="btn-blue"
                    >
                      Teklif Ver
                    </button>
                    <button
                      onClick={() =>
                        handleAction(d.demandId, { state: "İptal Edildi" })
                      }
                      className="btn-red"
                    >
                      İptal Et
                    </button>
                  </div>
                </div>
              )}

              {d.state === "Alıcı Onayladı" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      handleAction(d.demandId, { state: "Teslim Edildi" })
                    }
                    className="btn-green"
                  >
                    Teslim Et
                  </button>
                </div>
              )}

              {d.state === "Teslim Edildi" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      handleAction(d.demandId, { state: "Tamamlandı" })
                    }
                    className="btn-purple"
                  >
                    Tamamla
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
