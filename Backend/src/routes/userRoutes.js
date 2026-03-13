import express from "express";

import authMiddleware from "../middlewares/authMiddleware.js";

import upload from "../middlewares/uploadlogoMiddleware.js";

import {registerUser,loginUser,getProfile,updateProfile, uploadLogo} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/profile", authMiddleware, getProfile);

router.put("/update-profile", authMiddleware, updateProfile); 

router.post(
  "/upload-logo",
  authMiddleware,
  upload.single("logo"),
  uploadLogo
);

export default router;
