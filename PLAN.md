# AutoclAIm — Plan de Hackathon v2

## 1. Resumen del Producto

**AutoclAIm** es una aplicación web de IA que guía a usuarios a construir casos de reclamación sólidos mediante una entrevista inteligente. No genera texto genérico: construye un expediente paso a paso, detectando pruebas, midiéndose y generando documentación formal.

**Frase clave:** "ChatGPT te ayuda a escribir. AutoclAIm te ayuda a construir un caso."

**Flujo:**
1. Usuario describe su problema en lenguaje natural
2. IA detecta tipo de reclamación
3. Preguntas dinámicas adaptadas al caso
4. Panel lateral muestra score, pruebas aportadas y pendientes
5. Generación de expediente completo + PDF
6. Análisis de respuesta negativa de empresa + contrarespuesta

---

## 2. MVP Cerrado

### En el MVP SÍ está:
- Chat guiado con IA que detecta tipo de reclamación
- Preguntas dinámicas según el caso (adaptadas por tipo)
- Panel lateral con score de solidez (0-100), checklist visual
- Subida de imágenes/documentos con análisis visual (MiMo 2.5)
- Descripción textual de la evidencia por parte del usuario
- Generación de expediente resumen
- Generación de reclamación formal en texto
- Descarga de PDF con el expediente (renderizado en cliente)
- Análisis de respuesta negativa + contrarespuesta
- Dos casos demo funcionales: cafetera rota + hotel en mal estado

### En el MVP NO está:
- Login/registro
- Pagos
- App móvil
- Email real
- Base legal compleja
- Multiusuario
- OCR
- Búsqueda jurídica por país

---

## 3. Arquitectura Técnica Recomendada

### Stack para hackathon:

```
┌─────────────────────────────────────────────┐
│           Frontend (Next.js)                │
│  Layout NotebookLM + Panel lateral + PDF    │
│  Vercel AI SDK (Streaming)                  │
└──────────────┬──────────────────────────────┘
               │ REST API + Streaming
┌──────────────▼──────────────────────────────┐
│           Backend (Next.js API)              │
│  Endpoints + IA + Score + Supabase client    │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│     Qwen 3.6 / DeepSeek / MiMo v2.5         │
│  Detección + Preguntas + Reclamación        │
│  MiMo 2.5 → Visión (análisis de imágenes)   │
└─────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│           Supabase                          │
│  Sesiones + Archivos (URLs públicas)        │
└─────────────────────────────────────────────┘
```

### Modelos disponibles (restricción del hackathon):
- **Qwen 3.6** — modelo principal (buen balance calidad/velocidad)
- **DeepSeek** — alternativa para generación de reclamación formal
- **MiMo v2.5** — análisis de imágenes (visión) + alternativa para análisis de respuesta negativa

### Novedades técnicas respecto a v1:

#### Supabase (en lugar de JSON en disco)
- Jose monta Supabase
- Sesiones guardadas en tabla `sessions`
- Archivos subidos directamente a Supabase Storage
- Se pasa la URL pública al modelo de IA
- Sin almacenamiento local de archivos

#### Streaming con Vercel AI SDK (en lugar de polling)
- Todo el texto de la IA se transmite en streaming
- El usuario ve el mensaje aparecer carácter por carácter
- Sin polling, sin esperas, sin estados intermedios
- Experiencia más fluida y profesional

#### Visión con MiMo 2.5 (en lugar de sin visión)
- El usuario sube la foto directo a Supabase Storage
- Se obtiene la URL pública
- Esa URL se pasa a MiMo 2.5 para análisis visual
- La IA puede describir lo que ve en la imagen
- El score se actualiza automáticamente al analizar la imagen

#### PDF renderizado en cliente (en lugar de servidor)
- El PDF se genera en el navegador del usuario
- Sin depender del servidor para la generación
- Librería: @react-pdf/renderer
- Descarga instantánea sin esperar al backend

#### Layout tipo NotebookLM (en lugar de chat tradicional)
- No es una ventana de chat convencional
- Diseño similar a NotebookLM de Google:
  - Columna izquierda: conversación / preguntas de la IA
  - Columna central: respuestas del usuario + subida de archivos
  - Columna derecha: panel de expediente vivo (score, checklist, pruebas)
- Sensación de "asistente de investigación" en lugar de "chatbot"
- Más serio, más profesional, más diferencial

### ¿Por qué Next.js para todo?
- Un solo repo, un solo deploy
- API routes funcionan como backend
- Frontend React incluido
- Deploy en Vercel en 1 minuto
- Vercel AI SDK nativo para streaming
- Perfecto para hackathon

---

## 4. Modelo de Datos Mínimo

