import { useEffect, useState } from "react";
import { loadProtectedImage } from "../API/loadProtectedImage";

const ClientPhoto = ({
  memberId,
  clientName,
  className = "w-10 h-10",
}) => {
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadImage = async () => {
      if (!memberId) {
        setImageSrc(null);
        return;
      }

      const cleanId = String(memberId).replace(/\//g, "");

      const extensions = ["png", "jpg", "jpeg"];

      for (const ext of extensions) {
        try {
          const path = `/uploads/client/${cleanId}.${ext}`;

          const img = await loadProtectedImage(path);

          if (img) {
            if (!cancelled) {
              setImageSrc(img);
            }
            return;
          }
        } catch (error) {
          // Try next image extension
        }
      }

      if (!cancelled) {
        setImageSrc(null);
      }
    };

    loadImage();

    return () => {
      cancelled = true;
    };
  }, [memberId]);

  // Generate initials
  const nameParts = clientName?.trim().split(/\s+/).filter(Boolean) || [];

  let initials = "";

  if (nameParts.length === 1) {
    initials = nameParts[0].charAt(0);
  } else if (nameParts.length > 1) {
    initials =
      nameParts[0].charAt(0) +
      nameParts[nameParts.length - 1].charAt(0);
  }

  initials = initials.toUpperCase();

  return (
    <div
      className={`${className} rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center`}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={clientName || "client"}
          className="w-full h-full object-cover"
          onError={() => setImageSrc(null)}
        />
      ) : (
        <span className="text-gray-600 font-semibold text-sm">
          {initials}
        </span>
      )}
    </div>
  );
};

export default ClientPhoto;