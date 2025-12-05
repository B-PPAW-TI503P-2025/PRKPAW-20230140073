const express = require("express");
const router = express.Router();
const presensiController = require("../controllers/presensiController");
const { authenticateToken } = require("../middleware/permissionMiddleware");
const { body, validationResult } = require("express-validator");

router.use(authenticateToken);

router.post(
  "/check-in",
  presensiController.upload.single("image"),
  presensiController.CheckIn
);

router.post("/check-out", presensiController.CheckOut);

// --- VALIDASI & UPDATE ---
router.put(
  "/:id",
  [
    body("checkIn").optional().isISO8601().withMessage("Format checkIn salah"),
    body("checkOut")
      .optional()
      .isISO8601()
      .withMessage("Format checkOut salah"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Input tidak valid",
        errors: errors.array(),
      });
    }
    next();
  },
  presensiController.updatePresensi
);

router.delete("/:id", presensiController.deletePresensi);

module.exports = router;
