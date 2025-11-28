// reportController.js
const { Presensi, User } = require("../models");
const { Op } = require("sequelize");

exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggalMulai, tanggalSelesai } = req.query;
    const where = {};

    // Filter tanggal: jika ada, ubah menjadi rentang full-day (00:00:00 - 23:59:59)
    if (tanggalMulai && tanggalSelesai) {
      const startDate = new Date(`${tanggalMulai}T00:00:00`);
      const endDate = new Date(`${tanggalSelesai}T23:59:59`);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          message:
            "Format tanggal tidak valid. Gunakan format 'YYYY-MM-DD' untuk tanggalMulai dan tanggalSelesai.",
        });
      }

      where.checkIn = { [Op.between]: [startDate, endDate] };
    } else if (tanggalMulai && !tanggalSelesai) {
      const startDate = new Date(`${tanggalMulai}T00:00:00`);
      if (isNaN(startDate.getTime())) {
        return res
          .status(400)
          .json({ message: "Format tanggalMulai tidak valid." });
      }
      where.checkIn = { [Op.gte]: startDate };
    } else if (!tanggalMulai && tanggalSelesai) {
      const endDate = new Date(`${tanggalSelesai}T23:59:59`);
      if (isNaN(endDate.getTime())) {
        return res
          .status(400)
          .json({ message: "Format tanggalSelesai tidak valid." });
      }
      where.checkIn = { [Op.lte]: endDate };
    }

    // Build include for User and optional nama filter
    const userInclude = {
      model: User,
      as: "user", // ← WAJIB karena relasi pakai alias
      attributes: ["id", "nama", "email"],
    };

    if (nama) {
      userInclude.where = {
        nama: { [Op.like]: `%${nama}%` },
      };
      userInclude.required = true;
    }

    // Ambil data (urut berdasarkan checkIn desc)
    const records = await Presensi.findAll({
      where,
      include: [userInclude],
      order: [["checkIn", "DESC"]],
    });

    // Format response supaya frontend gampang pakai
    const data = records.map((r) => ({
      id: r.id,
      user: r.User
        ? user
        : r.user
        ? {
            id: r.user.id,
            nama: r.user.nama,
            email: r.user.email,
          }
        : null,

      checkIn: r.checkIn,
      checkOut: r.checkOut,
      latitude: r.latitude,
      longitude: r.longitude,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    res.json({
      reportDate: new Date().toLocaleDateString("id-ID"),
      totalData: data.length,
      data,
    });
  } catch (error) {
    console.log("ERROR REPORT:", error);
    res.status(500).json({
      message: "Gagal mengambil laporan",
      error: error.message,
    });
  }
};
