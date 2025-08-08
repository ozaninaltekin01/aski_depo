// src/Layout.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function Layout({ children, withNav = true }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.title = "ASKİ Depo"; // sayfa başlığı
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (e) {
      console.error("Kullanıcı alınamadı:", e);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800">
      {withNav && (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/products" className="text-xl font-semibold tracking-tight">
              ASKİ<span className="text-indigo-600"> Depo</span>
            </a>

            <nav className="flex items-center gap-2">
              <a href="/products" className="px-3 py-2 rounded-lg hover:bg-slate-100 transition">
                Ürünler
              </a>
              <a href="/add" className="px-3 py-2 rounded-lg hover:bg-slate-100 transition">
                Yeni Ürün
              </a>
              <a href="/profile" className="px-3 py-2 rounded-lg hover:bg-slate-100 transition">
                Profil
              </a>

              {user?.role === "admin" && (
                <>
                  <a href="/admin-users" className="px-3 py-2 rounded-lg hover:bg-slate-100 transition">
                    Kullanıcılar
                  </a>
                  <a href="/logs" className="px-3 py-2 rounded-lg hover:bg-slate-100 transition">
                    Loglar
                  </a>
                </>
              )}

              <button
                onClick={logout}
                className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
              >
                Çıkış
              </button>
            </nav>
          </div>
        </header>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

