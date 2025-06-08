import { Router } from "express";
import { PrismaClient } from "@prisma/client";

// Repositories
import { PrismaUserRepository } from "../../infrastructure/database/PrismaUserRepository";
import { PrismaProductRepository } from "../../infrastructure/database/PrismaProductRepository";
import { PrismaOrderRepository } from "../../infrastructure/database/PrismaOrderRepository";

// Use Cases
import { RegisterUserUseCase } from "../../application/use-cases/RegisterUserUseCase";
import { LoginUseCase } from "../../application/use-cases/LoginUseCase";
import { CreateProductUseCase } from "../../application/use-cases/CreateProductUseCase";
import { GetProductsUseCase } from "../../application/use-cases/GetProductsUseCase";
import { GetProductByIdUseCase } from "../../application/use-cases/GetProductByIdUseCase";
import { CreateOrderUseCase } from "../../application/use-cases/CreateOrderUseCase";
import { GetOrderByIdUseCase } from "../../application/use-cases/GetOrderByIdUseCase";
import { GetUserOrdersUseCase } from "../../application/use-cases/GetUserOrdersUseCase";
import { UpdateOrderStatusUseCase } from "../../application/use-cases/UpdateOrderStatusUseCase";

// Controllers
import { AuthController } from "../controllers/AuthController";
import { ProductController } from "../controllers/ProductController";
import { OrderController } from "../controllers/OrderController";
import { UserController } from "../controllers/UserController";
import { CategoryController } from "../controllers/CategoryController";

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Repositories
const userRepository = new PrismaUserRepository(prisma);
const productRepository = new PrismaProductRepository(prisma);
const orderRepository = new PrismaOrderRepository(prisma);

// Initialize Use Cases
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const loginUseCase = new LoginUseCase(userRepository);
const createProductUseCase = new CreateProductUseCase(productRepository);
const getProductsUseCase = new GetProductsUseCase(productRepository);
const getProductByIdUseCase = new GetProductByIdUseCase(productRepository);
const createOrderUseCase = new CreateOrderUseCase(
  orderRepository,
  productRepository,
  userRepository
);
const getOrderByIdUseCase = new GetOrderByIdUseCase(orderRepository);
const getUserOrdersUseCase = new GetUserOrdersUseCase(orderRepository);
const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository);

// Initialize Controllers
const authController = new AuthController(registerUserUseCase, loginUseCase);
const productController = new ProductController(
  createProductUseCase,
  getProductsUseCase,
  getProductByIdUseCase
);
const orderController = new OrderController(
  createOrderUseCase,
  getOrderByIdUseCase,
  getUserOrdersUseCase,
  updateOrderStatusUseCase
);
const userController = new UserController(userRepository);
const categoryController = new CategoryController();

// Create main router
const router = Router();

// ============================
// 🔓 Public Authentication Routes
// ============================
router.post("/auth/register", (req, res) => authController.register(req, res));
router.post("/auth/login", (req, res) => authController.login(req, res));

// ============================
// 🔓 Public User Routes
// ============================
router.get("/users/profile", (req, res) => userController.getProfile(req, res));
router.put("/users/profile", (req, res) =>
  userController.updateProfile(req, res)
);
router.get("/users", (req, res) => userController.getAllUsers(req, res));

// ============================
// 🔓 Public Product Routes
// ============================
router.get("/products", (req, res) => productController.getProducts(req, res));
router.get("/products/search", (req, res) =>
  productController.searchProducts(req, res)
);
router.get("/products/:id", (req, res) =>
  productController.getProductById(req, res)
);
router.post("/products", (req, res) =>
  productController.createProduct(req, res)
);
router.put("/products/:id", (req, res) =>
  productController.updateProduct(req, res)
);

// ============================
// 🔓 Public Order Routes
// ============================
router.post("/orders", (req, res) => orderController.createOrder(req, res));
router.get("/orders/:id", (req, res) => orderController.getOrderById(req, res));
router.get("/users/:userId/orders", (req, res) =>
  orderController.getUserOrders(req, res)
);
router.put("/orders/:id/status", (req, res) =>
  orderController.updateOrderStatus(req, res)
);

// ============================
// 🔓 Public Category Routes
// ============================
router.get("/categories", (req, res) =>
  categoryController.getAllCategories(req, res)
);
router.post("/categories", (req, res) =>
  categoryController.createCategory(req, res)
);
router.get("/categories/:id/products", (req, res) =>
  categoryController.getCategoryProducts(req, res)
);

export default router;
