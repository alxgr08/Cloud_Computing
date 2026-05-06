# BiblioMercado — Frontend React

Plataforma de catálogo de libros con integración completa a 5 microservicios desplegados detrás de un **API Gateway HTTPS en AWS**.

---

## Descripción

BiblioMercado es una SPA (Single Page Application) en React que consume datos reales de un backend de microservicios. Permite explorar libros, gestionar pedidos, escribir reseñas y visualizar métricas analíticas.

---

## URL base del API Gateway

```
https://47c36x353h.execute-api.us-east-1.amazonaws.com
```

Todas las llamadas HTTP van exclusivamente a esta URL. **No se usan IPs directas ni localhost en producción.**

---

## Variables de entorno

Copia `.env.example` como `.env` antes de correr el proyecto:

```bash
cp .env.example .env
```

| Variable | Valor | Descripción |
|---|---|---|
| `VITE_API_BASE_URL` | `https://47c36x353h.execute-api.us-east-1.amazonaws.com` | URL base del API Gateway |

---

## Microservicios consumidos

> El API Gateway expone cada microservicio con la siguiente configuración de prefijos.
> **Solo MS2 usa prefijo `/ms2`**. El resto se accede sin prefijo.

| MS | Nombre | Prefijo en API Gateway |
|---|---|---|
| MS1 | Catálogo | *(sin prefijo)* |
| MS2 | Pedidos | `/ms2` |
| MS3 | Reseñas | *(sin prefijo)* |
| MS4 | Agregador | *(sin prefijo)* |
| MS5 | Analytics | *(sin prefijo)* |

---

## Endpoints usados por pantalla (Rúbrica)

| Microservicio | Endpoint real (relativo al API Gateway) | Método | Pantalla |
|---|---|---|---|
| MS1 Catálogo | `/libros?limit=20` | GET | LibrosPage |
| MS1 Catálogo | `/libros` | POST | LibrosPage |
| MS1 Catálogo | `/libros/:id` | DELETE | LibrosPage |
| MS1 Catálogo | `/autores?limit=100` | GET | LibrosPage (select) |
| MS1 Catálogo | `/generos` | GET | LibrosPage (select) |
| MS1 Catálogo | `/editoriales?limit=100` | GET | LibrosPage (select) |
| MS2 Pedidos | `/ms2/pedidos/:id` | GET | PedidosPage |
| MS2 Pedidos | `/ms2/pedidos` | POST | PedidosPage |
| MS2 Pedidos | `/ms2/clientes/:id` | GET | PedidosPage |
| MS3 Reseñas | `/resenas?limit=20` | GET | ResenasPage |
| MS3 Reseñas | `/resenas?libro_id=:id` | GET | ResenasPage (filtro) |
| MS3 Reseñas | `/resenas` | POST | ResenasPage |
| MS3 Reseñas | `/resenas/:id` | DELETE | ResenasPage |
| MS4 Agregador | `/catalogo-con-stats` | GET | CatalogoPage |
| MS4 Agregador | `/detalle-libro/:id` | GET | DetalleLibroPage |
| MS4 Agregador | `/perfil-cliente/:id` | GET | PerfilClientePage |
| MS5 Analytics | `/ventas-por-genero` | GET | AnalyticsPage |
| MS5 Analytics | `/top-autores` | GET | AnalyticsPage |
| MS5 Analytics | `/rating-por-genero` | GET | AnalyticsPage |
| MS5 Analytics | `/libros-mas-vendidos` | GET | AnalyticsPage |

---

## Estructura del proyecto

