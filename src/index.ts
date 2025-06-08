import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import apiRoutes from "./presentation/routes/index";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(helmet());
app.use(cors());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "E-commerce API",
    version: "1.0.0",
    database: "Connected",
  });
});
app.get("/", (req, res) => {
  res.json({
    message: "E-commerce API - Clean Architecture Implementation",
    description:
      "API de E-commerce utilizando Clean Architecture, SOLID e Padrões GoF",
    version: "1.0.0",
    architecture: "Clean Architecture with SOLID principles",
    patterns: [
      "Strategy Pattern - Payment processing strategies",
      "Observer Pattern - Order status notifications",
      "Factory Pattern - Product type creation",
    ],
    authentication: "All routes are public (authentication removed)",
    endpoints: {
      authentication: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
      },
      users: {
        profile: "GET /api/users/profile",
        updateProfile: "PUT /api/users/profile",
        getAllUsers: "GET /api/users",
      },
      products: {
        getAll: "GET /api/products",
        getById: "GET /api/products/:id",
        search: "GET /api/products/search?q=query",
        create: "POST /api/products",
        update: "PUT /api/products/:id",
      },
      orders: {
        create: "POST /api/orders",
        getById: "GET /api/orders/:id",
        getUserOrders: "GET /api/users/:userId/orders",
        updateStatus: "PUT /api/orders/:id/status",
      },
      categories: {
        getAll: "GET /api/categories",
        create: "POST /api/categories",
        getProducts: "GET /api/categories/:id/products",
      },
    },
    paymentMethods: ["PIX", "CREDIT_CARD", "BOLETO"],
    productTypes: ["PHYSICAL", "DIGITAL", "SERVICE"],
    technologies: [
      "TypeScript",
      "Express.js",
      "Prisma ORM",
      "PostgreSQL/SQLite",
      "JWT Authentication (Available but not required)",
      "Bcrypt Password Hashing",
    ],
  });
});
app.use("/api", apiRoutes);
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message || "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
);
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
    availableRoutes: {
      health: "GET /health",
      documentation: "GET /",
      api: "GET /api/*",
    },
  });
});
const shutdown = () => {
  console.log("Received shutdown signal. Graceful shutdown...");
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
app.listen(PORT, () => {
  console.log(`🚀 E-commerce API server running on port ${PORT}`);
  console.log(`�� Health check: http://localhost:${PORT}/health`);
  console.log(`📖 Documentation: http://localhost:${PORT}/`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || "development"}`);
});
export default app;
