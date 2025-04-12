import { useEffect, useState } from "react";
import { getDemandsForSeller } from "./Main.crud";
import toast from "react-hot-toast";
import MapView from "./MapView";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DemandAll() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [demands, setDemands] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const stateOptions = [
    "Talep Oluşturuldu",
    "Teklif Verildi",
    "Alıcı Onayladı",
    "Teslim Edildi",
    "Tamamlandı",
    "İptal Edildi",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDemandsForSeller(user.userId);
        setDemands(res.data.model || []);
      } catch {
        toast.error("Talepler alınamadı");
      }
    };

    fetchData();
  }, []);

  const uniqueBuyers = [...new Set(demands.map((d) => d.recipientUserName))];

  const filtered = demands.filter((d) => {
    const matchState = selectedState ? d.state === selectedState : true;
    const matchBuyer = selectedBuyer
      ? d.recipientUserName === selectedBuyer
      : true;
    const matchStart = startDate
      ? new Date(d.date) >= new Date(startDate)
      : true;
    const matchEnd = endDate ? new Date(d.date) <= new Date(endDate) : true;
    return matchState && matchBuyer && matchStart && matchEnd;
  });

  const exportToExcel = () => {
    const sheetData = filtered.map((d) => ({
      Tarih: d.date,
      Alıcı: d.recipientUserName,
      "İstenen (L)": d.demandedMilk,
      "Teslim (L)": d.deliveredMilk,
      Fiyat: `${d.price} ${d.currency}`,
      Durum: d.state,
      Telefon: d.contactInfoModel?.value,
      Adres: d.addressInfoModel?.value,
    }));
    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Talepler");
    XLSX.writeFile(workbook, "talepler.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Talepler", 14, 10);
    const tableData = filtered.map((d) => [
      d.date,
      d.recipientUserName,
      d.demandedMilk,
      d.deliveredMilk,
      `${d.price} ${d.currency}`,
      d.state,
    ]);
    autoTable(doc, {
      head: [["Tarih", "Alıcı", "İstenen", "Teslim", "Fiyat", "Durum"]],
      body: tableData,
    });

    doc.save("talepler.pdf");
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-bold text-blue-600">
        📦 Tüm Talepler (Geçmiş)
      </h2>

      {/* Filtreler */}
      <div className="grid sm:grid-cols-3 gap-4">
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
          {uniqueBuyers.map((b, i) => (
            <option key={i} value={b}>
              {b}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Dışa Aktarım */}
      <div className="flex gap-3 justify-end">
        <button onClick={exportToExcel} className="btn-green">
          📊 Excel
        </button>
        <button onClick={exportToPDF} className="btn-red">
          📄 PDF
        </button>
      </div>

      {/* Liste */}
      {filtered.map((d, i) => (
        <div key={d.demandId} className="border rounded p-4 shadow bg-white">
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
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${d.addressInfoModel.latitude},${d.addressInfoModel.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-blue-600 hover:underline"
                  >
                    📍 Yol Tarifi
                  </a>
                )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
