// src/models/ClientModel.js

import db from "../config/db.js";

class ClientModel {

  // ✅ CREATE CLIENT
  static create(data, company_code, conn) {

    return conn.query(

      `INSERT INTO client_registration
      (reg_date, client_name, address, member_id, mobile, category_id,
       from_date, to_date, duration, dob, sessions, email,
       amount, discount, discount_price, description, company_code, photo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

      ,

      [
        data.reg_date,
        data.client_name,
        data.address,
        data.member_id,
        data.mobile,
        data.category_id,
        data.from_date,
        data.to_date,
        data.duration,
        data.dob,
        data.sessions,
        data.email,
        data.amount,
        data.discount ?? 0,
        data.discount_price ?? data.amount,
        data.description,
        company_code,   // ✅ FIXED
        data.photo
      ]

    );

  }


  // ✅ FIND ALL CLIENTS BY COMPANY_CODE
  static findAllByCompany(company_code) {

    return db.query(

      `SELECT cr.*, c.name AS category_name
       FROM client_registration cr
       LEFT JOIN categories c ON cr.category_id = c.id
       WHERE cr.company_code = ?
       ORDER BY cr.id DESC`

      ,

      [company_code]

    );

  }


  // ✅ FIND SINGLE CLIENT
  static findById(id, company_code) {

    return db.query(

      `SELECT *
       FROM client_registration
       WHERE id = ? AND company_code = ?`

      ,

      [id, company_code]

    );

  }


  // ✅ UPDATE CLIENT
  static update(id, company_code, data) {

    return db.query(

      `UPDATE client_registration
       SET ?
       WHERE id = ? AND company_code = ?`

      ,

      [data, id, company_code]

    );

  }


  // ✅ DELETE CLIENT
  static delete(id, company_code) {

    return db.query(

      `DELETE FROM client_registration
       WHERE id = ? AND company_code = ?`

      ,

      [id, company_code]

    );

  }

}

export default ClientModel;
