// src/pages/AddProduct.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../Layout";

export default function AddProduct() {
  const [form, setForm] = useState({ name: "", quantity: "", description: "", category: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [categories, setCategories] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadCats = async () => {
      try {
        const res = await axios.get("http://localhost:8000/products/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data || []);
      } catch (_e) {
        // kategori yoksa sorun değil
      }
    };
    loadCats();
  }, [token]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await axios.post("http://localhost:8000/products", {
        name: form.name.trim(),
        description: form.description?.trim() || null,
        quantity: parseInt(form.quantity || "0", 10),
        category: form.category?.trim() || null,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.href = "/products";
    } catch (e) {
      const msg = e.response?.data?.detail || "Ürün eklenemedi.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Yeni Ürün</h1>
          <p className="text-sm text-slate-500">Ürün bilgisini doldurup kaydedin.</p>
        </div>

        {err && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ad</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Örn: Vanalar"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Stok</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={onChange}
              placeholder="0"
              min={0}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
            <div className="flex gap-2">
              <select
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">— Seç / Yaz —</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={onChange}
                placeholder="Yeni kategori yaz"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">İstersen mevcut kategorilerden seç, istersen yeni yaz.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="İsteğe bağlı notlar…"
              rows={4}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <a href="/products" className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition">İptal</a>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white transition shadow-sm ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500"}`}
            >
              {loading ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}







