import ClientModel from "../models/ClientModel.js";

import db from "../config/db.js";

export const createClient = async (req, res) => {

  const conn = await db.getConnection();

  const company_code = req.user?.company_code;

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

    const clientId = clientResult?.[0]?.[0]?.insertId;

    if (!clientId) {
      throw new Error("Client insertId not found!");
    }

    await conn.commit();

    res.status(201).json({
      message: "Client created successfully",
      clientId
    });

  } catch (err) {

    console.error("❌ CREATE CLIENT ERROR:", err);

    await conn.rollback();

    res.status(500).json({
      error: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage
    });

  } finally {

    conn.release();

  }
};


export const getAllClients = async (req, res) => {

  const company_code = req.user.company_code;

  const [rows] =
    await ClientModel.findAllByCompany(company_code);

  res.json(rows);

};


export const getClientById = async (req, res) => {

  const { id } = req.body;

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


export const updateClient = async (req, res) => {

  const { id, ...updateData } = req.body;

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


export const deleteClient = async (req, res) => {

  const { id } = req.body;

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
}