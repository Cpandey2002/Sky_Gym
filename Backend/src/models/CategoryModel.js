import db from "../config/db.js";

class CategoryModel {

    static getAll() {
        return db.query(
            "CALL sp_category('GET_ALL', 0, NULL)"
        );
    }

    // CHANGES ADD CATEGORIES
    static create(payload) {
        return db.query(
            "CALL sp_category('CREATE', 0, ?)",
            [JSON.stringify(payload)]
        );
    }

}

export default CategoryModel;