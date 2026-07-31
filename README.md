# Gestor de tareas Full Stack

Aplicación web compacta para crear, consultar, buscar, filtrar, editar, cambiar de estado y
eliminar tareas. Está pensada como una prueba técnica fácil de ejecutar, estudiar y explicar.

## Objetivo

Demostrar un flujo Full Stack completo con una API REST tipada, persistencia local SQLite,
validación consistente y una interfaz Angular responsive. La aplicación no incluye autenticación
porque trabaja como un gestor personal local.

## Tecnologías

- Frontend: Angular 20, TypeScript 5.8, RxJS 7, Bootstrap 5 y SCSS.
- Backend: Node.js, Express 5, TypeScript 5.9, better-sqlite3 12, Zod 4, CORS y dotenv.
- Calidad: ESLint 9, Prettier 3, Vitest/Supertest y Jasmine/Karma.
- Identificadores: UUID v4 mediante `node:crypto`, sin dependencia adicional.

## Requisitos previos

- Node.js 20.19 o superior (Node.js 22 LTS recomendado).
- npm 10 o superior.
- Google Chrome o Chromium para ejecutar las pruebas del frontend.

## Estructura

```text
task-manager-fullstack/
├── backend/
│   ├── data/                  # Se crea al iniciar; la base no se versiona
│   ├── src/
│   │   ├── config/            # Entorno y conexión SQLite
│   │   ├── controllers/       # Adaptación HTTP
│   │   ├── middleware/        # Errores y 404
│   │   ├── models/            # Tipos de dominio
│   │   ├── repositories/      # SQL
│   │   ├── routes/            # Rutas Express
│   │   ├── schemas/           # Validación Zod
│   │   └── services/          # Casos de uso
│   └── tests/
├── frontend/
│   └── src/app/
│       ├── core/              # Modelos, servicio HTTP e interceptor
│       ├── features/tasks/    # Página y componentes de tareas
│       └── shared/            # Modal, toast, loading y estado vacío
├── .env.example
└── package.json
```

## Instalación y configuración

Desde la raíz:

```bash
npm run install:all
```

El script instala las dependencias raíz, del backend y del frontend. Después copia la configuración:

```powershell
Copy-Item backend/.env.example backend/.env
```

En macOS o Linux:

```bash
cp backend/.env.example backend/.env
```

Variables disponibles:

```env
PORT=3000
FRONTEND_URL=http://localhost:4200
DATABASE_PATH=./data/tasks.db
NODE_ENV=development
```

`FRONTEND_URL` es el único origen permitido por CORS. Las variables se validan al iniciar. Si no
se crea `.env`, los valores anteriores se usan como valores predeterminados.

## Ejecución

Ambas aplicaciones desde la raíz:

```bash
npm run dev
```

Por separado:

```bash
npm run dev:backend
npm run dev:frontend
```

- Interfaz: http://localhost:4200
- API: http://localhost:3000/api
- Salud: http://localhost:3000/api/health
- Base de datos: `backend/data/tasks.db`

El frontend lee la URL de la API desde `frontend/src/environments/environment*.ts`. Angular usa el
archivo de desarrollo al ejecutar `ng serve`.

Para añadir tres tareas de ejemplo que cubren todos los estados:

```bash
npm run seed
```

El seed es opcional y no se ejecuta al arrancar.

## Scripts de calidad y producción

```bash
npm run lint
npm test
npm run build
```

El build incluye el typecheck de ambos proyectos. Para comprobar únicamente los tipos, sin emitir
archivos:

```bash
npm exec --prefix backend -- tsc --noEmit -p backend/tsconfig.json
npm exec --prefix frontend -- tsc --noEmit -p frontend/tsconfig.app.json
npm exec --prefix frontend -- tsc --noEmit -p frontend/tsconfig.spec.json
```

La compilación queda en `backend/dist` y `frontend/dist/frontend`. Para ejecutar el backend
compilado:

```bash
npm --prefix backend start
```

## API REST

| Método | Ruta             | Descripción                                             |
| ------ | ---------------- | ------------------------------------------------------- |
| GET    | `/api/health`    | Comprueba el estado del servidor                        |
| GET    | `/api/tasks`     | Lista por fecha descendente; acepta `status` y `search` |
| GET    | `/api/tasks/:id` | Obtiene una tarea                                       |
| POST   | `/api/tasks`     | Crea una tarea                                          |
| PUT    | `/api/tasks/:id` | Reemplaza todos los campos editables                    |
| DELETE | `/api/tasks/:id` | Elimina una tarea                                       |

Estados válidos: `pending`, `in_progress` y `done`.

### Ejemplos

Listar, buscar y filtrar:

```bash
curl "http://localhost:3000/api/tasks?status=pending&search=documentacion"
```

Respuesta `200`:

```json
[
  {
    "id": "ad429614-9ee4-4838-a14a-4bc3884059e9",
    "title": "Preparar documentación",
    "description": "Revisar instrucciones",
    "status": "pending",
    "createdAt": "2026-07-30T20:00:00.000Z",
    "updatedAt": "2026-07-30T20:00:00.000Z"
  }
]
```

