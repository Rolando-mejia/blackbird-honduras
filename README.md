# Blackbird Honduras

Blackbird Honduras es una plataforma SaaS modular para microempresas y PYMEs hondureñas.

## Estado actual

Alpha DEV conectado a Supabase.

Flujo principal:

- Sin sesión → `/login`
- Sesión sin organización → `/onboarding`
- Sesión con organización → `/dashboard`

El backend DEV usa Supabase Auth, PostgreSQL y Row Level Security.

## Variables para Vercel

Configure:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`

No se debe subir `.env.local`, contraseñas de PostgreSQL, `service_role` ni claves secretas.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase Auth + PostgreSQL
- Drizzle ORM como capa de esquema/migraciones

## Entorno

Este repositorio corresponde al entorno de desarrollo de Blackbird Honduras. Producción se mantendrá separada.
