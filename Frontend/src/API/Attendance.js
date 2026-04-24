import axiosInstance from "./axiosInstance";

export const getAttendance = async (month, year) => {
  const company_code = localStorage.getItem("company_code");

  const res = await axiosInstance.post("/attendance/monthly-attendance", {
    company_code,
    month,
    year
  });

  return res.data;
};