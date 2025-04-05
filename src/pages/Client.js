import { useEffect, useState } from 'react';
import { clientFilter, clientAdd, clientUpdate, clientDelete } from './Main.crud';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function Client() {

  const exportToExcel = () => {
    const exportData = data.map(item => ({
      Ad: item.clientName,
      Soyad: item.clientSurname,
      Telefon: item.clientTelNo,
      Adres: item.clientAdres,
      IstenenSüt: item.clientRequestMilk,
      TeslimEdilenSüt: item.clientDeliverMilk,
      Tutar: item.clientPrice,
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Müşteriler');
  
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'musteriler.xlsx');
  
    toast.success('Excel dosyası indirildi!');
  };
  
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    clientName: '',
    clientSurname: '',
    clientTelNo: '',
    clientAdres: '',
    clientRequestMilk: '',
    clientDeliverMilk: '',
    clientPrice: '',
  });
  const [filter, setFilter] = useState({
    clientName: '',
    clientSurname: '',
    clientTelNo: '',
    clientAdres: '',
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  const fetchFiltered = async () => {
    try {
      setLoading(true);
      const res = await clientFilter(filter);
      setData(res.data);
    } catch {
      toast.error('Veri alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdate = async () => {
    const { clientName, clientSurname, clientTelNo, clientAdres, clientDeliverMilk, clientRequestMilk, clientPrice} = form;
    if (!clientName || !clientSurname || !clientTelNo || !clientAdres) {
      return toast.error('Tüm alanları doldurun');
    }

    try {
      if (editing) {
        const res = await clientUpdate({ ...form, clientId: editing.clientId });
        setData((prev) =>
          prev.map((item) => (item.clientId === editing.clientId ? res.data : item))
        );
        toast.success('Müşteri güncellendi');
      } else {
        const res = await clientAdd(form);
        setData((prev) => [...prev, res.data]);
        toast.success('Müşteri eklendi');
      }
      setForm({ clientName: '', clientSurname: '', clientTelNo: '', clientAdres: '', clientRequestMilk: '', clientDeliverMilk: '', clientPrice: '' });
      setEditing(null);
    } catch {
      toast.error('İşlem başarısız oldu');
    }
  };

  const handleDelete = async () => {
    try {
      await clientDelete(confirmDelete.clientId);
      setData((prev) => prev.filter((item) => item.clientId !== confirmDelete.clientId));
      toast.success('Müşteri silindi');
      setConfirmDelete(null);
    } catch {
      toast.error('Silme işlemi başarısız');
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFiltered();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [filter]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <h2 className="text-3xl font-bold text-blue-600 text-center sm:text-left mb-4 sm:mb-0">
        📇 Müşteri Yönetimi
      </h2>
      <button
    onClick={exportToExcel}
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
  >
    📥 Excel İndir
  </button>
</div>

      {/* FILTER */}
      <h4 className="text-xl font-semibold text-gray-700 mb-2">🔎 Filtrele</h4>
      <div className="bg-white shadow p-4 rounded mb-6 grid sm:grid-cols-4 gap-3">
        <input
          type="text"
          name="clientName"
          placeholder="Ad filtrele"
          value={filter.clientName}
          onChange={handleFilterChange}
          className="input"
        />
        <input
          type="text"
          name="clientSurname"
          placeholder="Soyad filtrele"
          value={filter.clientSurname}
          onChange={handleFilterChange}
          className="input"
        />
        <input
          type="text"
          name="clientTelNo"
          placeholder="Telefon filtrele"
          value={filter.clientTelNo}
          onChange={handleFilterChange}
          className="input"
        />
        <input
          type="text"
          name="clientAdres"
          placeholder="Adres filtrele"
          value={filter.clientAdres}
          onChange={handleFilterChange}
          className="input"
        />
      </div>

      {/* FORM */}
      <h4 className="text-xl font-semibold text-gray-700 mb-2">
        {editing ? '✏️ Müşteri Güncelle' : '➕ Yeni Müşteri Ekle'}
      </h4>
      <div className="bg-white rounded shadow p-6 mb-6 space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
  <input
    name="clientName"
    placeholder="Ad"
    value={form.clientName}
    onChange={handleChange}
    className="input"
  />
  <input
    name="clientSurname"
    placeholder="Soyad"
    value={form.clientSurname}
    onChange={handleChange}
    className="input"
  />
  <input
    name="clientTelNo"
    placeholder="Telefon"
    value={form.clientTelNo}
    onChange={handleChange}
    className="input"
  />
  <input
    name="clientAdres"
    placeholder="Adres"
    value={form.clientAdres}
    onChange={handleChange}
    className="input col-span-full"
  />
  <input
    name="clientRequestMilk"
    placeholder="İstenen Süt (L)"
    type="number"
    value={form.clientRequestMilk || ''}
    onChange={handleChange}
    className="input"
  />
  <input
    name="clientDeliverMilk"
    placeholder="Teslim Edilen Süt (L)"
    type="number"
    value={form.clientDeliverMilk || ''}
    onChange={handleChange}
    className="input"
  />
  <input
    name="clientPrice"
    placeholder="Tutar (₺)"
    type="number"
    value={form.clientPrice || ''}
    onChange={handleChange}
    className="input"
  />
</div>


        {/* BUTONLAR */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={handleAddOrUpdate}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded"
          >
            {editing ? 'Güncelle' : 'Ekle'}
          </button>

          {editing && (
            <button
              onClick={() => {
                setEditing(null);
                setForm({ clientName: '', clientSurname: '', clientTelNo: '', clientAdres: '', clientRequestMilk: '', clientDeliverMilk: '', clientPrice: '' });
                setSelectedClient(null);
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-6 rounded"
            >
              Vazgeç
            </button>
          )}
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <p className="text-center text-gray-500">Yükleniyor...</p>
      ) : (
        <ul className="space-y-4">
        {data.map((item) => (
          <li key={item.clientId} className="bg-white rounded shadow">
            {/* Client Row */}
            <div
              onClick={() =>{
                setSelectedClient(
                  selectedClient?.clientId === item.clientId ? null : item
                )
                    setEditing(item);
                    setForm({
                      clientName: item.clientName,
                      clientSurname: item.clientSurname,
                      clientTelNo: item.clientTelNo,
                      clientAdres: item.clientAdres,
                      clientRequestMilk: item.clientRequestMilk,
                      clientDeliverMilk: item.clientDeliverMilk,
                      clientPrice: item.clientPrice,
                    });}
              }
              className={`cursor-pointer p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                selectedClient?.clientId === item.clientId
                  ? 'ring-2 ring-blue-400'
                  : ''
              }`}
            >
              <div>
                <p className="font-bold text-lg text-gray-800">
                  {item.clientName} {item.clientSurname}
                </p>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <span>📞 {item.clientTelNo}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(item.clientTelNo);
                      toast.success('Telefon numarası kopyalandı!');
                    }}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Kopyala
                  </button>
                </div>
                <p className="text-gray-600 text-sm">🏠 {item.clientAdres}</p>
              </div>
      
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing(item);
                    setForm({
                      clientName: item.clientName,
                      clientSurname: item.clientSurname,
                      clientTelNo: item.clientTelNo,
                      clientAdres: item.clientAdres,
                      clientRequestMilk: item.clientRequestMilk,
                      clientDeliverMilk: item.clientDeliverMilk,
                      clientPrice: item.clientPrice,
                    });
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Güncelle
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(item);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Sil
                </button>
              </div>
            </div>
      
            {/* Detay Kutusu */}
            {selectedClient?.clientId === item.clientId && (
              <div className="bg-gray-50 px-6 pb-4 pt-2 border-t border-blue-100">
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>🥛 Sipariş Edilen Süt: <strong>{item.clientRequestMilk} Litre</strong></li>
                  <li>✅ Teslim Edilen Süt: <strong>{item.clientDeliverMilk} Litre</strong></li>
                  <li>💵 Tutar: <strong>{item.clientPrice}₺</strong></li>
                </ul>
              </div>
            )}

          </li>
        ))}
      </ul>
      
      
      )}


      {/* DELETE MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
              {confirmDelete.clientName} {confirmDelete.clientSurname} silinsin mi?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Evet, sil
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

