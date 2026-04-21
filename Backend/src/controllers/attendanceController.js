import AttendanceModel from "../models/AttendanceModel.js";

/* ===========================
   HELPER FUNCTION
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
    const attendance_date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0];
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
    const { client_id, company_code } = req.body;
    if (!client_id || !company_code) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    const now = new Date();
    const ist = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const today_date = ist.toLocaleDateString("en-CA"); // YYYY-MM-DD
    const current_time = ist.toTimeString().split(" ")[0];
    const payload = {
      client_id,
      company_code,
      today_date,
      current_time
    };
    const result = await AttendanceModel.gymPunch(payload);
    const response = result?.[0]?.[0]?.[0];
    if (!response) {
      return res.json({
        success: false,
        message: "NO_RESPONSE_FROM_SP"
      });
    }
    return res.json({
      success: true,
      action: response.action,
      message: response.message || response.action,
      attendance_date: response.attendance_date || today_date
    });
  } catch (err) {
    console.error(" ERROR:", err);
    console.error(" SQL:", err.sqlMessage);
    return res.status(500).json({
      success: false,
      message: err.message,
      sqlMessage: err.sqlMessage
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
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  },

  /* ===========================
     UPDATE EMBEDDING
  =========================== */

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
      if (typeof embedding !== "object") {
        return res.json({
          success: false,
          message: "embedding must be object"
        });
      }
      await AttendanceModel.updateEmbedding({
        member_id,
        company_code,
        embedding
      });
      res.json({
        success: true,
        message: "EMBEDDING_UPDATED_SUCCESSFULLY",
        member_id
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  },

getDailyAttendance: async (req, res) => {
    try {
      const { company_code, attendance_date } = req.body;

      if (!company_code || !attendance_date) {
        return res.status(400).json({
          success: false,
          message: "company_code and attendance_date are required"
        });
      }

      const data = await AttendanceModel.getDailyAttendance({
        ...req.body
      });

      return res.status(200).json({
        success: true,
        data
      });

    } catch (error) {
      console.error("Daily Attendance Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error"
      });
    }
  },


  /* ============================
     MONTHLY ATTENDANCE
  ============================ */
  getMonthlyAttendance: async (req, res) => {
    try {
      const { company_code, month, year } = req.body;

      if (!company_code || !month || !year) {
        return res.status(400).json({
          success: false,
          message: "company_code, month and year are required"
        });
      }

      const data = await AttendanceModel.getMonthlyAttendance({
          ...req.body
      });

      return res.status(200).json({
        success: true,
        data
      });

    } catch (error) {
      console.error("Monthly Attendance Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error"
      });
    }
  }
,

   getEmbeddingsByCompany : async (req, res) => {
  try {
    const { company_code } = req.body;
    // Validation
    if (!company_code) {
      return res.status(400).json({
        success: false,
        message: "company_code is required"
      });
    }
    const embeddings = await AttendanceModel.getEmbeddingsByCompany(company_code);
    return res.status(200).json({
      success: true,
      message: "Embeddings fetched successfully",
      data: embeddings
    });
  } catch (error) {
    console.error("Error in getEmbeddingsByCompany:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}
};
export default AttendanceController;