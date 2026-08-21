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
        nama_file: "",
    });

    const [gunakanFotoLama, setGunakanFotoLama] = useState(true);
    const [file, setFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // =========================
    // AMBIL DATA PRODUK
    // =========================
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Token tidak ditemukan. Silakan login terlebih dahulu.");
            setLoading(false);
            return;
        }

        fetch(`http://localhost:5000/produk/${id}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(async (res) => {
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data.message || "Gagal mengambil data produk"
                    );
                }

                return data;
            })
            .then((data) => {
                const produk = Array.isArray(data) ? data[0] : data;

                if (!produk) {
                    throw new Error("Produk tidak ditemukan");
                }

                setFormData({
                    judul: produk.judul || "",
                    deskripsi: produk.deskripsi || "",
                    harga: produk.harga || "",
                    id_kategori: produk.id_kategori || "",
                    nama_file: produk.nama_file || "",
                });

                setLoading(false);
            })
            .catch((err) => {
                console.error("Error mengambil produk:", err);
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    // =========================
    // HANDLE INPUT
    // =========================
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================
    // PILIH FOTO
    // =========================
    const handleFotoOption = (gunakanLama) => {
        setGunakanFotoLama(gunakanLama);

        // Kalau kembali menggunakan foto lama,
        // hapus file baru yang sebelumnya dipilih.
        if (gunakanLama) {
            setFile(null);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            setFile(selectedFile);
            setGunakanFotoLama(false);
        }
    };

    // =========================
    // SUBMIT
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.judul.trim()) {
            alert("Judul wajib diisi!");
            return;
        }

        if (!formData.harga) {
            alert("Harga wajib diisi!");
            return;
        }

        if (!gunakanFotoLama && !file) {
            alert("Silakan pilih foto baru!");
            return;
        }

        const yakin = window.confirm(
            "Yakin mau menyimpan perubahan produk ini?"
        );

        if (!yakin) {
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            alert("Token tidak ditemukan. Silakan login terlebih dahulu.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const data = new FormData();

            data.append("judul", formData.judul);
            data.append("deskripsi", formData.deskripsi);
            data.append("harga", formData.harga);
            data.append("id_kategori", formData.id_kategori);

            /*
             * Kalau user memilih foto baru,
             * kirim file baru.
             *
             * Kalau menggunakan foto lama,
             * jangan kirim file.
             * Backend akan mempertahankan nama_file lama.
             */
            if (!gunakanFotoLama && file) {
                data.append("file", file);
            }

            const response = await fetch(
                `http://localhost:5000/produk/${id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: data,
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Gagal memperbarui produk"
                );
            }

            alert(result.message || "Produk berhasil diperbarui!");

            navigate("/produk");
        } catch (err) {
            console.error("Error update produk:", err);

            setError(err.message);

            alert(`Gagal memperbarui produk: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div className="container mt-4">
                <p>Loading data produk...</p>
            </div>
        );
    }

    // =========================
    // ERROR
    // =========================
    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">
                    <strong>Gagal:</strong> {error}
                </div>

                <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/produk")}
                >
                    Kembali ke Produk
                </button>
            </div>
        );
    }

    // =========================
    // FORM
    // =========================
    return (
        <div className="container mt-4">
            <h2>Edit Produk</h2>

            <form onSubmit={handleSubmit} className="mt-3">

                {/* JUDUL */}
                <div className="mb-3">
                    <label className="form-label">
                        Judul
                    </label>

                    <input
                        type="text"
                        name="judul"
                        value={formData.judul}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                {/* DESKRIPSI */}
                <div className="mb-3">
                    <label className="form-label">
                        Deskripsi
                    </label>

                    <textarea
                        name="deskripsi"
                        value={formData.deskripsi}
                        onChange={handleChange}
                        className="form-control"
                        rows="4"
                    />
                </div>

                {/* HARGA */}
                <div className="mb-3">
                    <label className="form-label">
                        Harga
                    </label>

                    <input
                        type="number"
                        name="harga"
                        value={formData.harga}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                {/* KATEGORI */}
                <div className="mb-3">
                    <label className="form-label">
                        ID Kategori
                    </label>

                    <input
                        type="number"
                        name="id_kategori"
                        value={formData.id_kategori}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                {/* FOTO */}
                <div className="mb-3">
                    <label className="form-label d-block">
                        Foto Produk
                    </label>

                    {/* FOTO LAMA */}
                    <div className="form-check mb-2">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="pilihanFoto"
                            id="fotoLama"
                            checked={gunakanFotoLama}
                            onChange={() => handleFotoOption(true)}
                        />

                        <label
                            className="form-check-label"
                            htmlFor="fotoLama"
                        >
                            Gunakan foto lama
                        </label>
                    </div>

                    {/* PREVIEW FOTO LAMA */}
                    {gunakanFotoLama && formData.nama_file && (
                        <div className="mb-3">
                            <p className="mb-2">
                                Foto saat ini:
                            </p>

                            <img
                                src={`http://localhost:5000/uploads/${formData.nama_file}`}
                                alt="Foto produk"
                                style={{
                                    width: "200px",
                                    height: "200px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    border: "1px solid #ddd",
                                }}
                            />
                        </div>
                    )}

                    {/* GANTI FOTO */}
                    <div className="form-check mb-2">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="pilihanFoto"
                            id="fotoBaru"
                            checked={!gunakanFotoLama}
                            onChange={() => handleFotoOption(false)}
                        />

                        <label
                            className="form-check-label"
                            htmlFor="fotoBaru"
                        >
                            Ganti foto
                        </label>
                    </div>

                    {/* INPUT FOTO BARU */}
                    {!gunakanFotoLama && (
                        <div className="mt-2">
                            <input
                                type="file"
                                name="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="form-control"
                            />

                            {file && (
                                <small className="text-success d-block mt-2">
                                    Foto baru dipilih: {file.name}
                                </small>
                            )}
                        </div>
                    )}
                </div>

                {/* BUTTON */}
                <button
                    type="submit"
                    className="btn btn-success me-2"
                    disabled={saving}
                >
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>

                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate("/produk")}
                    disabled={saving}
                >
                    Batal
                </button>

            </form>
        </div>
    );
}
