# Blackbird Honduras

Blackbird Honduras es una plataforma SaaS modular para microempresas y PYMEs hondureñas.

## Estado actual

Alpha DEV conectado a Supabase.

Flujo principal:

- Sin sesión → `/login`
- Sesión sin organización → `/onboarding`
- Sesión con organización → `/dashboard`

El backend DEV usa Supabase Auth, PostgreSQL y Row Level Security.

## Identificadores del proyecto

- Producto: `Blackbird Honduras`
- Repositorio GitHub: `Rolando-mejia/blackbird-honduras`
- Proyecto Vercel DEV: `blackbird-hn-dev`
- URL DEV esperada: `https://blackbird-hn-dev.vercel.app`

El nombre de Vercel es deliberadamente distinto del nombre del repositorio para separar el entorno DEV del producto.

## Variables para Vercel

Configure:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`

Una vez creado el deployment DEV, `NEXT_PUBLIC_APP_URL` debe apuntar a:

`https://blackbird-hn-dev.vercel.app`

Si Vercel asigna otra URL, utilice la URL exacta que Vercel entregue.

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
