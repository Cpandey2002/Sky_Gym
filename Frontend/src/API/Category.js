import axiosInstance from "./axiosInstance";

// GET all categories
export const getAllCategories = async () => {
  const res = await axiosInstance.get(`/category`);
  return res.data;
};


