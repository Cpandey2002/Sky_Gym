import AttendanceModel from "../models/AttendanceModel.js";
import db from "../config/db.js";

/* ===========================
   HELPER FUNCTION (OUTSIDE OBJECT)
=========================== */

const euclideanDistance = (a, b) => {

  let sum = 0;

  for (let i = 0; i < a.length; i++) {

    sum += Math.pow(a[i] - b[i], 2);

  }

  return Math.sqrt(sum);

};


const AttendanceController = {

  /* ===========================
     COMMON PUNCH FUNCTION
  =========================== */

 handlePunch: async (member_id, company_code) => {

  const client =
    await AttendanceModel.getClientByMemberId(
      member_id,
      company_code
    );

  if (!client) {

    return {
      success: false,
      message: "INVALID_MEMBER"
    };

  }

  const client_id = client.id;

  const now = new Date();

  const attendance_date =
    now.toISOString().split("T")[0];

  const time =
    now.toTimeString().split(" ")[0];

  const attendance =
    await AttendanceModel.getTodayAttendance(
      client_id,
      member_id,
      company_code,
      attendance_date
    );

  /* ====================
     FIRST SCAN → PUNCH IN
  ==================== */

  if (!attendance) {

    await AttendanceModel.punchIn({

      client_id,
      member_id,
      company_code,
      attendance_date,
      clock_in: time

    });

    return {
      success: true,
      message: "PUNCH_IN_SUCCESS",
      type: "IN",
      clock_in: time
    };

  }

  /* ====================
     CHECK 30 MIN RULE
  ==================== */

  if (!attendance.clock_out) {

    const clockInTime =
      new Date(`${attendance_date} ${attendance.clock_in}`);

 const diffMs = now - clockInTime;

const totalSeconds = Math.floor(diffMs / 1000);

const minutes_passed = Math.floor(totalSeconds / 60);

const seconds_passed = totalSeconds % 60;

if (minutes_passed < 30) {

  return {
    success: false,
    message: "CANNOT_PUNCH_OUT_BEFORE_30_MIN",
    minutes_passed,
    seconds_passed,
    time_passed: `${minutes_passed} min ${seconds_passed} sec`
  };

}


    /* ALLOW PUNCH OUT */

    await AttendanceModel.punchOut({

      client_id,
      member_id,
      company_code,
      attendance_date,
      clock_out: time

    });

    return {
      success: true,
      message: "PUNCH_OUT_SUCCESS",
      type: "OUT",
      clock_out: time
    };

  }

  /* ====================
     ALREADY PUNCHED OUT
  ==================== */

  return {

    success: false,
    message: "ALREADY_PUNCHED_OUT",
    clock_in: attendance.clock_in,
    clock_out: attendance.clock_out

  };

},



  /* ===========================
     QR AUTO PUNCH
  =========================== */
qrAutoPunch: async (req, res) => {

  try {

    const { member_id, company_code } = req.body;

    if (!member_id || !company_code) {

      return res.status(400).json({
        success: false,
        message: "member_id and company_code required"
      });

    }

    const result =
      await AttendanceController.handlePunch(
        member_id,
        company_code
      );

    res.json(result);

  }
  catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

},


  /* ===========================
     FACE PUNCH
  =========================== */
facePunch: async (req, res) => {

  try {

    const {
      member_id,
      company_code,
      embedding
    } = req.body;

    if (!member_id || !company_code || !embedding) {

      return res.json({
        success: false,
        message: "member_id, company_code, embedding required"
      });

    }

    const client =
      await AttendanceModel.getClientByMemberId(
        member_id,
        company_code
      );

    if (!client) {

      return res.json({
        success: false,
        message: "INVALID_MEMBER"
      });

    }

    const savedEmbeddings =
      client.embedding
        ? JSON.parse(client.embedding)
        : null;

    if (!savedEmbeddings) {

      return res.json({
        success: false,
        message: "FACE_NOT_REGISTERED"
      });

    }

    let matched = false;
    let bestDistance = 999;

    // Compare with all angles
    for (const angle in savedEmbeddings) {

      const dist =
        euclideanDistance(
          embedding,
          savedEmbeddings[angle]
        );

      if (dist < bestDistance) {

        bestDistance = dist;

      }

      if (dist < 0.65) {

        matched = true;
        break;

      }

    }

    if (!matched) {

      return res.json({
        success: false,
        message: "FACE_NOT_MATCHED"
      });

    }

    // Call punch logic
    const result =
      await AttendanceController.handlePunch(
        member_id,
        company_code
      );

    res.json({
      success: true,
      member_id,
      ...result
    });

  }
  catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

},

updateEmbedding: async (req, res) => {

  try {

    const {
      member_id,
      company_code,
      embedding
    } = req.body;

    if (!member_id || !company_code || !embedding) {

      return res.status(400).json({
        success: false,
        message: "member_id, company_code, embedding required"
      });

    }

    // Check member exists
    const client =
      await AttendanceModel.getClientByMemberId(
        member_id,
        company_code
      );

    if (!client) {

      return res.json({
        success: false,
        message: "INVALID_MEMBER"
      });

    }

    // Validate embedding object
    if (typeof embedding !== "object") {

      return res.json({
        success: false,
        message: "embedding must be object"
      });

    }

    // Update embedding directly
    await db.query(
      `UPDATE client_registration
       SET embedding = ?
       WHERE member_id = ?
       AND company_code = ?`,
      [
        JSON.stringify(embedding),
        member_id,
        company_code
      ]
    );

    res.json({
      success: true,
      message: "EMBEDDING_UPDATED_SUCCESSFULLY",
      member_id
    });

  }
  catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

},


  /* ===========================
     GET ATTENDANCE
  =========================== */

  getAttendance: async (req, res) => {

    try {

      const [rows] = await db.query(

        `SELECT
          ga.client_id,
          ga.member_id,
          ga.company_code,
          ga.attendance_date,
          ga.clock_in,
          ga.clock_out,
          cr.client_name
         FROM gym_attendance ga
         JOIN client_registration cr
         ON ga.client_id = cr.id
         ORDER BY ga.attendance_date DESC`

      );

      res.json(rows);

    }
    catch (err) {

      res.status(500).json({

        success: false,
        message: err.message

      });

    }

  }

};

export default AttendanceController;
