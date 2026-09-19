import axiosInstance from "./axiosInstance";

export const addClient = async (data) => {
  const res = await axiosInstance.post(
    "/client/create",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return res.data;
};

export const getAllClients = async () => {
  const res = await axiosInstance.get("/client/get-all");

  console.log("GET ALL CLIENTS:", res.data);

  return res.data?.[0] || [];
};

export const getClientById = async (id) => {
  const res = await axiosInstance.post("/client/get-by-id", {
    id
  });

  console.log("GET CLIENT BY ID:", res.data);

  return res.data?.[0]?.[0] || res.data?.[0] || null;
};

export const updateClient = async (id, data) => {
  return axiosInstance.put("/client/update", data);
};

export const deleteClient = async (id) => {
  return axiosInstance.delete("/client", {
    data: { id }
  });
};

export const checkMemberIdExists = async (memberId) => {
  const res = await axiosInstance.post(
    "/client/check-member",
    {
      member_id: memberId
    }
  );

  return res.data.exists;
};