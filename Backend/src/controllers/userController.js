import db from "../config/db.js";
import jwt from "jsonwebtoken";


// ✅ REGISTER
export const registerUser = async (req, res) => {
  try {

    const {
      company_code,
      company_name,
      email,
      address,
      mobile_number,
      password
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO users 
      (company_code, company_name, email, address, mobile_number, password)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        company_code,
        company_name,
        email,
        address,
        mobile_number,
        password
      ]
    );

    res.json({
      message: "Registration successful"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ✅ LOGIN
export const loginUser = async (req, res) => {

  try {

    const { company_code, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE company_code = ? AND password = ?",
      [company_code, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Invalid company code or password"
      });
    }

    const user = rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        company_code: user.company_code
      },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    res.json({
      token,
      user
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ✅ GET PROFILE
export const getProfile = async (req, res) => {

  try {

    const company_code = req.user.company_code;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE company_code = ?",
      [company_code]
    );

    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const updateProfile = async (req, res) => {

  try {

    const company_code = req.user.company_code;

    const { email, mobile_number, address } = req.body;

    await db.query(
      `UPDATE users 
       SET email=?, mobile_number=?, address=? 
       WHERE company_code=?`,
      [email, mobile_number, address, company_code]
    );

    res.json({
      message: "Profile updated successfully"
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

};


// ✅ UPLOAD COMPANY LOGO
export const uploadLogo = async (req, res) => {

  try {

    const company_code = req.user.company_code;

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const logoName = req.file.filename;

    // save logo name in DB (optional but recommended)
    await db.query(
      "UPDATE users SET logo = ? WHERE company_code = ?",
      [logoName, company_code]
    );

    res.json({
      message: "Logo uploaded successfully",
      logo: logoName
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

};
