import axios from "axios";
import { BASE_URL } from "./config";

export const loadProtectedImage = async (imagePath) => {

  try {

    const token = localStorage.getItem("authToken");

    const response = await axios.get(
      `${BASE_URL}${imagePath}`,
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return URL.createObjectURL(response.data);

  } catch {

    return "/default-avatar.png";

  }

};
