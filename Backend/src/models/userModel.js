import db from "../config/db.js";

export const registerUser = async (userData) => {
  const {
    company_code,
    company_name,
    email,
    address,
    password,
    mobile_number,
    logo
  } = userData;

  const [result] = await db.query(
    `INSERT INTO users 
    (company_code, company_name, email, address, password, mobile_number, logo)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [company_code, company_name, email, address, password, mobile_number, logo]
  );

  return result;
};


export const loginUser = async (company_code, password) => {

  const [rows] = await db.query(
    `SELECT * FROM users 
     WHERE company_code=? AND password=?`,
    [company_code, password]
  );

  return rows[0];
};
