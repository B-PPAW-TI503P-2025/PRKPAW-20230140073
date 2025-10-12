// ==========================
// app.js
// ==========================

const express = require('express');
const cors = require('cors');
const bookRoutes = require('./routes/books');

const app = express();
const PORT = 3001;

// ==========================
// 🔧 Middleware
// ==========================
app.use(cors()); // agar bisa diakses dari luar
app.use(express.json()); // agar bisa parsing body JSON

// Middleware custom: logging semua request
app.use((req, res, next) => {
    const log = `${new Date().toISOString()} - ${req.method} ${req.url}`;
    console.log(log);
    next();
});

// ==========================
// 🌐 Routing Utama
// ==========================
app.get('/', (req, res) => {
    res.send('API Buku Perpustakaan - Express.js');
});

// Panggil route /api/books
app.use('/api/books', bookRoutes);

// ==========================
// ⚠️ Error Handling
// ==========================

// Middleware 404
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Middleware global error handler
app.use((err, req, res, next) => {
    console.error('Terjadi error:', err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// ==========================
// 🚀 Jalankan Server
// ==========================
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});