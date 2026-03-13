import db from "../config/db.js";

class CategoryModel {

    static getAll() {
        return db.query(
            "CALL sp_category('GET_ALL', 0, NULL)"
        );
    }

}

export default CategoryModel;