import { useEffect, useState } from "react";
import { createDemand, getAllUsers, getUserProfile } from "./Main.crud";
import toast from "react-hot-toast";

export default function DemandCreate() {
  const [form, setForm] = useState({
    demandedMilk: "",
    delivererUserId: "",
    currency: "₺",
    contactInfoId: "",
    addressInfoId: "",
  });

  const [errors, setErrors] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [addresses, setAddresses] = useState([]);
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
      } catch (err) {
        toast.error("Veriler alınamadı");
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["contactInfoId", "addressInfoId"].includes(name)) {
      setForm({ ...form, [name]: parseInt(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validateForm = () => {
    const missing = [];

    if (!form.demandedMilk) missing.push("İstenen süt miktarı");
    if (!form.currency) missing.push("Para birimi");
    if (!form.delivererUserId) missing.push("Satıcı");
    if (!form.contactInfoId) missing.push("İletişim bilgisi");
    if (!form.addressInfoId) missing.push("Adres");

    setErrors(missing);
    return missing.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = {
      demandedMilk: parseFloat(form.demandedMilk),
      delivererUserId: form.delivererUserId,
      recipientUserId: user.userId,
      currency: form.currency,
      contactInfoId: parseInt(form.contactInfoId),
      addressInfoId: parseInt(form.addressInfoId),
    };

    try {
      await createDemand(payload);
      toast.success("Talep oluşturuldu");
      setForm({
        demandedMilk: "",
        delivererUserId: "",
        currency: "₺",
        contactInfoId: "",
        addressInfoId: "",
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
        🧾 Süt Talebi Oluştur
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
        name="demandedMilk"
        value={form.demandedMilk}
        onChange={handleChange}
        placeholder="İstenen Süt (L)"
        type="number"
        className={inputClass("İstenen süt miktarı")}
      />

      <select
        name="currency"
        value={form.currency}
        onChange={handleChange}
        className={inputClass("Para birimi")}
      >
        <option value="₺">₺ - Türk Lirası</option>
        <option value="$">$ - Dolar</option>
        <option value="€">€ - Euro</option>
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
