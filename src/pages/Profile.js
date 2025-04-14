import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getUserProfile, updateProfile } from "./Main.crud";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Profile() {
  const [form, setForm] = useState({
    userName: "",
    password: "",
    contactInfos: [],
    addressInfos: [],
  });

  const [editMode, setEditMode] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile(user.userId);
        if (res.data.state) {
          const data = res.data.model;
          setForm({
            userName: data.userName,
            password: "",
            contactInfos: data.contactInfoList || [],
            addressInfos: data.addressInfoList || [],
          });
        } else {
          toast.error("Profil bilgileri alınamadı");
        }
      } catch {
        toast.error("Sunucu hatası");
      }
    };
    fetchProfile();
  }, [user.userId]);

  const handleChange = (e, index, field, type) => {
    const updated = [...form[type]];
    updated[index][field] = e.target.value;
    setForm((prev) => ({ ...prev, [type]: updated }));
  };

  const addField = (type) => {
    const newItem =
      type === "contactInfos"
        ? { type: "", value: "" }
        : { type: "", value: "", latitude: "", longitude: "" };
    setForm({ ...form, [type]: [...form[type], newItem] });
  };

  const handleSave = async () => {
    try {
      const payload = {
        userId: user.userId,
        userName: form.userName,
        password: form.password,
        contactInfoList: form.contactInfos,
        addressInfoList: form.addressInfos,
      };

      const res = await updateProfile(payload);
      if (res.data.state) {
        toast.success("Profil güncellendi");
        setEditMode(false);
      } else {
        toast.error("Güncelleme başarısız");
      }
    } catch {
      toast.error("Bir hata oluştu");
    }
  };

  const LocationSetter = ({ index }) => {
    useMapEvents({
      click(e) {
        const updated = [...form.addressInfos];
        updated[index] = {
          ...updated[index],
          latitude: e.latlng.lat.toString(),
          longitude: e.latlng.lng.toString(),
          value: "", // manuel tıklamada açıklama sıfırlanır
        };
        setForm((prev) => ({ ...prev, addressInfos: updated }));
        toast.success("Konum seçildi. Açıklama sıfırlandı.");
      },
    });
    return null;
  };

  const GeocoderControl = ({ index }) => {
    const map = useMap();

    useEffect(() => {
      const geocoder = L.Control.Geocoder.nominatim();

      const control = L.Control.geocoder({
        defaultMarkGeocode: true,
        geocoder,
      })
        .on("markgeocode", function (e) {
          const { center, name } = e.geocode;
          map.setView(center, 13);

          const updated = [...form.addressInfos];
          updated[index] = {
            ...updated[index],
            latitude: center.lat.toString(),
            longitude: center.lng.toString(),
            value: name,
          };
          setForm((prev) => ({ ...prev, addressInfos: updated }));
        })
        .addTo(map);

      return () => {
        map.removeControl(control);
      };
    }, [map]);

    return null;
  };

  const CurrentLocationButton = ({ index }) => {
    const map = useMap();

    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        toast.error("Tarayıcınız konum almayı desteklemiyor.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const updated = [...form.addressInfos];
          updated[index] = {
            ...updated[index],
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          };
          setForm((prev) => ({ ...prev, addressInfos: updated }));
          map.setView([latitude, longitude], 13);
          toast.success("Konum alındı!");
        },
        (error) => {
          toast.error("Konum alınamadı: " + error.message);
        }
      );
    };

    return (
      <button
        onClick={getCurrentLocation}
        className="text-sm text-blue-600 underline mt-2"
      >
        📍 Şu Anki Konumumu Kullan
      </button>
    );
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-lg shadow space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-blue-600">👤 Profilim</h2>

        <div className="flex gap-3">
          {editMode ? (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                İptal Et
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Kaydet
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Düzenle
            </button>
          )}
        </div>
      </div>

      {/* Kullanıcı Bilgileri */}
      <section className="space-y-4 border-t pt-4">
        <h3 className="text-xl font-semibold text-gray-700">👤 Kullanıcı Bilgileri</h3>
        <input
          value={form.userName}
          onChange={(e) => setForm({ ...form, userName: e.target.value })}
          disabled={!editMode}
          placeholder="Kullanıcı Adı"
          className="input w-full"
        />
        <input
          value={form.password}
          type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          disabled={!editMode}
          placeholder="Yeni Şifre (boş bırakılırsa değişmez)"
          className="input w-full"
        />
      </section>

      {/* İletişim Bilgileri */}
      <section className="space-y-3 border-t pt-4">
        <h3 className="text-xl font-semibold text-gray-700">📞 İletişim Bilgileri</h3>
        {form.contactInfos.map((c, idx) => (
          <div key={idx} className="flex gap-3">
            <input
              value={c.type}
              onChange={(e) => handleChange(e, idx, "type", "contactInfos")}
              disabled={!editMode}
              placeholder="Tür"
              className="input w-1/3"
            />
            <input
              value={c.value}
              onChange={(e) => handleChange(e, idx, "value", "contactInfos")}
              disabled={!editMode}
              placeholder="Bilgi"
              className="input w-2/3"
            />
          </div>
        ))}
        {editMode && (
          <button onClick={() => addField("contactInfos")} className="text-blue-600 text-sm">
            + Yeni İletişim
          </button>
        )}
      </section>

      {/* Adres Bilgileri */}
      <section className="space-y-3 border-t pt-4">
        <h3 className="text-xl font-semibold text-gray-700">📍 Adres Bilgileri</h3>
        {form.addressInfos.map((a, idx) => (
          <div key={idx} className="space-y-2 border p-4 rounded">
            <div className="flex gap-3">
              <input
                value={a.type}
                onChange={(e) => handleChange(e, idx, "type", "addressInfos")}
                disabled={!editMode}
                placeholder="Tür"
                className="input w-1/2"
              />
              <input
                value={a.value}
                onChange={(e) => handleChange(e, idx, "value", "addressInfos")}
                disabled={!editMode}
                placeholder="Adres Açıklaması"
                className="input w-1/2"
              />
            </div>


            <div className="h-40 mt-2 rounded overflow-hidden">
              <MapContainer
                center={
                  a.latitude && a.longitude
                    ? [parseFloat(a.latitude), parseFloat(a.longitude)]
                    : [39.92, 32.85]
                }
                zoom={a.latitude ? 13 : 6}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {editMode && <LocationSetter index={idx} />}
                {editMode && <GeocoderControl index={idx} />}
                {editMode && <CurrentLocationButton index={idx} />}

                {a.latitude && a.longitude && (
                  <Marker position={[parseFloat(a.latitude), parseFloat(a.longitude)]} />
                )}
              </MapContainer>
            </div>
          </div>
        ))}
        {editMode && (
          <button onClick={() => addField("addressInfos")} className="text-blue-600 text-sm">
            + Yeni Adres
          </button>
        )}
      </section>
    </div>
  );
}
