# AutoclAIm — Plan de Hackathon

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
- Preguntas dinámicas según el caso
- Panel lateral con score de solidez (0-100), checklist visual
- Subida de imágenes/documentos (sin análisis automático de imagen)
- Descripción textual de la evidencia por parte del usuario
- Generación de expediente resumen
- Generación de reclamación formal en texto
- Descarga de PDF con el expediente
- Análisis de respuesta negativa + contrarespuesta

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

### Stack rápido para hackathon:

```
┌─────────────────────────────────────────┐
│           Frontend (Next.js)            │
│  Chat + Panel lateral + PDF viewer      │
└──────────────┬──────────────────────────┘
               │ REST API
┌──────────────▼──────────────────────────┐
│           Backend (Next.js API)          │
│  Endpoints + IA + Score + PDF           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│     Qwen 3.6 / DeepSeek / MiMo v2.5     │
│  Detección + Preguntas + Reclamación    │
└─────────────────────────────────────────┘
```

### Modelos disponibles (restricción del hackathon):
- **Qwen 3.6** — modelo principal (buen balance calidad/velocidad)
- **DeepSeek** — alternativa para generación de reclamación formal
- **MiMo v2.5** — alternativa para análisis de respuesta negativa

### Limitación importante: Sin análisis de imagen
Ninguno de los modelos disponibles tiene capacidad de visión. Esto significa:
- La subida de imágenes **se almacena pero no se analiza automáticamente**
- El usuario puede subir fotos como evidencia, pero la IA no puede "ver" el contenido
- El score se actualiza manualmente cuando el usuario confirma que subió una foto
- **Futuro:** Integración con API de visión (ej. GPT-4o) cuando esté disponible

### Estrategia para la demo con esta limitación:
- El usuario dice "tengo foto" → la IA pregunta "¿puedes describir lo que se ve en la foto?"
- La IA extrae información de la descripción textual
- El score sube cuando el usuario confirma la subida + describe el contenido
- En la demo, tener las fotos pre-cargadas y la descripción preparada

### ¿Por qué Next.js para todo?
- Un solo repo, un solo deploy
- API routes funcionan como backend
- Frontend React incluido
- Deploy en Vercel en 1 minuto
- Menos coordinación entre personas
- Perfecto para hackathon

### Alternativa si prefieren separar:
- Backend: Python FastAPI
- Frontend: Next.js
- Pero suma complejidad innecesaria para una semana

---

## 4. Modelo de Datos Mínimo

