// src/pages/Register.jsx
import { useState } from "react";
import axios from "axios";
import Layout from "../Layout";

export default function Register() {
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    setLoading(true);
    try {
      await axios.post("http://localhost:8000/users/register", form, {
        headers: { "Content-Type": "application/json" },
      });
      setOk("Hesap başarıyla oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz…");
      setTimeout(() => (window.location.href = "/"), 1200);
    } catch (e) {
      const msg =
        e.response?.data?.detail ||
        (Array.isArray(e.response?.data) ? e.response.data[0]?.msg : "") ||
        "Kayıt işlemi başarısız.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout withNav={false}>
      <div className="min-h-[calc(100vh-0px)] grid place-items-center py-10">
        <div className="w-full max-w-3xl grid md:grid-cols-2 gap-0 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
          {/* Sol banner */}
          <div className="hidden md:flex flex-col justify-between p-8 bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400 text-white">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">ASKİ Depo</h1>
              <p className="mt-2 text-indigo-100">
                Dakikalar içinde kaydol, stoklarını yönetmeye başla.
              </p>
            </div>
            <ul className="mt-8 space-y-3 text-indigo-50/90 text-sm">
              <li className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-white rounded-full" />
                Basit ve modern arayüz
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-white rounded-full" />
                Yetkiye göre görünürlük
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-white rounded-full" />
                Log’larla şeffaf takip
              </li>
            </ul>
          </div>

          {/* Form */}
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight">Hesap Oluştur</h2>
              <p className="text-sm text-slate-500">
                E-posta, kullanıcı adı ve şifrenle kayıt ol.
              </p>
            </div>

            {err && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
                {err}
              </div>
            )}
            {ok && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">
                {ok}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="ornek@aski.gov.tr"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kullanıcı Adı</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  placeholder="kullanici_adi"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 text-sm"
                  >
                    {showPassword ? "Gizle" : "Göster"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-lg px-4 py-2 text-white transition shadow-sm ${
                  loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500"
                }`}
              >
                {loading ? "Kaydediliyor…" : "Kayıt Ol"}
              </button>
            </form>

            <div className="mt-5 text-sm text-slate-600">
              Zaten hesabın var mı?{" "}
              <a href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
                Giriş Yap
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

