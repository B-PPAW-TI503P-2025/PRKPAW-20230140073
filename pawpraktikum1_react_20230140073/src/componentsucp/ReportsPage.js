import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);

  // filter
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState("");

  const navigate = useNavigate();

  const fetchReports = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:3001/api/reports/daily",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            nama: searchTerm || "",
            date: date || "",
          },
        }
      );

      setReports(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengambil laporan");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReports();
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Laporan Presensi Harian
      </h1>

      <form onSubmit={handleSearch} className="mb-6 flex space-x-3">
        <input
          type="text"
          placeholder="Cari nama..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/2 px-3 py-2 border border-gray-300 rounded-md"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />

        <button
          type="submit"
          className="px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Cari
        </button>
      </form>

      {error && (
        <p className="text-red-600 bg-red-100 p-4 rounded-md mb-4">{error}</p>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold">
                Nama
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold">
                Check-In
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold">
                Check-Out
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {reports.length > 0 ? (
              reports.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4">{p.user?.nama || "-"}</td>
                  <td className="px-6 py-4">
                    {new Date(p.checkIn).toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4">
                    {p.checkOut
                      ? new Date(p.checkOut).toLocaleString("id-ID")
                      : "Belum Check-Out"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportsPage;
