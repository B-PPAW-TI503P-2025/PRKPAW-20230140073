// server.js
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/api/message', (req, res) => {
    res.json({ message: 'Hello from Server Naufal!' });
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});