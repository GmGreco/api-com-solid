import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Create Categories
  console.log("📂 Creating categories...");

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: "category-electronics" },
      update: {},
      create: {
        id: "category-electronics",
        name: "Eletrônicos",
        description:
          "Produtos eletrônicos em geral, incluindo smartphones, laptops e acessórios",
      },
    }),
    prisma.category.upsert({
      where: { id: "category-books" },
      update: {},
      create: {
        id: "category-books",
        name: "Livros",
        description: "Livros físicos e digitais de todas as categorias",
      },
    }),
    prisma.category.upsert({
      where: { id: "category-clothing" },
      update: {},
      create: {
        id: "category-clothing",
        name: "Roupas",
        description: "Vestuário masculino e feminino",
      },
    }),
    prisma.category.upsert({
      where: { id: "category-consulting" },
      update: {},
      create: {
        id: "category-consulting",
        name: "Consultoria",
        description: "Serviços de consultoria especializada",
      },
    }),
    prisma.category.upsert({
      where: { id: "category-home" },
      update: {},
      create: {
        id: "category-home",
        name: "Casa e Jardim",
        description: "Produtos para casa, decoração e jardinagem",
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // 2. Create Users
  console.log("👥 Creating users...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const customerPassword = await bcrypt.hash("customer123", 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@ecommerce.com" },
      update: {},
      create: {
        id: "user-admin-1",
        email: "admin@ecommerce.com",
        password: adminPassword,
        name: "Administrador",
        role: "ADMIN",
      },
    }),
    prisma.user.upsert({
      where: { email: "joao@example.com" },
      update: {},
      create: {
        id: "user-customer-1",
        email: "joao@example.com",
        password: customerPassword,
        name: "João Silva",
        role: "CUSTOMER",
      },
    }),
    prisma.user.upsert({
      where: { email: "maria@example.com" },
      update: {},
      create: {
        id: "user-customer-2",
        email: "maria@example.com",
        password: customerPassword,
        name: "Maria Santos",
        role: "CUSTOMER",
      },
    }),
    prisma.user.upsert({
      where: { email: "pedro@example.com" },
      update: {},
      create: {
        id: "user-customer-3",
        email: "pedro@example.com",
        password: customerPassword,
        name: "Pedro Costa",
        role: "CUSTOMER",
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // 3. Create Products
  console.log("🛍️ Creating products...");

  const products = await Promise.all([
    // Eletrônicos - Produtos Físicos
    prisma.product.upsert({
      where: { id: "product-iphone-15" },
      update: {},
      create: {
        id: "product-iphone-15",
        name: "iPhone 15 Pro",
        description: "Smartphone Apple com chip A17 Pro, 128GB, câmera 48MP",
        price: 1299.99,
        stock: 25,
        categoryId: "category-electronics",
        imageUrl: "https://example.com/iphone-15-pro.jpg",
        status: "ACTIVE",
      },
    }),
    prisma.product.upsert({
      where: { id: "product-macbook-air" },
      update: {},
      create: {
        id: "product-macbook-air",
        name: "MacBook Air M2",
        description: "Laptop Apple com chip M2, 16GB RAM, 512GB SSD",
        price: 2499.99,
        stock: 15,
        categoryId: "category-electronics",
        imageUrl: "https://example.com/macbook-air-m2.jpg",
        status: "ACTIVE",
      },
    }),
    prisma.product.upsert({
      where: { id: "product-samsung-tv" },
      update: {},
      create: {
        id: "product-samsung-tv",
        name: 'Smart TV Samsung 55" 4K',
        description: "Smart TV LED 55 polegadas com resolução 4K UHD",
        price: 899.99,
        stock: 10,
        categoryId: "category-electronics",
        imageUrl: "https://example.com/samsung-tv-55.jpg",
        status: "ACTIVE",
      },
    }),

    // Livros - Produtos Digitais
    prisma.product.upsert({
      where: { id: "product-clean-architecture" },
      update: {},
      create: {
        id: "product-clean-architecture",
        name: "Clean Architecture - Robert Martin",
        description:
          "Livro digital sobre arquitetura limpa em desenvolvimento de software",
        price: 49.99,
        stock: 9999, // Produto digital
        categoryId: "category-books",
        imageUrl: "https://example.com/clean-architecture-book.jpg",
        status: "ACTIVE",
      },
    }),
    prisma.product.upsert({
      where: { id: "product-design-patterns" },
      update: {},
      create: {
        id: "product-design-patterns",
        name: "Design Patterns GoF",
        description:
          "Livro digital sobre padrões de design em programação orientada a objetos",
        price: 39.99,
        stock: 9999,
        categoryId: "category-books",
        imageUrl: "https://example.com/design-patterns-book.jpg",
        status: "ACTIVE",
      },
    }),

    // Roupas - Produtos Físicos
    prisma.product.upsert({
      where: { id: "product-camiseta-dev" },
      update: {},
      create: {
        id: "product-camiseta-dev",
        name: "Camiseta 'Hello World'",
        description:
          "Camiseta 100% algodão com estampa 'Hello World' para desenvolvedores",
        price: 29.99,
        stock: 50,
        categoryId: "category-clothing",
        imageUrl: "https://example.com/camiseta-hello-world.jpg",
        status: "ACTIVE",
      },
    }),
    prisma.product.upsert({
      where: { id: "product-jaqueta" },
      update: {},
      create: {
        id: "product-jaqueta",
        name: "Jaqueta de Couro",
        description: "Jaqueta de couro legítimo, modelo clássico",
        price: 199.99,
        stock: 8,
        categoryId: "category-clothing",
        imageUrl: "https://example.com/jaqueta-couro.jpg",
        status: "ACTIVE",
      },
    }),

    // Consultoria - Serviços
    prisma.product.upsert({
      where: { id: "product-consultoria-dev" },
      update: {},
      create: {
        id: "product-consultoria-dev",
        name: "Consultoria em Desenvolvimento",
        description:
          "Sessão de consultoria especializada em arquitetura de software e boas práticas",
        price: 150.0,
        stock: 1, // Serviço limitado
        categoryId: "category-consulting",
        imageUrl: "https://example.com/consultoria-dev.jpg",
        status: "ACTIVE",
      },
    }),
    prisma.product.upsert({
      where: { id: "product-code-review" },
      update: {},
      create: {
        id: "product-code-review",
        name: "Code Review Especializado",
        description:
          "Análise detalhada de código com feedback e sugestões de melhorias",
        price: 75.0,
        stock: 5,
        categoryId: "category-consulting",
        imageUrl: "https://example.com/code-review.jpg",
        status: "ACTIVE",
      },
    }),

    // Casa e Jardim
    prisma.product.upsert({
      where: { id: "product-vaso-plantas" },
      update: {},
      create: {
        id: "product-vaso-plantas",
        name: "Vaso Decorativo para Plantas",
        description:
          "Vaso de cerâmica decorativo, ideal para plantas de interior",
        price: 35.99,
        stock: 20,
        categoryId: "category-home",
        imageUrl: "https://example.com/vaso-plantas.jpg",
        status: "ACTIVE",
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // 4. Create Sample Orders
  console.log("📦 Creating sample orders...");

  const orders = await Promise.all([
    // Pedido 1 - João compra iPhone
    prisma.order.create({
      data: {
        id: "order-1",
        userId: "user-customer-1",
        status: "COMPLETED",
        total: 1299.99,
        paymentMethod: "PIX",
        paymentStatus: "COMPLETED",
        orderItems: {
          create: [
            {
              id: "item-1-1",
              productId: "product-iphone-15",
              quantity: 1,
              price: 1299.99,
            },
          ],
        },
      },
    }),

    // Pedido 2 - Maria compra livros
    prisma.order.create({
      data: {
        id: "order-2",
        userId: "user-customer-2",
        status: "PROCESSING",
        total: 89.98,
        paymentMethod: "CREDIT_CARD",
        paymentStatus: "COMPLETED",
        orderItems: {
          create: [
            {
              id: "item-2-1",
              productId: "product-clean-architecture",
              quantity: 1,
              price: 49.99,
            },
            {
              id: "item-2-2",
              productId: "product-design-patterns",
              quantity: 1,
              price: 39.99,
            },
          ],
        },
      },
    }),

    // Pedido 3 - Pedro compra consultoria
    prisma.order.create({
      data: {
        id: "order-3",
        userId: "user-customer-3",
        status: "PENDING",
        total: 225.0,
        paymentMethod: "BOLETO",
        paymentStatus: "PENDING",
        orderItems: {
          create: [
            {
              id: "item-3-1",
              productId: "product-consultoria-dev",
              quantity: 1,
              price: 150.0,
            },
            {
              id: "item-3-2",
              productId: "product-code-review",
              quantity: 1,
              price: 75.0,
            },
          ],
        },
      },
    }),

    // Pedido 4 - Maria compra roupas e casa
    prisma.order.create({
      data: {
        id: "order-4",
        userId: "user-customer-2",
        status: "SHIPPED",
        total: 265.97,
        paymentMethod: "PIX",
        paymentStatus: "COMPLETED",
        orderItems: {
          create: [
            {
              id: "item-4-1",
              productId: "product-camiseta-dev",
              quantity: 2,
              price: 29.99,
            },
            {
              id: "item-4-2",
              productId: "product-jaqueta",
              quantity: 1,
              price: 199.99,
            },
            {
              id: "item-4-3",
              productId: "product-vaso-plantas",
              quantity: 1,
              price: 35.99,
            },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${orders.length} orders`);

  // 5. Show summary
  console.log("\n🎉 Database seeding completed successfully!");
  console.log("📊 Summary:");
  console.log(`   📂 Categories: ${categories.length}`);
  console.log(`   👥 Users: ${users.length}`);
  console.log(`   🛍️ Products: ${products.length}`);
  console.log(`   📦 Orders: ${orders.length}`);

  console.log("\n🔑 Test accounts created:");
  console.log("   👨‍💼 Admin: admin@ecommerce.com / admin123");
  console.log("   👤 Customer 1: joao@example.com / customer123");
  console.log("   👤 Customer 2: maria@example.com / customer123");
  console.log("   👤 Customer 3: pedro@example.com / customer123");

  console.log("\n🚀 You can now test the API with populated data!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
