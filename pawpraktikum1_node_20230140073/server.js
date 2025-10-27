// ===== Import Module =====
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;
const morgan = require("morgan");


// Impor router
const presensiRoutes = require("./routes/presensi");
const reportRoutes = require("./routes/reports");

// ===== Gunakan fungsi baru =====ser
app.use("/api/presensi", presensiRoutes);
app.use("/api/reports", reportRoutes);

// ===== Middleware =====
app.use(cors()); // izinkan akses dari React (frontend)
app.use(express.json()); // parsing body JSON

// Middleware custom untuk logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// ===== Routing dasar =====
app.get('/', (req, res) => {
    res.send('Home Page for API');
});

// ===== Routing CRUD Buku =====
const bookRoutes = require('./routes/books');
app.use('/api/books', bookRoutes);

// ===== Middleware Error Handling =====
// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// ===== Jalankan Server =====
app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}/`);
});