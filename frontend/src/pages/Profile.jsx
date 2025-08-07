// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:8000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Kullanıcı bilgileri alınamadı:", err);
      }
    };

    fetchProfile();
  }, []);

  if (!user) return <div className="p-8 text-gray-600">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-6 border-b pb-2 text-center text-gray-800">
          Hesap Bilgilerim
        </h1>
        <div className="space-y-4 text-lg text-gray-700">
          <div className="flex justify-between">
            <span className="font-semibold">👤 Kullanıcı Adı:</span>
            <span>{user.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">📧 Email:</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">🕒 Kayıt Zamanı:</span>
            <span>{new Date(user.created_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">🔐 Rol:</span>
            <span className="capitalize">{user.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

