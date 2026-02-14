// src/controllers/ClientController.js

import ClientModel from "../models/ClientModel.js";
import RenewModel from "../models/RenewModel.js";
import db from "../config/db.js";


// ✅ CREATE CLIENT
export const createClient = async (req, res) => {

  const conn = await db.getConnection();

  // ✅ FIXED: use company_code from JWT
  const company_code = req.user.company_code;

  try {

    await conn.beginTransaction();

    const photoName = req.file ? req.file.filename : null;

    const clientData = {
      ...req.body,
      photo: photoName
    };

    // ✅ FIXED
    const [clientResult] = await ClientModel.create(
      clientData,
      company_code,
      conn
    );

    const clientId = clientResult.insertId;

    // ✅ FIXED
    await RenewModel.create(
      { ...clientData, client_id: clientId },
      company_code,
      conn
    );

    await conn.commit();

    res.status(201).json({
      message: "Client created successfully"
    });

  } catch (err) {

    await conn.rollback();

    console.error(err);

    res.status(500).json({
      error: "Failed to create client"
    });

  } finally {

    conn.release();

  }

};



// ✅ GET ALL CLIENTS
export const getAllClients = async (req, res) => {

  const company_code = req.user.company_code;

  const [rows] = await ClientModel.findAllByCompany(company_code);

  res.json(rows);

};



// ✅ GET CLIENT BY ID
export const getClientById = async (req, res) => {

  const company_code = req.user.company_code;

  const [rows] = await ClientModel.findById(
    req.params.id,
    company_code
  );

  if (!rows.length) {

    return res.status(404).json({
      message: "Client not found"
    });

  }

  res.json(rows[0]);

};



// ✅ UPDATE CLIENT
export const updateClient = async (req, res) => {

  const company_code = req.user.company_code;

  await ClientModel.update(
    req.params.id,
    company_code,
    req.body
  );

  res.json({
    message: "Client updated successfully"
  });

};



// ✅ DELETE CLIENT
export const deleteClient = async (req, res) => {

  const company_code = req.user.company_code;

  await ClientModel.delete(
    req.params.id,
    company_code
  );

  res.json({
    message: "Client deleted successfully"
  });

};
