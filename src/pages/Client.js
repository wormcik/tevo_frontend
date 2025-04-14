import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { deleteUser, getAllBuyerUsers, signInUser } from "./Main.crud"; // API metodlarını buradan al

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    userName: "",
    contact: { type: "Telefon", value: "" },
    address: { type: "Ev", value: "", latitude: "", longitude: "" },
  });
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllBuyerUsers();
      const buyers = res.data.filter((u) => u.role === "Buyer");
      setUsers(buyers);
    } catch {
      toast.error("Kullanıcılar alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("contact.")) {
      setForm((prev) => ({
        ...prev,
        contact: { ...prev.contact, [name.split(".")[1]]: value },
      }));
    } else if (name.startsWith("address.")) {
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [name.split(".")[1]]: value },
      }));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleAddUser = async () => {
    if (!form.userName || !form.contact.value || !form.address.value) {
      return toast.error("Lütfen tüm alanları doldurun.");
    }

    const payload = {
      userName: form.userName,
      password: "test",
      role: "Buyer",
      isBanned: false,
      contactInfoModel: form.contact,
      addressInfoModel: form.address,
    };

    try {
      await signInUser(payload);
      toast.success("Kullanıcı eklendi!");
      fetchUsers();
      setForm({
        userName: "",
        contact: { type: "Telefon", value: "" },
        address: { type: "Ev", value: "", latitude: "", longitude: "" },
      });
    } catch (err) {
      toast.error("Ekleme başarısız!");
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(confirmDelete.userId);
      toast.success("Kullanıcı silindi!");
      setUsers((prev) => prev.filter((u) => u.userId !== confirmDelete.userId));
      setConfirmDelete(null);
    } catch {
      toast.error("Silme işlemi başarısız.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-blue-600 text-center mb-6">
        👤 Kullanıcı Yönetimi
      </h2>

      {/* FORM */}
      <div className="bg-white p-6 rounded shadow space-y-4 mb-8">
        <input
          name="userName"
          placeholder="Kullanıcı Adı"
          value={form.userName}
          onChange={handleChange}
          className="input w-full"
        />
        <input
          name="contact.value"
          placeholder="Telefon"
          value={form.contact.value}
          onChange={handleChange}
          className="input w-full"
        />
        <input
          name="address.value"
          placeholder="Adres"
          value={form.address.value}
          onChange={handleChange}
          className="input w-full"
        />
        <button
          onClick={handleAddUser}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          ➕ Kullanıcı Ekle
        </button>
      </div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Kullanıcı adına göre ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input w-full"
        />
      </div>

      {/* KULLANICI LİSTESİ */}
      {loading ? (
        <p className="text-center text-gray-500">Yükleniyor...</p>
      ) : (
        <ul className="space-y-4">
          {users
            .filter((u) =>
              u.userName?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((user) => (
              <li
                key={user.userId}
                className="bg-white rounded shadow p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-gray-800">{user.userName}</p>
                  <p className="text-sm text-gray-600">
                    📞 {user.contactInfoList?.[0]?.value || "Yok"}
                  </p>
                  <p className="text-sm text-gray-600">
                    🏠 {user.addressInfoList?.[0]?.value || "Yok"}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDelete(user)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                >
                  Sil
                </button>
              </li>
            ))}
        </ul>
      )}

      {/* SİLME ONAY MODALI */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
              {confirmDelete.userName} silinsin mi?
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
