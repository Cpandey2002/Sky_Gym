import CategoryModel from "../models/CategoryModel.js";

export const getCategories = async (req, res) => {
    try {
        const [rows] = await CategoryModel.getAll();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to load categories" });
    }
};