const { Presensi } = require("../models");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";

// MULTER CONFIG

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar yang diperbolehkan!"), false);
  }
};

exports.upload = multer({ storage: storage, fileFilter: fileFilter });

// CHECK IN
// CHECK IN
exports.CheckIn = async (req, res) => {
  try {
    console.log("========== DEBUG CHECK-IN ==========");
    console.log("req.file =", req.file);
    console.log("req.body =", req.body);
    console.log("req.user =", req.user);
    console.log("====================================");

    const { id: userId, nama: userName } = req.user;
    const waktuSekarang = new Date();
    const { latitude, longitude } = req.body;

    // SIMPAN HANYA PATH (PAKAI SLASH)
    const buktiFoto = req.file
      ? `uploads/${req.file.filename}` // <<=== FIX PENTING
      : null;

    const existingRecord = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (existingRecord) {
      return res
        .status(400)
        .json({ message: "Anda sudah melakukan check-in hari ini." });
    }

    const newRecord = await Presensi.create({
      userId,
      checkIn: waktuSekarang,
      latitude: latitude || null,
      longitude: longitude || null,
      buktiFoto, // <<=== path saja
    });

    res.status(201).json({
      message: `Halo ${userName}, check-in berhasil.`,
      data: {
        ...newRecord.dataValues,
        buktiFoto: `${req.protocol}://${req.get("host")}/${buktiFoto}`, // kirim URL ke FE
      },
    });
  } catch (error) {
    console.log("❌ ERROR CHECK-IN =", error);
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// CHECK OUT

exports.CheckOut = async (req, res) => {
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

// DELETE PRESENSI

exports.deletePresensi = async (req, res) => {
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

// UPDATE PRESENSI

exports.updatePresensi = async (req, res) => {
  try {
    const presensiId = req.params.id;
    const { checkIn, checkOut } = req.body;

    if (checkIn === undefined && checkOut === undefined) {
      return res.status(400).json({
        message:
          "Request body tidak berisi data yang valid untuk diupdate (checkIn, checkOut, atau nama).",
      });
    }

    const isValidDate = (value) => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    };

    if (checkIn && !isValidDate(checkIn)) {
      return res.status(400).json({
        message:
          "Format checkIn tidak valid. Gunakan format 'YYYY-MM-DD HH:mm:ss'",
      });
    }

    if (checkOut && !isValidDate(checkOut)) {
      return res.status(400).json({
        message:
          "Format checkOut tidak valid. Gunakan format 'YYYY-MM-DD HH:mm:ss'",
      });
    }

    const recordToUpdate = await Presensi.findByPk(presensiId);
    if (!recordToUpdate) {
      return res
        .status(404)
        .json({ message: "Catatan presensi tidak ditemukan." });
    }

    recordToUpdate.checkIn = checkIn || recordToUpdate.checkIn;
    recordToUpdate.checkOut = checkOut || recordToUpdate.checkOut;
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
