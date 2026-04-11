import RenewModel from "../models/RenewModel.js";


// ✅ CREATE
export const createRenew = async (req, res) => {

  try {

    const company_code = req.user.company_code;
    const [rows] = await RenewModel.create(
      req.body,
      company_code
    );

    res.status(201).json({
      message: "Renew created successfully",
      renew_id: rows[0].insertId
    });

  } catch (error) {

    res.status(500).json({
      error: "Failed to renew client",
      console: error  
    });

  }

};


// ✅ GET ALL
export const getAllRenew = async (req, res) => {

  try {

    const company_code = req.user.company_code;

    const [rows] =
      await RenewModel.findAllByCompany(company_code);

    res.json(rows);

  } catch (error) {

    res.status(500).json({
      error: "Failed to fetch renew records"
    });

  }

};


// ✅ GET BY CLIENT (BODY ONLY)
export const getRenewByClientId = async (req, res) => {

  try {

    const { client_id } = req.body;
    const company_code = req.user.company_code;

    const [rows] =
      await RenewModel.findByClientId(
        client_id,
        company_code
      );

    res.json(rows);

  } catch (error) {

    res.status(500).json({
      error: "Failed to fetch renew records"
    });

  }

};


// ✅ UPDATE (BODY ONLY)
export const updateRenew = async (req, res) => {

  try {

    const { id, ...data } = req.body;
    const company_code = req.user.company_code;

    await RenewModel.update(
      id,
      company_code,
      data
    );

    res.json({
      message: "Renew updated successfully"
    });

  } catch (error) {

    res.status(500).json({
      error: "Failed to update renew"
    });

  }

};


// ✅ DELETE (BODY ONLY)
export const deleteRenew = async (req, res) => {

  try {

    const { id } = req.body;
    const company_code = req.user.company_code;

    await RenewModel.delete(
      id,
      company_code
    );

    res.json({
      message: "Renew deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      error: "Failed to delete renew"
    });

  }

};