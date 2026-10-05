# PRD 01 — Blackbird Core Platform

**Estado:** En desarrollo  
**Versión:** 1.0  
**Producto:** Blackbird  
**Objetivo del documento:** definir el núcleo común que usarán todos los planes, módulos y rubros.

## 1. Objetivo

Blackbird Core Platform debe permitir que una empresa pase de trabajar con archivos dispersos y Excel a operar dentro de una plataforma centralizada, segura, auditable y accesible desde computadora, tablet o teléfono.

El Core no pertenece a un rubro específico. Debe servir como base para comercio, servicios, clínicas, restaurantes, talleres, agro, farmacias y futuros rubros.

## 2. Principios de producto

1. **Una sola marca:** el producto siempre se presenta como Blackbird.
2. **Adaptable por rubro:** la experiencia puede cambiar campos, recomendaciones, dashboards y flujos sin fragmentar la marca.
3. **Mobile-first y desktop-complete:** ninguna operación administrativa esencial debe depender exclusivamente de una computadora.
4. **Datos del cliente:** la empresa es propietaria de su información y podrá exportarla.
5. **Trazabilidad:** las operaciones importantes no se eliminan físicamente; se anulan, inactivan o sustituyen.
6. **Auditoría inmutable:** los eventos de auditoría no pueden editarse ni eliminarse.
7. **Seguridad no premium:** las capacidades esenciales de seguridad están disponibles desde Starter.
8. **Simplicidad progresiva:** Blackbird muestra lo necesario para el negocio y permite acceder a funciones avanzadas sin saturar la interfaz.

## 3. Usuarios objetivo

- Propietario / administrador.
- Cajero.
- Vendedor.
- Contador.
- Encargado de inventario.
- Compras.
- RRHH / planilla.
- Supervisor.
- Consultores o usuarios externos autorizados.

Una misma cuenta podrá pertenecer a varias empresas y sucursales con roles distintos en cada contexto.

## 4. Contexto activo

Blackbird debe mostrar siempre la empresa activa, sucursal activa, rol del usuario y plan de la empresa. Cambiar de empresa o sucursal debe ser una acción explícita. Tener acceso a varias sucursales nunca otorga permisos administrativos por sí mismo.

### Criterios de aceptación

- El usuario sabe en todo momento en qué empresa y sucursal está trabajando.
- Un movimiento nunca se registra silenciosamente en otra empresa.
- Los permisos se evalúan en el contexto activo.
- El sistema queda preparado para selector multiempresa/multisucursal.

## 5. Empresas

Datos mínimos: nombre comercial, razón social, RTN opcional durante etapa no fiscal, tipo de organización, país, moneda, zona horaria, estado, branding e información de contacto.

Estados previstos: trial, active, read_only, suspended y archived.

No se elimina una empresa por cancelación de suscripción. Sus datos se conservan hasta que el cliente solicite eliminación, sujeto a obligaciones legales aplicables.

## 6. Sucursales

- Starter: 1 sucursal.
- Business: hasta 5.
- Pro: ilimitadas.
- Enterprise: sin limitación por licencia.

Cada sucursal puede tener nombre, código, dirección, departamento, municipio, estado e indicador de sucursal principal.

Blackbird no asumirá que toda empresa tiene una ubicación física. Durante el onboarding el usuario podrá indicar que opera **solo en línea**. En ese caso:

- dirección, departamento y municipio dejan de ser obligatorios;
- se crea una ubicación principal virtual;
- la interfaz debe identificarla como **Operación en línea** y no como una dirección pendiente;
- esta decisión queda registrada para futuras recomendaciones y configuración por rubro.

Los negocios con local físico deberán registrar su ubicación principal. Los modelos híbridos podrán evolucionar después agregando ubicaciones físicas y canales digitales sin cambiar de cuenta.

## 7. Usuarios y membresías

