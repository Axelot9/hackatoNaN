# Transición de Roles y Plan de Trabajo — Frontend

> **Proyecto:** AutoclAIm — Hackathon v2  
> **De:** Jose (Frontend) → **Asumido por:** Dani  
> **Fecha:** 11 de Junio de 2026  
> **Días restantes:** 3 (Jueves 11, Viernes 12, Sábado 13)  
> **Estado del frontend:** ❌ No iniciado

---

## 1. Contexto de la Transición

### Motivo
Jose no ha podido continuar con sus tareas de frontend. Para asegurar que la aplicación sea funcional para la demo del Sábado 13, **Dani asume temporalmente el rol de Jose** como responsable del frontend.

### Decisión arquitectónica crítica
**Por falta de tiempo, se obvia Supabase para el MVP.** El backend de Norbert ya gestiona sesiones en memoria (`Map`), y el frontend se comunicará directamente con las API routes de Next.js. Esto nos permite:

- Evitar la configuración y debugging de Supabase (que consume tiempo valioso)
- Tener una aplicación completamente funcional en local
- Reducir puntos de fallo en la demo en vivo
- Posponer Supabase para la versión post-hackathon

### Stack frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js 15 (App Router) | ^15.5.19 | Framework |
| React | ^19.1.0 | UI |
| Vercel AI SDK (`ai`) | ^6.0.199 | Streaming de IA |
| CSS Modules / Tailwind | A definir | Estilos |
| @react-pdf/renderer | A instalar | Generación de PDF en cliente |

---

## 2. Plan de Trabajo — 3 Días

### Jueves 11 — Layout y Streaming (CRÍTICO)

| Hora | Tarea | Dependencia |
|------|-------|-------------|
| Mañana | Layout NotebookLM (3 columnas) | Ninguna |
| Mediodía | Conexión con API de sesión | Backend listo |
| Tarde | Streaming de mensajes en tiempo real | Layout funcional |
| Noche | Input de texto + botón enviar | Streaming funcional |

**Entregable:** Layout funcional con chat streaming y detección de tipo de reclamación.

### Viernes 12 — Panel Lateral y Subida de Archivos

| Hora | Tarea | Dependencia |
|------|-------|-------------|
| Mañana | Panel lateral con score y checklist | Layout listo |
| Mediodía | Subida de archivos desde frontend | Panel listo |
| Tarde | Preview de imágenes + análisis visual | Subida funcional |
| Noche | Vista de expediente generado | Generate endpoint |

**Entregable:** Usuario puede chatear, subir foto, ver score y generar expediente.

### Sábado 13 — Pulido y Demo

| Hora | Tarea | Dependencia |
|------|-------|-------------|
| Mañana | Vista de contrarespuesta + PDF | Todo lo anterior |
| Mediodía | Pulir UI, estados de error/loading | Funcionalidad completa |
| Tarde | Ensayo de demo + bugfixing | UI pulida |

**Entregable:** Demo completa funcional con PDF descargable.

---

## 3. Tareas de Frontend — Especificaciones Técnicas

### 3.1 Layout NotebookLM (3 Columnas)

#### Descripción
Implementar el layout de 3 columnas inspirado en Google NotebookLM. Este es el componente principal que define la experiencia de usuario de AutoclAIm.

#### Archivos a crear
```
src/
├── app/
│   ├── page.tsx                    # Página principal (orquestador)
│   ├── layout.tsx                  # Layout global (ya existe, modificar)
│   └── globals.css                 # Estilos globales (ya existe, modificar)
├── components/
│   ├── NotebookLayout.tsx          # Layout 3 columnas
│   ├── ConversationPanel.tsx       # Columna izquierda: preguntas IA
│   ├── ResponsePanel.tsx           # Columna central: respuestas + upload
│   └── Sidebar.tsx                 # Columna derecha: expediente vivo
```

