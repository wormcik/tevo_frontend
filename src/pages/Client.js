import { useEffect, useState } from 'react';
import { clientGet, clientAdd, clientUpdate, clientDelete } from './Main.crud';
import toast from 'react-hot-toast';

export default function Client() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    clientName: '',
    clientSurname: '',
    clientTelNo: '',
    clientAdres: '',
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await clientGet();
      setData(res.data);
    } catch {
      toast.error('Veriler alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdate = async () => {
    const { clientName, clientSurname, clientTelNo, clientAdres } = form;
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
      setForm({ clientName: '', clientSurname: '', clientTelNo: '', clientAdres: '' });
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
    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">📇 Müşteri Yönetimi</h2>

      {/* FORM */}
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
        </div>
        <button
          onClick={handleAddOrUpdate}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded w-full sm:w-auto"
        >
          {editing ? 'Güncelle' : 'Ekle'}
        </button>
      </div>

      {/* LIST */}
      {loading ? (
        <p className="text-center text-gray-500">Yükleniyor...</p>
      ) : (
        <ul className="space-y-4">
          {data.map((item) => (
            <li
              key={item.clientId}
              className="bg-white p-4 rounded shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <p className="font-bold text-lg text-gray-800">
                  {item.clientName} {item.clientSurname}
                </p>
                <p className="text-gray-600 text-sm">📞 {item.clientTelNo}</p>
                <p className="text-gray-600 text-sm">🏠 {item.clientAdres}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(item);
                    setForm({
                      clientName: item.clientName,
                      clientSurname: item.clientSurname,
                      clientTelNo: item.clientTelNo,
                      clientAdres: item.clientAdres,
                    });
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => setConfirmDelete(item)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Sil
                </button>
              </div>
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
