# ORBE | Jornada CACD

Aplicativo privado para acompanhar a formação em Relações Internacionais, preparação para o CACD e desenvolvimento pessoal.

## O que já funciona

- Conta individual por e-mail e senha.
- Dados sincronizados no Supabase, isolados por usuário com Row Level Security (RLS).
- Objetivos-base iniciando em `0%`, rotinas, marcos e histórico de evoluções.
- Interface responsiva e animações de preenchimento de progresso.

CPF não é usado para login: ele é um dado pessoal sensível na prática e não deve funcionar como credencial de acesso.

## Configurar o banco e login

1. Crie um projeto no [Supabase](https://supabase.com/dashboard).
2. Abra o SQL Editor e execute [supabase/migrations/001_user_plans.sql](./supabase/migrations/001_user_plans.sql).
3. Em Authentication, mantenha o login por e-mail habilitado e configure as URLs autorizadas do site publicado.
4. Copie `.env.example` para `.env.local` e informe a URL do projeto e a chave pública (`publishable key` ou `anon key`).

```bash
cp .env.example .env.local
npm install
npm run dev
```

As chaves públicas podem ficar no front-end porque o acesso aos registros é protegido pelas políticas RLS. Nunca exponha uma `service_role key`.

## Publicar na Netlify

O projeto já inclui `netlify.toml`, com o build do Vite, a pasta publicada (`dist`) e o redirecionamento necessário para a aplicação abrir corretamente em qualquer rota.

1. Suba este projeto para um repositório Git.
2. Na [Netlify](https://app.netlify.com), selecione **Add new project** e importe o repositório.
3. Em **Project configuration > Environment variables**, cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, com escopo disponível para builds.
4. Dispare o deploy. O domínio inicial será semelhante a `https://SEU-SITE.netlify.app`.
5. No Supabase, abra **Authentication > URL Configuration** e defina o **Site URL** como a URL oficial do site, por exemplo `https://SEU-SITE.netlify.app/`.
6. Ainda no Supabase, adicione as URLs de redirecionamento que serão usadas pelo login e pela recuperação de senha:

```text
http://localhost:5173/**
https://SEU-SITE.netlify.app/**
https://**--SEU-SITE.netlify.app/**
```

A última URL permite testar deploy previews da Netlify. Para produção, mantenha também a URL exata do site na lista e como `Site URL`.

O build utilizado na publicação é:

```bash
npm run build
```

A configuração de Vercel permanece no projeto apenas como alternativa de hospedagem; a Netlify já pode ser usada como destino principal.

## Pré-visualização sem conta

Antes de configurar o Supabase, o design pode ser visualizado sem persistência abrindo:

```text
http://localhost:5173/?preview=1
```

Nesse modo, alterações são temporárias e claramente identificadas como pré-visualização.
