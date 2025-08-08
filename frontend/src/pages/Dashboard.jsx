// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../Layout";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [daily, setDaily] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const run = async () => {
      try {
        const [s, d] = await Promise.all([
          axios.get("http://localhost:8000/stats?threshold=10", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:8000/stats/daily?days=7", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setStats(s.data);
        setDaily(d.data || []);
      } catch (e) {
        setErr(e.response?.data?.detail || "İstatistikler alınamadı.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [token]);

  if (loading) return <Layout><div>Yükleniyor…</div></Layout>;
  if (err) return <Layout><div className="text-rose-600">{err}</div></Layout>;
  if (!stats) return <Layout><div>Veri yok.</div></Layout>;

  const bars = daily.map(d => d.count_all);
  const max = Math.max(1, ...bars);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Özet</h1>
        <p className="text-sm text-slate-500">Depo durumunun hızlı görünümü</p>
      </div>

      {/* Kartlar */}
      <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-4">
          <div className="text-slate-500 text-sm">Toplam Ürün</div>
          <div className="text-3xl font-semibold">{stats.totals.all}</div>
          <div className="text-xs text-slate-500 mt-1">Benim: {stats.totals.mine}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-4">
          <div className="text-slate-500 text-sm">Düşük Stok (&lt; {stats.low_stock.threshold})</div>
          <div className="text-3xl font-semibold text-rose-600">{stats.low_stock.all}</div>
          <div className="text-xs text-slate-500 mt-1">Benim: {stats.low_stock.mine}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-4">
          <div className="text-slate-500 text-sm">Bugün Eklenen</div>
          <div className="text-3xl font-semibold">{stats.added_today.all}</div>
          <div className="text-xs text-slate-500 mt-1">Benim: {stats.added_today.mine}</div>
        </div>

        <a href="/products" className="bg-indigo-600 hover:bg-indigo-500 transition text-white rounded-2xl shadow-sm p-4 flex flex-col justify-center">
          <div className="text-sm opacity-90">Hızlı Erişim</div>
          <div className="text-2xl font-semibold">Ürünlere Git →</div>
        </a>
      </div>

      {/* Mini grafik: Son 7 gün eklenen (ALL) */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-4">
        <div className="flex items-end gap-2 h-32">
          {daily.map((d, i) => {
            const h = (d.count_all / max) * 100;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center">
                <div
                  className="w-6 bg-indigo-500/80 rounded-t"
                  style={{ height: `${h}%` }}
                  title={`${d.date}: ${d.count_all}`}
                />
                <div className="text-[10px] mt-2 text-slate-500">
                  {d.date.slice(5)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-slate-500 mt-2">Son 7 gün eklenen ürünler (Tümü)</div>
      </div>
    </Layout>
  );
}