### Session (en memoria o JSON en disco)
```json
{
  "sessionId": "abc123",
  "createdAt": "2026-06-09T10:00:00Z",
  "claimType": "damaged_product",
  "claimTypeLabel": "Producto recibido dañado",
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
      "url": "/uploads/photo1.jpg",
      "description": "Foto de la caja golpeada",
      "addedAt": "2026-06-09T10:05:00Z"
    }
  ],
  "extractedData": {
    "problema": "Cafetera rota al llegar",
    "fechaEntrega": "2026-06-07",
    "numeroPedido": "AMZ-12345",
    "tienda": "Amazon",
    "importe": "59.99",
    "fotoProducto": true,
    "fotoEmbalaje": false,
    "factura": false,
    "fechaCompra": "2026-06-01"
  },
  "score": {
    "total": 51,
    "breakdown": {
      "problemaExplicado": 15,
      "evidenciaVisual": 20,
      "datosFactura": 0,
      "fechaEntrega": 8,
      "numeroPedido": 8,
      "testimonios": 0
    }
  },
  "checklist": [
    {"item": "Problema explicado", "done": true, "weight": 15},
    {"item": "Foto del producto", "done": true, "weight": 15},
    {"item": "Foto del embalaje", "done": false, "weight": 10},
    {"item": "Factura/num. pedido", "done": true, "weight": 12},
    {"item": "Fecha de entrega", "done": true, "weight": 8},
    {"item": "Testimonios", "done": false, "weight": 0}
  ],
  "companyResponse": null,
  "claimGenerated": false,
  "pdfGenerated": false
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

---

## 5. Endpoints Necesarios

```
POST   /api/session/new              → Crea nueva sesión
POST   /api/session/:id/message      → Envía mensaje del usuario
POST   /api/session/:id/upload       → Sube archivo (imagen/doc)
GET    /api/session/:id/state        → Obtiene estado actual (score, checklist, data)
POST   /api/session/:id/generate     → Genera expediente completo
GET    /api/session/:id/pdf          → Descarga PDF del expediente
POST   /api/session/:id/company-reply → Analiza respuesta de empresa
POST   /api/session/:id/counter      → Genera contrarespuesta
```

### Detalle de cada endpoint:

#### POST /api/session/new
```json
Response: { "sessionId": "abc123", "firstMessage": "Hola, cuéntame..." }
```

#### POST /api/session/:id/message
```json
Request: { "message": "Me ha llegado una cafetera rota" }
Response: {
  "reply": "Parece una reclamación por producto dañado...",
  "claimType": "damaged_product",
  "score": { "total": 32, "breakdown": {...} },
  "checklist": [...],
  "nextQuestion": "¿Tienes foto de la caja?"
}
```

#### POST /api/session/:id/upload
```json
Request: multipart/form-data con archivo
Response: {
  "evidence": { "id": "ev1", "type": "image", "url": "..." },
  "score": { "total": 51, ... },
  "checklist": [...],
  "aiComment": "Esto refuerza el caso porque..."
}
```

#### GET /api/session/:id/state
```json
Response: {
  "score": {...},
  "checklist": [...],
  "extractedData": {...},
  "evidence": [...],
  "claimType": "damaged_product",
  "claimTypeLabel": "Producto recibido dañado"
}
```

#### POST /api/session/:id/generate
```json
Response: {
  "claim": "RECLAMACIÓN FORMAL...",
  "summary": "Resumen del caso...",
  "timeline": "...",
  "checklist": "Próximos pasos...",
  "pdfUrl": "/api/session/:id/pdf"
}
```

#### POST /api/session/:id/company-reply
```json
Request: { "reply": "Lamentamos informarle que..." }
Response: {
  "analysis": "Análisis de puntos débiles...",
  "weaknesses": ["No menciona garantía", "Plazo excedido"],
  "recommendation": "Reclamar amparándose en..."
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
4. Si ya tienes suficiente información, indica que puedes generar el expediente

Reglas:
- Nunca repitas preguntas ya hechas
- Prioriza: fotos/evidencia > fechas > números de pedido > importes > otros
- Sé conciso: máximo 2-3 frases
- Si el usuario dio información vaga, pide concreción
```

### Prompt 3: Cálculo de score

```
Eres un sistema de scoring de expedientes de reclamación.

Tipo de reclamación: [CLAIM_TYPE]
Datos recogidos: [EXTRACTED_DATA]
Evidencias: [EVIDENCE_LIST]

Calcula un score del 0 al 100 basado en estos factores (suman 100):
- Problema bien explicado: 15 puntos
- Foto del producto dañado: 15 puntos
- Foto del embalaje: 10 puntos
- Factura o número de pedido: 12 puntos
- Fecha exacta de compra/entrega: 8 puntos
- Descripción detallada del daño: 10 puntos
- Comunicación previa con la empresa: 8 puntos
- Testimonios o pruebas adicionales: 7 puntos
- Datos personales completos: 5 puntos
- Información del transportista: 10 puntos

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

Sé analítico y preciso. Identifica cada point débil con su contraargumento.
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

---

## 7. División de Tareas

### Persona A — Backend

#### Día 1 (Martes 9)
- [ ] Configurar proyecto Next.js
- [ ] Crear estructura de carpetas
- [ ] Implementar endpoint `POST /api/session/new`
- [ ] Implementar endpoint `POST /api/session/:id/message`
- [ ] Integrar modelo de IA para detección de tipo de reclamación
- [ ] Integrar modelo de IA para generación de siguiente pregunta

#### Día 2 (Miércoles 10)
- [ ] Implementar cálculo de score (Prompt 3)
- [ ] Implementar `GET /api/session/:id/state`
- [ ] Implementar `POST /api/session/:id/upload` (subida de archivos)
- [ ] Almacenamiento de sesión (JSON en memoria o archivo)
- [ ] Testear flujo completo: mensaje → tipo → pregunta → score

#### Día 3 (Jueves 11)
- [ ] Implementar `POST /api/session/:id/generate` (generación de reclamación)
- [ ] Integrar Prompt 4 para reclamación formal
- [ ] Generación de PDF (usar @react-pdf/renderer o puppeteer)
- [ ] Implementar `GET /api/session/:id/pdf`

#### Día 4 (Viernes 12)
- [ ] Implementar `POST /api/session/:id/company-reply`
- [ ] Implementar `POST /api/session/:id/counter`
- [ ] Integrar Prompts 5 y 6
- [ ] Pulir validación de JSON y fallbacks
- [ ] Testear flujo completo de contrarespuesta

#### Día 5 (Sábado 13)
- [ ] Bugfixing
- [ ] Preparar datos demo
- [ ] Ayudar a Persona C con la demo
- [ ] Últimos ajustes backend

---

### Persona B — Frontend

#### Día 1 (Martes 9)
- [ ] Configurar interfaz base
- [ ] Crear layout de dos paneles (chat + sidebar)
- [ ] Implementar componente de chat básico
- [ ] Conexión con endpoint de sesión
- [ ] Primer mensaje funcional

#### Día 2 (Miércoles 10)
- [ ] Chat con mensajes de usuario y IA
- [ ] Renderizado de mensajes (texto + markdown)
- [ ] Input de texto con botón enviar
- [ ] Panel lateral con score y checklist
- [ ] Polling o actualización de estado

#### Día 3 (Jueves 11)
- [ ] Subida de archivos en el chat
- [ ] Preview de imágenes subidas
- [ ] Indicador de "la IA está escribiendo..."
- [ ] Animación de score subiendo
- [ ] Panel lateral con pruebas aportadas/pendientes

#### Día 4 (Viernes 12)
- [ ] Vista de expediente generado
- [ ] Vista de análisis de respuesta de empresa
- [ ] Input para pegar respuesta de empresa
- [ ] Vista de contrarespuesta
- [ ] Botón de descarga PDF

#### Día 5 (Sábado 13)
- [ ] Pulir UI (colores, espaciado, tipografía)
- [ ] Estados de error y loading
- [ ] Responsive básico
- [ ] Preparar entorno demo
- [ ] Ayudar a Persona C con el pitch

---

### Persona C — Fullstack / Coordinador

#### Día 1 (Martes 9)
- [ ] Definir stack técnico final
- [ ] Crear repo y estructura
- [ ] Definir prompts detallados junto a Persona A
- [ ] Crear flujo de demo paso a paso
- [ ] Definir datos del caso demo principal

#### Día 2 (Miércoles 10)
- [ ] Revisar progreso de A y B
- [ ] Ajustar prompts según resultados
- [ ] Crear caso demo completo (cafetera rota)
- [ ] Preparar respuestas del usuario para el demo
- [ ] Definir checklist visual del panel

#### Día 3 (Jueves 11)
- [ ] Coordinar integración frontend/backend
- [ ] Probar flujo completo end-to-end
- [ ] Identificar bugs críticos
- [ ] Crear segundo caso demo (backup)
- [ ] Definir narrativa del pitch

#### Día 4 (Viernes 12)
- [ ] Pulir UI junto a Persona B
- [ ] Coordinar generación de PDF
- [ ] Preparar datos para la demo
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
**Objetivo:** Tener el proyecto andando con chat funcional básico.

| Persona | Tarea |
|---------|-------|
| A | Setup proyecto, endpoints básicos, integración de modelo IA |
| B | Layout dos paneles, chat básico, conexión con API |
| C | Definir stack, prompts, caso demo, estructura |

**Entregable del día:** Chat funcional que detecta tipo de reclamación y hace una pregunta.

---

### Miércoles 10 — Motor de datos
**Objetivo:** Tener score, checklist y subida de archivos funcionando.

| Persona | Tarea |
|---------|-------|
| A | Score, estado de sesión, subida de archivos |
| B | Chat completo, panel lateral, polling |
| C | Ajustar prompts, preparar caso demo |

**Entregable del día:** El usuario puede chatear, subir foto, y ver el score subir.

---

### Jueves 11 — Generación
**Objetivo:** Generar reclamación formal y PDF.

| Persona | Tarea |
|---------|-------|
| A | Generación de reclamación, PDF |
| B | Subida de archivos con preview, animaciones |
| C | Coordinar integración, probar end-to-end |

**Entregable del día:** Flujo completo: chat → reclamación → PDF descargable.

---

### Viernes 12 — Contrarespuesta + Pulido
**Objetivo:** Tener análisis de respuesta negativa y UI pulida.

| Persona | Tarea |
|---------|-------|
| A | Análisis de respuesta, contrarespuesta |
| B | Vista de análisis, contrarespuesta, botón PDF |
| C | Pulir UI, preparar pitch, ensayar |

**Entregable del día:** Demo completa funcional con contrarespuesta.

---

### Sábado 13 — Demo Day
**Objetivo:** Demo impecable al jurado.

| Persona | Tarea |
|---------|-------|
| A | Bugfixing final, soporte |
| B | Últimos ajustes UI |
| C | Ensayo final, presentación |

**Entregable del día:** Demo presentada al jurado.

---

## 9. Qué Debe Estar Listo Sí o Sí para la Demo

### Crítico (sin esto no hay demo):
1. Chat funcional con IA que responde
2. Detección automática de tipo de reclamación
3. Preguntas dinámicas (al menos 3-4 preguntas)
4. Panel lateral con score visual (animación de subida)
5. Checklist visual con pruebas aportadas/pendientes
6. Generación de reclamación formal
7. PDF descargable del expediente
8. Interfaz pulida y profesional

### Importante (mejora mucho la demo):
9. Subida de imágenes con preview
10. Comentario de la IA al subir evidencia ("esto refuerza tu caso")
11. Análisis de respuesta negativa
12. Contrarespuesta generada

---

## 10. Extras (Solo si Sobra Tiempo)

- Animaciones suaves en el panel lateral
- Modo oscuro
- Historial de sesiones
- Exportar a Word además de PDF
- Guía de derechos por país
- Ejemplos de casos exitosos
- Testimonios ficticios
-sonido de notificación al subir evidencia

---

## 11. Riesgos Principales y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Modelos sin visión (Qwen/DeepSeek/MiMo) | Medio | La IA pide descripción textual de las imágenes. Score se actualiza con confirmación + descripción del usuario. |
| IA genera JSON inválido | Alto | Validación estricta + fallbacks. Reintentar 1 vez, luego usar respuesta por defecto. |
| PDF complejo de generar | Medio | Usar @react-pdf/renderer (ya integrado con React). Si falla, generar HTML y "Imprimir como PDF". |
| Frontend no conecta con backend | Alto | Empezar la integración el día 1. No construir en paralelo sin probar conexión. |
| Score no es consistente | Medio | Prompt de scoring con ejemplos. Validar que suma 100. Cache de cálculos. |
| Tiempo insuficiente | Alto | MVP ultra-minimalista: chat + score + 1 generación. Lo demás es bonus. |
| La demo no funciona en vivo | Crítico | Tener demo grabada como backup. Preparar datos hardcodeados por si falla la IA. |
| UI fea o confusa | Medio | Persona C revisa UI cada día. Usar componentes existentes (shadcn/ui o similar). |

---

## 12. Guion de Demo (3 minutos)

### Minuto 0-1: Contexto
> "¿Alguna vez han recibido un producto roto y no sabían cómo reclamar? O peor: han reclamado y la empresa les ha dicho que no. AutoclAIm es una IA que no solo escribe reclamaciones: construye casos sólidos, paso a paso."

### Minuto 1-2: Demo en vivo
**Acción:** Abrir la app. Escribir:
> "Me ha llegado una cafetera rota. La caja venía golpeada y quiero reclamar."

**Pantalla:** La IA detecta "Producto recibido dañado". Pregunta: "¿Tienes foto de la caja tal como llegó?"

**Acción:** Subir una foto (preparada).

**Pantalla:** Score sube de 32 a 51. Panel lateral se actualiza. IA comenta: "Esto refuerza tu caso."

**Acción:** Responder con datos (factura, fecha, etc.)

**Pantalla:** Score sube a 78. Checklist se va completando.

**Acción:** Pulsar "Generar expediente"

**Pantalla:** Reclamación formal aparece. PDF descargable.

### Minuto 2-3: Contrarespuesta
> "Pero ¿qué pasa cuando la empresa dice que no? Miren esto."

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
│   │   ├── page.tsx              # Página principal
│   │   ├── layout.tsx            # Layout global
│   │   ├── globals.css           # Estilos globales
│   │   └── api/
│   │       ├── session/
│   │       │   ├── new/route.ts          # Crear sesión
│   │       │   └── [id]/
│   │       │       ├── message/route.ts  # Enviar mensaje
│   │       │       ├── upload/route.ts   # Subir archivo
│   │       │       ├── state/route.ts    # Estado actual
│   │       │       ├── generate/route.ts # Generar expediente
│   │       │       ├── pdf/route.ts      # Generar PDF
│   │       │       ├── company-reply/route.ts # Analizar respuesta
│   │       │       └── counter/route.ts  # Contrarespuesta
│   ├── components/
│   │   ├── Chat.tsx               # Componente de chat
│   │   ├── Message.tsx            # Mensaje individual
│   │   ├── Sidebar.tsx            # Panel lateral
│   │   ├── ScoreGauge.tsx         # Indicador de score
│   │   ├── Checklist.tsx          # Checklist visual
│   │   ├── FileUpload.tsx         # Subida de archivos
│   │   ├── ClaimView.tsx          # Vista de reclamación
│   │   └── CompanyReply.tsx       # Vista de contrarespuesta
│   ├── lib/
│   │   ├── ai.ts                  # Cliente de IA (Qwen/DeepSeek/MiMo)
│   │   ├── sessions.ts            # Gestión de sesiones
│   │   ├── scoring.ts             # Cálculo de score
│   │   ├── prompts.ts             # Todos los prompts
│   │   └── pdf.ts                 # Generación de PDF
│   └── types/
│       └── index.ts               # Tipos TypeScript
├── public/
│   └── uploads/                   # Archivos subidos
├── package.json
├── tsconfig.json
├── next.config.js
└── .env.local                     # API keys de modelos
```

---

## Checklist de Inicio Rápido

Antes de empezar el martes:

- [ ] API keys de Qwen 3.6, DeepSeek y/o MiMo v2.5
- [ ] Node.js instalado
- [ ] Cuenta de Vercel para deploy
- [ ] Repo creado en GitHub
- [ ] Equipo en comunicación (Discord/Slack)
- [ ] Caso demo preparado (datos, fotos, respuestas)
- [ ] Prompts finales revisados por el equipo
- [ ] Estrategia para imágenes sin visión definida (descripción textual)

---

*Documento generado para la hackathon AutoclAIm — Martes 9 de Junio 2026*
