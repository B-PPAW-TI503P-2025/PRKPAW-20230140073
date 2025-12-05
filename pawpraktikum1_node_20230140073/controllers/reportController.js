const { Presensi, User } = require("../models");
const { Op } = require("sequelize");

exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggalMulai, tanggalSelesai } = req.query;
    const where = {};

    // ==========================
    // FILTER TANGGAL
    // ==========================
    if (tanggalMulai && tanggalSelesai) {
      where.checkIn = {
        [Op.between]: [
          new Date(`${tanggalMulai}T00:00:00`),
          new Date(`${tanggalSelesai}T23:59:59`),
        ],
      };
    } else if (tanggalMulai) {
      where.checkIn = {
        [Op.gte]: new Date(`${tanggalMulai}T00:00:00`),
      };
    } else if (tanggalSelesai) {
      where.checkIn = {
        [Op.lte]: new Date(`${tanggalSelesai}T23:59:59`),
      };
    }

    // ==========================
    // RELASI USER
    // ==========================
    const userInclude = {
      model: User,
      as: "user", // alias WAJIB sesuai model
      attributes: ["id", "nama", "email"],
    };

    if (nama) {
      userInclude.where = {
        nama: { [Op.like]: `%${nama}%` },
      };
      userInclude.required = true;
    }

    // ==========================
    // AMBIL DATA DARI DATABASE
    // ==========================
    const records = await Presensi.findAll({
      where,
      include: [userInclude],
      order: [["checkIn", "DESC"]],
    });

    // ==========================
    // FORMAT RESPONSE
    // ==========================
    const data = records.map((r) => ({
      id: r.id,

      user: r.user
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

      // ⭐ KIRIM BUKTI FOTO (INI YG HILANG KEMAREN)
      buktiFoto: r.buktiFoto || null,

      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    // ==========================
    // KIRIM RESPONSE
    // ==========================
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
