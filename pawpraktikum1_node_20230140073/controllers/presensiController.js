// 1. Ganti sumber data dari array ke model Sequelize
const { Presensi } = require("../models");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";

// ======================= CHECK IN =======================
exports.CheckIn = async(req, res) => {
    try {
        const { id: userId, nama: userName } = req.user;
        const waktuSekarang = new Date();

        // Cek apakah user sudah check-in dan belum check-out
        const existingRecord = await Presensi.findOne({
            where: { userId: userId, checkOut: null },
        });

        if (existingRecord) {
            return res
                .status(400)
                .json({ message: "Anda sudah melakukan check-in hari ini." });
        }

        // Buat catatan baru
        const newRecord = await Presensi.create({
            userId: userId,
            nama: userName,
            checkIn: waktuSekarang,
        });

        const formattedData = {
            userId: newRecord.userId,
            nama: newRecord.nama,
            checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
            checkOut: null,
        };

        res.status(201).json({
            message: `Halo ${userName}, check-in Anda berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
            data: formattedData,
        });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Terjadi kesalahan pada server", error: error.message });
    }
};

// ======================= CHECK OUT =======================
exports.CheckOut = async(req, res) => {
    try {
        const { id: userId, nama: userName } = req.user;
        const waktuSekarang = new Date();

        const recordToUpdate = await Presensi.findOne({
            where: { userId: userId, checkOut: null },
        });

        if (!recordToUpdate) {
            return res.status(404).json({
                message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
            });
        }

        recordToUpdate.checkOut = waktuSekarang;
        await recordToUpdate.save();

        const formattedData = {
            userId: recordToUpdate.userId,
            nama: recordToUpdate.nama,
            checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", {
                timeZone,
            }),
            checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", {
                timeZone,
            }),
        };

        res.json({
            message: `Selamat jalan ${userName}, check-out Anda berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
            data: formattedData,
        });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Terjadi kesalahan pada server", error: error.message });
    }
};

// ======================= DELETE PRESENSI =======================
exports.deletePresensi = async(req, res) => {
    try {
        const { id: userId } = req.user;
        const presensiId = req.params.id;

        const recordToDelete = await Presensi.findByPk(presensiId);

        if (!recordToDelete) {
            return res
                .status(404)
                .json({ message: "Catatan presensi tidak ditemukan." });
        }

        if (recordToDelete.userId !== userId) {
            return res
                .status(403)
                .json({ message: "Akses ditolak: Anda bukan pemilik catatan ini." });
        }

        await recordToDelete.destroy();
        res.status(204).send();
    } catch (error) {
        res
            .status(500)
            .json({ message: "Terjadi kesalahan pada server", error: error.message });
    }
};

// ======================= UPDATE PRESENSI =======================
exports.updatePresensi = async(req, res) => {
    try {
        const presensiId = req.params.id;
        const { checkIn, checkOut, nama } = req.body;

        // Validasi jika semua field kosong
        if (checkIn === undefined && checkOut === undefined && nama === undefined) {
            return res.status(400).json({
                message: "Request body tidak berisi data yang valid untuk diupdate (checkIn, checkOut, atau nama).",
            });
        }

        // Fungsi untuk validasi tanggal
        const isValidDate = (value) => {
            const date = new Date(value);
            return !isNaN(date.getTime());
        };

        // Cek validasi tanggal
        if (checkIn && !isValidDate(checkIn)) {
            return res.status(400).json({
                message: "Format checkIn tidak valid. Gunakan format 'YYYY-MM-DD HH:mm:ss'",
            });
        }

        if (checkOut && !isValidDate(checkOut)) {
            return res.status(400).json({
                message: "Format checkOut tidak valid. Gunakan format 'YYYY-MM-DD HH:mm:ss'",
            });
        }

        // Cari data berdasarkan ID
        const recordToUpdate = await Presensi.findByPk(presensiId);
        if (!recordToUpdate) {
            return res
                .status(404)
                .json({ message: "Catatan presensi tidak ditemukan." });
        }

        // Update data
        recordToUpdate.checkIn = checkIn || recordToUpdate.checkIn;
        recordToUpdate.checkOut = checkOut || recordToUpdate.checkOut;
        recordToUpdate.nama = nama || recordToUpdate.nama;
        await recordToUpdate.save();

        res.json({
            message: "Data presensi berhasil diperbarui.",
            data: recordToUpdate,
        });
    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan pada server",
            error: error.message,
        });
    }
};