import db from "../config/db.js";

const softDeleteModel = {

  softDelete: async (payload) => {

    const [rows] = await db.query(
      "CALL sp_softdelete(?, ?)",
      ["SOFT_DELETE", JSON.stringify(payload)]
    );

    return rows[0][0];
  }

};

export default softDeleteModel;