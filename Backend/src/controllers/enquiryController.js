import Enquiry from "../models/enquiryModel.js";

export const createEnquiry = async (req, res) => {
  try {
    const company_code = req.user.company_code;
    const result = await Enquiry.create({
      ...req.body,
      company_code
    });
    res.status(201).json({
      message: "Enquiry created successfully",
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllEnquiries = async (req, res) => {
  try {
    const company_code = req.user.company_code;
    const rows =
      await Enquiry.getAllByCompany(company_code);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEnquiryById = async (req, res) => {
  try {
    const { id } = req.body;
    const company_code = req.user.company_code;
    const rows =
      await Enquiry.getById(id, company_code);
    if (!rows.length) {
      return res.status(404).json({
        message: "Enquiry not found"
      });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateEnquiryById = async (req, res) => {
  try {
    const { id, ...data } = req.body;
    const company_code = req.user.company_code;
    await Enquiry.updateById(
      id,
      company_code,
      data
    );
    res.json({
      message: "Enquiry updated successfully"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteEnquiryById = async (req, res) => {
  try {
    const { id } = req.body;
    const company_code = req.user.company_code;
    await Enquiry.deleteById(
      id,
      company_code
    );
    res.json({
      message: "Enquiry deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};