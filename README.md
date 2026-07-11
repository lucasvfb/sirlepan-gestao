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


## Configuração recomendada na Vercel — versão 6

Cadastre estas variáveis no ambiente **Production**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://popbipbawdgqoyqptehe.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

A versão 6 também aceita `NEXT_PUBLIC_SUPABASE_ANON_KEY` por compatibilidade, mas o nome recomendado para os projetos novos do Supabase é `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Depois de salvar, faça um novo deploy. A rota `/configuracao` mostra se a chave foi encontrada e testa a conexão com a tabela `lojas`.


## Correção 6.1

Esta versão normaliza automaticamente a URL do Supabase. Ela aceita:

- URL completa;
- Project ID;
- valor colado com caminhos extras.

O login agora usa diretamente `@supabase/supabase-js`, reduzindo problemas de URL no navegador.
