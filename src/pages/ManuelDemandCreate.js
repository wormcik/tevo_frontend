import { useEffect, useState } from "react";
import {
  createManualDemand,
  getAllUsers,
  getUserProfile,
  getAllProducts,
} from "./Main.crud";
import toast from "react-hot-toast";

export default function ManuelDemandCreate() {
  const [form, setForm] = useState({
    recipientUserId: "",
    demanded: "",
    price: "",
    currency: "₺",
    contactInfoId: "",
    addressInfoId: "",
    productId: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [products, setProducts] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await getAllUsers();
        setBuyers(usersRes.data.filter((u) => u.role === "Buyer"));

        const profileRes = await getUserProfile(user.userId);
        if (profileRes.data.state) {
          setContacts(profileRes.data.model.contactInfoList || []);
          setAddresses(profileRes.data.model.addressInfoList || []);
        } else {
          toast.error("Profil bilgileri alınamadı");
        }

        const productsRes = await getAllProducts();
        setProducts(productsRes.data.model || []);
      } catch {
        toast.error("Veriler alınamadı");
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = [
      "contactInfoId",
      "addressInfoId",
      "productId",
    ].includes(name)
      ? parseInt(value)
      : value;

    setForm({ ...form, [name]: parsedValue });
  };

  const validateForm = () => {
    const missing = [];

    if (!form.recipientUserId) missing.push("Alıcı");
    if (!form.demanded) missing.push("İstenen miktar");
    if (!form.price) missing.push("Fiyat");
    if (!form.productId) missing.push("Ürün");
    if (!form.contactInfoId) missing.push("İletişim");
    if (!form.addressInfoId) missing.push("Adres");
    if (!form.date) missing.push("Tarih");

    setErrors(missing);
    return missing.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      ...form,
      delivererUserId: user.userId,
      state: "Alıcı Onayladı", // Manuel olarak bu state atanıyor
    };

    try {
      await createManualDemand(payload);
      toast.success("Talep başarıyla oluşturuldu");
      setForm({
        recipientUserId: "",
        demanded: "",
        price: "",
        currency: "₺",
        contactInfoId: "",
        addressInfoId: "",
        productId: "",
        date: new Date().toISOString().split("T")[0],
      });
      setErrors([]);
    } catch {
      toast.error("Talep oluşturulamadı");
    }
  };

  const inputClass = (field) =>
    `input w-full ${errors.includes(field) ? "border-red-500" : ""}`;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow mt-6 space-y-4">
      <h2 className="text-xl font-bold text-blue-600">
        ✍️ Manuel Talep Oluştur
      </h2>

      {errors.length > 0 && (
        <div className="bg-red-100 text-red-700 border border-red-300 p-3 rounded text-sm">
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
      <input
        name="price"
        value={form.price}
        onChange={handleChange}
        placeholder="Fiyat"
        type="number"
        className={inputClass("Fiyat")}
      />
      <select
        name="recipientUserId"
        value={form.recipientUserId}
        onChange={handleChange}
        className={inputClass("Alıcı")}
      >
        <option value="">Alıcı Seç</option>
        {buyers.map((b) => (
          <option key={b.userId} value={b.userId}>
            {b.userName}
          </option>
        ))}
      </select>

      <select
        name="contactInfoId"
        value={form.contactInfoId}
        onChange={handleChange}
        className={inputClass("İletişim")}
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
        className="btn-blue w-full py-2 font-semibold"
      >
        Manuel Talep Oluştur
      </button>
    </div>
  );
}
