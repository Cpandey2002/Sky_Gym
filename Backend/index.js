import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import swaggerUi from "swagger-ui-express";

import corsConfig from "./src/middlewares/corsConfig.js";
import db from "./src/config/db.js";
import authMiddleware from "./src/middlewares/authMiddleware.js";

// ROUTES
import userRoutes from "./src/routes/userRoutes.js";
import enquiryRoutes from "./src/routes/enquiryRoutes.js";
import clientRoutes from "./src/routes/clientRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import renewRoutes from "./src/routes/renewRoutes.js";

dotenv.config();
const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsConfig);
app.use("/uploads", express.static("uploads"));
app.use("/logos", express.static("uploads/logos"));


/* ================= ROUTE MAP (IMPORTANT) ================= */
const routers = [
  ["/api/users", userRoutes],
  ["/api/enquiry", authMiddleware, enquiryRoutes],
  ["/api/client", authMiddleware, clientRoutes],
  ["/api/category", authMiddleware, categoryRoutes],
  ["/api/renew", authMiddleware, renewRoutes],
];


// REGISTER ROUTES
routers.forEach(route => {
  if (route.length === 2) {
    const [path, router] = route;
    app.use(path, router);
  } else {
    const [path, middleware, router] = route;
    app.use(path, middleware, router);
  }
});

/* ================= AUTO SWAGGER ================= */
const swaggerPaths = {};

routers.forEach(route => {
  const base = route[0];
  const router = route[route.length - 1];

  listEndpoints(router).forEach(({ path, methods }) => {
    const fullPath = (base + path).replace(/:([^/]+)/g, "{$1}");
    swaggerPaths[fullPath] ||= {};

    methods.forEach(m => {
      const method = m.toLowerCase();

      swaggerPaths[fullPath][method] = {
        summary: `${m} ${fullPath}`,
        tags: [base.replace("/api/", "").toUpperCase()],
        parameters: path.includes(":")
          ? path
              .split("/")
              .filter(p => p.startsWith(":"))
              .map(p => ({
                name: p.slice(1),
                in: "path",
                required: true,
                schema: { type: "string" },
              }))
          : [],
        ...( ["post","put","patch"].includes(method) && {
          requestBody: {
            required: true,
            content: {
              "application/json": {
                example: { note: "Add actual fields" }
              }
            }
          }
        }),
        responses: {
          200: { description: "Success" },
          401: { description: "Unauthorized" }
        },
      };
    });
  });
});

app.use(
  "/swagger",
  swaggerUi.serve,
  swaggerUi.setup({
    openapi: "3.0.0",
    info: {
      title: "Ideal Profilers API",
      version: "1.0.0",
      description: "Multi-company Gym Management API"
    },
    paths: swaggerPaths,
  })
);

/* ================= SERVER ================= */
const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log("\n=====================");
  console.log("🚀 SERVER RUNNING");
  console.log("=====================");
  console.log(`API     → http://localhost:${PORT}`);
  console.log(`Swagger → http://localhost:${PORT}/swagger`);
});

/* ================= DB CHECK ================= */
db.getConnection(err =>
  err
    ? console.error("❌ MySQL Error:", err)
    : console.log("✅ MySQL Connected")
);
