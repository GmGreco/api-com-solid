# 🛒 E-commerce API - Clean Architecture + Design Patterns

Uma API completa de E-commerce desenvolvida com **TypeScript**, **Express.js** e **Prisma ORM**, implementando **Clean Architecture**, princípios **SOLID** e **três padrões GoF**.

## 🏗️ Arquitetura

O projeto segue os princípios da **Clean Architecture** com as seguintes camadas:

```
src/
├── domain/                 # Camada de Domínio (Business Rules)
│   ├── entities/          # Entidades de negócio
│   ├── repositories/      # Interfaces dos repositórios
│   ├── services/          # Serviços de domínio
│   └── factories/         # Factories para criação de objetos
├── application/           # Camada de Aplicação (Use Cases)
│   └── use-cases/        # Casos de uso da aplicação
├── infrastructure/        # Camada de Infraestrutura
│   └── database/         # Implementações dos repositórios
└── presentation/          # Camada de Apresentação
    └── controllers/      # Controllers da API REST
```

## 🎯 Padrões GoF Implementados

### 1. **Strategy Pattern** 📋 - Sistema de Pagamento

**Localização**: `src/domain/services/payment/PaymentStrategy.ts`

**Problema Resolvido**: Diferentes métodos de pagamento (PIX, Cartão de Crédito, Boleto) com algoritmos e validações específicas.

**Implementação**:

- **Interface Strategy**: `PaymentStrategy`

  ```typescript
  export interface PaymentStrategy {
    processPayment(amount: number, paymentData: any): Promise<PaymentResult>;
    validatePaymentData(paymentData: any): boolean;
    getPaymentMethod(): PaymentMethod;
  }
  ```

- **Concrete Strategies**:

  - `CreditCardPaymentStrategy` - Validação de cartão, CVV, data de expiração
  - `PixPaymentStrategy` - Validação de chave PIX, processamento instantâneo
  - `BoletoPaymentStrategy` - Validação de documentos, geração de código

- **Context**: `PaymentProcessor`

  ```typescript
  export class PaymentProcessor {
    constructor(private strategy: PaymentStrategy) {}

    async processPayment(
      amount: number,
      paymentData: any
    ): Promise<PaymentResult> {
      return await this.strategy.processPayment(amount, paymentData);
    }
  }
  ```

- **Factory**: `PaymentStrategyFactory`
  ```typescript
  static createStrategy(paymentMethod: PaymentMethod): PaymentStrategy {
    switch (paymentMethod) {
      case PaymentMethod.PIX: return new PixPaymentStrategy();
      case PaymentMethod.CREDIT_CARD: return new CreditCardPaymentStrategy();
      case PaymentMethod.BOLETO: return new BoletoPaymentStrategy();
    }
  }
  ```

**Benefícios**:

- Extensibilidade: fácil adição de novos métodos de pagamento
- Flexibilidade: troca dinâmica de estratégias
- Testabilidade: cada estratégia pode ser testada isoladamente
- Manutenibilidade: cada método é independente

### 2. **Factory Method Pattern** 🏭 - Criação de Produtos

**Localização**: `src/domain/factories/ProductFactory.ts`

**Problema Resolvido**: Criação de diferentes tipos de produtos (Físicos, Digitais, Serviços) com configurações e validações específicas.

**Implementação**:

- **Abstract Factory**: `ProductFactory`

  ```typescript
  export abstract class ProductFactory {
    abstract createProduct(config: ProductConfig): Product;

    protected createBaseProduct(config: ProductConfig): Product {
      return new Product(/* configurações base */);
    }

    protected validateBaseConfig(config: ProductConfig): void {
      // Validações comuns a todos os produtos
    }
  }
  ```

- **Concrete Factories**:

  - `PhysicalProductFactory` - Produtos físicos com estoque, peso, dimensões
  - `DigitalProductFactory` - Produtos digitais com downloads, URLs
  - `ServiceProductFactory` - Serviços com agendamentos, duração

- **Factory Creator**: `ProductFactoryCreator`

  ```typescript
  static createProduct(type: ProductType, config: ProductConfig): Product {
    const factory = this.factories.get(type);
    return factory.createProduct(config);
  }
  ```

- **Builder Pattern** (bonus): `ProductConfigBuilder` para configurações complexas

**Benefícios**:

- Consistência: garantia de que produtos são criados corretamente
- Extensibilidade: fácil criação de novos tipos de produto
- Validação centralizada: validações específicas por tipo
- Flexibilidade: diferentes configurações para cada tipo

