import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Navbar() {
  const navigate = useNavigate();
  const [nama, setNama] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setNama(decoded.nama || "User");
        setRole(decoded.role || "");
      } catch (error) {
        handleLogout(); // jika token rusak
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="w-full bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <div className="text-lg font-semibold">
        <Link to="/dashboard">Absensi</Link>
      </div>

      <div className="flex items-center gap-6">
        <Link to="/presensi">Presensi</Link>

        {role === "admin" && <Link to="/reports">Laporan Admin</Link>}

        <span className="font-semibold">{nama}</span>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
