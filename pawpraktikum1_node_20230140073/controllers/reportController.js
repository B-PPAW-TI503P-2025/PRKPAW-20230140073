const { Presensi } = require("../models");
const { Op } = require("sequelize");

exports.getDailyReport = async(req, res) => {
    try {
        const { nama, tanggalMulai, tanggalSelesai } = req.query;
        const where = {};

        // 🔹 Filter nama (opsional)
        if (nama) {
            where.nama = {
                [Op.like]: `%${nama}%`
            };
        }

        // 🔹 Filter tanggal (opsional)
        if (tanggalMulai && tanggalSelesai) {
            const startDate = new Date(tanggalMulai);
            const endDate = new Date(tanggalSelesai);

            // Validasi format tanggal
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({
                    message: "Format tanggal tidak valid. Gunakan format 'YYYY-MM-DD' untuk tanggalMulai dan tanggalSelesai.",
                });
            }

            // Filter data antara dua tanggal (inklusif)
            where.checkIn = {
                [Op.between]: [startDate, endDate]
            };
        }

        // 🔹 Ambil data dari database
        const records = await Presensi.findAll({ where });

        res.json({
            reportDate: new Date().toLocaleDateString(),
            totalData: records.length,
            data: records,
        });
    } catch (error) {
        res.status(500).json({
            message: "Gagal mengambil laporan",
            error: error.message,
        });
    }
};