# Sistema MRP (Manufacturing Resource Planning)

Sistema de Planejamento de Recursos de Manufatura desenvolvido com React, TypeScript e Node.js.

## 🚀 Funcionalidades

- **Gestão de Usuários**
  - Diferentes níveis de acesso (admin, comprador, produção)
  - Sistema de autenticação seguro
  - Perfis personalizados

- **Gestão de Produtos**
  - Cadastro completo de produtos
  - Controle de estoque
  - Estrutura de produto (BOM - Bill of Materials)
  - Parâmetros de produção (lote mínimo, múltiplo, etc.)

- **Gestão de Materiais**
  - Cadastro de matérias-primas
  - Controle de estoque
  - Lead time e custos
  - Vinculação com fornecedores

- **Gestão de Fornecedores**
  - Cadastro completo de fornecedores
  - CNPJ e informações de contato
  - Prazos de entrega
  - Condições de pagamento

- **Pedidos de Compra**
  - Criação manual e automática
  - Acompanhamento de status
  - Cálculo de valores
  - Gestão de recebimentos

- **Dashboard**
  - Visão geral do sistema
  - Indicadores importantes
  - Alertas e notificações

## 🛠️ Tecnologias Utilizadas

- **Frontend**
  - React
  - TypeScript
  - Material-UI
  - React Router
  - Axios

- **Backend**
  - Node.js
  - Express
  - MySQL
  - TypeScript
  - JWT para autenticação

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- MySQL (versão 8.0 ou superior)
- NPM ou Yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd [NOME_DO_PROJETO]
```

2. Instale as dependências do backend:
```bash
cd server
npm install
```

3. Instale as dependências do frontend:
```bash
cd ../client
npm install
```

4. Configure o banco de dados:
- Crie um banco de dados MySQL
- Execute o script `server/schema.sql`
- Configure as variáveis de ambiente no arquivo `.env` do servidor

5. Configure as variáveis de ambiente:
Crie um arquivo `.env` na pasta `server` com:
```
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=mrp_system
JWT_SECRET=seu_segredo_jwt
PORT=3001
```

## 🚀 Executando o Projeto

1. Inicie o servidor:
```bash
cd server
npm run dev
```

2. Em outro terminal, inicie o frontend:
```bash
cd client
npm start
```

3. Acesse o sistema:
- URL: http://localhost:3000
- Usuário padrão: admin@sistema.com
- Senha padrão: admin123

## 📦 Estrutura do Projeto

```
project/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── services/     # Serviços e APIs
│   │   └── utils/        # Utilitários
│   └── public/           # Arquivos estáticos
│
└── server/                # Backend Node.js
    ├── src/
    │   ├── controllers/  # Controladores
    │   ├── models/       # Modelos
    │   ├── routes/       # Rotas
    │   └── utils/        # Utilitários
    └── schema.sql        # Script do banco de dados
```

## 🔐 Segurança

- Autenticação via JWT
- Senhas criptografadas com bcrypt
- Validação de dados
- Proteção contra SQL Injection
- CORS configurado

## 🤝 Contribuição

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✨ Recursos Adicionais

- Sistema de notificações em tempo real
- Relatórios exportáveis
- Interface responsiva
- Suporte a múltiplos idiomas
- Backup automático do banco de dados

## 📞 Suporte

Para suporte, envie um email para [seu-email@dominio.com] ou abra uma issue no repositório.
