import axiosInstance from "./axiosInstance";

// GET all categories
export const getAllCategories = async () => {
    const res = await axiosInstance.get(`/category`);
    return res.data[0];
};

// CREATE category
export const createCategory = async (payload) => {
    const res = await axiosInstance.post(`/category`, payload);
    return res.data;
};