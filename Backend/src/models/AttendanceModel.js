import db from "../config/db.js";

const AttendanceModel = {

  /* ===========================
     GET ALL EMBEDDINGS
  =========================== */
  getEmbeddingsByCompany: async (company_code) => {

    const [rows] = await db.query(
      `SELECT 
         id AS client_id,
         member_id,
         embedding
       FROM client_registration
       WHERE company_code = ?
       AND embedding IS NOT NULL`,
      [company_code]
    );

    return rows;
  },


  /* ===========================
     GET CLIENT BY MEMBER ID
  =========================== */
getClientByMemberId: async (member_id, company_code) => {

  const [rows] = await db.query(
    `SELECT id, member_id, company_code
     FROM client_registration
     WHERE member_id = ?
     AND company_code = ?`,
    [member_id, company_code]
  );

  return rows[0];

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
      `SELECT *
       FROM gym_attendance
       WHERE client_id = ?
       AND member_id = ?
       AND company_code = ?
       AND attendance_date = ?`,
      [client_id, member_id, company_code, attendance_date]
    );

    return rows[0];
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
    `INSERT INTO gym_attendance
     (client_id, member_id, company_code, attendance_date, clock_in)
     VALUES (?, ?, ?, ?, ?)`,
    [
      client_id,
      member_id,
      company_code,
      attendance_date,
      clock_in
    ]
  );

}
,


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
    `UPDATE gym_attendance
     SET clock_out = ?
     WHERE client_id = ?
     AND member_id = ?
     AND company_code = ?
     AND attendance_date = ?
     AND clock_out IS NULL`,
    [
      clock_out,
      client_id,
      member_id,
      company_code,
      attendance_date
    ]
  );

},


  /* ===========================
     GET ALL ATTENDANCE
  =========================== */
  getAttendanceByCompany: async (company_code) => {

    const [rows] = await db.query(
      `SELECT 
         ga.id,
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
       WHERE ga.company_code = ?
       ORDER BY ga.attendance_date DESC`,
      [company_code]
    );

    return rows;
  }

};

export default AttendanceModel;