### Supabase — Tabla sessions
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  claim_type TEXT,
  claim_type_label TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  evidence JSONB DEFAULT '[]'::jsonb,
  extracted_data JSONB DEFAULT '{}'::jsonb,
  timeline JSONB DEFAULT '[]'::jsonb,
  score JSONB DEFAULT '{"total": 0, "breakdown": {}}'::jsonb,
  checklist JSONB DEFAULT '[]'::jsonb,
  company_response JSONB DEFAULT NULL,
  claim_generated BOOLEAN DEFAULT FALSE,
  pdf_generated BOOLEAN DEFAULT FALSE
);
```

### Supabase — Storage
- Bucket: `claim-evidence`
- Archivos organizados por sesión: `{sessionId}/{filename}`
- URLs públicas accesibles desde el frontend y la IA

### Session (estructura JSONB en Supabase)
```json
{
  "id": "abc123",
  "created_at": "2026-06-09T10:00:00Z",
  "claim_type": "damaged_product",
  "claim_type_label": "Producto recibido dañado",
  "messages": [
    {
      "role": "user",
      "content": "Me ha llegado una cafetera rota",
      "timestamp": "2026-06-09T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Parece una reclamación por producto dañado...",
      "timestamp": "2026-06-09T10:00:01Z"
    }
  ],
  "evidence": [
    {
      "id": "ev1",
      "type": "image",
      "url": "https://supabase.co/storage/v1/object/public/claim-evidence/abc123/caja-golpeada.jpg",
      "description": "Foto de la caja golpeada",
      "ai_analysis": "Se observa un golpe en la esquina superior derecha de la caja...",
      "added_at": "2026-06-09T10:05:00Z"
    }
  ],
  "extracted_data": {
    "problema": "Cafetera rota al llegar",
    "fechaEntrega": "2026-06-07",
    "numeroPedido": "AMZ-12345",
    "tienda": "Amazon",
    "importe": "189.00",
    "fotoProducto": true,
    "fotoEmbalaje": false,
    "factura": true,
    "fechaCompra": "2026-06-01",
    "empresaImplicada": "Amazon",
    "descripcionDanio": "Base de la cafetera partida, caja golpeada"
  },
  "timeline": [
    { "date": "2026-06-01", "event": "Compra realizada", "source": "factura" },
    { "date": "2026-06-07", "event": "Entrega del paquete", "source": "usuario" },
    { "date": "2026-06-07", "event": "Descubrimiento del daño", "source": "usuario" }
  ],
  "score": {
    "total": 51,
    "breakdown": {
      "problemaExplicado": 15,
      "fotoProducto": 15,
      "fotoEmbalaje": 0,
      "facturaPedido": 12,
      "fechaEntrega": 8,
      "descripcionDetallada": 0,
      "comunicacionPrevia": 0,
      "datosPersonales": 0,
      "empresaIdentificada": 1
    }
  },
  "checklist": [
    {"item": "Problema explicado", "done": true, "weight": 15, "key": "problemaExplicado"},
    {"item": "Foto del producto", "done": true, "weight": 15, "key": "fotoProducto"},
    {"item": "Foto del embalaje", "done": false, "weight": 10, "key": "fotoEmbalaje"},
    {"item": "Factura / nº pedido", "done": true, "weight": 12, "key": "facturaPedido"},
    {"item": "Fecha de entrega", "done": true, "weight": 8, "key": "fechaEntrega"},
    {"item": "Descripción detallada del daño", "done": false, "weight": 10, "key": "descripcionDetallada"},
    {"item": "Comunicación previa con empresa", "done": false, "weight": 8, "key": "comunicacionPrevia"},
    {"item": "Datos personales", "done": false, "weight": 5, "key": "datosPersonales"},
    {"item": "Empresa identificada", "done": true, "weight": 1, "key": "empresaIdentificada"}
  ],
  "company_response": null,
  "claim_generated": false,
  "pdf_generated": false
}
```

### Estructura de company_response (cuando se llena):
```json
{
  "company_response": {
    "original_text": "Lamentamos informarle que...",
    "analyzed_at": "2026-06-09T12:00:00Z",
    "analysis": "La empresa rechaza pero no responde a la evidencia del embalaje...",
    "weaknesses": ["No menciona garantía", "Plazo excedido"],
    "recommendation": "Enviar respuesta firme adjuntando evidencia",
    "counter_reply": "Contrarespuesta generada..."
  }
}
```

### Tipos de reclamación soportados:
| Código | Tipo | Score máximo |
|--------|------|-------------|
| `damaged_product` | Producto recibido dañado | 100 |
| `defective_product` | Producto defectuoso | 100 |
| `damaged_luggage` | Maleta dañada | 100 |
| `bad_hotel` | Hotel en mal estado | 100 |
| `bad_repair` | Reparación mal hecha | 100 |
| `bank_charge` | Cargo bancario extraño | 100 |
| `insurance` | Seguro | 100 |
| `rental` | Alquiler/vivienda | 100 |
| `other` | Otro | 100 |

### Plantillas de preguntas por tipo de reclamación:

#### damaged_product (Producto recibido dañado)
1. ¿Qué producto es y qué daño tiene?
2. ¿Tienes foto del producto dañado?
3. ¿Tienes foto del embalaje/caja?
4. ¿Tienes factura o captura del pedido?
5. ¿Cuándo llegó el paquete?
6. ¿Cuál es el importe?
7. ¿Ya contactaste con la tienda?

#### bad_hotel (Hotel en mal estado)
1. ¿Qué problema encontraste en el hotel?
2. ¿Tienes fotos del problema?
3. ¿Cuándo fue tu estancia?
4. ¿Tienes la reserva/confirmación?
5. ¿Qué precio pagaste?
6. ¿Comunicaste el problema en recepción?
7. ¿Qué respuesta te dieron?
8. ¿Buscaste alternativa de alojamiento?

#### damaged_luggage (Maleta dañada)
1. ¿En qué vuelo viajaste?
2. ¿Qué daño tiene la maleta?
3. ¿Tienes foto de la maleta dañada?
4. ¿Tienes la etiqueta de equipaje?
5. ¿Presentaste parte en el aeropuerto?
6. ¿Tienes el billete de avión?
7. ¿Cuál es el importe de la maleta?

#### bad_repair (Reparación mal hecha)
1. ¿Qué se reparó y por qué empresa?
2. ¿Tienes fotos del resultado?
3. ¿Tienes el presupuesto original?
4. ¿Tienes la factura de la reparación?
5. ¿Cuándo se hizo la reparación?
6. ¿Contactaste con el reparador?

---

## 5. Endpoints Necesarios

```
POST   /api/session/new              → Crea nueva sesión en Supabase
POST   /api/session/:id/message      → Envía mensaje + streaming de respuesta
POST   /api/session/:id/upload       → Sube archivo a Supabase Storage + análisis MiMo
GET    /api/session/:id/state        → Obtiene estado actual desde Supabase
POST   /api/session/:id/generate     → Genera expediente completo
POST   /api/session/:id/company-reply → Analiza respuesta de empresa
POST   /api/session/:id/counter      → Genera contrarespuesta
```

### Detalle de cada endpoint:

#### POST /api/session/new
```json
Response: {
  "sessionId": "abc123",
  "firstMessage": "Hola, soy AutoclAIm. Cuéntame qué ha pasado y te ayudo a construir un caso sólido."
}
```

#### POST /api/session/:id/message
```json
Request: { "message": "Me ha llegado una cafetera rota" }
Response: Streaming (Vercel AI SDK) — texto carácter por carácter
```

#### POST /api/session/:id/upload
```json
Request: multipart/form-data con archivo
Response: {
  "evidence": {
    "id": "ev1",
    "type": "image",
    "url": "https://supabase.co/storage/...",
    "description": "",
    "ai_analysis": "Se observa un golpe en la esquina..."
  },
  "score": { "total": 51, ... },
  "checklist": [...],
  "aiComment": "He analizado la imagen y se confirma el daño en el embalaje..."
}
```

#### GET /api/session/:id/state
```json
Response: {
  "sessionId": "abc123",
  "claimType": "damaged_product",
  "claimTypeLabel": "Producto recibido dañado",
  "score": {...},
  "checklist": [...],
  "extractedData": {...},
  "evidence": [...],
  "timeline": [...],
  "companyResponse": null,
  "claimGenerated": false
}
```

#### POST /api/session/:id/generate
```json
Response: {
  "claim": "RECLAMACIÓN FORMAL...",
  "summary": "Resumen del caso...",
  "timeline": [...],
  "nextSteps": ["Enviar por registro...", "Guardar copias..."],
  "checklist": "Próximos pasos..."
}
```

#### POST /api/session/:id/company-reply
```json
Request: { "reply": "Lamentamos informarle que..." }
Response: {
  "analysis": "Análisis de puntos débiles...",
  "weaknesses": ["No menciona garantía", "Plazo excedido"],
  "recommendation": "Reclamar amparándose en...",
  "counterReply": "Contrarespuesta firme..."
}
```

#### POST /api/session/:id/counter
```json
Response: {
  "counterReply": "Contrarespuesta firme...",
  "legalBasis": "Fundamento legal..."
}
```

---

## 6. Prompts Principales

### Prompt 1: Detección de tipo + primera respuesta

```
Eres AutoclAIm, una IA especializada en ayudar a personas a construir casos de reclamación sólidos.

