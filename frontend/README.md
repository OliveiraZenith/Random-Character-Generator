# Random Character Creator – Frontend

Landing/login page inspirada em RPG medieval construída com React + Vite.

## Requisitos
- Node.js 18+

## Instalação
```bash
cd frontend
npm install
```

## Configuração
Crie um `.env` baseado em `.env.example`:
```
VITE_API_BASE_URL="http://localhost:3000"
```
Aponte para seu backend (porta 3000 por padrão).

## Rodar
```bash
npm run dev
```
Acesse `http://localhost:5173`.

## Build
```bash
npm run build
npm run preview
```

## Funcionalidades
- Layout em duas colunas (hero + painel de login); empilha no mobile.
- Inputs controlados com validação simples (email/senha obrigatórios).
- Chamada POST `/auth/login` com Axios; `baseURL` via `VITE_API_BASE_URL`.
- Token JWT salvo em `localStorage` (`rcc_token`); redireciona para `/app` após sucesso (ajuste conforme sua rota).
- Estados de loading e mensagens de erro/sucesso.

## Estrutura
```
src/
├── components/
│   ├── HeroSection.jsx
│   └── LoginForm.jsx
├── pages/
│   └── Login.jsx
├── services/
│   └── api.js
├── styles/
│   └── global.css
└── main.jsx
```

## Personalização visual
- Fontes fantasy: Uncial Antiqua / IM Fell English / Cardo (Google Fonts).
- Fundo com gradientes, partículas e glow para ambientação medieval.
- Botão com efeito dourado/vermelho e hover animado.

## Integração
- Ajuste `VITE_API_BASE_URL` conforme ambiente.
- Após login bem-sucedido, altere o redirecionamento em `LoginForm.jsx` se quiser outra rota.
