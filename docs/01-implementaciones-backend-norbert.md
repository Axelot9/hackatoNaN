# Implementaciones Realizadas — Backend (Norbert)

> **Proyecto:** AutoclAIm — Hackathon v2  
> **Responsable:** Norbert  
> **Rama:** `features/dani` (original en `norbert/hackatoNaN`)  
> **Fecha:** 11 de Junio de 2026  
> **Estado general:** ~60% completado (Días 1 y 2 del plan)

---

## Índice

1. [Configuración del Proyecto Next.js](#1-configuración-del-proyecto-nextjs)
2. [Estructura de Carpetas](#2-estructura-de-carpetas)
3. [Tipos TypeScript](#3-tipos-typescript)
4. [Módulo de Sesiones (sessions.ts)](#4-módulo-de-sesiones)
5. [Módulo de Prompts (prompts.ts)](#5-módulo-de-prompts)
6. [Módulo de IA (ai.ts)](#6-módulo-de-ia)
7. [Módulo de Scoring (scoring.ts)](#7-módulo-de-scoring)
8. [POST /api/session/new](#8-post-apisessionnew)
9. [POST /api/session/:id/message](#9-post-apisessionidmessage)
10. [GET /api/session/:id/state](#10-get-apisessionidstate)
11. [POST /api/session/:id/upload](#11-post-apisessionidupload)
12. [POST /api/session/:id/generate (Stub)](#12-post-apisessionidgenerate-stub)
13. [POST /api/session/:id/company-reply (Stub)](#13-post-apisessionidcompany-reply-stub)
14. [POST /api/session/:id/counter (Stub)](#14-post-apisessionidcounter-stub)
15. [Test de API (test-api.mjs)](#15-test-de-api)

---

## 1. Configuración del Proyecto Next.js

### Descripción
Inicialización del proyecto Next.js 15 con TypeScript, incluyendo todas las dependencias necesarias para el backend de AutoclAIm.

### Archivos involucrados
- `package.json`
- `tsconfig.json`
- `next.config.ts`

### Dependencias instaladas
| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `next` | ^15.5.19 | Framework React con API routes |
| `react` / `react-dom` | ^19.1.0 | Renderizado |
| `ai` | ^6.0.199 | Vercel AI SDK para streaming |
| `uuid` | ^11.1.0 | Generación de IDs únicos |
| `zod` | ^3.25.0 | Validación de esquemas |
| `typescript` | ^5.8.0 | Tipado estático |

### Requisitos
- Node.js >= 18
- Ejecutar `npm install` para instalar dependencias
- Servidor disponible en `http://localhost:3000` con `npm run dev`

### Criterios de aceptación
- [x] `npm run dev` inicia el servidor sin errores
- [x] `npm run build` compila sin errores
- [x] TypeScript configurado con path alias `@/*` → `./src/*`
- [x] Scripts definidos: `dev`, `build`, `start`, `lint`, `test:api`

### Tests mínimos
- [x] `npm run build` exitoso
- [ ] `npm run lint` sin errores (no ejecutado)

---

## 2. Estructura de Carpetas

### Descripción
Organización del proyecto siguiendo las convenciones de Next.js App Router, con separación clara entre API routes, lógica de negocio y tipos.

### Estructura creada
```
hackatoNaN/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       └── session/
│   │           ├── new/route.ts
│   │           └── [id]/
│   │               ├── message/route.ts
│   │               ├── upload/route.ts
│   │               ├── state/route.ts
│   │               ├── generate/route.ts
│   │               ├── company-reply/route.ts
│   │               └── counter/route.ts
│   ├── lib/
│   │   ├── ai.ts
│   │   ├── sessions.ts
│   │   ├── scoring.ts
│   │   └── prompts.ts
│   └── types/
│       └── index.ts
├── test-api.mjs
├── package.json
├── tsconfig.json
├── next.config.ts
├── README.md
├── PLAN.md
└── .gitignore
```

### Requisitos
- Seguir el patrón App Router de Next.js 15
- Separar lógica de negocio en `src/lib/`
- Definir tipos compartidos en `src/types/`

### Criterios de aceptación
- [x] Todas las rutas API existen en las ubicaciones correctas
- [x] Los imports usan el alias `@/` correctamente
- [x] La estructura es coherente con el plan original

### Tests mínimos
- [x] `npm run build` compila sin errores de importación

---

## 3. Tipos TypeScript

### Descripción
Definición de todos los tipos compartidos utilizados en el backend, incluyendo sesiones, mensajes, evidencias, scores y checklist.

### Archivo: `src/types/index.ts`

### Tipos definidos

| Tipo | Propósito |
|------|-----------|
| `ClaimType` | Union type con 9 tipos de reclamación soportados |
| `Message` | Mensaje del chat (role, content, timestamp) |
| `Evidence` | Evidencia subida (imagen/documento/texto) |
| `TimelineEvent` | Evento de cronología |
| `ScoreBreakdown` | Desglose de puntuación por factor |
| `Score` | Score total + breakdown + missingCritical + suggestion |
| `ChecklistItem` | Item del checklist (item, done, weight, key) |
| `ExtractedData` | Datos extraídos del usuario (clave-valor) |
| `CompanyResponse` | Análisis de respuesta de empresa |
| `Session` | Sesión completa con todos los campos |

### Requisitos
- Tipado estricto (`strict: true` en tsconfig)
- Coherencia con el modelo de datos definido en PLAN.md
- Todos los campos opcionales correctamente marcados con `| null` o `| undefined`

### Criterios de aceptación
- [x] Todos los tipos del modelo de datos están cubiertos
- [x] `ClaimType` incluye los 9 tipos del plan
- [x] `Session` contiene todos los campos de la tabla Supabase
- [x] No hay errores de tipo en tiempo de compilación

### Tests mínimos
- [x] Compilación TypeScript exitosa

---

## 4. Módulo de Sesiones

### Descripción
Gestión de sesiones en memoria utilizando `Map<string, Session>`. Proporciona operaciones CRUD básicas y generación de checklist inicial adaptado por tipo de reclamación.

### Archivo: `src/lib/sessions.ts`

### Funciones implementadas

| Función | Descripción |
|---------|-------------|
| `createSession()` | Crea nueva sesión con UUID, score inicial 0 y checklist vacío |
| `getSession(id)` | Obtiene sesión por ID |
| `updateSession(id, updates)` | Actualiza campos parciales de una sesión |
| `deleteSession(id)` | Elimina sesión |
| `getAllSessions()` | Lista todas las sesiones activas |
| `getInitialChecklist(claimType)` | Genera checklist adaptado al tipo (damaged_product, bad_hotel, damaged_luggage, base) |

### Requisitos
- Las sesiones deben persistir durante la vida del servidor
- El checklist debe adaptarse dinámicamente según el tipo de reclamación
- Cada sesión debe tener un UUID único

### Criterios de aceptación
- [x] `createSession()` devuelve una sesión con ID único
- [x] `getSession()` devuelve `undefined` para IDs inexistentes
- [x] `updateSession()` aplica cambios parciales correctamente
- [x] `getInitialChecklist("bad_hotel")` devuelve items diferentes a `"damaged_product"`
- [x] `getInitialChecklist(null)` devuelve el checklist base

### Tests mínimos
- [ ] Test unitario: crear sesión → obtener sesión → verificar campos por defecto
- [ ] Test unitario: actualizar sesión → verificar cambios
- [ ] Test unitario: checklist adaptado por tipo

---

## 5. Módulo de Prompts

### Descripción
Constructores de prompts para cada uno de los 7 prompts definidos en el plan. Generan el texto completo que se enviará al modelo de IA.

### Archivo: `src/lib/prompts.ts`

### Prompts implementados

| Función | Prompt | Propósito |
|---------|--------|-----------|
| `buildDetectionPrompt(userMessage)` | Prompt 1 | Detección de tipo de reclamación + primera respuesta |
| `buildNextQuestionPrompt(...)` | Prompt 2 | Generación de siguiente pregunta dinámica |
| `buildScorePrompt(...)` | Prompt 3 | Cálculo de score con factores dinámicos |
| `buildImageAnalysisPrompt()` | Prompt 7 | Análisis de evidencia visual |
| `buildClaimGenerationPrompt(...)` | Prompt 4 | Generación de reclamación formal |
| `buildCompanyReplyAnalysisPrompt(...)` | Prompt 5 | Análisis de respuesta negativa |
| `buildCounterReplyPrompt(...)` | Prompt 6 | Generación de contrarespuesta |

### Constantes adicionales
- `claimTypeLabels`: Mapa de `ClaimType` → etiqueta legible en español

### Requisitos
- Cada prompt debe incluir placeholders para los datos dinámicos
- Los prompts deben seguir exactamente la estructura definida en PLAN.md
- Deben ser auto-contenidos (no dependen de estado externo)

### Criterios de aceptación
- [x] `buildDetectionPrompt("mensaje")` incluye el mensaje del usuario
- [x] `buildNextQuestionPrompt(...)` incluye claimType, extractedData, previousQuestions, score
- [x] `buildScorePrompt(...)` incluye factores de scoring
- [x] `buildClaimGenerationPrompt(...)` incluye todos los datos del caso
- [x] `claimTypeLabels` tiene entrada para cada `ClaimType`

### Tests mínimos
- [ ] Test unitario: cada builder devuelve un string no vacío
- [ ] Test unitario: los placeholders se reemplazan correctamente

---

## 6. Módulo de IA

### Descripción
Capa de abstracción para la interacción con modelos de IA. Actualmente implementada con respuestas mock (hardcodeadas) y streaming simulado. Pendiente de integración con Qwen 3.6 / DeepSeek / MiMo v2.5 reales.

### Archivo: `src/lib/ai.ts`

### Funciones implementadas

| Función | Estado | Descripción |
|---------|--------|-------------|
| `detectClaimType(message)` | ✅ Completo | Heurística por palabras clave (sin IA) |
| `generateFirstResponse(userMessage)` | ✅ Mock | Streaming simulado con respuestas hardcodeadas por tipo |
| `generateNextQuestion(...)` | ✅ Mock | Streaming simulado con preguntas predefinidas por tipo |
| `analyzeImageMock()` | ✅ Mock | Simula análisis de imagen con respuesta fija |

### Detección de tipo de reclamación (heurística)
| Palabras clave | Tipo detectado |
|----------------|----------------|
| cafetera, rota, dañado, golpe | `damaged_product` |
| hotel, habitación, sucia, cucaracha | `bad_hotel` |
| maleta, equipaje, vuelo | `damaged_luggage` |
| reparación, taller | `bad_repair` |
| banco, cargo, cobro | `bank_charge` |
| seguro | `insurance` |
| alquiler, piso, vivienda | `rental` |
| (ninguna de las anteriores) | `other` |

### Requisitos
- Debe soportar streaming de texto carácter por carácter
- La detección de tipo debe funcionar sin conexión a IA (modo offline)
- Las respuestas deben ser coherentes con el tipo de reclamación detectado

### Criterios de aceptación
- [x] `detectClaimType("cafetera rota")` devuelve `"damaged_product"`
- [x] `detectClaimType("hotel sucio")` devuelve `"bad_hotel"`
- [x] `detectClaimType("texto genérico")` devuelve `"other"`
- [x] `generateFirstResponse()` devuelve un `ReadableStream`
- [x] `generateNextQuestion()` no repite preguntas ya hechas
- [x] El streaming simulado tiene un delay de ~15ms por carácter

### Tests mínimos
- [ ] Test unitario: detección de cada tipo de reclamación
- [ ] Test unitario: `generateFirstResponse` produce texto legible
- [ ] Test unitario: `generateNextQuestion` filtra preguntas repetidas
- [ ] Test de integración: el stream se consume completamente

---

## 7. Módulo de Scoring

### Descripción
Sistema de cálculo de score para expedientes de reclamación. Evalúa hasta 10 factores con pesos dinámicos adaptados al tipo de reclamación.

### Archivo: `src/lib/scoring.ts`

### Funciones implementadas

| Función | Descripción |
|---------|-------------|
| `calculateScore(claimType, extractedData, evidence)` | Calcula score 0-100 con desglose |
| `updateChecklist(checklist, score)` | Marca items del checklist como completados según el score |

### Factores de scoring (base)
| Factor | Peso máximo |
|--------|-------------|
| Problema explicado | 15 |
| Foto del producto/daño | 15 |
| Foto del embalaje/entorno | 10 |
| Factura / nº pedido | 12 |
| Fecha de entrega/estancia | 8 |
| Descripción detallada del daño | 10 |
| Comunicación previa con empresa | 8 |
| Datos personales | 5 |
| Empresa identificada | 7 |
| Pruebas adicionales | 10 |
| **Total** | **100** |

### Adaptaciones por tipo
- **bad_hotel**: Reemplaza "foto embalaje" por "respuesta del hotel" y "alternativa alojamiento"
- **damaged_luggage**: Reemplaza "factura" por "etiqueta de equipaje", añade "importe maleta"

### Requisitos
- El score debe calcularse en base a datos extraídos y evidencias
- Los factores deben adaptarse al tipo de reclamación
- Debe identificar factores críticos faltantes (`missingCritical`)
- Debe sugerir qué mejoraría más el score

### Criterios de aceptación
- [x] `calculateScore(null, {}, [])` devuelve score 0
- [x] `calculateScore("damaged_product", { problema: "texto largo" }, [])` asigna puntos a "problemaExplicado"
- [x] `calculateScore("damaged_product", {}, [imageEvidence])` asigna puntos a "fotoProducto"
- [x] `missingCritical` identifica factores con 0 puntos
- [x] `updateChecklist` marca `done: true` cuando el factor tiene puntos > 0

### Tests mínimos
- [ ] Test unitario: score 0 sin datos
- [ ] Test unitario: score parcial con algunos datos
- [ ] Test unitario: score completo con todos los datos
- [ ] Test unitario: adaptación para bad_hotel vs damaged_product
- [ ] Test unitario: checklist se actualiza correctamente

---

## 8. POST /api/session/new

### Descripción
Crea una nueva sesión de reclamación y devuelve el ID de sesión junto con un mensaje de bienvenida.

### Archivo: `src/app/api/session/new/route.ts`

### Endpoint
```
POST /api/session/new
```

### Response (200)
```json
{
  "sessionId": "uuid-string",
  "firstMessage": "Hola, soy AutoclAIm. Cuéntame qué ha pasado y te ayudo a construir un caso sólido."
}
```

### Requisitos
- Debe generar un UUID único para cada sesión
- Debe inicializar la sesión con score 0 y checklist vacío
- El mensaje de bienvenida debe ser el definido en el plan

### Criterios de aceptación
- [x] Responde con `sessionId` (string UUID válido)
- [x] Responde con `firstMessage` (string no vacío)
- [x] Status code 200
- [x] La sesión creada es accesible via `GET /api/session/:id/state`

### Tests mínimos
- [x] Test de API: `POST /api/session/new` → 200 + sessionId válido
- [ ] Test: sessionId tiene formato UUID

---

## 9. POST /api/session/:id/message

### Descripción
Envía un mensaje del usuario a la sesión. Detecta el tipo de reclamación (si es el primer mensaje), genera una respuesta con streaming, extrae datos del mensaje y recalcula el score.

### Archivo: `src/app/api/session/[id]/message/route.ts`

### Endpoint
```
POST /api/session/:id/message
Content-Type: application/json

{
  "message": "Me ha llegado una cafetera rota"
}
```

### Response
Streaming de texto (text/plain; charset=utf-8) con Transfer-Encoding: chunked.

### Flujo interno
1. Validar que la sesión existe
2. Guardar mensaje del usuario
3. Si no hay `claimType`: detectar tipo + generar primera respuesta
4. Si ya hay `claimType`: generar siguiente pregunta dinámica
5. Extraer datos del mensaje (heurística simple: fechas, importes, empresas)
6. Recalcular score y checklist
7. Devolver streaming
8. Al completar el stream: guardar mensaje del asistente y sesión actualizada

### Extracción de datos (heurística)
| Patrón | Campo extraído |
|--------|----------------|
| Mensaje con >10 caracteres | `extractedData.problema` |
| Fecha en formato YYYY-MM-DD | `extractedData.fechaEntrega` |
| Número con € | `extractedData.importe` |
| "amazon" o "tienda" | `extractedData.empresaImplicada` |

### Requisitos
- Debe transmitir la respuesta en streaming
- Debe detectar automáticamente el tipo de reclamación en el primer mensaje
- Debe extraer datos estructurados del mensaje
- Debe recalcular el score después de cada mensaje
- Debe persistir el mensaje del asistente al finalizar el stream

### Criterios de aceptación
- [x] Responde con streaming (Content-Type: text/plain)
- [x] Primer mensaje: detecta claimType y responde acorde
- [x] Mensajes siguientes: genera preguntas dinámicas
- [x] Extrae datos como fechas, importes y empresas
- [x] Recalcula score después de cada mensaje
- [x] Guarda mensajes en la sesión
- [x] Status 404 si la sesión no existe

### Tests mínimos
- [x] Test de API: primer mensaje → streaming + claimType detectado
- [x] Test de API: segundo mensaje → pregunta diferente
- [ ] Test: extracción de fecha desde el mensaje
- [ ] Test: extracción de importe desde el mensaje
- [ ] Test: score se actualiza después del mensaje

---

## 10. GET /api/session/:id/state

### Descripción
Obtiene el estado completo de una sesión, incluyendo tipo de reclamación, score, checklist, evidencias, datos extraídos y cronología.

### Archivo: `src/app/api/session/[id]/state/route.ts`

### Endpoint
```
GET /api/session/:id/state
```

### Response (200)
```json
{
  "sessionId": "uuid",
  "claimType": "damaged_product",
  "claimTypeLabel": "Producto recibido dañado",
  "score": { "total": 51, "breakdown": {...}, ... },
  "checklist": [...],
  "extractedData": {...},
  "evidence": [...],
  "timeline": [...],
  "companyResponse": null,
  "claimGenerated": false
}
```

### Requisitos
- Debe devolver todos los campos relevantes de la sesión
- Debe responder 404 si la sesión no existe

### Criterios de aceptación
- [x] Responde con todos los campos del estado
- [x] Status 200 para sesión existente
- [x] Status 404 para sesión inexistente

### Tests mínimos
- [x] Test de API: estado después de crear sesión
- [x] Test de API: estado después de enviar mensajes

---

## 11. POST /api/session/:id/upload

### Descripción
Sube un archivo de evidencia (imagen/documento) a la sesión. Actualmente usa URL mock en lugar de Supabase Storage. Incluye análisis de imagen simulado (MiMo 2.5 mock).

### Archivo: `src/app/api/session/[id]/upload/route.ts`

### Endpoint
```
POST /api/session/:id/upload
Content-Type: multipart/form-data

file: <binary>
```

### Response (200)
```json
{
  "evidence": {
    "id": "uuid",
    "type": "image",
    "url": "https://storage.autoclaim.dev/evidence/{id}/{filename}",
    "description": "Archivo subido: {filename}",
    "aiAnalysis": "Se observa un golpe visible...",
    "addedAt": "2026-06-11T00:00:00Z"
  },
  "score": { "total": 51, ... },
  "checklist": [...],
  "aiComment": "He analizado la imagen y se confirma un golpe..."
}
```

### Requisitos
- Debe aceptar archivos via multipart/form-data
- Debe generar un ID único para cada evidencia
- Debe analizar la imagen (actualmente mock)
- Debe recalcular el score con la nueva evidencia
- Debe actualizar el checklist

### Criterios de aceptación
- [x] Acepta subida de archivos
- [x] Genera URL mock para la evidencia
- [x] Devuelve análisis de imagen (mock)
- [x] Recalcula score incluyendo la nueva evidencia
- [x] Status 400 si no se envía archivo
- [x] Status 404 si la sesión no existe

### Tests mínimos
- [x] Test de API: subir imagen → evidencia creada + score actualizado
- [ ] Test: subir archivo no imagen (tipo document)
- [ ] Test: verificar que el score sube al añadir evidencia

---

## 12. POST /api/session/:id/generate (Stub)

### Descripción
**Implementación parcial — Stub.** Genera la reclamación formal a partir de los datos de la sesión. Actualmente devuelve datos mock. Pendiente de integrar con Prompt 4 y modelo de IA real.

### Archivo: `src/app/api/session/[id]/generate/route.ts`

### Endpoint
```
POST /api/session/:id/generate
```

### Response actual (stub)
```json
{
  "sessionId": "uuid",
  "claim": "RECLAMACIÓN FORMAL — stub para Day 3",
  "summary": "Resumen del caso — stub",
  "timeline": [],
  "nextSteps": ["stub"],
  "checklist": "stub"
}
```

### Requisitos (pendientes)
- [ ] Integrar `buildClaimGenerationPrompt` (Prompt 4)
- [ ] Llamar al modelo de IA para generar el texto de la reclamación
- [ ] Devolver reclamación formal completa con encabezado, cuerpo, base legal y plazo
- [ ] Marcar `claimGenerated: true` en la sesión
- [ ] Construir timeline a partir de `extractedData` y `evidence`

### Criterios de aceptación (pendientes)
- [ ] La reclamación incluye: encabezado, descripción, cronología, base legal, reclamación concreta, plazo, aviso de escalada
- [ ] El timeline contiene eventos ordenados cronológicamente
- [ ] `nextSteps` contiene acciones concretas para el usuario
- [ ] La sesión se marca como `claimGenerated: true`

### Tests mínimos (pendientes)
- [ ] Test de API: generar reclamación → claim no vacío
- [ ] Test: claim contiene palabras clave (reclamación, derecho, plazo)
- [ ] Test: timeline tiene al menos 2 eventos

---

## 13. POST /api/session/:id/company-reply (Stub)

### Descripción
**Implementación parcial — Stub.** Analiza la respuesta negativa de una empresa. Actualmente devuelve datos mock. Pendiente de integrar con Prompt 5 y modelo de IA real.

### Archivo: `src/app/api/session/[id]/company-reply/route.ts`

### Endpoint
```
POST /api/session/:id/company-reply
Content-Type: application/json

{
  "reply": "Lamentamos informarle que..."
}
```

### Response actual (stub)
```json
{
  "sessionId": "uuid",
  "analysis": "Análisis de puntos débiles — stub para Day 4",
  "weaknesses": ["stub"],
  "recommendation": "stub",
  "counterReply": "stub"
}
```

### Requisitos (pendientes)
- [ ] Integrar `buildCompanyReplyAnalysisPrompt` (Prompt 5)
- [ ] Llamar al modelo de IA para analizar la respuesta
- [ ] Identificar puntos débiles de la respuesta de la empresa
- [ ] Generar recomendación de acción
- [ ] Almacenar `companyResponse` en la sesión

### Criterios de aceptación (pendientes)
- [ ] `analysis` contiene un análisis detallado de la respuesta
- [ ] `weaknesses` es un array con al menos 2 puntos débiles
- [ ] `recommendation` es una acción concreta
- [ ] La sesión guarda el análisis completo

### Tests mínimos (pendientes)
- [ ] Test de API: analizar respuesta → weaknesses no vacío
- [ ] Test: analysis contiene referencias a la respuesta original

---

## 14. POST /api/session/:id/counter (Stub)

### Descripción
**Implementación parcial — Stub.** Genera una contrarespuesta firme a la respuesta negativa de la empresa. Actualmente devuelve datos mock. Pendiente de integrar con Prompt 6 y modelo de IA real.

### Archivo: `src/app/api/session/[id]/counter/route.ts`

### Endpoint
```
POST /api/session/:id/counter
```

### Response actual (stub)
```json
{
  "sessionId": "uuid",
  "counterReply": "Contrarespuesta firme — stub para Day 4",
  "legalBasis": "Fundamento legal — stub"
}
```

### Requisitos (pendientes)
- [ ] Integrar `buildCounterReplyPrompt` (Prompt 6)
- [ ] Llamar al modelo de IA para generar la contrarespuesta
- [ ] Debe rebatir punto por punto los argumentos de la empresa
- [ ] Debe citar base legal correspondiente

### Criterios de aceptación (pendientes)
- [ ] `counterReply` es un texto de al menos 1 párrafo
- [ ] `legalBasis` menciona una ley o derecho concreto
- [ ] La contrarespuesta hace referencia a la respuesta original

### Tests mínimos (pendientes)
- [ ] Test de API: generar contrarespuesta → counterReply no vacío
- [ ] Test: counterReply contiene argumentos legales

---

## 15. Test de API

### Descripción
Script de prueba que simula un flujo completo de usuario paso a paso, ejecutando todos los endpoints de la API en secuencia.

### Archivo: `test-api.mjs`

### Pasos del test
| Paso | Endpoint | Descripción |
|------|----------|-------------|
| 1 | `POST /api/session/new` | Crear sesión |
| 2 | `POST /api/session/:id/message` | Enviar "mi cafetera llegó rota" |
| 3 | `GET /api/session/:id/state` | Ver estado |
| 4 | `POST /api/session/:id/message` | Enviar datos de factura, fecha, importe |
| 5 | `POST /api/session/:id/upload` | Subir imagen mock |
| 6 | `GET /api/session/:id/state` | Ver estado actualizado |
| 7 | `POST /api/session/:id/generate` | Generar reclamación |
| 8 | `POST /api/session/:id/company-reply` | Analizar respuesta |
| 9 | `POST /api/session/:id/counter` | Generar contrarespuesta |

### Requisitos
- El servidor debe estar corriendo en `http://localhost:3000`
- Se puede configurar URL alternativa con `API_URL`

### Criterios de aceptación
- [x] El script se ejecuta sin errores
- [x] Cada paso imprime el resultado por consola
- [x] El flujo completo cubre todos los endpoints

### Tests mínimos
- [x] `npm run test:api` ejecuta el script correctamente
- [ ] Todos los pasos devuelven status 200 (actualmente pasos 7-9 devuelven stubs)

---

## Resumen de Estado

| Componente | Estado | Prioridad para completar |
|------------|--------|--------------------------|
| Configuración Next.js | ✅ Completo | - |
| Estructura de carpetas | ✅ Completo | - |
| Tipos TypeScript | ✅ Completo | - |
| Módulo de sesiones | ✅ Completo (en memoria) | Media (migrar a Supabase post-MVP) |
| Módulo de prompts | ✅ Completo | - |
| Módulo de IA | 🟡 Mock | Alta (integrar modelo real) |
| Módulo de scoring | ✅ Completo | - |
| POST /api/session/new | ✅ Completo | - |
| POST /api/session/:id/message | ✅ Completo | - |
| GET /api/session/:id/state | ✅ Completo | - |
| POST /api/session/:id/upload | 🟡 Mock (sin Supabase) | Alta (integrar Supabase Storage) |
| POST /api/session/:id/generate | 🟡 Stub | **Crítica** |
| POST /api/session/:id/company-reply | 🟡 Stub | Alta |
| POST /api/session/:id/counter | 🟡 Stub | Alta |
| Test de API | ✅ Completo | - |
| **Frontend completo** | ❌ No iniciado | **Crítica** |
| **Supabase** | ❌ No iniciado | Pospuesto (ver documento de transición) |

---

*Documento generado el 11 de Junio de 2026 — Revisión técnica del backend de AutoclAIm*