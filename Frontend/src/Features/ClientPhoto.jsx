import { useEffect, useState } from "react";
import { loadProtectedImage } from "../API/loadProtectedImage";

const ClientPhoto = ({ memberId, className = "w-10 h-10" }) => {

  const [imageSrc, setImageSrc] = useState("/default-avatar.png");

  useEffect(() => {

    const loadImage = async () => {

      if (!memberId) {
        setImageSrc("/default-avatar.png");
        return;
      }

      const cleanId = memberId.replace(/\//g, "");

      const extensions = ["png", "jpg", "jpeg"];

      let img = null;

      for (let ext of extensions) {

        const path = `/uploads/client/${cleanId}.${ext}`;

        img = await loadProtectedImage(path);

        if (img) {
          break;
        }

      }

      setImageSrc(img || "/default-avatar.png");

    };

    loadImage();

  }, [memberId]);

  return (
    <img
      src={imageSrc}
      alt="client"
      className={`${className} rounded-full object-cover`}
    />
  );

};

export default ClientPhoto;
