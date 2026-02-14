import axiosInstance from "../API/axiosInstance";

// GET all clients
export const getAllsession = async () => {
  const res = await axiosInstance.get(`/session`);
  return res.data;
};

// GET client by ID
export const getclientsessionById = async (id) => {
  const res = await axiosInstance.get(`/session/${id}`);
  return res.data;
};

// POST (Create) a new client
// export const addsesssion = async (sesssionData) => {
//   const res = await axiosInstance.post("/session", sesssionData);
//   return res.data;
// };


// PRESENT
export const markPresent = async (payload) => {
  return axiosInstance.post("/session", payload);
};

// ABSENT
export const markAbsent = async (payload) => {
  return axiosInstance.post("/session/absent", payload);
};
