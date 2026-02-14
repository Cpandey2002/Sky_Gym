import axiosInstance from "./axiosInstance";

export const renewClient = async (data) => {
  const res = await axiosInstance.post("/renew", data);
  return res.data;
};

export const getAllRenewals = async (clientId) => {
  const res = await axiosInstance.get(`/renew/client/${clientId}`);
  return res.data;
};