Starter incluye 5 usuarios. Cada membresía relaciona usuario, empresa, rol, estado, sucursales permitidas y fecha de incorporación. El modelo debe soportar usuarios adicionales como add-on.

## 8. Roles y permisos

Roles sugeridos iniciales: Propietario, Administrador, Supervisor, Cajero, Vendedor, Contador, Inventario, Compras y RRHH.

Principio de mínimo privilegio. Deben existir permisos granulares para facturar, anular, aplicar descuentos, ver costos/utilidad, modificar precios, ajustar inventario, aprobar transferencias, registrar pagos, exportar reportes, ver planilla/salarios y administrar usuarios/roles.

## 9. Aprobaciones

El Core debe proveer un motor reutilizable de aprobaciones con reglas por monto, rol, sucursal, tipo de operación y varios niveles. Casos iniciales: descuentos, anulaciones, compras, ajustes de inventario, pagos, vacaciones, horas extra, préstamos y transferencias.

## 10. Auditoría

La auditoría es obligatoria e inmutable. Cada evento puede registrar empresa, sucursal, usuario, acción, entidad, registro afectado, fecha/hora, valor anterior, valor nuevo, metadata, IP y agente cuando esté disponible.

La interfaz de auditoría permite filtrar, consultar y exportar, pero nunca modificar o borrar eventos.

## 11. Onboarding

Flujo base: crear acceso → confirmar correo → crear empresa → crear sucursal principal → identificar rubro → recomendar configuración → importar datos o iniciar desde cero → revisar estado fiscal Honduras → finalizar.

El usuario puede seguir recomendaciones, omitir pasos, omitir todo y reactivar recomendaciones después.

## 12. Personalización por rubro

La experiencia puede cambiar sin cambiar de marca. Ejemplos: clínica (pacientes/citas), taller (vehículos/órdenes), restaurante (POS/comandas/delivery), gimnasio (membresías/asistencia), agro (lotes/producción/trazabilidad).

## 13. Branding empresarial

Los documentos y reportes representan a la empresa. El cliente puede configurar logo, nombre, datos fiscales, dirección, teléfonos, información visible y estilo dentro de opciones controladas.

## 14. Reportería base

Framework común para filtros, períodos, Excel, PDF, impresión, programación de reportes, distribución y personalización de dashboard.

## 15. Seguridad

Desde Starter: 2FA, recuperación segura, historial de sesiones, cierre remoto, alertas de acceso y obligación de 2FA para roles sensibles.

## 16. Offline y sincronización

Blackbird se diseña para PWA y operación offline. Debe sincronizar al recuperar conexión, resolver conflictos seguros automáticamente y mandar conflictos reales a revisión de supervisor, auditando la decisión.

## 17. Estados de suscripción relevantes

trial, active, grace_period, read_only, suspended, cancelled.

Al finalizar trial sin pago: solo lectura; reportería por 30 días; luego restringida; datos conservados. Pago fallido de suscripción activa: 5 días de gracia.

## 18. Navegación Core v1

Inicio, Empresa, Sucursales, Usuarios, Roles y permisos, Módulos, Auditoría y Configuración. Debe funcionar en desktop, tablet y móvil.

## 19. Alcance Sprint 1

Incluido: sistema visual Blackbird v1, navegación Core, contexto empresa/sucursal, dashboard shell, Empresa, Sucursales, Usuarios, Roles, base de Auditoría y refactor visual de Auth/Onboarding.

No incluido todavía: creación de sucursales adicionales, invitaciones, editor completo de permisos, selector multiempresa persistente, billing ni módulos operativos Starter.

## 20. Criterios de salida

1. Shell autenticado consistente.
2. Empresa y sucursal activas visibles.
3. Navegación móvil/desktop.
4. Empresa, sucursales, usuarios y roles muestran datos reales.
5. Identidad visual Blackbird v1.
6. Auth/onboarding alineados visualmente.
7. Vercel compila sin errores.
8. Ninguna clave secreta se expone.
