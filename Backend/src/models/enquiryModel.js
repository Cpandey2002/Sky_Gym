import db from "../config/db.js";

const Enquiry = {

  create: async (data) => {

    const sql = `
      INSERT INTO enquiry 
      (client_name, email, mobile, enquiry_date, address, enquiry_received_from, company_code)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [

      data.client_name,
      data.email,
      data.mobile,
      data.enquiry_date,
      data.address,
      data.enquiry_received_from,
      data.company_code

    ]);

    return result;

  },


  getAllByCompany: async (company_code) => {

    const [rows] = await db.query(

      "SELECT * FROM enquiry WHERE company_code = ? ORDER BY id DESC",

      [company_code]

    );

    return rows;

  },


  getById: async (id, company_code) => {

    const [rows] = await db.query(

      "SELECT * FROM enquiry WHERE id = ? AND company_code = ?",

      [id, company_code]

    );

    return rows;

  },


  updateById: async (id, company_code, data) => {

    return db.query(

      `UPDATE enquiry SET
       client_name=?,
       email=?,
       mobile=?,
       enquiry_date=?,
       address=?,
       enquiry_received_from=?
       WHERE id=? AND company_code=?`,

      [

        data.client_name,
        data.email,
        data.mobile,
        data.enquiry_date,
        data.address,
        data.enquiry_received_from,
        id,
        company_code

      ]

    );

  },


  deleteById: async (id, company_code) => {

    return db.query(

      "DELETE FROM enquiry WHERE id=? AND company_code=?",

      [id, company_code]

    );

  }

};

export default Enquiry;
