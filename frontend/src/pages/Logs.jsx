// src/pages/Logs.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import Layout from "../Layout";

const ACTION_LABELS = {
  create_product: "Ürün Ekleme",
  update_product: "Ürün Güncelleme",
  increase_stock: "Stok Artırma",
  decrease_stock: "Stok Azaltma",
  delete_product: "Ürün Silme",
};

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [actionFilter, setActionFilter] = useState("");
  const [textFilter, setTextFilter] = useState("");
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const token = localStorage.getItem("token");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const [logsRes, usersRes] = await Promise.all([
        axios.get("http://localhost:8000/logs", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8000/users/admin", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setLogs(logsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (e) {
      const msg =
        e.response?.status === 403
          ? "Bu sayfaya yalnızca adminler erişebilir."
          : e.response?.data?.detail || e.message;
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const userMap = useMemo(() => {
    const m = new Map();
    users.forEach((u) => m.set(u.id, u.username));
    return m;
  }, [users]);

  const filtered = useMemo(() => {
    let list = [...logs];

    if (actionFilter) list = list.filter((l) => l.action === actionFilter);

    if (startDate) {
      const s = new Date(startDate);
      list = list.filter((l) => new Date(l.timestamp) >= s);
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      list = list.filter((l) => new Date(l.timestamp) <= e);
    }

    if (textFilter.trim()) {
      const q = textFilter.toLowerCase();
      list = list.filter((l) => {
        const uname = (userMap.get(l.user_id) || "").toLowerCase();
        const actionLabel = (ACTION_LABELS[l.action] || l.action || "").toLowerCase();
        const entity = (l.entity || "").toLowerCase();
        const entityId = String(l.entity_id ?? "").toLowerCase();
        return (
          uname.includes(q) ||
          actionLabel.includes(q) ||
          entity.includes(q) ||
          entityId.includes(q)
        );
      });
    }

    list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return list;
  }, [logs, actionFilter, startDate, endDate, textFilter, userMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const badge = (action) => {
    if (action === "delete_product") return "bg-rose-100 text-rose-700";
    if (action === "update_product") return "bg-amber-100 text-amber-700";
    if (action === "create_product") return "bg-emerald-100 text-emerald-700";
    if (action?.includes("increase")) return "bg-cyan-100 text-cyan-700";
    if (action?.includes("decrease")) return "bg-orange-100 text-orange-700";
    return "bg-slate-100 text-slate-700";
    };

  const resetFilters = () => {
    setActionFilter("");
    setTextFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const exportCSV = () => {
    const header = ["timestamp", "username", "action", "entity", "entity_id"];
    const rows = filtered.map((l) => [
      new Date(l.timestamp).toISOString(),
      userMap.get(l.user_id) || `user#${l.user_id}`,
      ACTION_LABELS[l.action] || l.action,
      l.entity,
      l.entity_id ?? "",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Layout><div>Yükleniyor…</div></Layout>;
  if (err) return <Layout><div className="text-rose-600">{err}</div></Layout>;

  return (
    <Layout>
      {/* Üst */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Aktivite Logları</h1>
          <p className="text-sm text-slate-500">Sistem üzerinde yapılan işlemlerin zaman çizelgesi.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-sm"
          >
            CSV Dışa Aktar
          </button>
          <button
            onClick={fetchAll}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
          >
            Yenile
          </button>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-4 mb-5 grid md:grid-cols-5 sm:grid-cols-2 gap-3">
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="border px-3 py-2 rounded"
        >
          <option value="">Tüm İşlemler</option>
          <option value="create_product">Ürün Ekleme</option>
          <option value="update_product">Ürün Güncelleme</option>
          <option value="increase_stock">Stok Artırma</option>
          <option value="decrease_stock">Stok Azaltma</option>
          <option value="delete_product">Ürün Silme</option>
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
          className="border px-3 py-2 rounded"
        />

        <input
          type="text"
          value={textFilter}
          onChange={(e) => { setTextFilter(e.target.value); setPage(1); }}
          placeholder="Kullanıcı/işlem/varlık ara…"
          className="border px-3 py-2 rounded md:col-span-2"
        />

        <div className="md:col-start-5 flex md:justify-end">
          <button onClick={resetFilters} className="bg-gray-200 px-3 py-2 rounded w-full md:w-auto">
            Temizle
          </button>
        </div>
      </div>

      {/* Tablo */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="border-b border-slate-200 p-3 text-left text-sm font-medium text-slate-600">Zaman</th>
              <th className="border-b border-slate-200 p-3 text-left text-sm font-medium text-slate-600">Kullanıcı</th>
              <th className="border-b border-slate-200 p-3 text-left text-sm font-medium text-slate-600">İşlem</th>
              <th className="border-b border-slate-200 p-3 text-left text-sm font-medium text-slate-600">Varlık</th>
              <th className="border-b border-slate-200 p-3 text-left text-sm font-medium text-slate-600">Varlık ID</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">Kayıt bulunamadı.</td>
              </tr>
            ) : (
              pageItems.map((l, idx) => (
                <tr key={l.id} className={idx % 2 ? "bg-slate-50/40" : "bg-white hover:bg-slate-50"}>
                  <td className="p-3">{new Date(l.timestamp).toLocaleString()}</td>
                  <td className="p-3">{userMap.get(l.user_id) || `Kullanıcı #${l.user_id}`}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge(l.action)}`} title={l.action}>
                      {ACTION_LABELS[l.action] || l.action}
                    </span>
                  </td>
                  <td className="p-3 capitalize">{l.entity}</td>
                  <td className="p-3">{l.entity_id ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-slate-600">
          Toplam {filtered.length} kayıt • Sayfa {currentPage}/{totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`px-3 py-2 rounded border ${currentPage <= 1 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            ← Önceki
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={`px-3 py-2 rounded border ${currentPage >= totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Sonraki →
          </button>
        </div>
      </div>
    </Layout>
  );
}



