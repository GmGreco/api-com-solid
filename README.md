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

### 1. **Strategy Pattern** 📋

**Localização**: `src/domain/services/payment/PaymentStrategy.ts`

**Problema Resolvido**: Diferentes métodos de pagamento (PIX, Cartão de Crédito, Boleto) com lógicas específicas.

**Implementação**:

- **Interface Strategy**: `PaymentStrategy`
- **Concrete Strategies**:
  - `CreditCardPaymentStrategy`
  - `PixPaymentStrategy`
  - `BoletoPaymentStrategy`
- **Context**: `PaymentProcessor`
- **Factory**: `PaymentStrategyFactory`

**Benefícios**:

- Extensibilidade: fácil adição de novos métodos de pagamento
- Manutenibilidade: cada estratégia é independente
- Testabilidade: cada estratégia pode ser testada isoladamente

### 2. **Observer Pattern** 👁️

**Localização**: `src/domain/services/notification/OrderStatusObserver.ts`

**Problema Resolvido**: Necessidade de notificar múltiplos sistemas quando o status de um pedido muda.

**Implementação**:

- **Subject Interface**: `OrderStatusSubject`
- **Observer Interface**: `OrderStatusObserver`
- **Concrete Observers**:
  - `EmailNotificationObserver` - Notificações por email
  - `SmsNotificationObserver` - Notificações por SMS
  - `AuditLogObserver` - Log de auditoria
  - `InventoryObserver` - Atualização de estoque
- **Concrete Subject**: `OrderStatusManager`

**Benefícios**:

- Desacoplamento: observers são independentes do subject
- Flexibilidade: fácil adição/remoção de observers
- Responsabilidade única: cada observer tem uma responsabilidade específica

### 3. **Factory Pattern** 🏭

**Localização**: `src/domain/factories/ProductFactory.ts`

**Problema Resolvido**: Criação de diferentes tipos de produtos (Físicos, Digitais, Serviços) com configurações específicas.

**Implementação**:

- **Abstract Factory**: `ProductFactory`
- **Concrete Factories**:
  - `PhysicalProductFactory` - Produtos físicos com estoque/peso
  - `DigitalProductFactory` - Produtos digitais com downloads
  - `ServiceProductFactory` - Serviços com agendamento
- **Factory Creator**: `ProductFactoryCreator`
- **Builder Pattern**: `ProductConfigBuilder` (bonus pattern)

**Benefícios**:

- Extensibilidade: fácil criação de novos tipos de produto
- Consistência: garantia de que produtos são criados corretamente
- Flexibilidade: diferentes configurações para cada tipo

## 🔧 Princípios SOLID Aplicados

### **S** - Single Responsibility Principle

- Cada classe tem uma única responsabilidade
- Use Cases focados em uma única operação
- Observers com responsabilidades específicas

### **O** - Open/Closed Principle

- Fácil extensão via Strategy Pattern (novos métodos de pagamento)
- Novos observers podem ser adicionados sem modificar código existente
- Factories permitem novos tipos de produto

### **L** - Liskov Substitution Principle

- Todas as estratégias de pagamento são intercambiáveis
- Observers podem ser substituídos sem afetar o funcionamento
- Factories seguem a mesma interface

### **I** - Interface Segregation Principle

- Interfaces específicas para cada repositório
- Observers têm interfaces minimalistas
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

### **Manutenibilidade**

- Código organizado em responsabilidades claras
- Fácil localização de funcionalidades
- Baixo acoplamento entre componentes

### **Extensibilidade**

- Novos métodos de pagamento via Strategy
- Novos tipos de notificação via Observer
- Novos tipos de produto via Factory
- Novos Use Cases sem afetar infraestrutura

### **Escalabilidade**

- Repositórios podem ser implementados para diferentes bancos
- Controllers podem ser adaptados para GraphQL/gRPC
- Lógica de negócio independente da tecnologia

## 🛡️ Qualidade de Código

- **TypeScript**: Tipagem forte para reduzir erros
- **ESLint**: Análise estática de código
- **Prettier**: Formatação consistente
- **Clean Code**: Nomes descritivos e funções pequenas
- **SOLID**: Princípios seguidos rigorosamente

## 🎓 Aprendizados

Este projeto demonstra:

1. Como aplicar **Design Patterns** de forma prática e justificada
2. Implementação de **Clean Architecture** em Node.js
3. Uso correto dos princípios **SOLID**
4. Organização de código para projetos **enterprise**
5. **Separação de responsabilidades** entre camadas
6. **Injeção de dependência** para testabilidade

---

**Desenvolvido com ❤️ aplicando as melhores práticas de engenharia de software**
