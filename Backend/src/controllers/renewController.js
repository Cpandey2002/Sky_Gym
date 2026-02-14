import RenewModel from "../models/RenewModel.js";
import db from "../config/db.js";


// ✅ CREATE RENEW
export const createRenew = async (req, res) => {

  const conn = await db.getConnection();

  const company_code = req.user.company_code;

  try {

    await conn.beginTransaction();

    // ✅ INSERT renew record
    const [result] = await RenewModel.create(
      req.body,
      company_code,
      conn
    );

    // ✅ UPDATE client expiry date
    await conn.query(
      `
      UPDATE client_registration
      SET to_date = ?
      WHERE id = ?
      AND company_code = ?
      `,
      [
        req.body.to_date,
        req.body.client_id,
        company_code
      ]
    );

    await conn.commit();

    res.status(201).json({

      message: "Renew created successfully",

      renew_id: result.insertId

    });

  }
  catch (error) {

    await conn.rollback();

    console.error("RENEW ERROR:", error);

    res.status(500).json({

      error: "Failed to renew client"

    });

  }
  finally {

    conn.release();

  }

};



// ✅ GET ALL RENEW
export const getAllRenew = async (req, res) => {

  try {

    const company_code = req.user.company_code;

    const [rows] = await RenewModel.findAllByCompany(company_code);

    res.json(rows);

  }
  catch (error) {

    console.error(error);

    res.status(500).json({

      error: "Failed to fetch renew records"

    });

  }

};



// ✅ GET RENEW BY CLIENT
export const getRenewByClientId = async (req, res) => {

  try {

    const company_code = req.user.company_code;

    const [rows] = await RenewModel.findByClientId(

      req.params.client_id,
      company_code

    );

    res.json(rows);

  }
  catch (error) {

    console.error(error);

    res.status(500).json({

      error: "Failed to fetch renew records"

    });

  }

};



// ✅ UPDATE RENEW
export const updateRenew = async (req, res) => {

  try {

    const company_code = req.user.company_code;

    await RenewModel.update(

      req.params.id,
      company_code,
      req.body

    );

    res.json({

      message: "Renew updated successfully"

    });

  }
  catch (error) {

    console.error(error);

    res.status(500).json({

      error: "Failed to update renew"

    });

  }

};



// ✅ DELETE RENEW
export const deleteRenew = async (req, res) => {

  try {

    const company_code = req.user.company_code;

    await RenewModel.delete(

      req.params.id,
      company_code

    );

    res.json({

      message: "Renew deleted successfully"

    });

  }
  catch (error) {

    console.error(error);

    res.status(500).json({

      error: "Failed to delete renew"

    });

  }

};
