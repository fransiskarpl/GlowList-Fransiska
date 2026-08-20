import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditProduk() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        judul: "",
        deskripsi: "",
        harga: "",
        id_kategori: "",
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduk = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/produk/${id}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`Gagal mengambil data: ${response.status}`);
                }

                const data = await response.json();

                if (!data || data.length === 0) {
                    throw new Error("Produk tidak ditemukan");
                }

                setFormData(data[0]);
            } catch (error) {
                console.error(error);
                alert(error.message);
                navigate("/produk");
            } finally {
                setLoading(false);
            }
        };

        fetchProduk();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append("judul", formData.judul);
        data.append("deskripsi", formData.deskripsi);
        data.append("harga", formData.harga);
        data.append("id_kategori", formData.id_kategori);
        if (fileBaru) {
            data.append("file", fileBaru); // hanya kirim kalau ada foto baru
        }

        const confirmUpdate = window.confirm(
            "Yakin mau menyimpan perubahan ini?"
        );

        if (!confirmUpdate) {
            return;
        }

        try {
            await fetch(`http://localhost:5000/produk/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: data,
            });
            
            if (!response.ok) {
                throw new Error(
                    `Gagal memperbarui produk: ${response.status}`
                );
            }

            alert("Produk berhasil diperbarui!");
            navigate("/produk");
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    if (loading) {
        return <div className="container mt-4">Loading...</div>;
    }

    return (
        <div className="container mt-4">
            <h2>Edit Produk</h2>

            <form onSubmit={handleSubmit} className="mt-3">
                <div className="mb-3">
                    <label className="form-label">Foto Saat Ini</label>

                    <div>
                        {formData.nama_file ? (
                            <img
                                src={`http://localhost:5000/uploads/${formData.nama_file}`}
                                alt="Foto lama"
                                style={{
                                    width: "120px",
                                    borderRadius: "8px",
                                }}
                            />
                        ) : (
                            <p>Tidak ada foto</p>
                        )}
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Ganti Foto (opsional)</label>

                    <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={(e) => setFileBaru(e.target.files[0])}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Judul</label>
                    <input
                        type="text"
                        name="judul"
                        value={formData.judul}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-success me-2"
                >
                    Simpan Perubahan
                </button>
            </form>
        </div>
    );
}