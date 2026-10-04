# Blackbird DEV en Vercel

Para desplegar Blackbird DEV en Vercel configure:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL` con la URL pública del deployment.

El runtime actual no requiere contraseña PostgreSQL ni `service_role`.

Después del primer deployment, agregue la URL pública en Supabase > Authentication > URL Configuration para permitir confirmación de correo y redirecciones de Auth.