El usuario te acaba de describir su problema por primera vez.

Tu trabajo:
1. Detecta el tipo de reclamación (damaged_product, defective_product, damaged_luggage, bad_hotel, bad_repair, bank_charge, insurance, rental, other)
2. Responde con empatía y profesionalidad
3. Explica qué vas a hacer (guiarle paso a paso)
4. Haz UNA primera pregunta concreta y fácil de responder
5. Menciona brevemente por qué esa información es importante

Tipo de reclamación detectada: [CLAIM_TYPE]
Problema descrito: [USER_MESSAGE]

Responde en máximo 3-4 frases. Sé directo y cercano.
```

### Prompt 2: Generación de siguiente pregunta

```
Eres AutoclAIm. Estás en una conversación de recolección de datos para una reclamación.

Tipo de reclamación: [CLAIM_TYPE]
Datos recogidos hasta ahora: [EXTRACTED_DATA]
Preguntas ya hechas: [PREVIOUS_QUESTIONS]

Tu trabajo:
1. Analiza qué datos faltan para construir un caso sólido
2. Haz UNA pregunta concreta sobre el dato más importante que falta
3. Explica brevemente por qué necesitas ese dato
4. Si ya tienes suficiente información (score >= 75), indica que puedes generar el expediente

Reglas:
- Nunca repitas preguntas ya hechas
- Prioriza: fotos/evidencia > fechas > números de pedido > importes > otros
- Sé conciso: máximo 2-3 frases
- Si el usuario dio información vaga, pide concreción
- Adapta el lenguaje al tipo de reclamación (no pidas "nº de pedido" si es un hotel)
```

### Prompt 3: Cálculo de score

```
Eres un sistema de scoring de expedientes de reclamación.

