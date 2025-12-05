import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const navigate = useNavigate();

  const fetchReports = async (query) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const baseUrl = "http://localhost:3001/api/reports/daily";
      const url = query ? `${baseUrl}?nama=${query}` : baseUrl;

      const response = await axios.get(url, config);
      setReports(response.data.data);
      setError(null);
    } catch (err) {
      setReports([]);
      setError(
        err.response ? err.response.data.message : "Gagal mengambil data"
      );
    }
  };

  useEffect(() => {
    fetchReports("");
  }, [navigate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports(searchTerm);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Judul */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Laporan Presensi Harian
      </h1>

      {/* FORM SEARCH */}
      <form onSubmit={handleSearchSubmit} className="mb-6 flex space-x-2">
        <input
          type="text"
          placeholder="Cari berdasarkan nama..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700"
        >
          Cari
        </button>
      </form>

      {/* ERROR */}
      {error && (
        <p className="text-red-600 bg-red-100 p-4 rounded-md mb-4">{error}</p>
      )}

      {/* TABLE */}
      {!error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Check-In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Check-Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Latitude
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Longitude
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bukti Foto
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {reports.length > 0 ? (
                reports.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {p.user ? p.user.nama : "N/A"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(p.checkIn).toLocaleString("id-ID", {
                        timeZone: "Asia/Jakarta",
                      })}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {p.checkOut
                        ? new Date(p.checkOut).toLocaleString("id-ID", {
                            timeZone: "Asia/Jakarta",
                          })
                        : "Belum Check-Out"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {p.latitude || "N/A"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {p.longitude || "N/A"}
                    </td>

                    {/* FOTO */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {p.buktiFoto ? (
                        <img
                          src={`http://localhost:3001/${p.buktiFoto}`}
                          alt="bukti"
                          className="w-16 h-16 object-cover rounded cursor-pointer shadow"
                          onClick={() =>
                            setSelectedPhoto(
                              `http://localhost:3001/${p.buktiFoto}`
                            )
                          }
                        />
                      ) : (
                        "Tidak Ada"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* =======================
          MODAL FOTO FULLSCREEN
      ======================== */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Close */}
            <button
              className="absolute -top-10 right-0 text-white text-3xl font-bold"
              onClick={() => setSelectedPhoto(null)}
            >
              ✕
            </button>

            {/* Foto fullscreen */}
            <img
              src={selectedPhoto}
              alt="Full"
              className="rounded-lg shadow-xl max-h-[90vh] w-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportPage;
