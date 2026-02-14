import multer from "multer";
import fs from "fs";

const uploadPath = "uploads/client";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {

    let memberId = req.body.member_id;

    // ✅ remove slashes ONLY for filename
    const safeMemberId = memberId.replace(/\//g, "");

    cb(null, safeMemberId + ".png");
  }
});

export default multer({ storage });
