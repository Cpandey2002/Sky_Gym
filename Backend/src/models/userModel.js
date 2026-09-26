import db from "../config/db.js";

export const registerUser = async (userData) => {
  const [rows] = await db.query(
    "CALL sp_user('REGISTER', 0, ?)",
    [JSON.stringify(userData)]
  );

  return rows[0][0];
};


export const loginUser = async (company_code, password) => {

  const [rows] = await db.query(
    "CALL sp_user('LOGIN', 0, ?)",
    [
      JSON.stringify({
        company_code,
        password
      })
    ]
  );

  return rows[0][0];

};


export const getProfile = async (company_code) => {

  const [rows] = await db.query(
    "CALL sp_user('GET_PROFILE', 0, ?)",
    [
      JSON.stringify({ company_code })
    ]
  );

  return rows[0][0];

};


export const updateProfile = async (company_code, data) => {

  return db.query(
    "CALL sp_user('UPDATE_PROFILE', 0, ?)",
    [
      JSON.stringify({
        ...data,
        company_code
      })
    ]
  );

};


export const uploadLogo = async (company_code, logo) => {

  return db.query(
    "CALL sp_user('UPLOAD_LOGO', 0, ?)",
    [
      JSON.stringify({
        company_code,
        logo
      })
    ]
  );

};