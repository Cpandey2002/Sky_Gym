import axiosInstance from "./axiosInstance";

export const addClient = async (data) => {
    const res = await axiosInstance.post(
    "/client",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

};

export const getAllClients = async () => {
  const res = await axiosInstance.get("/client/get-all");
  return res.data;
};

export const getClientById = async (id) => {
  const res = await axiosInstance.get(`/client/${id}`);
  return res.data;
};

export const updateClient = async (id, data) => {
  return axiosInstance.put(`/client/${id}`, data);
};


export const deleteClient = async (id) => {
  return axiosInstance.delete(`/client/${id}`);
};

export const checkMemberIdExists = async (memberId) => {

  const res = await axiosInstance.get(
    `/client/check-member/${encodeURIComponent(memberId)}`
  );

  return res.data.exists;
};

