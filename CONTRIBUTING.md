# 🤝 Contribuindo para API com SOLID + Design Patterns

Obrigado pelo interesse em contribuir! Este documento explica como você pode ajudar a melhorar este projeto.

## 📋 Código de Conduta

Este projeto segue um código de conduta simples: seja respeitoso, construtivo e colaborativo.

## 🚀 Como Contribuir

### 1. **Fork do Projeto**

```bash
# Clique em "Fork" no GitHub ou use gh CLI
gh repo fork GmGreco/api-com-solid --clone
cd api-com-solid
```

### 2. **Configuração do Ambiente**

```bash
# Instalar dependências
npm install

# Configurar banco de dados
npm run prisma:generate
npm run prisma:migrate

# Executar testes (quando implementados)
npm test
```

### 3. **Criar uma Branch**

```bash
# Para nova funcionalidade
git checkout -b feature/nome-da-funcionalidade

# Para correção de bug
git checkout -b fix/descrição-do-bug

# Para melhoria de documentação
git checkout -b docs/melhoria-documentacao
```

## 🎯 Tipos de Contribuição

### **🚀 Novas Funcionalidades**

- Implementação de novos Design Patterns relevantes
- Novas integrações (pagamento, storage, etc.)
- Melhorias de performance
- Novas funcionalidades de usuário

### **🐛 Correções de Bug**

- Correções de problemas existentes
- Melhorias de estabilidade
- Correções de segurança

### **📚 Documentação**

- Melhorias no README
- Exemplos de uso
- Tutoriais
- Comentários no código

### **🧪 Testes**

- Testes unitários
- Testes de integração
- Testes de performance

## 📐 Padrões de Código

### **Estrutura de Arquivos**

Mantenha a Clean Architecture:

```
src/
├── domain/          # Regras de negócio puras
├── application/     # Coordenação entre layers
├── infrastructure/  # Implementações técnicas
└── presentation/    # Interface externa
```

### **TypeScript**

- Use tipagem forte
- Prefira interfaces a types quando possível
- Documente métodos públicos

### **Design Patterns**

Antes de implementar um novo pattern, considere:

- **Valor real**: Resolve um problema específico?
- **Simplicidade**: Não adiciona complexidade desnecessária?
- **Testabilidade**: É fácil de testar?

### **Nomenclatura**

```typescript
// ✅ Bom
class UserRepository {}
interface EmailService {}
function createUser() {}

// ❌ Evitar
class userRepo {}
interface email_service {}
function CreateUser() {}
```

## 🔍 Process de Review

### **Checklist antes do PR**

- [ ] Código compila sem erros
- [ ] Testes passam (quando existirem)
- [ ] Documentação atualizada
- [ ] Segue padrões do projeto
- [ ] Commit messages descritivos

### **Template de Pull Request**

```markdown
## 📋 Descrição

Breve descrição das mudanças.

## 🎯 Tipo de Mudança

- [ ] 🚀 Nova funcionalidade
- [ ] 🐛 Correção de bug
- [ ] 📚 Documentação
- [ ] 🧪 Testes

## 🧪 Como Testar

Passos para testar as mudanças:

1. ...
2. ...

## 📸 Screenshots (se aplicável)
```

## 💡 Sugestões de Contribuição

### **🚀 Funcionalidades Sugeridas**

- Sistema de autenticação JWT
- Middleware de rate limiting
- Sistema de logs estruturados
- Testes automatizados
- CI/CD pipeline
- Dockerização
- API documentation (Swagger)

### **🎨 Padrões Candidatos**

Só implemente se agregar valor real:

- **Command Pattern**: Para operações complexas
- **Observer Pattern**: Para eventos de sistema
- **Strategy Pattern**: Para algoritmos variáveis

## 🆘 Precisa de Ajuda?

### **Onde Buscar Ajuda**

1. **Issues**: Para dúvidas específicas
2. **Discussions**: Para ideias e sugestões
3. **Email**: Para questões privadas

### **Documentação Útil**

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Design Patterns](https://refactoring.guru/design-patterns)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🙏 Reconhecimento

Todos os contribuidores serão listados no README e terão seus commits reconhecidos.

---

**Obrigado por contribuir! 🚀**
