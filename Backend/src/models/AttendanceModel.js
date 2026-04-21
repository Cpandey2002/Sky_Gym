import db from "../config/db.js";

const AttendanceModel = {

  /* ===========================
     GET ALL EMBEDDINGS
  =========================== */
  getEmbeddingsByCompany: async (company_code) => {

    const [rows] = await db.query(
      "CALL sp_attendance('GET_EMBEDDINGS', 0, ?)",
      [
        JSON.stringify({
          company_code
        })
      ]
    );

    return rows[0];
  },


  /* ===========================
     GET CLIENT BY MEMBER ID
  =========================== */
  getClientByMemberId: async (member_id, company_code) => {

    const [rows] = await db.query(
      "CALL sp_attendance('GET_CLIENT', 0, ?)",
      [
        JSON.stringify({
          member_id,
          company_code
        })
      ]
    );

    return rows[0][0];
  },


  /* ===========================
     GET TODAY ATTENDANCE
  =========================== */
  getTodayAttendance: async (
    client_id,
    member_id,
    company_code,
    attendance_date
  ) => {

    const [rows] = await db.query(
      "CALL sp_attendance('GET_TODAY_ATTENDANCE', 0, ?)",
      [
        JSON.stringify({
          client_id,
          member_id,
          company_code,
          attendance_date
        })
      ]
    );

    return rows[0][0];
  },

  gymPunch :async (data) => {
    try {

      const result = await db.query(
        "CALL sp_attendance('AUTO_PUNCH_DECISION', 0, ?)",
        [JSON.stringify(data)]
      );

      return result;

    } catch (err) {
      console.error("❌ Model Error:", err);
      throw err;
    }
  },
  /* ===========================
   UPDATE EMBEDDING
=========================== */

updateEmbedding: async (data) => {
  const [rows] = await db.query(
    "CALL sp_attendance('UPDATE_EMBEDDING', 0, ?)",
    [
      JSON.stringify({
        member_id: data.member_id,
        company_code: data.company_code,
        embedding: data.embedding
      })
    ]
  );

  return rows;
},

  /* ============================
     DAILY ATTENDANCE
  ============================ */
  
  getDailyAttendance: async (payload) => {
    try {
      const [rows] = await db.query(
        "CALL sp_attendance(?, ?, ?)",
        [
          "GET_DAILY_ATTENDANCE",
          0,
          JSON.stringify(payload)
        ]
      );

      return rows[0]; // important (SP returns nested array)
    } catch (error) {
      throw error;
    }
  },

  /* ============================
     MONTHLY ATTENDANCE
  ============================ */
  getMonthlyAttendance: async (payload) => {
    try {
      const [rows] = await db.query(
        "CALL sp_attendance(?, ?, ?)",
        [
          "GET_MONTHLY_ATTENDANCE",
          0,
          JSON.stringify(payload)
        ]
      );

      return rows[0];
    } catch (error) {
      throw error;
    }
  }

};

export default AttendanceModel;