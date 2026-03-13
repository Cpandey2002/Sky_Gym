import jwt from "jsonwebtoken";
import * as UserModel from "../models/userModel.js";


// ✅ REGISTER
export const registerUser = async (req, res) => {

  try {

    const result =
      await UserModel.registerUser(req.body);

    res.json({
      message: "Registration successful",
      id: result.insertId
    });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


// ✅ LOGIN
export const loginUser = async (req, res) => {

  try {

    const { company_code, password } = req.body;

    const user =
      await UserModel.loginUser(company_code, password);

    if (!user) {

      return res.status(401).json({
        message: "Invalid company code or password"
      });

    }

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

    const user =
      await UserModel.getProfile(company_code);

    res.json(user);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


// ✅ UPDATE PROFILE
export const updateProfile = async (req, res) => {

  try {

    const company_code = req.user.company_code;

    await UserModel.updateProfile(
      company_code,
      req.body
    );

    res.json({
      message: "Profile updated successfully"
    });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


// ✅ UPLOAD LOGO
export const uploadLogo = async (req, res) => {

  try {

    const company_code = req.user.company_code;

    if (!req.file) {

      return res.status(400).json({
        message: "No file uploaded"
      });

    }

    await UserModel.uploadLogo(
      company_code,
      req.file.filename
    );

    res.json({
      message: "Logo uploaded successfully",
      logo: req.file.filename
    });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};