Tipo de reclamación: [CLAIM_TYPE]
Datos recogidos: [EXTRACTED_DATA]
Evidencias: [EVIDENCE_LIST]

Calcula un score del 0 al 100 basado en estos factores (suman 100):
- Problema bien explicado: 15 puntos
- Foto del producto/daño: 15 puntos
- Foto del embalaje/entorno: 10 puntos
- Factura o número de pedido: 12 puntos
- Fecha exacta de compra/entrega/estancia: 8 puntos
- Descripción detallada del daño/problema: 10 puntos
- Comunicación previa con la empresa: 8 puntos
- Datos personales completos: 5 puntos
- Empresa/destinatario identificado: 7 puntos
- Testimonios o pruebas adicionales: 10 puntos

IMPORTANTE: Adapta los factores al tipo de reclamación. Por ejemplo:
- Si es "bad_hotel": "foto del embalaje" NO aplica, pero sí "comunicación con recepción"
- Si es "damaged_luggage": "factura" se sustituye por "etiqueta de equipaje"
- Si es "bank_charge": "foto del producto" NO aplica, pero sí "captura del cargo"

Devuelve JSON con:
{
  "total": number,
  "breakdown": { "factor": points, ... },
  "missingCritical": ["factor que falta y es crítico"],
  "suggestion": "Qué subiría más el score"
}
```

### Prompt 4: Generación de reclamación formal

```
Eres un experto en redacción de reclamaciones formales en español.

Datos del caso:
- Tipo: [CLAIM_TYPE]
- Problema: [PROBLEM_DESCRIPTION]
- Datos extraídos: [EXTRACTED_DATA]
- Evidencias: [EVIDENCE]
- Cronología: [TIMELINE]

Genera una reclamación formal que incluya:
1. Encabezado con datos del reclamante
2. Descripción clara del problema
3. Cronología de hechos
4. Base legal (general: derecho de consumidor, garantía legal)
5. Reclamación concreta (reembolso, sustitución, reparación)
6. Plazo de respuesta razonable (15 días)
7. Aviso de escalada (consumo, tribunales)

Tono: firme pero profesional. Sin amenazas, pero con determinación.
Extensión: 1-2 páginas.
```

### Prompt 5: Análisis de respuesta negativa

```
Eres AutoclAIm analizando la respuesta negativa de una empresa a una reclamación.

Nuestra reclamación original:
[CLAIM_GENERATED]

Respuesta de la empresa:
[COMPANY_RESPONSE]

Datos del caso:
[EXTRACTED_DATA]

Analiza:
1. Qué argumentos usa la empresa para rechazar
2. Puntos débiles de su respuesta
3. Qué argumentos legales podemos usar contra ellos
4. Si mencionan plazos o condiciones que podemos cuestionar
5. Recomendación de siguiente acción concreta

