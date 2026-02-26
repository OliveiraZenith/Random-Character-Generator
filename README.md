# RPG Worlds API

API em Node.js + Express, PostgreSQL, Prisma, JWT e bcrypt para criar mundos e personagens de RPG com geração aleatória de dados.

## Requisitos
- Node.js 18+
- PostgreSQL 13+

## Instalação
```bash
npm install
npm run prisma:generate
```

## Configuração do .env
Crie um arquivo `.env` baseado em `.env.example`:
```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="uma-chave-segura"
PORT=3000
FRONTEND_BASE_URL="http://localhost:5173/register"
PASSWORD_RESET_URL="http://localhost:5173/register"
PASSWORD_RESET_EXPIRES_MINUTES=30
SMTP_HOST="smtp.exemplo.com"
SMTP_PORT=587
SMTP_USER="usuario"
SMTP_PASS="senha"
SMTP_SECURE=false
MAIL_FROM="Reino dos Contos <no-reply@meusite.com>"
```

## Migrações e Prisma
Crie o banco e rode as migrações:
```bash
npm run migrate -- --name init
npm run migrate -- --name add_gender_character
```
Abra o Prisma Studio (opcional):
```bash
npm run prisma:studio
```

## Rodar o projeto
Ambiente de desenvolvimento (com reload):
```bash
npm run dev
```
Produção:
```bash
npm start
```
A API sobe em `http://localhost:3000` por padrão.

Frontend (Vite):
```bash
cd frontend
npm install
VITE_API_BASE_URL="http://localhost:3000" npm run dev
```

## Estrutura
```
src/
├── app.js
├── controllers/
├── middleware/
├── prisma/
├── routes/
└── services/
```

## Rotas principais
Autenticação:
- `POST /auth/register` — { name, email, password }
- `POST /auth/login` — { email, password }
- `POST /auth/forgot-password` — { email }
- `GET /auth/validate-token` — ?token=<token>
- `POST /auth/reset-password` — { token, password }

Mundos (token Bearer obrigatório):
- `POST /worlds` — { name, theme, country? }
- `GET /worlds`
- `PUT /worlds/:id`
- `DELETE /worlds/:id`

Personagens (token Bearer obrigatório):
- `POST /worlds/:worldId/characters` — { gender: 'male'|'female', name?, race?, appearance?, history?, age?, generate?: { name?, race?, appearance?, history? } }
- `GET /worlds/:id/characters`
- `PUT /characters/:id` — { name?, gender?, race?, appearance?, history?, age? }
- `DELETE /characters/:id`

### Regras de mundo
- `theme` aceita: `fantasia`, `medieval`, `atual`.
- Se `theme !== "atual"`, o campo `country` é ignorado e salvo como `null`.

### Geração aleatória
- O service `src/services/randomGenerator.js` consulta a tabela `random_data` filtrando por `type`, `theme`, `country` (se existir) e, para nomes, também por `gender`.
- Alimente a tabela `random_data` com dados compatíveis para `type`: `name`, `race`, `appearance`, `story`. Inclua `gender` quando quiser nomes específicos por gênero.

## Exemplos de requisições
Registro:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"Senha@123"}'
```

Login (retorna token):
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Senha@123"}'
```

Criar mundo:
```bash
curl -X POST http://localhost:3000/worlds \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Reino Sol","theme":"medieval"}'
```

Criar personagem com dados aleatórios de nome e história:
```bash
curl -X POST http://localhost:3000/worlds/1/characters \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"gender":"male","race":"Elfo","appearance":"Alto e ágil","age":120,"generate":{"name":true,"history":true}}'
```

## Notas
- As rotas protegidas requerem cabeçalho `Authorization: Bearer <token>`.
- O banco deve conter registros em `random_data` para geração aleatória funcionar.
- Use `npm audit fix` se quiser tratar avisos de vulnerabilidade das dependências transitivas.
- Tokens de recuperação expiram conforme `PASSWORD_RESET_EXPIRES_MINUTES` (padrão 30 minutos) e são invalidados após o uso.
