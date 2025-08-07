import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleAdd = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:8000/products",
        { name, quantity: parseInt(quantity), description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/products");
    } catch (err) {
      alert("Ürün eklenemedi: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Yeni Ürün Ekle</h2>
      <form onSubmit={handleAdd} className="space-y-4">
        <input
          type="text"
          placeholder="Ürün adı"
          className="border p-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Adet"
          className="border p-2 w-full"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <textarea
          placeholder="Açıklama"
          className="border p-2 w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Ekle
          </button>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}





