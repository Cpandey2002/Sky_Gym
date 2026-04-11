import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import db from "../config/db.js";

import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient
} from "../controllers/ClientController.js";

const router = express.Router();

router.use(authMiddleware);

/* =================================
   CREATE CLIENT
================================= */
router.post("/create", upload.single("photo"), createClient);


/* =================================
   CHECK MEMBER (BODY VERSION)
================================= */
router.post("/check-member", async (req, res) => {

  try {

    const { member_id } = req.body;
    const company_code = req.user.company_code;

    if (!member_id) {
      return res.status(400).json({
        message: "member_id required"
      });
    }

    const [rows] = await db.query(
      "SELECT id FROM client_registration WHERE member_id = ? AND company_code = ?",
      [member_id, company_code]
    );

    res.json({
      exists: rows.length > 0
    });

  } catch (err) {

    res.status(500).json({
      exists: false,
      error: err.message
    });

  }

});


/* =================================
   GET ALL CLIENTS
================================= */
router.get("/get-all", getAllClients);


/* =================================
   GET CLIENT BY ID
================================= */
router.post("/get-by-id", getClientById);


/* =================================
   UPDATE CLIENT
================================= */
router.put("/update", upload.single("photo"), updateClient);


/* =================================
   DELETE CLIENT
================================= */
router.delete("/", deleteClient);

export default router;