#### Diseño visual
```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  CONVERSACIÓN │  │  RESPUESTAS  │  │   EXPEDIENTE     │   │
│  │               │  │              │  │                  │   │
│  │  IA: ¿Qué     │  │  Usuario:    │  │  Score: 51/100   │   │
│  │  pasó?        │  │  "Me llegó   │  │  ██████░░░░      │   │
│  │               │  │  una         │  │                  │   │
│  │  IA: ¿Tienes  │  │  cafetera    │  │  Checklist:      │   │
│  │  foto?        │  │  rota"       │  │  ✅ Problema     │   │
│  │               │  │              │  │  ✅ Foto prod.   │   │
│  │               │  │  [📎 Subir   │  │  ❌ Embalaje     │   │
│  │               │  │   foto]      │  │                  │   │
│  │               │  │              │  │  [Generar        │   │
│  │               │  │  [✏️ Escribe │  │   Expediente]    │   │
│  │               │  │   aquí...]   │  │                  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

#### Requisitos funcionales
- RF-01: El layout debe tener exactamente 3 columnas en desktop
- RF-02: Columna izquierda: muestra los mensajes del asistente (IA)
- RF-03: Columna central: input del usuario + área de subida de archivos
- RF-04: Columna derecha: panel de expediente vivo (score, checklist, evidencias)
- RF-05: Las columnas deben tener scroll independiente
- RF-06: La columna central debe ser más ancha que las laterales (proporción 1:2:1)
- RF-07: Debe tener un header con el logo/nombre "AutoclAIm"

#### Criterios de aceptación
- [ ] Las 3 columnas se renderizan correctamente en desktop (viewport >= 1024px)
- [ ] Cada columna tiene scroll independiente
- [ ] El header muestra "AutoclAIm" y es visible siempre
- [ ] La columna izquierda muestra los mensajes de la IA
- [ ] La columna central tiene un input de texto
- [ ] La columna derecha muestra score y checklist

#### Tests mínimos
- [ ] Renderizado: las 3 columnas existen en el DOM
- [ ] Responsive: en mobile (< 768px) las columnas se apilan verticalmente
- [ ] Scroll: cada columna hace scroll independientemente

---

### 3.2 ConversationPanel (Columna Izquierda)

#### Descripción
Panel que muestra la conversación generada por la IA. Cada mensaje del asistente aparece aquí, con streaming en tiempo real.

#### Archivo: `src/components/ConversationPanel.tsx`

#### Props
```typescript
interface ConversationPanelProps {
  messages: Array<{ role: "assistant"; content: string; timestamp: string }>;
  isStreaming: boolean;
  currentStreamText: string;
}
```

#### Requisitos funcionales
- RF-08: Muestra los mensajes del asistente en orden cronológico
- RF-09: Soporta streaming: el texto actual aparece carácter por carácter
- RF-10: Muestra un indicador "escribiendo..." cuando `isStreaming` es true
- RF-11: Auto-scroll al último mensaje
- RF-12: Los mensajes tienen formato de burbuja de chat (estilo asistente)

#### Criterios de aceptación
- [ ] Los mensajes se muestran en orden cronológico
- [ ] El texto en streaming se actualiza sin saltos
- [ ] El indicador "escribiendo..." aparece durante el streaming
- [ ] Auto-scroll funciona correctamente
- [ ] Las burbujas tienen estilo diferenciado (asistente)

#### Tests mínimos
- [ ] Renderizado con 0 mensajes: muestra estado vacío
- [ ] Renderizado con mensajes: todos son visibles
- [ ] Streaming: el texto se actualiza sin perder el histórico

---

### 3.3 ResponsePanel (Columna Central)

#### Descripción
Panel central donde el usuario escribe sus respuestas y sube archivos de evidencia.

#### Archivo: `src/components/ResponsePanel.tsx`

#### Props
```typescript
interface ResponsePanelProps {
  onSendMessage: (message: string) => void;
  onUploadFile: (file: File) => void;
  disabled: boolean;
  isUploading: boolean;
  evidence: Evidence[];
}
```

#### Subcomponentes a crear
- `FileUpload.tsx` — Botón de subida de archivos con preview
- `ImagePreview.tsx` — Preview de imagen subida con análisis MiMo

#### Requisitos funcionales
- RF-13: Input de texto multilínea con botón de envío
- RF-14: Envío con tecla Enter (sin Shift) y con botón
- RF-15: Botón de subida de archivos (input type="file")
- RF-16: Preview de la imagen subida antes de enviar
- RF-17: Indicador de progreso de subida
- RF-18: Deshabilitar input durante el streaming de la IA
- RF-19: Mostrar mensajes del usuario en burbujas (estilo usuario)

#### Criterios de aceptación
- [ ] El input de texto captura la entrada del usuario
- [ ] Enter envía el mensaje (sin Shift)
- [ ] El botón de subida abre el selector de archivos
- [ ] La preview de imagen se muestra después de subir
- [ ] El input se deshabilita durante el streaming
- [ ] Los mensajes del usuario se muestran en burbujas

#### Tests mínimos
- [ ] Input: escribir y enviar texto
- [ ] Upload: seleccionar archivo y ver preview
- [ ] Deshabilitado: input no acepta texto durante streaming

---

### 3.4 Sidebar (Columna Derecha — Expediente Vivo)

#### Descripción
Panel lateral que muestra el estado actual del expediente: score, checklist, evidencias aportadas y botón de generación.

#### Archivo: `src/components/Sidebar.tsx`

#### Subcomponentes a crear
- `ScoreGauge.tsx` — Indicador visual de score (barra de progreso circular o lineal)
- `Checklist.tsx` — Checklist visual con items completados/pendientes

#### Props
```typescript
interface SidebarProps {
  score: Score;
  checklist: ChecklistItem[];
  evidence: Evidence[];
  claimGenerated: boolean;
  onGenerateClaim: () => void;
  isGenerating: boolean;
}
```

#### Requisitos funcionales
- RF-20: Muestra el score total (0-100) con indicador visual (barra de progreso)
- RF-21: El score debe tener animación al actualizarse
- RF-22: Muestra el desglose del score por factor
- RF-23: Muestra el checklist con items marcados como ✅ (completado) o ❌ (pendiente)
- RF-24: Muestra el número de evidencias aportadas
- RF-25: Botón "Generar expediente" (visible solo si score > 0)
- RF-26: El botón se deshabilita durante la generación
- RF-27: Muestra "Caso sólido" si score >= 75

#### Criterios de aceptación
- [ ] El score se muestra con una barra de progreso visual
- [ ] El checklist muestra items completados y pendientes
- [ ] El botón "Generar expediente" aparece cuando hay datos
- [ ] La animación de score funciona al actualizarse
- [ ] El mensaje "Caso sólido" aparece con score >= 75

#### Tests mínimos
- [ ] Score 0: barra vacía, sin botón de generar
- [ ] Score 51: barra al 51%, botón visible
- [ ] Score 100: barra llena, mensaje "Caso sólido"
- [ ] Checklist: items done vs not done se muestran correctamente

---

### 3.5 ScoreGauge

#### Descripción
Indicador visual del score de solidez del caso. Debe ser intuitivo y tener animación.

#### Archivo: `src/components/ScoreGauge.tsx`

#### Props
```typescript
interface ScoreGaugeProps {
  score: number;
  maxScore?: number; // default 100
  size?: "sm" | "md" | "lg";
}
```

#### Comportamiento
- Score 0-24: Rojo (débil)
- Score 25-49: Naranja (en progreso)
- Score 50-74: Amarillo (moderado)
- Score 75-89: Verde claro (sólido)
- Score 90-100: Verde oscuro (muy sólido)

#### Requisitos funcionales
- RF-28: Animación de transición cuando el score cambia
- RF-29: Color cambia según el rango de score
- RF-30: Muestra el número exacto dentro del gauge

#### Criterios de aceptación
- [ ] El gauge se renderiza con el score correcto
- [ ] La animación de cambio de score es suave
- [ ] Los colores corresponden al rango definido

---

### 3.6 Checklist

#### Descripción
Lista visual de los items necesarios para un caso sólido, marcando cuáles están completados.

#### Archivo: `src/components/Checklist.tsx`

#### Props
```typescript
interface ChecklistProps {
  items: ChecklistItem[];
}
```

#### Requisitos funcionales
- RF-31: Muestra cada item con icono ✅ o ❌
- RF-32: Muestra el peso de cada item (importancia)
- RF-33: Los items completados aparecen en verde, pendientes en gris
- RF-34: Muestra el progreso: "X de Y completados"

#### Criterios de aceptación
- [ ] Todos los items del checklist se renderizan
- [ ] Los items completados tienen estilo verde
- [ ] Los items pendientes tienen estilo gris
- [ ] El contador "X de Y" es correcto

---

### 3.7 FileUpload

#### Descripción
Componente de subida de archivos con drag & drop y preview.

#### Archivo: `src/components/FileUpload.tsx`

#### Props
```typescript
interface FileUploadProps {
  onUpload: (file: File) => void;
  disabled: boolean;
  isUploading: boolean;
}
```

#### Requisitos funcionales
- RF-35: Botón para seleccionar archivo
- RF-36: Soporte para drag & drop (opcional pero deseable)
- RF-37: Acepta solo imágenes (image/*) y PDFs
- RF-38: Indicador de carga durante la subida
- RF-39: Validación de tamaño máximo (10MB)

#### Criterios de aceptación
- [ ] El botón de subida abre el selector de archivos
- [ ] Solo acepta imágenes y PDFs
- [ ] Muestra error si el archivo es > 10MB
- [ ] Muestra indicador de carga durante la subida

---

### 3.8 ImagePreview

#### Descripción
Preview de la imagen subida con el análisis de MiMo 2.5.

#### Archivo: `src/components/ImagePreview.tsx`

#### Props
```typescript
interface ImagePreviewProps {
  evidence: Evidence;
}
```

#### Requisitos funcionales
- RF-40: Muestra la imagen en miniatura
- RF-41: Muestra el análisis de IA debajo de la imagen
- RF-42: Botón para expandir la imagen (opcional)

#### Criterios de aceptación
- [ ] La imagen se muestra correctamente
- [ ] El análisis de IA se muestra debajo
- [ ] El componente es responsive

---

### 3.9 ClaimView

#### Descripción
Vista de la reclamación formal generada, con opción de descargar PDF.

#### Archivo: `src/components/ClaimView.tsx`

#### Props
```typescript
interface ClaimViewProps {
  claim: string;
  summary: string;
  timeline: TimelineEvent[];
  nextSteps: string[];
  onDownloadPDF: () => void;
}
```

#### Requisitos funcionales
- RF-43: Muestra la reclamación formal en formato de documento
- RF-44: Muestra el resumen del caso
- RF-45: Muestra la cronología de eventos
- RF-46: Muestra los siguientes pasos
- RF-47: Botón "Descargar PDF" que renderiza en cliente

#### Criterios de aceptación
- [ ] La reclamación se muestra con formato de documento
- [ ] La cronología se muestra ordenada
- [ ] El botón de PDF está presente y funcional

---

### 3.10 CompanyReply

#### Descripción
Vista para pegar la respuesta negativa de la empresa y ver el análisis.

#### Archivo: `src/components/CompanyReply.tsx`

#### Props
```typescript
interface CompanyReplyProps {
  onAnalyze: (replyText: string) => void;
  analysis: CompanyResponse | null;
  isAnalyzing: boolean;
}
```

#### Requisitos funcionales
- RF-48: Textarea para pegar la respuesta de la empresa
- RF-49: Botón "Analizar respuesta"
- RF-50: Muestra el análisis con puntos débiles destacados
- RF-51: Muestra la recomendación
- RF-52: Botón "Generar contrarespuesta"

#### Criterios de aceptación
- [ ] El textarea acepta el texto de la respuesta
- [ ] El análisis se muestra después de enviar
- [ ] Los puntos débiles se muestran destacados
- [ ] El botón de contrarespuesta está presente

---

### 3.11 PDFDownload

#### Descripción
Botón de descarga de PDF que renderiza el expediente en el cliente usando `@react-pdf/renderer`.

#### Archivo: `src/components/PDFDownload.tsx`

#### Dependencia
- `@react-pdf/renderer` (pendiente de instalar)

#### Props
```typescript
interface PDFDownloadProps {
  claim: string;
  summary: string;
  timeline: TimelineEvent[];
  evidence: Evidence[];
  score: Score;
}
```

#### Requisitos funcionales
- RF-53: Genera PDF en el navegador (sin llamada al servidor)
- RF-54: El PDF incluye: encabezado, resumen, cronología, evidencias, score
- RF-55: Botón de descarga con nombre de archivo descriptivo
- RF-56: Indicador de generación mientras se renderiza

#### Criterios de aceptación
- [ ] El PDF se genera y descarga al hacer clic
- [ ] El PDF contiene toda la información del expediente
- [ ] El nombre del archivo incluye el ID de sesión

#### Tests mínimos
- [ ] Generación: el PDF se descarga sin errores
- [ ] Contenido: el PDF contiene texto legible

---

### 3.12 Integración con API (Conexión Frontend-Backend)

#### Descripción
Capa de comunicación entre el frontend y los endpoints de la API.

#### Archivo a crear: `src/lib/api.ts`

#### Funciones a implementar

```typescript
// Crear sesión
async function createSession(): Promise<{ sessionId: string; firstMessage: string }>

