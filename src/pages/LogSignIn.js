import { useState } from "react";
import toast from "react-hot-toast";
import { logInUser, signInUser } from "./Main.crud";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet marker fix (ikonu düzgün göstermesi için)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function LogSignIn() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userName: "",
    password: "",
    role: "Buyer",
    contact: { type: "Telefon", value: "" },
    address: { type: "Ev", value: "", longitude: "", latitude: "" },
  });

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

  const handleSubmit = async () => {
    if (!form.userName || !form.password) {
      return toast.error("Kullanıcı adı ve şifre zorunlu");
    }
    if (!isLogin) {
      if (!form.contact.value) return toast.error("Telefon zorunlu");
      if (
        !form.address.value ||
        !form.address.type ||
        !form.address.latitude ||
        !form.address.longitude
      ) {
        return toast.error("Adres açıklaması ve konumu zorunlu");
      }
    }
    try {
      let payload;

      if (isLogin) {
        payload = {
          userName: form.userName,
          password: form.password,
        };
      } else {
        payload = {
          userName: form.userName,
          password: form.password,
          role: form.role,
          contactInfoModel: form.contact,
          addressInfoModel: form.address,
        };
      }

      const res = isLogin
        ? await logInUser(payload)
        : await signInUser(payload);

      if (res.data.state) {
        localStorage.setItem("user", JSON.stringify(res.data.model));
        toast.success(isLogin ? "Giriş başarılı!" : "Kayıt başarılı!");
        navigate("/menu");
        window.location.reload();
      } else {
        toast.error(res.data.message || "İşlem başarısız");
      }
    } catch (err) {
      toast.error("Bir hata oluştu");
      console.error(err);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setForm((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            latitude: e.latlng.lat.toString(),
            longitude: e.latlng.lng.toString(),
          },
        }));
      },
    });

    return form.address.latitude && form.address.longitude ? (
      <Marker
        position={[
          parseFloat(form.address.latitude),
          parseFloat(form.address.longitude),
        ]}
      />
    ) : null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 px-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-blue-600">
          {isLogin ? "🔐 Giriş Yap" : "📝 Kayıt Ol"}
        </h2>

        <div className="space-y-4">
          <input
            name="userName"
            value={form.userName}
            onChange={handleChange}
            placeholder="Kullanıcı Adı"
            className="input w-full"
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Şifre"
            className="input w-full"
          />

          {!isLogin && (
            <>
              <input
                name="contact.value"
                value={form.contact.value}
                onChange={handleChange}
                placeholder="Telefon (555 555 55 55)"
                className="input w-full"
              />

              <input
                name="address.type"
                value={form.address.type}
                onChange={handleChange}
                placeholder="Adres Tipi (örn: Ev, İş, Ahır)"
                className="input w-full"
              />

              <input
                name="address.value"
                value={form.address.value}
                onChange={handleChange}
                placeholder="Adres Açıklaması"
                className="input w-full"
              />

              <div>
                <label className="text-sm text-gray-600">
                  📍 Haritada konum seç:
                </label>
                <div className="h-60 mt-2 rounded overflow-hidden">
                  <MapContainer
                    center={[39.92, 32.85]} // Default Ankara
                    zoom={6}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationMarker />
                  </MapContainer>
                </div>
              </div>
            </>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </button>
        </div>

        <p className="text-sm text-center text-gray-600">
          {isLogin ? "Hesabın yok mu?" : "Zaten hesabın var mı?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setForm({
                userName: "",
                password: "",
                role: "Buyer",
                contact: { type: "Telefon", value: "" },
                address: { type: "Ev", value: "", longitude: "", latitude: "" },
              });
            }}
            className="text-blue-600 hover:underline"
          >
            {isLogin ? "Kayıt Ol" : "Giriş Yap"}
          </button>
        </p>
      </div>
    </div>
  );
}
