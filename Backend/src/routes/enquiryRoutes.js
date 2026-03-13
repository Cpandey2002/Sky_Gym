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

router.post("/get-by-id", getEnquiryById);

router.put("/", updateEnquiryById);

router.delete("/", deleteEnquiryById);


export default router;