### 3. **Chain of Responsibility Pattern** 🔗 - Validação de Pedidos

**Localização**: `src/domain/services/validation/OrderValidationChain.ts`

**Problema Resolvido**: Sistema flexível e extensível de validação de pedidos com múltiplos critérios.

**Implementação**:

- **Abstract Handler**: `OrderValidationHandler`

  ```typescript
  export abstract class OrderValidationHandler {
    protected nextHandler?: OrderValidationHandler;

    setNext(handler: OrderValidationHandler): OrderValidationHandler {
      this.nextHandler = handler;
      return handler;
    }

    async handle(context: ValidationContext): Promise<ValidationResult> {
      const result = await this.validate(context);
      if (this.nextHandler && result.isValid) {
        const nextResult = await this.nextHandler.handle(context);
        return this.mergeResults(result, nextResult);
      }
      return result;
    }

    protected abstract validate(
      context: ValidationContext
    ): Promise<ValidationResult>;
  }
  ```

- **Concrete Handlers**:

  - `StockValidationHandler` - Validação de estoque por tipo de produto
  - `PaymentValidationHandler` - Validação de métodos e valores
  - `CustomerValidationHandler` - Validação de dados do cliente
  - `BusinessRulesValidationHandler` - Regras de negócio específicas

- **Chain Builder**: `OrderValidationChainBuilder`
  ```typescript
  static createCompleteChain(): OrderValidationHandler {
    return new OrderValidationChainBuilder()
      .addStockValidation()
      .addPaymentValidation()
      .addCustomerValidation()
      .addBusinessRulesValidation()
      .build();
  }
  ```

**Benefícios**:

- Flexibilidade: fácil reordenação e composição de validações
- Extensibilidade: novos validadores podem ser adicionados facilmente
- Responsabilidade única: cada handler tem uma responsabilidade específica
- Metadata rica: coleta informações detalhadas durante a validação

## 🔄 Integração dos Padrões

No fluxo de criação de pedidos (`CreateOrderUseCase`), os três padrões trabalham em sinergia:

```typescript
// 1. Factory Pattern - Determinar tipo dos produtos
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
const paymentProcessor = new PaymentProcessor(paymentStrategy);
const paymentResult = await paymentProcessor.processPayment(
  order.total,
  paymentData
);
```

## 🔧 Princípios SOLID Aplicados

### **S** - Single Responsibility Principle

- Cada classe tem uma única responsabilidade
- Use Cases focados em uma única operação
- Handlers de validação com responsabilidades específicas

### **O** - Open/Closed Principle

- Fácil extensão via Strategy Pattern (novos métodos de pagamento)
- Novos handlers podem ser adicionados sem modificar código existente
- Factories permitem novos tipos de produto

### **L** - Liskov Substitution Principle

- Todas as estratégias de pagamento são intercambiáveis
- Handlers podem ser substituídos sem afetar o funcionamento
- Factories seguem a mesma interface

### **I** - Interface Segregation Principle

- Interfaces específicas para cada repositório
- Handlers têm interfaces minimalistas
- DTOs específicos para cada operação

### **D** - Dependency Inversion Principle

- Controllers dependem de abstrações (Use Cases)
- Use Cases dependem de interfaces (Repositories)
- Injeção de dependência em todos os níveis

## 🗄️ Modelo de Dados

### Entidades Principais:

- **User**: Usuários do sistema (admin/customer)
- **Product**: Produtos disponíveis
- **Category**: Categorias de produtos
- **Order**: Pedidos realizados
- **OrderItem**: Itens de um pedido
- **Payment**: Pagamentos dos pedidos
- **Review**: Avaliações de produtos

## 🚀 Como Executar

### Pré-requisitos

- Node.js 16+
- npm ou yarn

### Instalação

1. **Instalar dependências**:

```bash
npm install
```

2. **Configurar banco de dados**:

```bash
# Gerar o cliente Prisma
npm run db:generate

# Criar e aplicar migrações
npm run db:migrate

# (Opcional) Popular banco com dados de exemplo
npm run db:seed
```

3. **Executar em desenvolvimento**:

```bash
npm run dev
```

4. **Build para produção**:

```bash
npm run build
npm start
```

### Endpoints Principais

#### Pedidos

- `POST /api/orders` - Criar pedido
- `GET /api/orders/:id` - Buscar pedido
- `GET /api/users/:userId/orders` - Pedidos do usuário
- `PUT /api/orders/:id/status` - Atualizar status

