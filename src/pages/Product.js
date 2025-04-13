import { useEffect, useState } from "react";
import { getAllProducts, addProduct, deleteProduct } from "./Main.crud";
import toast from "react-hot-toast";

export default function Product() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ productName: "", unit: "" });

  const fetchProducts = async () => {
    try {
      const res = await getAllProducts();
      setProducts(res.data.model || []);
    } catch {
      toast.error("Ürünler alınamadı");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAdd = async () => {
    if (!form.productName || !form.unit) {
      return toast.error("Tüm alanları doldurun");
    }
    try {
      await addProduct(form);
      toast.success("Ürün eklendi");
      setForm({ productName: "", unit: "" });
      fetchProducts();
    } catch {
      toast.error("Ürün eklenemedi");
    }
  };

  const handleDelete = async (productId) => {
    try {
      await deleteProduct({ productId });
      toast.success("Ürün silindi");
      fetchProducts();
    } catch {
      toast.error("Silme işlemi başarısız");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-bold text-blue-600">📦 Ürün Yönetimi</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <input
          name="productName"
          value={form.productName}
          onChange={handleChange}
          placeholder="Ürün Adı"
          className="input"
        />
        <input
          name="unit"
          value={form.unit}
          onChange={handleChange}
          placeholder="Birim (ör: Litre, Kg)"
          className="input"
        />
      </div>
      <button onClick={handleAdd} className="btn-blue w-full sm:w-auto">
        ➕ Ürün Ekle
      </button>

      <div className="space-y-2 mt-6">
        {products.map((p) => (
          <div
            key={p.productId}
            className="flex justify-between items-center bg-white p-4 rounded shadow"
          >
            <div>
              <p className="font-semibold">{p.productName}</p>
              <p className="text-sm text-gray-500">Birim: {p.unit}</p>
            </div>
            <button
              onClick={() => handleDelete(p.productId)}
              className="btn-red text-sm"
            >
              Sil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
