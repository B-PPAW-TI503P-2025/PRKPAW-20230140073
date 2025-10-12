const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Path file JSON untuk penyimpanan sementara
const dataPath = path.join(__dirname, '..', 'data', 'books.json');

// Helper: baca data dari file
function readData() {
    try {
        const raw = fs.readFileSync(dataPath);
        return JSON.parse(raw);
    } catch (error) {
        return [];
    }
}

// Helper: tulis data ke file
function writeData(data) {
    fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// READ - Semua buku
router.get('/', (req, res) => {
    const books = readData();
    res.json(books);
});

// READ - Buku berdasarkan ID
router.get('/:id', (req, res) => {
    const books = readData();
    const book = books.find(b => b.id === parseInt(req.params.id));

    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
});

// CREATE - Tambah buku baru
router.post('/', (req, res) => {
    const { title, author } = req.body;

    // Validasi input
    if (!title || !author) {
        return res.status(400).json({ message: 'Title and author are required' });
    }

    const books = readData();

    const newBook = {
        id: books.length ? books[books.length - 1].id + 1 : 1,
        title,
        author
    };

    books.push(newBook);
    writeData(books);

    res.status(201).json(newBook);
});

// UPDATE - Ubah buku
router.put('/:id', (req, res) => {
    const { title, author } = req.body;

    if (!title || !author) {
        return res.status(400).json({ message: 'Title and author are required' });
    }

    const books = readData();
    const index = books.findIndex(b => b.id === parseInt(req.params.id));

    if (index === -1) {
        return res.status(404).json({ message: 'Book not found' });
    }

    books[index] = { id: books[index].id, title, author };
    writeData(books);

    res.json(books[index]);
});

//DELETE - Hapus buku
router.delete('/:id', (req, res) => {
    const books = readData();
    const index = books.findIndex(b => b.id === parseInt(req.params.id));

    if (index === -1) {
        return res.status(404).json({ message: 'Book not found' });
    }

    const deleted = books.splice(index, 1)[0];
    writeData(books);

    res.json(deleted);
});

module.exports = router;