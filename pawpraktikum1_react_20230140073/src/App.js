import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import DashboardPage from "./components/DashboardPage";
import PresensiPage from "./components/PresensiPage";
import ReportsPage from "./components/ReportsPage";
import Navbar from "./components/Navbar";

function AppContent() {
  const location = useLocation();

  // Halaman yang tidak menampilkan navbar
  const hideNavbarOn = ["/login", "/register"];

  const shouldHideNavbar = hideNavbarOn.includes(location.pathname);

  return (
    <>
      {/* Tampilkan Navbar jika bukan login/register */}
      {!shouldHideNavbar && <Navbar />}

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/presensi" element={<PresensiPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