```
src/
├── components/
│   ├── common/
│   │   ├── DataCard.jsx       ← Tarjeta de métrica reutilizable
│   │   ├── EmptyState.jsx     ← Estado vacío
│   │   ├── ErrorState.jsx     ← Estado de error con reintento
│   │   └── LoadingState.jsx   ← Spinner de carga
│   ├── BookCard.jsx
│   ├── BookList.jsx
│   ├── Footer.jsx
│   ├── Hero.jsx
│   ├── Navbar.jsx             ← Actualizado con React Router
│   └── SearchBar.jsx
├── hooks/
│   └── useApi.js              ← Hook genérico para fetch
├── pages/
│   ├── AnalyticsPage.jsx      ← MS5: dashboard de métricas
│   ├── CatalogoPage.jsx       ← MS4: catálogo con stats
│   ├── DetalleLibroPage.jsx   ← MS4: detalle de libro
│   ├── HomePage.jsx           ← Landing con status de microservicios
│   ├── LibrosPage.jsx         ← MS1: CRUD de libros
│   ├── PedidosPage.jsx        ← MS2: pedidos y clientes
│   ├── PerfilClientePage.jsx  ← MS4: perfil de cliente
│   └── ResenasPage.jsx        ← MS3: reseñas
├── services/
│   ├── apiClient.js           ← Cliente HTTP centralizado
│   ├── ms1CatalogoService.js  ← MS1: libros, autores, géneros, editoriales
│   ├── ms2PedidosService.js   ← MS2: pedidos y clientes
│   ├── ms3ResenasService.js   ← MS3: reseñas
│   ├── ms4AgregadorService.js ← MS4: perfil, detalle, stats
│   └── ms5AnalyticsService.js ← MS5: analytics y métricas
└── data/
    └── mockBooks.js
```

---

## Rutas del frontend

| Ruta | Página | Microservicio |
|---|---|---|
| `/` | HomePage | Todos (health check) |
| `/libros` | LibrosPage | MS1 |
| `/libros/:id` | DetalleLibroPage | MS4 |
| `/catalogo` | CatalogoPage | MS4 |
| `/pedidos` | PedidosPage | MS2 |
| `/resenas` | ResenasPage | MS3 |
| `/analytics` | AnalyticsPage | MS5 |
| `/clientes/:id` | PerfilClientePage | MS4 |

---

## Correr localmente

### Prerrequisitos
- Node.js 18+
- npm 9+

### Pasos

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# (El .env ya tiene la URL correcta del API Gateway)

# 4. Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

---

## Desplegar en AWS Amplify

### Desde la consola de Amplify

1. Ir a [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. **New app → Host web app**
3. Conectar el repositorio (GitHub/GitLab/Bitbucket)
4. Configurar:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
5. Agregar la variable de entorno:

| Clave | Valor |
|---|---|
| `VITE_API_BASE_URL` | `https://47c36x353h.execute-api.us-east-1.amazonaws.com` |

6. Guardar y desplegar.

### amplify.yml (opcional)

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

> **Importante:** Agregar `VITE_API_BASE_URL` en **Environment variables** de la consola antes de desplegar.

---

## Tecnologías

- **React 18** + **Vite**
- **React Router DOM** v6
- **CSS Variables** (diseño propio, sin Tailwind)
- **Fetch API** nativa (sin axios)
- Despliegue en **AWS Amplify**
- Backend en **AWS API Gateway + 5 microservicios**

---

## Evidencia de consumo de los 5 microservicios

| Microservicio | Pantalla | Operaciones |
|---|---|---|
| **MS1 Catálogo** | `/libros` | GET lista, POST crear, DELETE eliminar |
| **MS2 Pedidos** | `/pedidos` | GET pedidos, POST crear, GET clientes |
| **MS3 Reseñas** | `/resenas` | GET lista, POST crear, DELETE eliminar |
| **MS4 Agregador** | `/catalogo`, `/libros/:id`, `/clientes/:id` | GET catálogo-con-stats, detalle-libro, perfil-cliente |
| **MS5 Analytics** | `/analytics` | GET ventas-por-genero, top-autores, top-clientes, rating-por-genero, libros-mas-vendidos |

La página principal (`/`) hace health-checks a los 5 microservicios y muestra su estado en tiempo real.