Crear:

```bash
curl -i -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Completar prueba técnica","description":"Revisar frontend y backend","status":"pending"}'
```

Retorna `201`, la tarea creada y el encabezado
`Location: /api/tasks/{id}`.

Actualizar con PUT completo:

```bash
curl -X PUT http://localhost:3000/api/tasks/ad429614-9ee4-4838-a14a-4bc3884059e9 \
  -H "Content-Type: application/json" \
  -d '{"title":"Completar y revisar prueba","description":null,"status":"in_progress"}'
```

Eliminar:

```bash
curl -i -X DELETE http://localhost:3000/api/tasks/ad429614-9ee4-4838-a14a-4bc3884059e9
```

Retorna `204` sin cuerpo.

Error de validación `400`:

```json
{
  "statusCode": 400,
  "message": "Los datos enviados no son válidos",
  "errors": [{ "field": "title", "message": "El título es obligatorio" }],
  "timestamp": "2026-07-30T20:00:00.000Z",
  "path": "/api/tasks"
}
```

Error `404`:

```json
{
  "statusCode": 404,
  "message": "La tarea no existe",
  "timestamp": "2026-07-30T20:00:00.000Z",
  "path": "/api/tasks/id-inexistente"
}
```

## Arquitectura y comunicación

En el backend, las rutas delegan en controladores delgados; los servicios contienen los casos de
uso y el repositorio concentra las consultas SQL. Zod valida los límites HTTP y el middleware
global convierte errores conocidos o inesperados a un formato seguro. SQLite crea
automáticamente la carpeta y tabla, incluida una restricción `CHECK` para el estado.

En el frontend, `TasksPageComponent` coordina datos y operaciones. Los componentes de filtros,
resumen, lista y tarjeta reciben entradas y emiten acciones. `TaskService` encapsula HttpClient.
La búsqueda aplica debounce y distinct, mientras la página usa `switchMap` para cancelar listados
anteriores cuando cambian los filtros. No se necesita estado global.

El interceptor aplica un timeout de 10 segundos y convierte errores `400`, `404`, `500`, de red y
timeout en mensajes en español. También diferencia un cuerpo demasiado grande (`413`). El
formulario conserva el modal abierto ante un error. El backend responde `400` ante JSON malformado
y reserva `500` para errores inesperados, sin enviar stack traces.

## Validaciones y decisiones

- El título se recorta, es obligatorio y admite entre 1 y 100 caracteres.
- La descripción se recorta, admite hasta 500 caracteres y una cadena vacía se guarda como `null`.
- El estado es obligatorio y está limitado a los tres valores documentados.
- `PUT` exige `title`, `description` y `status`; `description` puede ser `null`.
- Los cuerpos usan esquemas Zod estrictos. Por consistencia, `id`, `createdAt`, `updatedAt` y
  cualquier otro campo desconocido se rechazan con `400`.
- La búsqueda no distingue mayúsculas, incluidas letras acentuadas, y escapa `%` y `_` para
  tratarlos como texto.
- Las fechas e identificadores son responsabilidad exclusiva del servidor.
- Se usa SQL directo para que el modelo de persistencia sea visible y sencillo de explicar.

## Funcionalidades y experiencia

La interfaz incluye resumen global, búsqueda, filtro, limpieza de filtros, tarjetas responsive,
estados vacíos diferenciados, loading inicial y de filtros, modal reutilizable, contadores de
caracteres, cambio rápido de estado, confirmación accesible, bloqueo durante operaciones y
notificaciones. Los botones, labels, mensajes asociados y diálogos cuentan con atributos básicos
de accesibilidad.

Las pruebas representativas cubren once flujos de API con SQLite en memoria y seis casos del
frontend: formulario, parámetros del servicio, interceptor HTTP y estado vacío. La base de
desarrollo nunca se usa en pruebas.

## Supuestos

- La aplicación se ejecuta como herramienta local para una sola persona.
- El backend es la fuente de verdad para identificadores, fechas y validaciones.
- Las fechas se almacenan en UTC y el navegador las presenta en la zona horaria del usuario.
- SQLite es suficiente para el volumen esperado de una prueba técnica y un único proceso servidor.

## Mejoras futuras

- Paginación si el volumen de tareas creciera de forma significativa.
- Pruebas end-to-end con Playwright.
- Configuración de la URL de API en tiempo de despliegue.
- Tema oscuro y preferencias de orden.

## Limitaciones conocidas

La aplicación está diseñada para un único usuario local: no incluye autenticación, sincronización
multiusuario ni resolución de ediciones simultáneas.

Con los lockfiles actuales, `npm audit` informa vulnerabilidades transitivas en herramientas de
desarrollo (5 altas en backend y 6 moderadas/21 altas en frontend). `npm audit --omit=dev` no
informa vulnerabilidades en las dependencias de ejecución. Corregir las alertas restantes requiere
evaluar actualizaciones mayores del toolchain.
