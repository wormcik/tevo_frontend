import { useEffect, useState } from "react";
import { getAllProducts, getDemandsForSeller } from "./Main.crud";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { registerFonts } from "./fonts";

export default function DemandAll() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [demands, setDemands] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  const stateOptions = [
    "Talep Oluşturuldu",
    "Teklif Verildi",
    "Alıcı Onayladı",
    "Teslim Edildi",
    "Tamamlandı",
    "İptal Edildi",
  ];

  const dateOptions = [
    "Tüm Tarihler",
    "Bugün",
    "Bu Hafta",
    "Bu Ay",
    "Bu Yıl",
    "1 Hafta İçinde",
    "1 Ay İçinde",
    "2024",
    "2023",
    "2022",
  ];

  const getFilteredDateRange = () => {
    const start = new Date();
    const end = new Date();
    switch (dateFilter) {
      case "Bugün":
        return [setMidnight(start), setEndOfDay(end)];
      case "Bu Hafta":
        const day = start.getDay() || 7;
        start.setDate(start.getDate() - day + 1);
        return [setMidnight(start), setEndOfDay(end)];
      case "Bu Ay":
        start.setDate(1);
        return [setMidnight(start), setEndOfDay(end)];
      case "Bu Yıl":
        start.setMonth(0, 1);
        return [setMidnight(start), setEndOfDay(end)];
      case "1 Hafta İçinde":
        const weekFutureEnd = new Date();
        weekFutureEnd.setDate(start.getDate() + 6);
        return [setMidnight(start), setEndOfDay(weekFutureEnd)];

      case "1 Ay İçinde":
        const monthFutureEnd = new Date();
        monthFutureEnd.setDate(start.getDate() + 29);
        return [setMidnight(start), setEndOfDay(monthFutureEnd)];

      case "2024":
      case "2023":
      case "2022":
        return [
          new Date(`${dateFilter}-01-01`),
          new Date(`${dateFilter}-12-31T23:59:59`),
        ];
      default:
        return [null, null];
    }
  };

  const setMidnight = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const setEndOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  useEffect(() => {
    const fetchDemands = async () => {
      try {
        const res = await getDemandsForSeller(user.userId);
        setDemands(res.data.model || []);
        const resProducts = await getAllProducts();
        setProducts(resProducts.data.model || []);
      } catch {
        toast.error("Talepler alınamadı");
      }
    };
    fetchDemands();
  }, []);

  const uniqueBuyers = [...new Set(demands.map((d) => d.recipientUserName))];

  const [rangeStart, rangeEnd] = getFilteredDateRange();
  const filtered = demands.filter((d) => {
    const date = new Date(d.date);
    const demandDateStr = date.toISOString().split("T")[0];
    const matchState = selectedState ? d.state === selectedState : true;
    const matchBuyer = selectedBuyer
      ? d.recipientUserName === selectedBuyer
      : true;
    const matchProduct = selectedProductId
      ? d.productId === parseInt(selectedProductId)
      : true;

    let matchDate = true;
    if (customDate) {
      const custom = new Date(customDate);
      matchDate =
        date.getFullYear() === custom.getFullYear() &&
        date.getMonth() === custom.getMonth() &&
        date.getDate() === custom.getDate();
    } else if (rangeStart && rangeEnd) {
      matchDate = date >= rangeStart && date <= rangeEnd;
    }

    return matchState && matchBuyer && matchDate && matchProduct;
  });

  const totals = {
    total: filtered.length,
    demanded: filtered.reduce((sum, d) => sum + d.demanded, 0),
    delivered: filtered.reduce((sum, d) => sum + (d.delivered || 0), 0),
    amount: filtered.reduce((sum, d) => sum + (d.price || 0), 0),
  };

  const exportToExcel = () => {
    const data = filtered.map((d) => ({
      Tarih: new Date(d.date).toLocaleDateString(),
      Ürün: products.find((p) => p.productId === d.productId)?.productName,
      Alıcı: d.recipientUserName,
      İstenen: d.demanded,
      Teslim: d.delivered,
      Fiyat: `${d.price} ${d.currency}`,
      Durum: d.state,
      Telefon: d.contactInfoModel?.value,
      Adres: d.addressInfoModel?.value,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Talepler");
    XLSX.writeFile(wb, "talepler.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Türkçe destekli fontu kaydet ve seç
    registerFonts(doc);
    doc.setFont("DejaVuSans", "normal");

    // Başlık
    doc.setFontSize(14);
    doc.text("Talepler Dökümü", 14, 15);

    // Tablo verileri
    const body = filtered.map((d) => {
      const product = products.find((p) => p.productId === d.productId);
      return [
        new Date(d.date).toLocaleDateString("tr-TR"),
        d.recipientUserName,
        product ? `${product.productName} (${product.unit})` : "-",
        d.delivered,
        `${d.price} ${d.currency}`,
        d.state,
        d.addressInfoModel?.value || "-",
      ];
    });

    // Tabloyu çiz
    autoTable(doc, {
      head: [["Tarih", "Alıcı", "Ürün", "Teslim", "Fiyat", "Durum", "Adres"]],
      body: body,
      margin: { top: 25 },
      styles: {
        font: "DejaVuSans",
      },
    });

    // Alt bilgiler
    const finalY = doc.lastAutoTable.finalY || 30;
    doc.setFontSize(12);
    doc.text(`Toplam Talep: ${totals.total}`, 14, finalY + 10);
    doc.text(`Toplam Teslim: ${totals.delivered} Litre`, 14, finalY + 16);
    doc.text(`Toplam Tutar: ${totals.amount} ₺`, 14, finalY + 22);

    // PDF'i indir
    doc.save("talepler.pdf");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-blue-600">📦 Tüm Talepler</h2>

      {/* Özet Bilgiler */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="font-bold text-lg">{totals.total}</p>
          <p className="text-sm text-gray-500">Toplam Talep</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="font-bold text-lg">{totals.demanded} L</p>
          <p className="text-sm text-gray-500">İstenen</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="font-bold text-lg">{totals.delivered} L</p>
          <p className="text-sm text-gray-500">Teslim</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="font-bold text-lg">{totals.amount} ₺</p>
          <p className="text-sm text-gray-500">Tutar</p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="grid sm:grid-cols-4 gap-4 items-center">
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="input"
        >
          <option value="">Tüm Ürünler</option>
          {products.map((p) => (
            <option key={p.productId} value={p.productId}>
              {p.productName} ({p.unit})
            </option>
          ))}
        </select>

        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="input"
        >
          <option value="">Tüm Durumlar</option>
          {stateOptions.map((s, i) => (
            <option key={i}>{s}</option>
          ))}
        </select>
        <select
          value={selectedBuyer}
          onChange={(e) => setSelectedBuyer(e.target.value)}
          className="input"
        >
          <option value="">Tüm Alıcılar</option>
          {uniqueBuyers.map((b, i) => (
            <option key={i}>{b}</option>
          ))}
        </select>
        <select
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setCustomDate("");
          }}
          className="input"
        >
          {dateOptions.map((d, i) => (
            <option key={i}>{d}</option>
          ))}
        </select>
        <input
          type="date"
          value={customDate}
          onChange={(e) => {
            setCustomDate(e.target.value);
            setDateFilter("");
          }}
          className="input"
          placeholder="Tarih seç"
        />
      </div>

      {/* Dışa Aktarım */}
      <div className="flex justify-end gap-2">
        <button onClick={exportToExcel} className="btn-green">
          📊 Excel
        </button>
        <button onClick={exportToPDF} className="btn-red">
          📄 PDF
        </button>
      </div>

      {/* Liste */}
      <div className="space-y-4">
        {filtered.map((d, i) => (
          <div key={d.demandId} className="bg-white border rounded shadow p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-blue-700">
                  #{i + 1} - {d.recipientUserName}
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
                className="text-blue-600 text-sm underline"
              >
                {expanded === i ? "Gizle" : "Detay"}
              </button>
            </div>
            {expanded === i && (
              <div className="mt-3 text-sm space-y-1 text-gray-700">
                <p>
                  <strong>İstenen:</strong> {d.demanded} L
                </p>
                <p>
                  <strong>Teslim:</strong> {d.delivered || "-"} L
                </p>
                <p>
                  <strong>Fiyat:</strong> {d.price} {d.currency}
                </p>
                <p>
                  <strong>📞 Tel:</strong> {d.contactInfoModel?.value}
                </p>
                <p>
                  <strong>📍 Adres:</strong> {d.addressInfoModel?.value}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
