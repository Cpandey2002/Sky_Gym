import axiosInstance from "../API/axiosInstance";

export const getEnquiryAll = async () => {
  const res = await axiosInstance.get("/enquiry");

  return Array.isArray(res.data?.[0])
    ? res.data[0]
    : res.data;
};

export const addEnquiry = async (enquiryData) => {
  const res = await axiosInstance.post("/enquiry", enquiryData);
  return res.data;
};

export const updateEnquiry = async (id, enquiryData) => {
  const res = await axiosInstance.put(`/enquiry/${id}`, enquiryData);
  return res.data;
};

export const deleteEnquiry = async (id) => {
  const res = await axiosInstance.delete(`/enquiry/${id}`);
  return res.data;
};
