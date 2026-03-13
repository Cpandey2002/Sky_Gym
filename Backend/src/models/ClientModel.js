import db from "../config/db.js";

class ClientModel {

  static create(data, company_code, conn) {

    return conn.query(
      "CALL sp_client('CREATE', 0, ?)",
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
      "CALL sp_client('GET_ALL', 0, ?)",
      [
        JSON.stringify({ company_code })
      ]
    );

  }

  static findById(id, company_code) {

    return db.query(
      "CALL sp_client('GET_BY_ID', ?, ?)",
      [
        id,
        JSON.stringify({ company_code })
      ]
    );

  }

  static update(id, company_code, data) {

    return db.query(
      "CALL sp_client('UPDATE', ?, ?)",
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
      "CALL sp_client('DELETE', ?, ?)",
      [
        id,
        JSON.stringify({ company_code })
      ]
    );

  }

}

export default ClientModel;