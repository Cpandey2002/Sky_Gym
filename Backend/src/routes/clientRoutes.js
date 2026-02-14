import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import db from "../config/db.js"; // ✅ ADD THIS

import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient
} from "../controllers/ClientController.js";

const router = express.Router();

router.use(authMiddleware);

// ✅ CREATE CLIENT
router.post("/", upload.single("photo"), createClient);

// ✅ CHECK MEMBER FIRST (MOVE ABOVE :id)
router.get("/check-member/:member_id", async (req, res) => {

  try {

    const company_code = req.user.company_code;
    const memberId = req.params.member_id;

    const [rows] = await db.query(
      "SELECT id FROM client_registration WHERE member_id = ? AND company_code = ?",
      [memberId, company_code]
    );

    res.json({
      exists: rows.length > 0
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      exists: false,
      error: err.message
    });

  }

});

// ✅ GET ALL
router.get("/", getAllClients);

// ✅ GET BY ID
router.get("/:id", getClientById);

// ✅ UPDATE
router.put("/:id", upload.single("photo"), updateClient);

// ✅ DELETE
router.delete("/:id", deleteClient);

export default router;
