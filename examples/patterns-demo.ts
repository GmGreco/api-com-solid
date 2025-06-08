// Demonstração dos Padrões GoF implementados no E-commerce API

import {
  PaymentStrategyFactory,
  PaymentProcessor,
} from "../src/domain/services/payment/PaymentStrategy";
import { PaymentMethod } from "../src/domain/entities/Order";

import {
  OrderStatusManager,
  EmailNotificationObserver,
  SmsNotificationObserver,
  AuditLogObserver,
} from "../src/domain/services/notification/OrderStatusObserver";

import {
  ProductFactoryCreator,
  ProductType,
  PhysicalProductConfigBuilder,
  QuickProductFactory,
} from "../src/domain/factories/ProductFactory";

// Simulação de serviços auxiliares
const mockEmailService = {
  async sendEmail(
    userId: string,
    subject: string,
    message: string,
    order: any
  ) {
    console.log(`📧 Email enviado para ${userId}: ${subject}`);
  },
  async sendAdminEmail(subject: string, message: string, order: any) {
    console.log(`📧 Email admin: ${subject}`);
  },
};

const mockSmsService = {
  async sendSms(userId: string, message: string) {
    console.log(`📱 SMS enviado para ${userId}: ${message}`);
  },
};

const mockLogger = {
  info(event: string, data: any) {
    console.log(`ℹ️  [INFO] ${event}:`, data);
  },
  warn(event: string, data: any) {
    console.log(`⚠️  [WARN] ${event}:`, data);
  },
  error(event: string, data: any) {
    console.log(`❌ [ERROR] ${event}:`, data);
  },
};

async function demonstratePatterns() {
  console.log("🎯 === DEMONSTRAÇÃO DOS PADRÕES GoF ===\n");

  // 1. STRATEGY PATTERN - Estratégias de Pagamento
  console.log("📋 1. STRATEGY PATTERN - Estratégias de Pagamento");
  console.log("---------------------------------------------------");

  // Pagamento PIX
  const pixStrategy = PaymentStrategyFactory.createStrategy(PaymentMethod.PIX);
  const pixProcessor = new PaymentProcessor(pixStrategy);

  const pixData = {
    pixKey: "usuario@email.com",
    userDocument: "12345678901",
  };

  console.log("💳 Processando pagamento PIX...");
  const pixResult = await pixProcessor.processPayment(100.0, pixData);
  console.log("Resultado PIX:", pixResult);

  // Pagamento Cartão de Crédito
  const cardStrategy = PaymentStrategyFactory.createStrategy(
    PaymentMethod.CREDIT_CARD
  );
  const cardProcessor = new PaymentProcessor(cardStrategy);

  const cardData = {
    cardNumber: "1234567890123456",
    expiryDate: "12/25",
    cvv: "123",
    cardholderName: "João Silva",
  };

  console.log("\n💳 Processando pagamento Cartão...");
  const cardResult = await cardProcessor.processPayment(200.0, cardData);
  console.log("Resultado Cartão:", cardResult);

  // 2. OBSERVER PATTERN - Notificações de Status
  console.log("\n\n👁️  2. OBSERVER PATTERN - Notificações de Status");
  console.log("---------------------------------------------------");

  const orderStatusManager = new OrderStatusManager(mockLogger);

  // Registrar observers
  const emailObserver = new EmailNotificationObserver(mockEmailService);
  const smsObserver = new SmsNotificationObserver(mockSmsService);
  const auditObserver = new AuditLogObserver(mockLogger);

  orderStatusManager.addObserver(emailObserver);
  orderStatusManager.addObserver(smsObserver);
  orderStatusManager.addObserver(auditObserver);

  // Simular mudança de status de pedido
  const mockOrder = {
    id: "order_123",
    userId: "user_456",
    status: "PENDING",
    total: 299.99,
    items: [{ id: "item_1", productId: "prod_1", quantity: 2, price: 149.99 }],
  };

  console.log("📦 Simulando mudança de status do pedido...");
  orderStatusManager.notifyObservers(
    mockOrder as any,
    "PENDING" as any,
    "CONFIRMED" as any
  );

  // 3. FACTORY PATTERN - Criação de Produtos
  console.log("\n\n🏭 3. FACTORY PATTERN - Criação de Produtos");
  console.log("---------------------------------------------------");

  // Criação usando Factory Creator
  console.log("📱 Criando produto digital (e-book)...");
  const ebook = QuickProductFactory.createBook(
    "Clean Code",
    "Livro sobre código limpo e boas práticas de programação",
    49.99,
    "category_books"
  );
  console.log("E-book criado:", ebook.toJSON());

  // Criação usando Builder Pattern
  console.log("\n👕 Criando produto físico (camiseta) usando Builder...");
  const camisetaConfig = new PhysicalProductConfigBuilder()
    .setName("Camiseta Dev")
    .setDescription("Camiseta confortável para desenvolvedores")
    .setPrice(39.99)
    .setCategoryId("category_clothing")
    .setStock(50)
    .setWeight(0.2)
    .setDimensions(30, 20, 2)
    .setShippingRequired(true)
    .build();

  const camiseta = ProductFactoryCreator.createProduct(
    ProductType.PHYSICAL,
    camisetaConfig
  );
  console.log("Camiseta criada:", camiseta.toJSON());

  // Criação de serviço
  console.log("\n💼 Criando produto de serviço (consultoria)...");
  const consultoriaConfig = {
    name: "Consultoria em Arquitetura de Software",
    description:
      "Consultoria especializada em Clean Architecture e Design Patterns",
    price: 150.0,
    categoryId: "category_consulting",
    duration: 2, // 2 horas
    deliveryTime: 1, // 1 dia
    requiresScheduling: true,
    availableSlots: ["09:00", "14:00", "16:00"],
  };

  const consultoria = ProductFactoryCreator.createProduct(
    ProductType.SERVICE,
    consultoriaConfig
  );
  console.log("Consultoria criada:", consultoria.toJSON());

  console.log("\n✅ === DEMONSTRAÇÃO CONCLUÍDA ===");
  console.log("\nTodos os padrões GoF foram demonstrados com sucesso!");
  console.log("- Strategy Pattern: Diferentes estratégias de pagamento");
  console.log(
    "- Observer Pattern: Notificações automáticas de mudança de status"
  );
  console.log(
    "- Factory Pattern: Criação flexível de diferentes tipos de produtos"
  );
}

// Executar demonstração
demonstratePatterns().catch(console.error);
