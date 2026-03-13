import express from "express";
import AttendanceController from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/qr-auto-punch", AttendanceController.qrAutoPunch);

router.post("/face-punch", AttendanceController.facePunch);

router.put( "/update-embedding", AttendanceController.updateEmbedding
);

router.get("/", AttendanceController.getAttendance);

export default router;
