import axiosInstance from "./axiosInstance";

export const getAttendance = async () => {

  const res = await axiosInstance.get("/attendance");

  return res.data;

};
