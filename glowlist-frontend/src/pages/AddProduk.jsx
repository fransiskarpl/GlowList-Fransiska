import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AddProduk() {
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    harga: "",
    id_kategori: "",
  });
  const [file, setFile] = useState(null);

  const [kategori, setKategori] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/kategori")
      .then((res) => res.json())
      .then((data) => setKategori(data))
      .catch((err) => console.error("Gagal mengambil data kategori:", err));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Tombol Simpan ditekan");
    console.log("File:", file);

    // Validasi ukuran file maksimal 2MB
    if (file && file.size > 2 * 1024 * 1024) {
      alert("Ukuran file terlalu besar, maksimal 2MB");
      return;
    }

    const data = new FormData();

    data.append("judul", formData.judul);
    data.append("deskripsi", formData.deskripsi);
    data.append("harga", formData.harga);
    data.append("id_kategori", formData.id_kategori);

    if (file) {
      data.append("foto", file);
    }

    console.log("Data siap dikirim");

    try {
      const res = await fetch("http://localhost:5000/produk", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: data,
      });

      console.log("Status:", res.status);

      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const result = await res.json();

        console.log("Response:", result);

        if (res.ok) {
          alert("Produk berhasil ditambahkan!");
          navigate("/produk");
        } else {
          alert(result.message || "Gagal menambah produk");
        }
      } else {
        const errorText = await res.text();

        console.error("Response server:", errorText);

        alert("Terjadi error pada server. Cek terminal backend.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Tidak dapat terhubung ke server");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Tambah Produk ✨</h2>

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">

        <div className="mb-3">
          <label className="form-label">Judul Produk</label>
          <input
            type="text"
            name="judul"
            value={formData.judul}
            onChange={handleChange}
            className="form-control"
            placeholder="Masukkan nama produk"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Deskripsi</label>
          <textarea
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleChange}
            className="form-control"
            placeholder="Masukkan deskripsi produk"
            rows="4"
          ></textarea>
        </div>

        {/* Harga */}
        <div className="mb-3">
          <label className="form-label">Harga</label>
          <input
            type="number"
            name="harga"
            value={formData.harga}
            onChange={handleChange}
            className="form-control"
            placeholder="Masukkan harga"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Kategori</label>
          <select
            name="id_kategori"
            value={formData.id_kategori}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">-- Pilih Kategori --</option>

            {kategori.map((item) => (
              <option
                key={item.id_kategori}
                value={item.id_kategori}
              >
                {item.kategori}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Foto Produk</label>
          <input type="file" accept="image/*" className="form-control" onChange={(e) => setFile(e.target.files[0])} />
        </div>

        <button type="submit" className="btn btn-success">
          Simpan
        </button>
      </form>
    </div>
  );
}