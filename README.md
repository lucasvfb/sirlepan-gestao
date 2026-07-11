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


## Criar o primeiro usuário

1. Abra o Supabase.
2. Vá em **Authentication → Users**.
3. Clique em **Add user → Create new user**.
4. Informe o e-mail e a senha.
5. Marque o usuário como confirmado, quando a opção estiver disponível.
6. Use esses dados na tela de login do sistema.

## Segurança

A versão 5 protege automaticamente todas as páginas do sistema. Usuários não autenticados são enviados para `/login`.
