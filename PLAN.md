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
- Preguntas dinámicas según el caso (adaptadas por tipo)
- Panel lateral con score de solidez (0-100), checklist visual
- Subida de imágenes/documentos (sin análisis automático de imagen)
- Descripción textual de la evidencia por parte del usuario
- Generación de expediente resumen
- Generación de reclamación formal en texto
- Descarga de PDF con el expediente
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
- Análisis automático de imágenes (modelos sin visión)

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
- El score se actualiza cuando el usuario confirma que subió una foto + describe su contenido
- **Futuro:** Integración con API de visión cuando esté disponible

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
    "importe": "189.00",
    "fotoProducto": true,
    "fotoEmbalaje": false,
    "factura": true,
    "fechaCompra": "2026-06-01",
    "empresaImplicada": "Amazon",
    "descripcionDanio": "Base de la cafetera partida, caja golpeada"
  },
  "timeline": [
    {
      "date": "2026-06-01",
      "event": "Compra realizada",
      "source": "factura"
    },
    {
      "date": "2026-06-07",
      "event": "Entrega del paquete",
      "source": "usuario"
    },
    {
      "date": "2026-06-07",
      "event": "Descubrimiento del daño",
      "source": "usuario"
    }
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
  "companyResponse": null,
  "claimGenerated": false,
  "pdfGenerated": false
}
```

### Estructura de companyResponse (cuando se llena):
```json
{
  "companyResponse": {
    "originalText": "Lamentamos informarle que...",
    "analyzedAt": "2026-06-09T12:00:00Z",
    "analysis": "La empresa rechaza pero no responde a la evidencia del embalaje...",
    "weaknesses": ["No menciona garantía", "Plazo excedido"],
    "recommendation": "Enviar respuesta firme adjuntando evidencia",
    "counterReply": "Contrarespuesta generada..."
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
POST   /api/session/new              → Crea nueva sesión
POST   /api/session/:id/message      → Envía mensaje del usuario
POST   /api/session/:id/upload       → Sube archivo (imagen/doc)
GET    /api/session/:id/state        → Obtiene estado actual (score, checklist, data)
POST   /api/session/:id/generate     → Genera expediente completo
POST   /api/session/:id/pdf          → Genera y descarga PDF
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
Response: {
  "reply": "Parece una reclamación por producto dañado...",
  "claimType": "damaged_product",
  "claimTypeLabel": "Producto recibido dañado",
  "score": { "total": 32, "breakdown": {...} },
  "checklist": [...],
  "extractedData": {...},
  "timeline": [...],
  "isComplete": false
}
```

#### POST /api/session/:id/upload
```json
Request: multipart/form-data con archivo
Response: {
  "evidence": { "id": "ev1", "type": "image", "url": "...", "description": "" },
  "score": { "total": 51, ... },
  "checklist": [...],
  "aiComment": "Esto refuerza el caso porque..."
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
  "checklist": "Próximos pasos...",
  "pdfAvailable": true
}
```

#### POST /api/session/:id/pdf
```json
Response: Binary PDF file (Content-Type: application/pdf)
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

---

## 7. División de Tareas

### Norbert — Backend

#### Día 1 (Martes 9)
- [ ] Configurar proyecto Next.js
- [ ] Crear estructura de carpetas
- [ ] Implementar endpoint `POST /api/session/new`
- [ ] Implementar endpoint `POST /api/session/:id/message`
- [ ] Integrar modelo de IA para detección de tipo de reclamación
- [ ] Integrar modelo de IA para generación de siguiente pregunta

#### Día 2 (Miércoles 10)
- [ ] Implementar cálculo de score (Prompt 3) con factores dinámicos por tipo
- [ ] Implementar `GET /api/session/:id/state`
- [ ] Implementar `POST /api/session/:id/upload` (subida de archivos)
- [ ] Almacenamiento de sesión (JSON en memoria o archivo)
- [ ] Testear flujo completo: mensaje → tipo → pregunta → score

#### Día 3 (Jueves 11)
- [ ] Implementar `POST /api/session/:id/generate` (generación de reclamación)
- [ ] Integrar Prompt 4 para reclamación formal
- [ ] Generación de PDF (usar @react-pdf/renderer)
- [ ] Implementar `POST /api/session/:id/pdf`

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

### Jospaquim — Frontend

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
- [ ] Ayudar a Daniel con el pitch

---

### Daniel — Fullstack / Coordinador

#### Día 1 (Martes 9)
- [ ] Definir stack técnico final
- [ ] Crear repo y estructura
- [ ] Definir prompts detallados junto a Norbert
- [ ] Crear flujo de demo paso a paso
- [ ] Definir datos del caso demo principal (cafetera)

#### Día 2 (Miércoles 10)
- [ ] Revisar progreso de Norbert y Jospaquim
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
- [ ] Pulir UI junto a Jospaquim
- [ ] Coordinar generación de PDF
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
**Objetivo:** Tener el proyecto andando con chat funcional básico.

| Persona | Tarea |
|---------|-------|
| Norbert | Setup proyecto, endpoints básicos, integración de modelo IA |
| Jospaquim | Layout dos paneles, chat básico, conexión con API |
| Daniel | Definir stack, prompts, caso demo, estructura |

**Entregable del día:** Chat funcional que detecta tipo de reclamación y hace una pregunta.

---

### Miércoles 10 — Motor de datos
**Objetivo:** Tener score, checklist y subida de archivos funcionando.

| Persona | Tarea |
|---------|-------|
| Norbert | Score dinámico por tipo, estado de sesión, subida de archivos |
| Jospaquim | Chat completo, panel lateral, polling |
| Daniel | Ajustar prompts, preparar caso demo cafetera |

**Entregable del día:** El usuario puede chatear, subir foto, y ver el score subir.

---

### Jueves 11 — Generación
**Objetivo:** Generar reclamación formal y PDF.

| Persona | Tarea |
|---------|-------|
| Norbert | Generación de reclamación, PDF |
| Jospaquim | Subida de archivos con preview, animaciones |
| Daniel | Coordinar integración, crear caso demo hotel, probar end-to-end |

**Entregable del día:** Flujo completo: chat → reclamación → PDF descargable.

---

### Viernes 12 — Contrarespuesta + Pulido
**Objetivo:** Tener análisis de respuesta negativa y UI pulida.

| Persona | Tarea |
|---------|-------|
| Norbert | Análisis de respuesta, contrarespuesta |
| Jospaquim | Vista de análisis, contrarespuesta, botón PDF |
| Daniel | Pulir UI, preparar pitch, ensayar demo con ambos casos |

**Entregable del día:** Demo completa funcional con contrarespuesta.

---

### Sábado 13 — Demo Day
**Objetivo:** Demo impecable al jurado.

| Persona | Tarea |
|---------|-------|
| Norbert | Bugfixing final, soporte |
| Jospaquim | Últimos ajustes UI |
| Daniel | Ensayo final, presentación |

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
13. Segundo caso demo funcional (hotel)

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
| Modelos sin visión (Qwen/DeepSeek/MiMo) | Medio | La IA pide descripción textual de las imágenes. Score se actualiza con confirmación + descripción del usuario. |
| IA genera JSON inválido | Alto | Validación estricta + fallbacks. Reintentar 1 vez, luego usar respuesta por defecto. |
| PDF complejo de generar | Medio | Usar @react-pdf/renderer (ya integrado con React). Si falla, generar HTML y "Imprimir como PDF". |
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
**Acción:** Abrir la app. Escribir:
> "Me ha llegado una cafetera rota. La caja venía golpeada y quiero reclamar."

**Pantalla:** La IA detecta "Producto recibido dañado". Pregunta: "¿Tienes foto de la caja tal como llegó?"

**Acción:** Subir una foto (preparada).

**Pantalla:** Score sube de 32 a 51. Panel lateral se actualiza. IA comenta: "Esto refuerza tu caso porque muestra posible daño durante el transporte."

**Acción:** Responder con datos (factura, fecha, importe).

**Pantalla:** Score sube a 78. Checklist se va completando.

**Acción:** Pulsar "Generar expediente"

**Pantalla:** Reclamación formal aparece. PDF descargable.

### Minuto 2:00-2:30: Transición
> "Pero AutoclAIm no sirve solo para productos. Miren este otro caso."

### Minuto 2:30-3:15: Demo Caso 2 — Hotel en mal estado
**Acción:** Empezar nueva sesión. Escribir:
> "Me alojé en un hotel y la habitación estaba sucia, el aire acondicionado no funcionaba y había cucarachas."

**Pantalla:** La IA detecta "Hotel en mal estado". Pregunta: "¿Tienes fotos de los problemas? ¿Comunicaste algo en recepción?"

**Acción:** Subir fotos y responder.

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
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
└── .env.local                     # API keys de modelos
```

---

## Casos Demo Preparados

### Caso 1: Cafetera rota (Principal)
**Entrada del usuario:**
> "Me ha llegado una cafetera rota. La caja venía golpeada y quiero reclamar."

**Datos que irá aportando:**
- Foto de la caja golpeada
- Foto de la cafetera con la base partida
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
- Fotos de la habitación sucia
- Fotos de las cucarachas
- Reserva confirmada: Hotel Paradiso, 3 noches, 285€
- Comunicó en recepción → le dijeron "no podemos hacer nada"
- No le ofrecieron alternativa

**Respuesta negativa de empresa (para contrarespuesta):**
> "Estimado cliente, lamentamos su experiencia. Nuestros estándares de limpieza son elevados. No disponemos de registros de su queja en recepción. Le ofrecemos un 10% de descuento en su próxima estancia."

**Score esperado final:** 75/100

---

## Checklist de Inicio Rápido

Antes de empezar el martes:

- [ ] API keys de Qwen 3.6, DeepSeek y/o MiMo v2.5
- [ ] Node.js instalado
- [ ] Cuenta de Vercel para deploy
- [ ] Repo creado en GitHub
- [ ] Equipo en comunicación (Discord/Slack)
- [ ] Caso demo cafetera preparado (datos, fotos, respuestas)
- [ ] Caso demo hotel preparado (datos, fotos, respuestas)
- [ ] Prompts finales revisados por el equipo
- [ ] Estrategia para imágenes sin visión definida (descripción textual)

---

*Documento generado para la hackathon AutoclAIm — Martes 9 de Junio 2026*
