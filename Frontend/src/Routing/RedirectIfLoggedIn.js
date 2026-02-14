import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RedirectIfLoggedIn() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      navigate("/enquiry", { replace: true });
    }
  }, [navigate]);

  return null;
}
