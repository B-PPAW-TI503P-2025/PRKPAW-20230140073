const bookRoutes = require('./routes/books');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;
const morgan = require("morgan");

// Impor router
const presensiRoutes = require("./routes/presensi");
const reportRoutes = require("./routes/reports");

// // Middleware (HARUS DI ATAS ROUTE SPESIFIK)
app.use(cors());
app.use(express.json()); // <--- Body Parser untuk JSON
app.use(morgan("dev"));
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
// // END Middleware

// Route Spesifik (HARUS DI BAWAH Body Parser)
app.use('/api/books', bookRoutes);

app.get('/', (req, res) => {
    res.send('Home Page for API');
});
const ruteBuku = require("./routes/books");
app.use("/api/books", ruteBuku);
app.use("/api/presensi", presensiRoutes);
app.use("/api/reports", reportRoutes);
app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}/`);
});

// Middleware 404 - jika route tidak ditemukan
app.use((req, res, next) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Global Error:', err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});