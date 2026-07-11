# Sirlepan Gestão

Sistema web para controlar compras, produtos, fornecedores e histórico de preços das unidades Sirlepan.

## Tecnologias

- Next.js
- TypeScript
- Supabase
- Vercel

## Como configurar

1. Renomeie `.env.example` para `.env.local`.
2. No Supabase, acesse **Project Settings → API**.
3. Copie a URL do projeto e a chave pública/anon.
4. Preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

5. Execute:

```bash
npm install
npm run dev
```

## Publicação

Importe este repositório na Vercel e configure as mesmas variáveis de ambiente.
