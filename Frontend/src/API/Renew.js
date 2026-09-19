import axiosInstance from "./axiosInstance";

export const renewClient = async (data) => {
  const res = await axiosInstance.post("/renew", data);
  return res.data;
};

export const getAllRenewals = async (clientId) => {
  const res = await axiosInstance.get(`/renew/client/${clientId}`);

  console.log("GET RENEWALS:", res.data);

  return res.data?.[0] || [];
};
