// src/controllers/ClientController.js

import ClientModel from "../models/ClientModel.js";
import RenewModel from "../models/RenewModel.js";
import db from "../config/db.js";


// ✅ CREATE CLIENT
export const createClient = async (req, res) => {

  const conn = await db.getConnection();
  const company_code = req.user.company_code;

  try {

    await conn.beginTransaction();

    const photoName = req.file ? req.file.filename : null;

    const clientData = {
      ...req.body,
      photo: photoName
    };

    const [clientResult] = await ClientModel.create(
      clientData,
      company_code,
      conn
    );

    const clientId = clientResult[0].insertId;

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

    res.status(500).json({
      error: "Failed to create client"
    });

  } finally {

    conn.release();

  }

};



// ✅ GET ALL CLIENTS (BODY ONLY)
export const getAllClients = async (req, res) => {

  const company_code = req.user.company_code;

  const [rows] =
    await ClientModel.findAllByCompany(company_code);

  res.json(rows);

};



// ✅ GET CLIENT BY ID (BODY ONLY)
export const getClientById = async (req, res) => {

  const { id } = req.body;   // ✅ FROM BODY
  const company_code = req.user.company_code;

  if (!id) {
    return res.status(400).json({
      message: "Client id required"
    });
  }

  const [rows] =
    await ClientModel.findById(id, company_code);

  if (!rows.length) {
    return res.status(404).json({
      message: "Client not found"
    });
  }

  res.json(rows[0]);

};



// ✅ UPDATE CLIENT (BODY ONLY)
export const updateClient = async (req, res) => {

  const { id, ...updateData } = req.body;   // ✅ FROM BODY
  const company_code = req.user.company_code;

  if (!id) {
    return res.status(400).json({
      message: "Client id required"
    });
  }

  await ClientModel.update(
    id,
    company_code,
    updateData
  );

  res.json({
    message: "Client updated successfully"
  });

};



// ✅ DELETE CLIENT (BODY ONLY)
export const deleteClient = async (req, res) => {

  const { id } = req.body;   // ✅ FROM BODY
  const company_code = req.user.company_code;

  if (!id) {
    return res.status(400).json({
      message: "Client id required"
    });
  }

  await ClientModel.delete(
    id,
    company_code
  );

  res.json({
    message: "Client deleted successfully"
  });

};