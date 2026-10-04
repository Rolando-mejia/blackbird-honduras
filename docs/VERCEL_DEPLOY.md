# Blackbird DEV en Vercel

## Proyecto DEV oficial

Use el proyecto Vercel:

`blackbird-honduras`

Dominio DEV oficial:

`https://blackbird-honduras.vercel.app`

## Variables de entorno

Configure:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL=https://blackbird-honduras.vercel.app`

El runtime actual no requiere contraseña PostgreSQL ni `service_role`.

## Supabase Auth

En:

Supabase > Authentication > URL Configuration

configure:

- Site URL: `https://blackbird-honduras.vercel.app`
- Redirect URL: `https://blackbird-honduras.vercel.app/**`
- Mantenga también `http://localhost:3000/**` para desarrollo local.

Esto permite confirmación de correo y redirecciones de Auth desde DEV y local.
