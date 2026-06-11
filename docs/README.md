# AutoclAIm — Documentación del Proyecto

> **Hackathon v2** — 9 al 13 de Junio de 2026  
> **Equipo:** Norbert (Backend), ~~Jose~~ → **Dani** (Frontend), Daniel (Coordinación)
> **Rama activa:** `features/dani`

---

## Documentos

| Documento | Descripción |
|-----------|-------------|
| [`01-implementaciones-backend-norbert.md`](./01-implementaciones-backend-norbert.md) | Documentación completa del backend implementado por Norbert. Incluye descripción, requisitos, criterios de aceptación y tests mínimos para cada componente. |
| [`02-plan-frontend-dani.md`](./02-plan-frontend-dani.md) | Plan de trabajo para el frontend, asumido por Dani tras la baja de Jose. Incluye especificaciones técnicas detalladas de todos los componentes, dependencias, prioridades y riesgos. |

---

## Estado del Proyecto

| Área | Responsable | Progreso |
|------|-------------|----------|
| Backend (API + Lógica) | Norbert | 🟡 ~65% (4 endpoints completos, 3 stubs) |
| Frontend (UI + Integración) | Dani | ✅ ~95% (12 componentes, orquestador, API client) |
| Documentación | Dani | ✅ Completa |
| Coordinación + Demo | Daniel | 🟡 Pendiente |

## Stack Técnico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js 15 (App Router) | ^15.5.19 | Framework fullstack |
| React | ^19.1.0 | UI |
| TypeScript | ^5.8.0 | Tipado estricto |
| Vercel AI SDK (`ai`) | ^6.0.199 | Streaming (pendiente integración real) |

## Decisiones Arquitectónicas

1. **Supabase se obvia para el MVP** — Las sesiones se gestionan en memoria (`Map`). Se integrará post-hackathon.
2. **Dani asume el rol de Jose** — Jose no pudo continuar con el frontend.
3. **PDF generado en cliente** — Se usa `window.print()` para generar PDF sin dependencias externas.
4. **Streaming vía ReadableStream** — El backend usa TextEncoder para enviar bytes correctamente al frontend.

## Componentes Frontend

| Componente | Archivo | Descripción |
|-----------|---------|-------------|
| NotebookLayout | `src/components/NotebookLayout.tsx` | Layout 3 columnas tipo NotebookLM |
| ConversationPanel | `src/components/ConversationPanel.tsx` | Columna izquierda: mensajes IA con streaming |
| ResponsePanel | `src/components/ResponsePanel.tsx` | Columna central: input de texto + upload |
| Sidebar | `src/components/Sidebar.tsx` | Columna derecha: score, checklist, botón generar |
| ScoreGauge | `src/components/ScoreGauge.tsx` | Gauge circular animado con colores por rango |
| Checklist | `src/components/Checklist.tsx` | Checklist visual con items completados/pendientes |
| FileUpload | `src/components/FileUpload.tsx` | Subida de archivos con drag & drop |
| ImagePreview | `src/components/ImagePreview.tsx` | Preview de imagen con análisis IA |
| ClaimView | `src/components/ClaimView.tsx` | Vista de reclamación generada + PDF |
| CompanyReply | `src/components/CompanyReply.tsx` | Análisis de respuesta de empresa + contrarespuesta |

---

*Última actualización: 12 de Junio de 2026*