Sé analítico y preciso. Identifica cada punto débil con su contraargumento.
```

### Prompt 6: Contrarespuesta

```
Eres un experto en contestar a rechazos de empresas.

Reclamación original: [CLAIM_GENERATED]
Respuesta negativa: [COMPANY_RESPONSE]
Análisis de puntos débiles: [ANALYSIS]

Genera una contrarespuesta firme que:
1. Rebuta punto por punto los argumentos de la empresa
2. Cite la base legal correspondiente
3. Reafirme la reclamación
4. Establezca un nuevo plazo razonable
5. Indique las próximas escaladas si no hay respuesta satisfactoria

Tono: respetuoso pero inequívocamente firme.
Extensión: 1 página.
```

### Prompt 7: Análisis de imagen (MiMo 2.5)

```
Eres un analista de evidencia visual para reclamaciones.

Analiza esta imagen y describe:
1. ¿Qué se ve en la imagen?
2. ¿Hay daños visibles? Descríbelos con detalle.
3. ¿El daño parece reciente o antiguo?
4. ¿Hay elementos que ayuden a identificar el producto, embalaje o contexto?
5. ¿La imagen es útil como prueba para una reclamación?

Sé objetivo y descriptivo. No inventes información que no esté visible.
```

---

## 7. División de Tareas

### Norbert — Backend

#### Día 1 (Martes 9)
- [ ] Configurar proyecto Next.js
- [ ] Crear estructura de carpetas
- [ ] Implementar endpoint `POST /api/session/new` (crear sesión en Supabase)
- [ ] Implementar endpoint `POST /api/session/:id/message` (con streaming)
- [ ] Integrar Vercel AI SDK para streaming
- [ ] Integrar modelo de IA para detección de tipo de reclamación
- [ ] Integrar modelo de IA para generación de siguiente pregunta

#### Día 2 (Miércoles 10)
- [ ] Implementar cálculo de score (Prompt 3) con factores dinámicos por tipo
- [ ] Implementar `GET /api/session/:id/state`
- [ ] Implementar `POST /api/session/:id/upload` (subida a Supabase Storage + análisis MiMo)
- [ ] Integrar MiMo 2.5 para análisis de imagen (Prompt 7)
- [ ] Testear flujo completo: mensaje → tipo → pregunta → score

#### Día 3 (Jueves 11)
- [ ] Implementar `POST /api/session/:id/generate` (generación de reclamación)
- [ ] Integrar Prompt 4 para reclamación formal
- [ ] Asegurar que los datos de sesión se guardan correctamente en Supabase

#### Día 4 (Viernes 12)
- [ ] Implementar `POST /api/session/:id/company-reply`
- [ ] Implementar `POST /api/session/:id/counter`
- [ ] Integrar Prompts 5 y 6
- [ ] Pulir validación de JSON y fallbacks
- [ ] Testear flujo completo de contrarespuesta

#### Día 5 (Sábado 13)
- [ ] Bugfixing
- [ ] Preparar datos demo (cafetera + hotel)
- [ ] Ayudar a Daniel con la demo
- [ ] Últimos ajustes backend

---

### Jose — Frontend

#### Día 1 (Martes 9)
- [ ] Configurar interfaz base
- [ ] Crear layout tipo NotebookLM (3 columnas)
- [ ] Columna izquierda: conversación / preguntas de la IA
- [ ] Columna central: respuestas del usuario + subida de archivos
- [ ] Columna derecha: panel de expediente vivo
- [ ] Conexión con endpoint de sesión
- [ ] Primer mensaje funcional con streaming

#### Día 2 (Miércoles 10)
- [ ] Streaming de mensajes con Vercel AI SDK
- [ ] Renderizado de mensajes en tiempo real
- [ ] Input de texto con botón enviar
- [ ] Panel lateral con score y checklist
- [ ] Subida de archivos a Supabase Storage desde el frontend

#### Día 3 (Jueves 11)
- [ ] Preview de imágenes subidas
- [ ] Indicador de "la IA está escribiendo..."
- [ ] Animación de score subiendo
- [ ] Panel lateral con pruebas aportadas/pendientes
- [ ] Análisis visual: mostrar descripción de MiMo 2.5 al usuario

#### Día 4 (Viernes 12)
- [ ] Vista de expediente generado
- [ ] Vista de análisis de respuesta de empresa
- [ ] Input para pegar respuesta de empresa
- [ ] Vista de contrarespuesta
- [ ] Renderizado de PDF en cliente (@react-pdf/renderer)
- [ ] Botón de descarga PDF

#### Día 5 (Sábado 13)
- [ ] Pulir UI (colores, espaciado, tipografía)
- [ ] Estados de error y loading
- [ ] Responsive básico
- [ ] Preparar entorno demo
- [ ] Ayudar a Daniel con el pitch

---

### Daniel — Fullstack / Coordinador

#### Día 1 (Martes 9)
- [ ] Definir stack técnico final
- [ ] Crear repo y estructura
- [ ] Definir prompts detallados junto a Norbert
- [ ] Crear flujo de demo paso a paso
- [ ] Definir datos del caso demo principal (cafetera)
- [ ] Configurar Supabase (tablas + storage)

#### Día 2 (Miércoles 10)
- [ ] Revisar progreso de Norbert y Jose
- [ ] Ajustar prompts según resultados
- [ ] Crear caso demo completo (cafetera rota)
- [ ] Preparar respuestas del usuario para el demo
- [ ] Definir checklist visual del panel

#### Día 3 (Jueves 11)
- [ ] Coordinar integración frontend/backend
- [ ] Probar flujo completo end-to-end
- [ ] Identificar bugs críticos
- [ ] Crear segundo caso demo: hotel en mal estado
- [ ] Definir narrativa del pitch

#### Día 4 (Viernes 12)
- [ ] Pulir UI junto a Jose
- [ ] Coordinar generación de PDF en cliente
- [ ] Preparar datos para ambos demos
- [ ] Ensayar la demo
- [ ] Preparar pitch de 3 minutos

#### Día 5 (Sábado 13)
- [ ] Ensayo final de demo
- [ ] Preparar demo backup
- [ ] Revisar que todo funciona
- [ ] Presentar al jurado
- [ ] Documentar learnings

---

## 8. Plan por Días (Martes 9 - Sábado 13)

### Martes 9 — Fundamentos
**Objetivo:** Tener el proyecto andando con layout NotebookLM y streaming funcional.

| Persona | Tarea |
|---------|-------|
| Norbert | Setup proyecto, endpoints básicos, streaming con Vercel AI SDK |
| Jose | Layout 3 columnas tipo NotebookLM, conexión con API, streaming |
| Daniel | Definir stack, prompts, Supabase, caso demo, estructura |

**Entregable del día:** Layout NotebookLM funcional con streaming de IA que detecta tipo de reclamación.

---

### Miércoles 10 — Motor de datos
**Objetivo:** Tener score, checklist, subida de archivos y análisis visual funcionando.

| Persona | Tarea |
|---------|-------|
| Norbert | Score dinámico, estado de sesión, subida a Supabase + análisis MiMo |
| Jose | Streaming completo, panel lateral, subida de archivos desde frontend |
| Daniel | Ajustar prompts, preparar caso demo cafetera |

**Entregable del día:** El usuario puede chatear, subir foto, la IA la analiza visualmente, y el score sube.

---

### Jueves 11 — Generación
**Objetivo:** Generar reclamación formal.

| Persona | Tarea |
|---------|-------|
| Norbert | Generación de reclamación, datos en Supabase |
| Jose | Preview de imágenes, animaciones, panel lateral completo |
| Daniel | Coordinar integración, crear caso demo hotel, probar end-to-end |

**Entregable del día:** Flujo completo: chat → análisis visual → reclamación.

---

### Viernes 12 — Contrarespuesta + PDF + Pulido
**Objetivo:** Tener análisis de respuesta negativa, PDF en cliente y UI pulida.

| Persona | Tarea |
|---------|-------|
| Norbert | Análisis de respuesta, contrarespuesta |
| Jose | Vista de análisis, contrarespuesta, PDF con @react-pdf/renderer |
| Daniel | Pulir UI, preparar pitch, ensayar demo con ambos casos |

**Entregable del día:** Demo completa funcional con PDF descargable y contrarespuesta.

---

### Sábado 13 — Demo Day
**Objetivo:** Demo impecable al jurado.

| Persona | Tarea |
|---------|-------|
| Norbert | Bugfixing final, soporte |
| Jose | Últimos ajustes UI |
| Daniel | Ensayo final, presentación |

**Entregable del día:** Demo presentada al jurado.

---

## 9. Qué Debe Estar Listo Sí o Sí para la Demo

### Crítico (sin esto no hay demo):
1. Layout NotebookLM funcional (3 columnas)
2. Streaming de IA en tiempo real
3. Detección automática de tipo de reclamación
4. Preguntas dinámicas (al menos 3-4 preguntas)
5. Panel lateral con score visual (animación de subida)
6. Checklist visual con pruebas aportadas/pendientes
7. Subida de imágenes con análisis visual (MiMo 2.5)
8. Generación de reclamación formal
9. PDF descargable del expediente (renderizado en cliente)
10. Interfaz pulida y profesional

### Importante (mejora mucho la demo):
11. Comentario de la IA al analizar imagen ("he detectado daño en el embalaje...")
12. Análisis de respuesta negativa
13. Contrarespuesta generada
14. Segundo caso demo funcional (hotel)

---

## 10. Extras (Solo si Sobra Tiempo)

- Animaciones suaves en el panel lateral
- Modo oscuro
- Historial de sesiones
- Exportar a Word además de PDF
- Guía de derechos por país
- Ejemplos de casos exitosos
- Testimonios ficticios
- Sonido de notificación al subir evidencia

---

## 11. Riesgos Principales y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| MiMo 2.5 no funciona bien con visión | Alto | Tener fallback: IA pide descripción textual. El score se actualiza igual. |
| Streaming con Vercel AI SDK complejo | Medio | Norbert y Jose lo prueban juntos el día 1. Documentación de Vercel clara. |
| Supabase Storage lento o caído | Medio | Tener URLs mock preparadas para la demo. Cache local de sesiones. |
| IA genera JSON inválido | Alto | Validación estricta + fallbacks. Reintentar 1 vez, luego usar respuesta por defecto. |
| PDF en cliente no se renderiza bien | Medio | Probar con @react-pdf/renderer el día 3. Si falla, generar HTML y "Imprimir como PDF". |
| Frontend no conecta con backend | Alto | Empezar la integración el día 1. No construir en paralelo sin probar conexión. |
| Score no es consistente | Medio | Prompt de scoring con ejemplos. Validar que suma 100. Cache de cálculos. |
| Tiempo insuficiente | Alto | MVP ultra-minimalista: chat + score + 1 generación. Lo demás es bonus. |
| La demo no funciona en vivo | Crítico | Tener demo grabada como backup. Preparar datos hardcodeados por si falla la IA. |
| UI fea o confusa | Medio | Daniel revisa UI cada día. Usar componentes existentes (shadcn/ui o similar). |

---

## 12. Guion de Demo (3-4 minutos)

### Minuto 0-0:30: Contexto
> "¿Alguna vez han recibido un producto roto y no sabían cómo reclamar? O peor: han reclamado y la empresa les ha dicho que no. AutoclAIm es una IA que no solo escribe reclamaciones: construye casos sólidos, paso a paso."

### Minuto 0:30-2:00: Demo Caso 1 — Cafetera rota
**Acción:** Abrir la app (layout NotebookLM). Escribir en la columna central:
> "Me ha llegado una cafetera rota. La caja venía golpeada y quiero reclamar."

**Pantalla:** La IA responde en streaming en la columna izquierda. Detecta "Producto recibido dañado". Pregunta: "¿Tienes foto de la caja tal como llegó?"

**Acción:** Subir una foto (preparada) → se sube a Supabase Storage → MiMo 2.5 la analiza.

**Pantalla:** La IA comenta: "He analizado la imagen. Se confirma un golpe en la esquina superior derecha de la caja. Esto refuerza tu caso." Score sube de 32 a 51. Panel derecho se actualiza.

**Acción:** Responder con datos (factura, fecha, importe).

**Pantalla:** Score sube a 78. Checklist se va completando en el panel derecho.

**Acción:** Pulsar "Generar expediente"

**Pantalla:** Reclamación formal aparece. Botón "Descargar PDF" → se renderiza en cliente y se descarga.

### Minuto 2:00-2:30: Transición
> "Pero AutoclAIm no sirve solo para productos. Miren este otro caso."

### Minuto 2:30-3:15: Demo Caso 2 — Hotel en mal estado
**Acción:** Empezar nueva sesión. Escribir:
> "Me alojé en un hotel y la habitación estaba sucia, el aire acondicionado no funcionaba y había cucarachas."

**Pantalla:** La IA detecta "Hotel en mal estado". Pregunta: "¿Tienes fotos de los problemas? ¿Comunicaste algo en recepción?"

**Acción:** Subir fotos → MiMo 2.5 analiza.

**Pantalla:** Score sube. IA adapta sus preguntas al contexto hotelero (reserva, precio, respuesta del hotel).

### Minuto 3:15-3:45: Contrarespuesta
> "Ahora veamos qué pasa cuando la empresa dice que no."

**Acción:** Pegar respuesta negativa de empresa (preparada).

**Pantalla:** IA analiza, detecta puntos débiles, genera contrarespuesta firme.

> "AutoclAIm no solo reclama. Contesta cuando le dicen que no. Construye casos que resisten."

### Cierre
> "En una semana, con tres personas, hemos construido esto. ChatGPT te ayuda a escribir. AutoclAIm te ayuda a construir un caso. ¿Preguntas?"

---

## Estructura del Proyecto

```
AutoclAIm/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Página principal (layout NotebookLM)
│   │   ├── layout.tsx            # Layout global
│   │   ├── globals.css           # Estilos globales
│   │   └── api/
│   │       ├── session/
│   │       │   ├── new/route.ts          # Crear sesión en Supabase
│   │       │   └── [id]/
│   │       │       ├── message/route.ts  # Enviar mensaje + streaming
│   │       │       ├── upload/route.ts   # Subir a Supabase + análisis MiMo
│   │       │       ├── state/route.ts    # Estado actual desde Supabase
│   │       │       ├── generate/route.ts # Generar expediente
│   │       │       ├── company-reply/route.ts # Analizar respuesta
│   │       │       └── counter/route.ts  # Contrarespuesta
│   ├── components/
│   │   ├── NotebookLayout.tsx     # Layout 3 columnas tipo NotebookLM
│   │   ├── ConversationPanel.tsx  # Columna izquierda: preguntas IA
│   │   ├── ResponsePanel.tsx      # Columna central: respuestas + upload
│   │   ├── Sidebar.tsx            # Columna derecha: expediente vivo
│   │   ├── ScoreGauge.tsx         # Indicador de score
│   │   ├── Checklist.tsx          # Checklist visual
│   │   ├── FileUpload.tsx         # Subida de archivos a Supabase
│   │   ├── ImagePreview.tsx       # Preview con análisis MiMo
│   │   ├── ClaimView.tsx          # Vista de reclamación
│   │   ├── CompanyReply.tsx       # Vista de contrarespuesta
│   │   └── PDFDownload.tsx        # Botón de descarga PDF (cliente)
│   ├── lib/
│   │   ├── ai.ts                  # Cliente de IA (Qwen/DeepSeek/MiMo)
│   │   ├── supabase.ts            # Cliente Supabase
│   │   ├── sessions.ts            # Gestión de sesiones en Supabase
│   │   ├── scoring.ts             # Cálculo de score
│   │   ├── prompts.ts             # Todos los prompts
│   │   └── pdf.ts                 # Generación de PDF en cliente
│   └── types/
│       └── index.ts               # Tipos TypeScript
├── public/
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
└── .env.local                     # API keys + Supabase URL
```

---

## Casos Demo Preparados

### Caso 1: Cafetera rota (Principal)
**Entrada del usuario:**
> "Me ha llegado una cafetera rota. La caja venía golpeada y quiero reclamar."

**Datos que irá aportando:**
- Foto de la caja golpeada (analizada por MiMo 2.5)
- Foto de la cafetera con la base partida (analizada por MiMo 2.5)
- Factura de Amazon: 189€
- Fecha de entrega: hace 2 días
- Número de pedido: AMZ-2026-78542

**Respuesta negativa de empresa (para contrarespuesta):**
> "Tras revisar su caso, lamentamos informarle que no podemos confirmar que el daño se produjera durante el transporte. Le recomendamos contactar con su aseguradora."

**Score esperado final:** 82/100

### Caso 2: Hotel en mal estado (Backup)
**Entrada del usuario:**
> "Me alojé en un hotel y la habitación estaba sucia, el aire acondicionado no funcionaba y había cucarachas."

**Datos que irá aportando:**
- Fotos de la habitación sucia (analizadas por MiMo 2.5)
- Fotos de las cucarachas (analizadas por MiMo 2.5)
- Reserva confirmada: Hotel Paradiso, 3 noches, 285€
- Comunicó en recepción → le dijeron "no podemos hacer nada"
- No le ofrecieron alternativa

**Respuesta negativa de empresa (para contrarespuesta):**
> "Estimado cliente, lamentamos su experiencia. Nuestros estándares de limpieza son elevados. No disponemos de registros de su queja en recepción. Le ofrecemos un 10% de descuento en su próxima estancia."

**Score esperado final:** 75/100

---

## Checklist de Inicio Rápido

Antes de empezar el martes:

- [ ] API keys de Qwen 3.6, DeepSeek y MiMo v2.5
- [ ] Cuenta de Supabase (gratuita) con proyecto creado
- [ ] Node.js instalado
- [ ] Cuenta de Vercel para deploy
- [ ] Repo creado en GitHub
- [ ] Equipo en comunicación (Discord/Slack)
- [ ] Caso demo cafetera preparado (datos, fotos, respuestas)
- [ ] Caso demo hotel preparado (datos, fotos, respuestas)
- [ ] Prompts finales revisados por el equipo
- [ ] Estrategia de streaming definida (Vercel AI SDK)
- [ ] Layout NotebookLM diseñado (3 columnas)

---

*Documento generado para la hackathon AutoclAIm v2 — Martes 9 de Junio 2026*