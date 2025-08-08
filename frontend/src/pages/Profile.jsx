// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../Layout";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (e) {
        setErr(e.response?.data?.detail || "Kullanıcı bilgileri alınamadı.");
      }
    };
    fetchProfile();
  }, []);

  if (err) {
    return (
      <Layout>
        <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
          {err}
        </div>
      </Layout>
    );
  }

  if (!user) return <Layout><div>Yükleniyor…</div></Layout>;

  const roleBadge =
    user.role === "admin"
      ? "bg-purple-100 text-purple-700"
      : "bg-emerald-100 text-emerald-700";

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{user.username}</h1>
              <p className="text-slate-500">{user.email}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${roleBadge}`}>
              {user.role?.toUpperCase() || "ROLE"}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-6 text-sm">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-slate-500">Kayıt Tarihi</div>
              <div className="font-medium">
                {user.created_at ? new Date(user.created_at).toLocaleString() : "-"}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-slate-500">Kullanıcı ID</div>
              <div className="font-medium">#{user.id}</div>
            </div>
          </div>
        </div>

        {/* Admin kısayolları */}
        {user.role === "admin" && (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Yönetim</h2>
            <div className="flex flex-wrap gap-3">
              <a
                href="/admin-users"
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition"
              >
                Kullanıcıları Gör
              </a>
              <a
                href="/logs"
                className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
              >
                Loglar
              </a>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}


