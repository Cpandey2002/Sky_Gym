import axiosInstance from "./axiosInstance";

export const registerCompany = async (formData) => {

  const res = await axiosInstance.post(
    "/users/register",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return res.data;

};
