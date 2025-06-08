# 🧪 API Testing Guide

## 🚀 Servidor Iniciado

A API está funcionando em: **http://localhost:3000**

## ⚠️ **IMPORTANTE**: Todas as rotas são públicas (autenticação removida)

Todas as rotas da API agora são **públicas** e **não requerem autenticação**. Você pode acessar qualquer endpoint sem tokens JWT.

## 📋 Endpoints Implementados

### 🔍 Health Check & Documentation

```bash
# Health check
curl http://localhost:3000/health

# Documentação completa
curl http://localhost:3000/
```

### 🔓 Autenticação (Opcional)

```bash
# Registrar usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "123456",
    "role": "CUSTOMER"
  }'

# Login (gera token mas não é obrigatório)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "123456"
  }'
```

### 🔓 Usuários (Público)

```bash
# Ver perfil (sem token necessário)
curl -X GET http://localhost:3000/api/users/profile

# Atualizar perfil (sem token necessário)
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva Atualizado"
  }'

# Listar todos usuários (público)
curl -X GET http://localhost:3000/api/users
```

### 🔓 Categorias (Público)

```bash
# Listar categorias
curl http://localhost:3000/api/categories

# Criar categoria (público)
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Casa e Jardim",
    "description": "Produtos para casa e decoração"
  }'

# Produtos de uma categoria
curl http://localhost:3000/api/categories/category-electronics/products
```

### 🔓 Produtos (Público)

```bash
# Listar produtos
curl "http://localhost:3000/api/products?limit=10&offset=0"

# Produto por ID
curl http://localhost:3000/api/products/PRODUCT_ID

# Buscar produtos
curl "http://localhost:3000/api/products/search?q=notebook&limit=5"

# Criar produto (público)
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Pro M2",
    "description": "Laptop Apple com chip M2, 16GB RAM, 512GB SSD",
    "price": 2999.99,
    "categoryId": "category-electronics",
    "imageUrl": "https://example.com/macbook.jpg",
    "type": "PHYSICAL",
    "stock": 10,
    "attributes": {
      "weight": 1.4,
      "dimensions": "30.41 x 21.24 x 1.55 cm",
      "shippingRequired": true
    }
  }'
```

### 🔓 Pedidos (Público)

```bash
# Criar pedido (sem token necessário)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "items": [
      {
        "productId": "PRODUCT_ID",
        "quantity": 2,
        "price": 299.99
      }
    ],
    "paymentMethod": "PIX",
    "paymentData": {
      "phone": "+5511999999999"
    }
  }'

# Ver pedido por ID (público)
curl http://localhost:3000/api/orders/ORDER_ID

# Pedidos do usuário (público)
curl http://localhost:3000/api/users/USER_ID/orders

# Atualizar status do pedido (público)
curl -X PUT http://localhost:3000/api/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PROCESSING"
  }'
```

## 🎯 Exemplos de Teste Simplificado

### 1. Teste Básico Sem Autenticação

```bash
# 1. Listar categorias
curl http://localhost:3000/api/categories

# 2. Listar produtos
curl http://localhost:3000/api/products

# 3. Buscar produtos
curl "http://localhost:3000/api/products/search?q=eletrônicos"

# 4. Criar categoria
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tecnologia",
    "description": "Produtos de tecnologia"
  }'
```

### 2. Criar Produto Diretamente

```bash
# Criar produto sem autenticação
PRODUCT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "description": "Smartphone Apple com chip A17 Pro",
    "price": 1299.99,
    "categoryId": "category-electronics",
    "type": "PHYSICAL",
    "stock": 50
  }')

echo "Product Created: $PRODUCT_RESPONSE"
```

## 📊 Métodos de Pagamento Implementados

- **PIX**: Pagamento instantâneo brasileiro
- **CREDIT_CARD**: Cartão de crédito
- **BOLETO**: Boleto bancário

## 🏗️ Tipos de Produtos (Factory Pattern)

- **PHYSICAL**: Produtos físicos com estoque e envio
- **DIGITAL**: Produtos digitais com download
- **SERVICE**: Serviços com agendamento

## 🔓 Níveis de Acesso

- **Todos os endpoints**: Públicos e acessíveis sem autenticação
- **JWT**: Ainda disponível mas não obrigatório
- **Roles**: Não verificados (ADMIN/CUSTOMER não fazem diferença)

## ⚠️ Notas Importantes

1. **Autenticação**: REMOVIDA - todos os endpoints são públicos
2. **JWT Secret**: Ainda usado se você quiser gerar tokens
3. **Database**: Execute `npx prisma migrate dev` antes de usar
4. **Rate Limiting**: Máximo 100 requests por IP a cada 15 minutos
5. **CORS**: Configurado para aceitar requisições de qualquer origem

## 🐛 Debug

Para ver logs detalhados, execute:

```bash
NODE_ENV=development npm run dev
```

Endpoints retornam sempre no formato:

```json
{
  "success": boolean,
  "data": object,
  "error": string,
  "message": string
}
```

## ✅ Vantagens da Remoção da Autenticação

- **Testes mais simples**: Não precisa gerar tokens
- **Desenvolvimento rápido**: Acesso direto a todos os endpoints
- **Demonstração fácil**: Ideal para showcases e protótipos
- **API aberta**: Perfeita para testes automatizados
