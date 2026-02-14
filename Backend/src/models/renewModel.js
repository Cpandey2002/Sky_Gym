import db from "../config/db.js";

class RenewModel {

  // ✅ CREATE
  static create(data, company_code, conn) {

    return conn.query(
      `
      INSERT INTO renew
      (
        client_id,
        from_date,
        to_date,
        duration,
        sessions,
        amount,
        discount,
        discount_price,
        category_id,
        company_code
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.client_id,
        data.from_date,
        data.to_date,
        data.duration,
        data.sessions,
        data.amount,
        data.discount ?? 0,
        data.discount_price ?? data.amount,
        data.category_id,
        company_code
      ]
    );

  }


  // ✅ GET ALL
  static findAllByCompany(company_code) {

    return db.query(
      `
      SELECT 
        r.*,
        c.client_name
      FROM renew r
      JOIN client_registration c
        ON r.client_id = c.id
      WHERE r.company_code = ?
      ORDER BY r.id DESC
      `,
      [company_code]
    );

  }


  // ✅ GET BY CLIENT
  static findByClientId(client_id, company_code) {

    return db.query(
      `
      SELECT 
        r.*,
        c.client_name
      FROM renew r
      LEFT JOIN client_registration c
        ON r.client_id = c.id
      WHERE r.client_id = ?
      AND r.company_code = ?
      ORDER BY r.id DESC
      `,
      [client_id, company_code]
    );

  }


  // ✅ UPDATE
  static update(id, company_code, data) {

    return db.query(
      `
      UPDATE renew
      SET ?
      WHERE id = ?
      AND company_code = ?
      `,
      [data, id, company_code]
    );

  }


  // ✅ DELETE
  static delete(id, company_code) {

    return db.query(
      `
      DELETE FROM renew
      WHERE id = ?
      AND company_code = ?
      `,
      [id, company_code]
    );

  }

}

export default RenewModel;
