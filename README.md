# AutoclAIm

AutoclAIm es una aplicación web de IA que guía a usuarios a construir casos de reclamación sólidos mediante una entrevista inteligente.

**Frase clave:** "ChatGPT te ayuda a escribir. AutoclAIm te ayuda a construir un caso."

## Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone <repo-url>
cd hackatoNaN
npm install
```

## Ejecutar en desarrollo

Inicia el servidor de desarrollo de Next.js:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Construir y ejecutar en producción

Compila la aplicación y luego iníciala:

```bash
npm run build
npm start
```

## Test de API

Hay un script de test (`test-api.mjs`) que simula un flujo completo de usuario paso a paso por consola.

### Requisitos

El servidor debe estar corriendo (en dev o producción) para que el test funcione.

### Ejecutar el test

```bash
npm run test:api
```

Esto ejecuta el script contra `http://localhost:3000` por defecto.

### Test contra producción

Si ya desplegaste la app, puedes apuntar el test a otra URL:

```bash
API_URL=https://tu-app.vercel.app npm run test:api
```

### Qué hace el test

El script ejecuta estos pasos en orden:

1. **Crear sesión** — `POST /api/session/new`
2. **Enviar primer mensaje** — `POST /api/session/:id/message` ("mi cafetera llegó rota")
3. **Consultar estado** — `GET /api/session/:id/state`
4. **Enviar seguimiento** — `POST /api/session/:id/message` (datos de factura, fecha, importe)
5. **Subir evidencia** — `POST /api/session/:id/upload` (imagen mock)
6. **Consultar estado actualizado** — `GET /api/session/:id/state`
7. **Generar reclamación** — `POST /api/session/:id/generate`
8. **Analizar respuesta de empresa** — `POST /api/session/:id/company-reply`
9. **Generar contrarespuesta** — `POST /api/session/:id/counter`

Cada paso imprime por consola la URL, el body y el resultado.

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/session/new` | Crea una nueva sesión |
| `POST` | `/api/session/:id/message` | Envía un mensaje del usuario (devuelve streaming) |
| `GET`  | `/api/session/:id/state` | Obtiene el estado completo de la sesión |
| `POST` | `/api/session/:id/upload` | Sube un archivo de evidencia |
| `POST` | `/api/session/:id/generate` | Genera la reclamación formal |
| `POST` | `/api/session/:id/company-reply` | Analiza la respuesta negativa de la empresa |
| `POST` | `/api/session/:id/counter` | Genera la contrarespuesta |
 
