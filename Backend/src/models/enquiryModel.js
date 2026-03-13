import db from "../config/db.js";

const Enquiry = {

  create: async (data) => {

    const [rows] = await db.query(
      "CALL sp_enquiry('CREATE', 0, ?)",
      [
        JSON.stringify(data)
      ]
    );

    return rows[0];
  },


  getAllByCompany: async (company_code) => {

    const [rows] = await db.query(
      "CALL sp_enquiry('GET_ALL', 0, ?)",
      [
        JSON.stringify({ company_code })
      ]
    );

    return rows;
  },


  getById: async (id, company_code) => {

    const [rows] = await db.query(
      "CALL sp_enquiry('GET_BY_ID', ?, ?)",
      [
        id,
        JSON.stringify({ company_code })
      ]
    );

    return rows;
  },


  updateById: async (id, company_code, data) => {

    return db.query(
      "CALL sp_enquiry('UPDATE', ?, ?)",
      [
        id,
        JSON.stringify({
          ...data,
          company_code
        })
      ]
    );

  },


  deleteById: async (id, company_code) => {

    return db.query(
      "CALL sp_enquiry('DELETE', ?, ?)",
      [
        id,
        JSON.stringify({ company_code })
      ]
    );

  }

};

export default Enquiry;