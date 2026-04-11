// // src/middlewares/authMiddleware.js
// import jwt from "jsonwebtoken";

// const authMiddleware = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).json({ message: "No token provided" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // { id, company, role }
//     next();
//   } catch {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

// export default authMiddleware;
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("❌ JWT ERROR:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
