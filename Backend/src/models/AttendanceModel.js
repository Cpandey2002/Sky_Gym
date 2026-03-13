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


  /* ===========================
     PUNCH IN
  =========================== */
  punchIn: async ({
    client_id,
    member_id,
    company_code,
    attendance_date,
    clock_in
  }) => {

    await db.query(
      "CALL sp_attendance('PUNCH_IN', 0, ?)",
      [
        JSON.stringify({
          client_id,
          member_id,
          company_code,
          attendance_date,
          clock_in
        })
      ]
    );

  },


  /* ===========================
     PUNCH OUT
  =========================== */
  punchOut: async ({
    client_id,
    member_id,
    company_code,
    attendance_date,
    clock_out
  }) => {

    await db.query(
      "CALL sp_attendance('PUNCH_OUT', 0, ?)",
      [
        JSON.stringify({
          client_id,
          member_id,
          company_code,
          attendance_date,
          clock_out
        })
      ]
    );

  },


  /* ===========================
     GET ALL ATTENDANCE
  =========================== */
  getAttendanceByCompany: async (company_code) => {

    const [rows] = await db.query(
      "CALL sp_attendance('GET_ALL_ATTENDANCE', 0, ?)",
      [
        JSON.stringify({
          company_code
        })
      ]
    );

    return rows[0];
  }

};

export default AttendanceModel;