#### Produtos

- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Buscar produto
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Atualizar produto

#### Usuários

- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/users/profile` - Perfil do usuário

## 📝 Exemplo de Uso

### Criar um Pedido

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "items": [
      {
        "productId": "product-456",
        "quantity": 2
      }
    ],
    "paymentMethod": "PIX",
    "paymentData": {
      "pixKey": "user@email.com",
      "userDocument": "12345678901"
    }
  }'
```

### Resposta

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_123",
      "userId": "user-123",
      "status": "PENDING",
      "total": 199.98,
      "paymentMethod": "PIX",
      "items": [...]
    },
    "payment": {
      "transactionId": "pix_789",
      "processingTime": 500
    }
  }
}
```

## 🔍 Benefícios da Arquitetura

### **Testabilidade**

- Cada camada pode ser testada independentemente
- Mocks fáceis através das interfaces
- Use Cases isolados facilitam testes unitários
- Handlers de validação podem ser testados isoladamente

### **Manutenibilidade**

- Código organizado em responsabilidades claras
- Fácil localização de funcionalidades
- Baixo acoplamento entre componentes
- Cada padrão resolve um problema específico

### **Extensibilidade**

- Novos métodos de pagamento via Strategy Pattern
- Novos tipos de produto via Factory Method Pattern
- Novos validadores via Chain of Responsibility Pattern
- Novos Use Cases sem afetar infraestrutura

### **Escalabilidade**

- Repositórios podem ser implementados para diferentes bancos
- Controllers podem ser adaptados para GraphQL/gRPC
- Lógica de negócio independente da tecnologia
- Validações modulares permitem diferentes fluxos

## 🛡️ Qualidade de Código

- **TypeScript**: Tipagem forte para reduzir erros
- **ESLint**: Análise estática de código
- **Prettier**: Formatação consistente
- **Clean Code**: Nomes descritivos e funções pequenas
- **SOLID**: Princípios seguidos rigorosamente
- **Design Patterns**: Padrões GoF aplicados corretamente

## 🎓 Aprendizados

Este projeto demonstra:

1. Como aplicar **Design Patterns** de forma prática e justificada
2. Implementação de **Clean Architecture** em Node.js
3. Uso correto dos princípios **SOLID**
4. Organização de código para projetos **enterprise**
5. **Separação de responsabilidades** entre camadas
6. **Injeção de dependência** para testabilidade
7. **Validações modulares** com Chain of Responsibility
8. **Estratégias intercambiáveis** para algoritmos variados
9. **Factories consistentes** para criação de objetos complexos

## 📊 Demonstração dos Padrões

### Exemplo de Uso Integrado

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "items": [
      {
        "productId": "product-456",
        "quantity": 2
      }
    ],
    "paymentMethod": "PIX",
    "paymentData": {
      "pixKey": "user@email.com",
      "userDocument": "12345678901"
    },
    "customerData": {
      "creditLimit": 5000,
      "deliveryRegion": "SP",
      "isVip": true
    }
  }'
```

### Resposta com Metadata dos Padrões

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_123",
      "userId": "user-123",
      "status": "PENDING",
      "total": 199.98,
      "paymentMethod": "PIX",
      "items": [...]
    },
    "payment": {
      "transactionId": "pix_789",
      "processingTime": 500
    },
    "validation": {
      "isValid": true,
      "warnings": ["Cliente VIP - aplicar desconto"],
      "metadata": {
        "stockValidation": {
          "product-456": {
            "available": 100,
            "requested": 2,
            "type": "PHYSICAL"
          }
        },
        "paymentValidation": {
          "method": "PIX",
          "amount": 199.98,
          "minimumOrderValue": 10.0
        },
        "customerValidation": {
          "userId": "user-123",
          "isVip": true
        },
        "businessRulesValidation": {
          "itemCount": 1,
          "productTypesInOrder": ["PHYSICAL"]
        }
      }
    }
  }
}
```

## 🔗 Arquivos Relacionados

- **Padrões Detalhados**: `DESIGN_PATTERNS.md` - Documentação completa dos padrões
- **Documentação API**: `DOCUMENTATION.md` - Guia completo da API
- **Testes da API**: `API_TESTING.md` - Guia de testes e exemplos
- **Demonstração**: `examples/patterns-demo.ts` - Exemplos práticos dos padrões
