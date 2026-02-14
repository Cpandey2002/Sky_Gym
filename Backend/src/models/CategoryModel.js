import db from "../config/db.js";

class CategoryModel {

    static getAll() {
        return db.query("SELECT * FROM categories ORDER BY id DESC");
    }
}

export default CategoryModel;