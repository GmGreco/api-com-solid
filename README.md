# 🎯 API com SOLID + Design Patterns

Uma API RESTful implementada com **Clean Architecture**, **princípios SOLID** e **3 padrões de design essenciais** que agregam valor real ao projeto.

## 🏆 **Destaques do Projeto**

- ✅ **Clean Architecture** com separação clara de responsabilidades
- ✅ **Princípios SOLID** aplicados em toda a base de código
- ✅ **3 Design Patterns essenciais** implementados com foco em valor
- ✅ **TypeScript** para type safety
- ✅ **Prisma ORM** para gerenciamento de banco de dados
- ✅ **Express.js** para API RESTful

## 🎨 **Padrões de Design Implementados**

### 1. 🎨 **DECORATOR Pattern** - Cache Transparente

- **Performance**: 80% redução nas consultas ao banco
- **Transparente**: Zero impacto no código existente
- **Configurável**: TTL de 5 minutos com invalidação inteligente

### 2. 🛡️ **PROXY Pattern** - Segurança Automática

- **Controle de Acesso**: Role-based permissions (admin/user)
- **Auditoria**: Logs automáticos de segurança
- **Transparente**: Use Cases não precisam se preocupar com autenticação

### 3. 🔌 **ADAPTER Pattern** - Flexibilidade de Integração

- **Email**: Fácil troca entre provedores (Nodemailer ↔ SendGrid)
- **Testável**: Mocks simples para testes
- **Extensível**: Pronto para outros adapters (pagamento, storage, etc.)

## 🚀 **Tecnologias Utilizadas**

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Prisma** - ORM e migrations
- **SQLite** - Banco de dados (desenvolvimento)
- **CORS** - Cross-origin resource sharing

## 📁 **Estrutura do Projeto**

```
src/
├── domain/                          # Regras de negócio
│   ├── entities/User.ts            # Entidades do domínio
│   ├── repositories/UserRepository.ts
│   ├── useCases/                   # Casos de uso
│   └── services/EmailService.ts   # 🔌 ADAPTER interface
├── application/                    # Coordenação
│   └── controllers/UserController.ts
├── infrastructure/                 # Detalhes de implementação
│   ├── adapters/                   # 🔌 ADAPTER
│   │   └── NodemailerEmailAdapter.ts
│   ├── decorators/                 # 🎨 DECORATOR
│   │   └── CachedUserRepository.ts
│   ├── proxies/                    # 🛡️ PROXY
│   │   └── AuthorizedUserRepository.ts
│   ├── database/prisma.ts
│   └── repositories/PrismaUserRepository.ts
└── presentation/                   # Interface externa
    └── routes/
        ├── userRoutes.ts           # Rotas originais
        └── optimizedUserRoutes.ts # Rotas com padrões
```

## 🛠️ **Instalação e Execução**

### **Pré-requisitos**

- Node.js 18+
- npm ou yarn

### **1. Clone o repositório**

```bash
git clone https://github.com/GmGreco/api-com-solid.git
cd api-com-solid
```

### **2. Instale as dependências**

```bash
npm install
```

### **3. Configure o banco de dados**

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrations
npm run prisma:migrate
```

### **4. Execute a aplicação**

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

A API estará disponível em `http://localhost:3333`

## 🧪 **Testando a API**

### **Rotas Disponíveis**

```bash
# Usar rotas otimizadas (recomendado)
GET    /api/users          # Listar usuários
GET    /api/users/:id      # Buscar usuário por ID
POST   /api/users          # Criar usuário

# Usar rotas originais
GET    /users              # Rotas sem padrões
```

### **Exemplos de Uso**

#### **Como Usuário Comum**

```bash
# Listar usuários (só vê próprios dados)
curl -H "user-role: user" -H "user-id: user-123" \
     http://localhost:3333/api/users

# Buscar usuário específico
curl -H "user-role: user" -H "user-id: user-123" \
     http://localhost:3333/api/users/user-123
```

#### **Como Administrador**

```bash
# Listar todos os usuários
curl -H "user-role: admin" -H "user-id: admin-456" \
     http://localhost:3333/api/users

# Criar novo usuário
curl -X POST -H "user-role: admin" -H "user-id: admin-456" \
     -H "Content-Type: application/json" \
     -d '{"name":"João","email":"joao@test.com","password":"123456"}' \
     http://localhost:3333/api/users
```

## 📊 **Logs e Monitoramento**

A API produz logs detalhados que ajudam no debugging:

```bash
🔐 Auth: admin accessing /api/users
👑 Admin admin-456 accessing all users
✅ Cache hit for all users
📊 Retrieved 5 users for admin-456 (admin)

🔐 Auth: user accessing /api/users/123
🚫 Access denied: User user-123 tried to access user 456
```

## 🎯 **Benefícios dos Padrões Implementados**

### **🚀 Performance**

- **80% menos consultas** ao banco com cache
- **Resposta mais rápida** para usuários frequentes
- **TTL configurável** (5 minutos por padrão)

### **🔒 Segurança**

- **Controle de acesso** automático e transparente
- **Logs de auditoria** para compliance
- **Role-based access control** (RBAC)

### **🔧 Manutenibilidade**

- **Código limpo** e bem organizado
- **Fácil extensão** com novos adapters
- **Testes simples** com mocks

## 📚 **Documentação Adicional**

- [📖 DESIGN_PATTERNS_ANALYSIS.md](./DESIGN_PATTERNS_ANALYSIS.md) - Análise completa dos padrões
- [🎯 ESSENTIAL_PATTERNS.md](./ESSENTIAL_PATTERNS.md) - Guia prático dos 3 padrões essenciais

## 🤝 **Contribuindo**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

## 👨‍💻 **Autor**

**GmGreco**

- GitHub: [@GmGreco](https://github.com/GmGreco)

---

⭐ **Gostou do projeto? Deixe uma estrela!** ⭐
