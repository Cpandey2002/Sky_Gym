import CategoryModel from "../models/CategoryModel.js";

export const getCategories = async (req, res) => {

    try {

        const [rows] = await CategoryModel.getAll();

        res.json(rows);

    } catch (err) {

        res.status(500).json({ error: "Failed to load categories" });

    }

};


// Changes add new categories
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const payload = {
            name,
            description
        };

        const [rows] = await CategoryModel.create(payload);

        res.status(201).json(rows);

    } catch (err) {
        console.error("Create Category Error:", err);
        res.status(500).json({ error: "Failed to create category" });
    }
};