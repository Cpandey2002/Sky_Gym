import multer from "multer";
import path from "path";

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, "uploads/logos/");
  },

  filename: (req, file, cb) => {

    const company_code = req.user.company_code;

    cb(null, company_code + ".png");

  }

});

const upload = multer({ storage });

export default upload;