// Enviar mensaje (con streaming)
async function sendMessage(sessionId: string, message: string): Promise<ReadableStream>

// Obtener estado
async function getSessionState(sessionId: string): Promise<SessionState>

// Subir archivo
async function uploadEvidence(sessionId: string, file: File): Promise<UploadResponse>

// Generar reclamación
async function generateClaim(sessionId: string): Promise<ClaimResponse>

// Analizar respuesta de empresa
async function analyzeCompanyReply(sessionId: string, reply: string): Promise<CompanyResponse>

// Generar contrarespuesta
async function generateCounterReply(sessionId: string): Promise<CounterResponse>
```

#### Requisitos funcionales
- RF-57: Todas las llamadas API usan fetch nativo
- RF-58: El streaming se consume con `ReadableStream.getReader()`
- RF-59: Manejo de errores con try/catch y mensajes al usuario
- RF-60: Timeout de 30 segundos para llamadas sin streaming
- RF-61: Las URLs de la API son relativas (mismo origen)

#### Criterios de aceptación
- [ ] `createSession()` devuelve sessionId válido
- [ ] `sendMessage()` devuelve un stream legible
- [ ] `getSessionState()` devuelve el estado completo
- [ ] `uploadEvidence()` envía multipart/form-data correctamente
- [ ] Los errores de red se manejan gracefulmente

#### Tests mínimos
- [ ] Test de integración: flujo completo crear → mensaje → estado
- [ ] Test de integración: subida de archivo
- [ ] Test: error handling con servidor caído

---

### 3.13 Página Principal (page.tsx)

#### Descripción
Página principal que orquesta todos los componentes y gestiona el estado global de la aplicación.

#### Archivo: `src/app/page.tsx` (modificar el existente)

#### Estado global (useState / useReducer)
```typescript
interface AppState {
  sessionId: string | null;
  messages: Message[];
  score: Score;
  checklist: ChecklistItem[];
  evidence: Evidence[];
  extractedData: ExtractedData;
  claimGenerated: boolean;
  companyResponse: CompanyResponse | null;
  isStreaming: boolean;
  isUploading: boolean;
  isGenerating: boolean;
  error: string | null;
}
```

#### Requisitos funcionales
- RF-62: Al cargar, crea una sesión automáticamente
- RF-63: Gestiona el estado de la aplicación
- RF-64: Pasa props a los componentes hijos
- RF-65: Maneja errores globales
- RF-66: Muestra el layout NotebookLM

#### Criterios de aceptación
- [ ] Al cargar la página, se crea una sesión
- [ ] El estado se actualiza correctamente con cada acción
- [ ] Los errores se muestran al usuario
- [ ] El layout de 3 columnas se renderiza

---

## 4. Dependencias entre Tareas

```
Layout NotebookLM (3 columnas)
├── ConversationPanel (columna izquierda)
│   └── Streaming de mensajes
├── ResponsePanel (columna central)
│   ├── Input de texto
│   ├── FileUpload
│   │   └── ImagePreview
│   └── Mensajes del usuario
└── Sidebar (columna derecha)
    ├── ScoreGauge
    ├── Checklist
    └── Botón generar

