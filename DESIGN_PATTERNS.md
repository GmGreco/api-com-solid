# 🎯 Design Patterns GoF - E-commerce API

Esta API implementa **três padrões GoF** para demonstrar arquitetura limpa e boas práticas de desenvolvimento.

## 📋 Padrões Implementados

### 1. 🎯 Strategy Pattern - Sistema de Pagamento

**Localização:** `src/domain/services/payment/`

**Problema Resolvido:** Diferentes métodos de pagamento com algoritmos específicos.

**Implementação:**

- **Interface Strategy:** `PaymentStrategy`
- **Concrete Strategies:**
  - `CreditCardPaymentStrategy`
  - `PixPaymentStrategy`
  - `BoletoPaymentStrategy`
- **Context:** `PaymentProcessor`
- **Factory:** `PaymentStrategyFactory`

```typescript
// Uso do Strategy Pattern
const strategy = PaymentStrategyFactory.createStrategy(PaymentMethod.PIX);
const processor = new PaymentProcessor(strategy);
const result = await processor.processPayment(100.0, pixData);
```

### 2. 🏭 Factory Method Pattern - Criação de Produtos

**Localização:** `src/domain/factories/`

**Problema Resolvido:** Criação de diferentes tipos de produtos com configurações específicas.

**Implementação:**

- **Product:** `Product` (entidade base)
- **Abstract Factory:** `ProductFactory`
- **Concrete Factories:**
  - `PhysicalProductFactory`
  - `DigitalProductFactory`
  - `ServiceProductFactory`
- **Factory Creator:** `ProductFactoryCreator`

```typescript
// Uso do Factory Pattern
const product = ProductFactoryCreator.createProduct(
  ProductType.PHYSICAL,
  physicalProductConfig
);
```

### 3. 🔗 Chain of Responsibility Pattern - Validação de Pedidos

**Localização:** `src/domain/services/validation/`

**Problema Resolvido:** Validações complexas e extensíveis para pedidos.

**Implementação:**

- **Handler:** `OrderValidationHandler` (abstract)
- **Concrete Handlers:**
  - `StockValidationHandler`
  - `PaymentValidationHandler`
  - `CustomerValidationHandler`
  - `BusinessRulesValidationHandler`
- **Chain Builder:** `OrderValidationChainBuilder`

```typescript
// Uso do Chain of Responsibility Pattern
const validationChain = OrderValidationChainBuilder.createCompleteChain();

const result = await validationChain.handle(validationContext);
```

## 🚀 Como os Padrões se Integram

### No CreateOrderUseCase:

```typescript
// 1. Factory Pattern - Determinar tipo do produto
const productTypes = new Map<string, ProductType>();

// 2. Chain of Responsibility - Validar pedido
const validationResult = await this.validateOrderWithChain(
  order,
  user,
  products,
  productTypes,
  customerData
);

// 3. Strategy Pattern - Processar pagamento
const paymentStrategy = PaymentStrategyFactory.createStrategy(
  order.paymentMethod
);
```

## 📊 Benefícios dos Padrões

### Strategy Pattern:

- ✅ Facilita adição de novos métodos de pagamento
- ✅ Isola algoritmos de pagamento
- ✅ Permite troca dinâmica de estratégias

### Factory Method Pattern:

- ✅ Centraliza criação de produtos
- ✅ Facilita adição de novos tipos de produto
- ✅ Valida configurações específicas por tipo

### Chain of Responsibility Pattern:

- ✅ Validações modulares e reutilizáveis
- ✅ Facilita adição/remoção de validações
- ✅ Ordem flexível de execução
- ✅ Coleta de metadata para auditoria

## 🛠️ Extensibilidade

### Adicionar Novo Método de Pagamento:

1. Criar nova strategy implementando `PaymentStrategy`
2. Adicionar no `PaymentStrategyFactory`
3. Adicionar enum em `PaymentMethod`

### Adicionar Novo Tipo de Produto:

1. Criar nova factory estendendo `ProductFactory`
2. Registrar no `ProductFactoryCreator`
3. Adicionar enum em `ProductType`

### Adicionar Nova Validação:

1. Criar handler estendendo `OrderValidationHandler`
2. Adicionar no `OrderValidationChainBuilder`
3. Configurar ordem na cadeia

## 🎯 Demonstração em Uso

### 1. Criar Pedido com Validações:

```bash
POST /orders
{
  "userId": "user_1",
  "items": [
    {"productId": "prod_1", "quantity": 2}
  ],
  "paymentMethod": "PIX",
  "paymentData": {"pixKey": "user@email.com"},
  "customerData": {
    "creditLimit": 5000,
    "deliveryRegion": "SP",
    "isVip": true
  }
}
```

### 2. Resposta com Metadata de Validação:

```json
{
  "success": true,
  "data": {
    "order": {...},
    "payment": {...},
    "validation": {
      "isValid": true,
      "warnings": ["Cliente VIP - aplicar desconto"],
      "metadata": {
        "stockValidation": {...},
        "paymentValidation": {...},
        "customerValidation": {...},
        "businessRulesValidation": {...}
      }
    }
  }
}
```

## 🔄 Evolução dos Padrões

### Histórico:

1. **Inicial:** Strategy (pagamentos) + Factory (produtos) + Observer (notificações)
2. **Primeira Substituição:** Observer → Command (notificações + histórico)
3. **Substituição Final:** Command → Chain of Responsibility (validações)

### Vantagens da Substituição:

- ✅ Foco em validações ao invés de notificações
- ✅ Maior flexibilidade na composição de validações
- ✅ Melhor separação de responsabilidades
- ✅ Facilita testes unitários

## 📚 Referências

- Gang of Four Design Patterns
- Clean Architecture by Robert C. Martin
- Domain-Driven Design by Eric Evans
