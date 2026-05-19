import SoftDelete from "../models/softDeleteModel.js";

const softDeletefunctionality = async (req, res) => {
  try {

    const { status, email, company_code } = req.body;

    const result = await SoftDelete.softDelete({
      company_code,
      status,
      email
    });

    res.json({
      success: true,
      message: "Company Deleted successfully",
      data: result
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};

export { softDeletefunctionality };