ClaimView ─── PDFDownload
CompanyReply ─── CounterReply

api.ts (capa de integración)
└── Todos los componentes dependen de esta capa
```

---

## 5. Prioridades para la Demo

### Crítico (sin esto no hay demo)
1. **Layout NotebookLM** — La base visual de la app
2. **Streaming de mensajes** — La interacción principal
3. **Input de texto + envío** — El usuario debe poder responder
4. **Panel lateral con score** — Muestra el progreso del caso
5. **Checklist visual** — Muestra qué falta
6. **Subida de imágenes** — Parte clave de la demo
7. **Generación de expediente** — El entregable final

### Importante (mejora la demo)
8. **Preview de imágenes con análisis MiMo**
9. **Animación de score**
10. **Vista de contrarespuesta**
11. **PDF descargable**

### Nice to have
12. **Drag & drop en upload**
13. **Modo oscuro**
14. **Responsive mobile**

---

## 6. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| No terminar el layout a tiempo | Crítico | Priorizar funcionalidad sobre estética. Usar CSS simple. |
| Streaming no funciona en frontend | Alto | Norbert ayuda con la integración del Vercel AI SDK |
| PDF no se renderiza bien | Medio | Fallback: "Imprimir como PDF" del navegador |
| Subida de archivos sin Supabase | Medio | Usar endpoint mock de Norbert (ya implementado) |
| Tiempo insuficiente para todo | Alto | Priorizar items críticos. Lo demás es bonus. |

---

## 7. Notas Finales

- **Supabase se obvia completamente** para el MVP. Todo funciona en memoria.
- **Norbert** está disponible para ayudar con la integración frontend-backend si es necesario.
- **Demo backup**: Si la app no está estable, tener una demo grabada.
- **Comunicación**: Cualquier bloqueo en frontend debe reportarse inmediatamente para redistribuir tareas.

---

*Documento generado el 11 de Junio de 2026 — Transición de roles Jose → Dani para AutoclAIm Hackathon v2*