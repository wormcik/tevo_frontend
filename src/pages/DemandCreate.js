import { useEffect, useState } from "react";
import {
  createDemand,
  getAllUsers,
  getUserProfile,
  getAllProducts,
} from "./Main.crud";
import toast from "react-hot-toast";

export default function DemandCreate() {
  const [form, setForm] = useState({
    demanded: "",
    delivererUserId: "",
    currency: "₺",
    contactInfoId: "",
    addressInfoId: "",
    productId: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [products, setProducts] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resUsers = await getAllUsers();
        const filtered = resUsers.data.filter((u) => u.role === "Seller");
        setSellers(filtered);

        const resProfile = await getUserProfile(user.userId);
        if (resProfile.data.state) {
          setContacts(resProfile.data.model.contactInfoList || []);
          setAddresses(resProfile.data.model.addressInfoList || []);
        } else {
          toast.error("Profil bilgileri alınamadı");
        }

        const resProducts = await getAllProducts();
        setProducts(resProducts.data.model || []);
      } catch (err) {
        toast.error("Veriler alınamadı");
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["contactInfoId", "addressInfoId", "productId"];
    setForm({
      ...form,
      [name]: numericFields.includes(name) ? parseInt(value) : value,
    });
  };

  const validateForm = () => {
    const missing = [];

    if (!form.demanded) missing.push("İstenen miktar");
    if (!form.currency) missing.push("Para birimi");
    if (!form.delivererUserId) missing.push("Satıcı");
    if (!form.contactInfoId) missing.push("İletişim bilgisi");
    if (!form.addressInfoId) missing.push("Adres");
    if (!form.productId) missing.push("Ürün");
    if (!form.date) missing.push("Tarih");

    setErrors(missing);
    return missing.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      demanded: parseFloat(form.demanded),
      delivererUserId: form.delivererUserId,
      recipientUserId: user.userId,
      currency: form.currency,
      contactInfoId: form.contactInfoId,
      addressInfoId: form.addressInfoId,
      productId: form.productId,
      date: new Date(form.date),
    };

    try {
      await createDemand(payload);
      toast.success("Talep oluşturuldu");
      setForm({
        demanded: "",
        delivererUserId: "",
        currency: "₺",
        contactInfoId: "",
        addressInfoId: "",
        productId: "",
        date: new Date().toISOString().split("T")[0],
      });
      setErrors([]);
    } catch (err) {
      toast.error("Talep oluşturulamadı");
    }
  };

  const inputClass = (field) =>
    `input w-full ${errors.includes(field) ? "border-red-500" : ""}`;

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-2xl font-bold text-blue-600 mb-2">
        🧾 Talep Oluştur
      </h2>

      {errors.length > 0 && (
        <div className="bg-red-100 text-red-700 border border-red-300 p-3 rounded text-sm mb-4">
          <strong>Eksik Alanlar:</strong>
          <ul className="list-disc list-inside">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <input
        name="date"
        value={form.date}
        onChange={handleChange}
        type="date"
        className={inputClass("Tarih")}
      />
      
      <input
        name="demanded"
        value={form.demanded}
        onChange={handleChange}
        placeholder="İstenen Miktar"
        type="number"
        className={inputClass("İstenen miktar")}
      />

      <select
        name="productId"
        value={form.productId}
        onChange={handleChange}
        className={inputClass("Ürün")}
      >
        <option value="">Ürün Seçin</option>
        {products.map((p) => (
          <option key={p.productId} value={p.productId}>
            {p.productName} ({p.unit})
          </option>
        ))}
      </select>

      <select
        name="delivererUserId"
        value={form.delivererUserId}
        onChange={handleChange}
        className={inputClass("Satıcı")}
      >
        <option value="">Satıcı Seçin</option>
        {sellers.map((s) => (
          <option key={s.userId} value={s.userId}>
            {s.userName}
          </option>
        ))}
      </select>

      <select
        name="contactInfoId"
        value={form.contactInfoId}
        onChange={handleChange}
        className={inputClass("İletişim bilgisi")}
      >
        <option value="">İletişim Bilgisi Seçin</option>
        {contacts.map((c) => (
          <option key={c.contactInfoId} value={c.contactInfoId}>
            {c.type}: {c.value}
          </option>
        ))}
      </select>

      <select
        name="addressInfoId"
        value={form.addressInfoId}
        onChange={handleChange}
        className={inputClass("Adres")}
      >
        <option value="">Adres Seçin</option>
        {addresses.map((a) => (
          <option key={a.addressInfoId} value={a.addressInfoId}>
            {a.type}: {a.value}
          </option>
        ))}
      </select>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full"
      >
        Talep Oluştur
      </button>
    </div>
  );
}
