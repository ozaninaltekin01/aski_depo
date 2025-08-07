import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", email: "", role: "" });

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:8000/users/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      alert("Kullanıcıları yüklerken hata oluştu: " + (err.response?.data?.detail || err.message));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const confirmDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:8000/users/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteConfirm(false);
      fetchUsers();
    } catch (err) {
      alert("Silme işlemi başarısız: " + (err.response?.data?.detail || err.message));
    }
  };

  const openDeleteConfirm = (user) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setSelectedUser(null);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({ username: user.username, email: user.email, role: user.role });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const submitEdit = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:8000/users/${selectedUser.id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      alert("Güncelleme başarısız: " + (err.response?.data?.detail || err.message));
    }
  };

  const cancelEdit = () => {
    setShowEditModal(false);
    setSelectedUser(null);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tüm Kullanıcılar</h1>
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Kullanıcı Adı</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Rol</th>
            <th className="border p-2">Kayıt Tarihi</th>
            <th className="border p-2">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border p-2">{u.id}</td>
              <td className="border p-2">{u.username}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2 capitalize">{u.role}</td>
              <td className="border p-2">{new Date(u.created_at).toLocaleString()}</td>
              <td className="border p-2 flex gap-2">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                  onClick={() => openEditModal(u)}
                >
                  Güncelle
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => openDeleteConfirm(u)}
                >
                  Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Silme Onay Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[350px] text-center">
            <h2 className="text-xl font-bold mb-4">Bu kullanıcıyı silmek istediğinize emin misiniz?</h2>
            <div className="flex justify-around">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={confirmDelete}
              >
                Evet
              </button>
              <button
                className="bg-gray-400 text-black px-4 py-2 rounded"
                onClick={cancelDelete}
              >
                Hayır
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Güncelleme Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px] space-y-4">
            <h2 className="text-xl font-bold">Kullanıcı Güncelle</h2>
            <input
              type="text"
              name="username"
              placeholder="Kullanıcı Adı"
              value={editForm.username}
              onChange={handleEditChange}
              className="border p-2 w-full"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={editForm.email}
              onChange={handleEditChange}
              className="border p-2 w-full"
            />
            <select
              name="role"
              value={editForm.role}
              onChange={handleEditChange}
              className="border p-2 w-full"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <div className="flex justify-between">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={submitEdit}
              >
                Kaydet
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={cancelEdit}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

