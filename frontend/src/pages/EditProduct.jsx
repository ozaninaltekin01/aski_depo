import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function EditProduct() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:8000/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { name, quantity, description } = res.data;
      setName(name);
      setQuantity(quantity);
      setDescription(description || "");
    };
    fetchProduct();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:8000/products/${id}`,
        { name, quantity: parseInt(quantity), description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/products");
    } catch (err) {
      alert("Güncelleme başarısız: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Ürünü Güncelle</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Güncelle
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


