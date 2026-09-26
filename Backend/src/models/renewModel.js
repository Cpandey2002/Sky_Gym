import db from "../config/db.js";

class RenewModel {

  static create(data, company_code, conn = db) {
  return conn.query(
    "CALL sp_renew('CREATE', 0, ?)",
    [
      JSON.stringify({
        ...data,
        company_code
      })
    ]
  );
}

  static findAllByCompany(company_code) {
    return db.query(
      "CALL sp_renew('GET_ALL', 0, ?)",
      [
        JSON.stringify({ company_code })
      ]
    );
  }

  static findByClientId(client_id, company_code) {
    return db.query(
      "CALL sp_renew('GET_BY_CLIENT', 0, ?)",
      [
        JSON.stringify({
          client_id,
          company_code
        })
      ]
    );
  }

  static update(id, company_code, data) {
    return db.query(
      "CALL sp_renew('UPDATE', ?, ?)",
      [
        id,
        JSON.stringify({
          ...data,
          company_code
        })
      ]
    );
  }

  static delete(id, company_code) {
    return db.query(
      "CALL sp_renew('DELETE', ?, ?)",
      [
        id,
        JSON.stringify({ company_code })
      ]
    );
  }
}

export default RenewModel;