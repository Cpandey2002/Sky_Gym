import express from "express";

import authMiddleware from "../middlewares/authMiddleware.js";

import {

  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiryById,
  deleteEnquiryById

} from "../controllers/enquiryController.js";


const router = express.Router();


router.use(authMiddleware);


router.post("/", createEnquiry);

router.get("/", getAllEnquiries);

router.get("/:id", getEnquiryById);

router.put("/:id", updateEnquiryById);

router.delete("/:id", deleteEnquiryById);


export default router;
