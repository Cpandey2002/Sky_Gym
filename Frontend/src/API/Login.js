import axiosInstance from "./axiosInstance";

export const Authentication = async (data) => {

  const res = await axiosInstance.post("/users/login", data);

  return res.data;

};
