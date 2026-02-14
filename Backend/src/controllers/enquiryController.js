import Enquiry from "../models/enquiryModel.js";


// ✅ CREATE ENQUIRY
export const createEnquiry = async (req, res) => {

  try {

    if (!req.user || !req.user.company_code) {

      return res.status(401).json({
        message: "company_code not found in token"
      });

    }

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

    console.error("CREATE ENQUIRY ERROR =>", error);

    res.status(500).json({
      error: error.message
    });

  }

};



// ✅ GET ALL ENQUIRIES
export const getAllEnquiries = async (req, res) => {

  try {

    const company_code = req.user.company_code;

    const rows = await Enquiry.getAllByCompany(company_code);

    res.json(rows);

  } catch (error) {

    console.error("GET ENQUIRY ERROR =>", error);

    res.status(500).json({
      error: error.message
    });

  }

};



// ✅ GET ENQUIRY BY ID
export const getEnquiryById = async (req, res) => {

  try {

    const company_code = req.user.company_code;

    const rows = await Enquiry.getById(

      req.params.id,
      company_code

    );

    if (!rows.length) {

      return res.status(404).json({
        message: "Enquiry not found"
      });

    }

    res.json(rows[0]);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};



// ✅ UPDATE ENQUIRY
export const updateEnquiryById = async (req, res) => {

  try {

    const company_code = req.user.company_code;

    await Enquiry.updateById(

      req.params.id,
      company_code,
      req.body

    );

    res.json({

      message: "Enquiry updated successfully"

    });

  } catch (error) {

    console.error("UPDATE ERROR =>", error);

    res.status(500).json({
      error: error.message
    });

  }

};



// ✅ DELETE ENQUIRY
export const deleteEnquiryById = async (req, res) => {

  try {

    const company_code = req.user.company_code;

    await Enquiry.deleteById(

      req.params.id,
      company_code

    );

    res.json({

      message: "Enquiry deleted successfully"

    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};
