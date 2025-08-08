// src/pages/AdminUsers.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "../Layout";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [editOpen, setEditOpen] = useState(false);
  const [edited, setEdited] = useState({ id: null, username: "", email: "", role: "user", password: "" });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const token = localStorage.getItem("token");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get("http://localhost:8000/users/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data || []);
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
    fetchUsers();
  }, [fetchUsers]);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.role || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const items = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const roleBadge = (role) =>
    role === "admin"
      ? "bg-purple-100 text-purple-700"
      : "bg-emerald-100 text-emerald-700";

  const openEdit = (u) => {
    setEdited({ id: u.id, username: u.username, email: u.email, role: u.role || "user", password: "" });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEdited({ id: null, username: "", email: "", role: "user", password: "" });
  };

  const saveUser = async () => {
    try {
      const body = {
        username: edited.username,
        email: edited.email,
        role: edited.role,
      };
      if (edited.password?.trim()) body.password = edited.password.trim();

      await axios.put(`http://localhost:8000/users/${edited.id}`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchUsers();
      closeEdit();
    } catch (e) {
      alert(e.response?.data?.detail || "Güncelleme başarısız.");
    }
  };

  const askDelete = (u) => {
    setToDelete(u);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/users/${toDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchUsers();
      setConfirmOpen(false);
      setToDelete(null);
    } catch (e) {
      alert(e.response?.data?.detail || "Silme işlemi başarısız.");
    }
  };

  if (loading) return <Layout><div>Yükleniyor…</div></Layout>;
  if (err) return <Layout><div className="text-rose-600">{err}</div></Layout>;

  return (
    <Layout>
      {/* Üst */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kullanıcılar</h1>
          <p className="text-sm text-slate-500">Kullanıcı bilgilerini görüntüle ve yönet.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Kullanıcı / e-posta / rol ara…"
              className="peer border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none px-4 py-2 rounded-lg bg-white shadow-sm transition w-72"
            />
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 21l-4.3-4.3m1.3-5.2a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
          >
            Yenile
          </button>
        </div>
      </div>

      {/* Tablo */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="border-b border-slate-200 p-3 text-left text-sm font-medium text-slate-600">ID</th>
              <th className="border-b border-slate-200 p-3 text-left text-sm font-medium text-slate-600">Kullanıcı Adı</th>
              <th className="border-b border-slate-200 p-3 text-left text-sm font-medium text-slate-600">E-posta</th>
              <th className="border-b border-slate-200 p-3 text-left text-sm font-medium text-slate-600">Rol</th>
              <th className="border-b border-slate-200 p-3 text-left text-sm font-medium text-slate-600">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u, idx) => (
              <tr key={u.id} className={idx % 2 ? "bg-slate-50/40" : "bg-white hover:bg-slate-50"}>
                <td className="p-3">#{u.id}</td>
                <td className="p-3 font-medium">{u.username}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadge(u.role)}`}>
                    {u.role?.toUpperCase() || "USER"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      className="px-3 py-1.5 rounded-md bg-amber-500 text-white hover:bg-amber-400 transition"
                      onClick={() => openEdit(u)}
                    >
                      Düzenle
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-md bg-rose-600 text-white hover:bg-rose-500 transition"
                      onClick={() => askDelete(u)}
                    >
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">Kayıt yok.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-slate-600">
          Toplam {filtered.length} kullanıcı • Sayfa {currentPage}/{totalPages}
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

      {/* Düzenle Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[420px] ring-1 ring-slate-200 space-y-4">
            <h2 className="text-xl font-semibold">Kullanıcıyı Düzenle</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kullanıcı Adı</label>
              <input
                value={edited.username}
                onChange={(e) => setEdited({ ...edited, username: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
              <input
                type="email"
                value={edited.email}
                onChange={(e) => setEdited({ ...edited, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
              <select
                value={edited.role}
                onChange={(e) => setEdited({ ...edited, role: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="user">USER</option>
                <option value="admin">ADMIN</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Yeni Şifre (opsiyonel)</label>
              <input
                type="password"
                value={edited.password}
                onChange={(e) => setEdited({ ...edited, password: e.target.value })}
                placeholder="Boş bırakırsan değişmez"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="flex justify-between">
              <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition" onClick={saveUser}>
                Kaydet
              </button>
              <button className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition" onClick={closeEdit}>
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Silme Onayı */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[360px] ring-1 ring-slate-200 text-center">
            <h2 className="text-lg font-semibold mb-3">
              {toDelete ? `${toDelete.username}` : "Kullanıcı"} silinsin mi?
            </h2>
            <div className="flex justify-around mt-2">
              <button className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition" onClick={doDelete}>
                Evet
              </button>
              <button className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition" onClick={() => setConfirmOpen(false)}>
                Hayır
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}






