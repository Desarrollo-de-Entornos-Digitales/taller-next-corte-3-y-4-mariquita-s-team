# Frontend - VincoBov

Aplicacion frontend desarrollada con Next.js para el marketplace agropecuario VincoBov.
Este proyecto consume servicios reales del backend (NestJS + PostgreSQL) para autenticacion, registro, onboarding y feed de productos.

## Requisitos

- Node.js 20+
- npm
- Docker y Docker Compose (para la base de datos del backend)
- Backend disponible en `../backend-nest-mariquita-s-team/vincobov`

## Configuracion de entorno (Frontend)

Crear archivo `.env.local` en este proyecto con:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

La variable usada por el frontend para la URL del API es `NEXT_PUBLIC_API_URL`.

## Ejecucion completa (Backend + Frontend)

### 1) Levantar base de datos (Docker)

En `backend-nest-mariquita-s-team/vincobov`:

```bash
docker compose up -d
```

### 2) Levantar API backend

En `backend-nest-mariquita-s-team/vincobov`:

```bash
npm install
npm run start:dev
```

### 3) Cargar datos iniciales (seed SQL)

En PowerShell, dentro de `backend-nest-mariquita-s-team/vincobov`:

```powershell
Get-Content .\db\seed.initial.sql | docker exec -i vincobov-postgres psql -U postgres -d vincobov
```

### 4) Levantar frontend

En `taller-next-corte-3-y-4-mariquita-s-team`:

```bash
npm install
npm run dev
```

Frontend: [http://localhost:3000](http://localhost:3000)

## Credenciales de prueba

- `admin@vincobov.com` / `Admin123*`
- `seller1@vincobov.com` / `Seller123*`
- `buyer1@vincobov.com` / `Buyer123*`

## Validacion de funcionalidades

### Autenticacion

La validacion del modulo de autenticacion se realiza comprobando que el inicio de sesion consuma correctamente el endpoint real `POST /auth/login`, que el token JWT retornado sea almacenado en `localStorage` y que posteriormente sea enviado en las peticiones que lo requieren mediante el encabezado `Authorization: Bearer <token>`. De igual manera, se verifica que el cierre de sesion elimine la informacion de autenticacion local, garantizando que la aplicacion regrese a estado no autenticado.

### Registro + onboarding de rol

En el flujo de registro se valida que la creacion de usuarios se ejecute contra el endpoint `POST /users` y que, una vez completado el formulario inicial, el usuario pase por una etapa de onboarding donde selecciona su rol (`buyer` o `seller`). Esta seleccion no queda solo a nivel visual: se persiste en backend mediante `PATCH /users/:id`.

### Feed dinamico

Para validar el feed se confirma que la informacion provenga de datos reales del backend a traves de `GET /product`, que los elementos se rendericen dinamicamente en la interfaz y que cada item tenga interacciones basicas funcionales (por ejemplo, eventos de clic con trazas en consola), dejando preparada la base para futuras acciones de negocio sobre cada producto.

### Paginacion

La paginacion se implemento con la estrategia `limit + offset`, elegida por su simplicidad, compatibilidad con APIs REST y facilidad de escalabilidad para listados medianos y grandes. En la interfaz se incorporaron controles `Anterior` y `Siguiente` para navegar entre paginas, y se definio el reinicio automatico a la primera pagina cuando el usuario cambia filtros o categoria, evitando inconsistencias entre el criterio de busqueda y los resultados mostrados.

### Imagenes de productos

La gestion de imagenes se valida comprobando que cada producto tenga asociado el campo `image_url` en base de datos y que el frontend utilice ese dato para renderizar la imagen correspondiente dentro de cada card del feed. Con este enfoque, la fuente de verdad de las imagenes queda centralizada en backend y desacoplada de la capa visual.

## Funcionalidades implementadas

### Mecanismos de autenticacion

El frontend fue desarrollado para tolerar distintas convenciones de respuesta de token (`access_token`, `accessToken` o `token`), con el fin de mantener compatibilidad con variaciones de contrato en el backend. El JWT se persiste localmente y se utiliza como base del estado de sesion, permitiendo ajustar el comportamiento de la navbar y de las vistas segun si el usuario esta autenticado o no.

### Mecanismos de autorizacion

En el backend, la autorizacion se sustenta en guards JWT y validacion de permisos por rol. Adicionalmente, para soportar el onboarding de manera funcional, se habilito la actualizacion del propio usuario autenticado al momento de asignar rol, manteniendo las restricciones necesarias para evitar modificaciones no autorizadas sobre terceros.

### Gestion del estado

La gestion del estado se implemento principalmente con React Hooks para controlar sesion, carga de productos, filtros, paginacion, estados de carga y manejo de errores. Como estrategia de persistencia, se utiliza `localStorage` para datos de sesion que deben conservarse entre recargas (por ejemplo, token e identidad basica), y `sessionStorage` para datos transitorios del onboarding que solo son necesarios durante el flujo de registro.

### Link de Figma

https://www.figma.com/design/KYcAlG4jawYAoQsK32ZjbS/Mockups?node-id=0-1&p=f&t=Yd4iTphAHFURy7Bk-0