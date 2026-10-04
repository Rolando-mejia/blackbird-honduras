# Blackbird DEV en Vercel

## Nombre del proyecto

Use este nombre para el entorno de desarrollo:

`blackbird-hn-dev`

La URL esperada será:

`https://blackbird-hn-dev.vercel.app`

Si Vercel asigna una URL distinta, use la URL exacta del deployment en las variables y en Supabase Auth.

## Variables de entorno

Configure:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`

Después del primer deployment, establezca `NEXT_PUBLIC_APP_URL` con la URL pública real de Vercel.

El runtime actual no requiere contraseña PostgreSQL ni `service_role`.

## Supabase Auth

Después del primer deployment, agregue la URL pública en:

Supabase > Authentication > URL Configuration

Esto permitirá confirmación de correo y redirecciones de Auth desde el entorno DEV.
