import { useEffect, useState } from "react";
import { loadProtectedImage } from "../API/loadProtectedImage";

const CompanyLogo = ({ companyCode, className = "h-16" }) => {

  const [logoSrc, setLogoSrc] = useState("/default-logo.png");

  useEffect(() => {

    const loadLogo = async () => {

      if (!companyCode) {
        setLogoSrc("/default-logo.png");
        return;
      }

      const cleanCode = companyCode.replace(/\//g, "");

      // try png first
      let path = `/uploads/logos/${cleanCode}.png`;

      let img = await loadProtectedImage(path);

      // fallback jpg
      if (!img) {
        path = `/uploads/logos/${cleanCode}.jpg`;
        img = await loadProtectedImage(path);
      }

      // fallback jpeg
      if (!img) {
        path = `/uploads/logos/${cleanCode}.jpeg`;
        img = await loadProtectedImage(path);
      }

      setLogoSrc(img || "/default-logo.png");

    };

    loadLogo();

  }, [companyCode]);

  return (
    <img
      src={logoSrc}
      alt="company logo"
      className={`${className} object-contain`}
    />
  );

};

export default CompanyLogo;
