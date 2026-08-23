# Preguntas frecuentes (`/faq`)

Sección de preguntas frecuentes en formato blog: un índice agrupado por
categoría y una página por artículo. Está en el sitio público **y** en la
sección del atleta, con una sola URL.

## Por qué son archivos y no filas en la base del coach

El criterio que decide es **quién edita**. La base de `roberto-parodi` existe
para que Roberto administre sin depender de un desarrollador; estas preguntas
las escribe quien tiene acceso al repo. Meterlas en Postgres obligaría a un
modelo, una migración, un endpoint y una pantalla en el panel que Roberto no
usaría — y el contenido se seguiría editando desde el repo igual.

Además:

- **Modo de falla.** Si se cae el VPS, el sitio público sigue funcionando y sólo
  se rompe la planilla del atleta. Con las FAQ en Postgres, una caída se llevaría
  también la ayuda — justo lo que alguien lee *cuando algo no le anda*.
- **Offline.** La app es una PWA; las páginas estáticas quedan cacheadas y se
  leen sin señal. Un fetch al VPS, no.
- **Historial.** Git da diff, revisión y rollback sin construir nada.

Esto no rompe la convención del proyecto, la sigue: los datos de entrenamiento
viven en Postgres y el contenido del sitio (carreras, beneficios, productos,
tracks) nunca estuvo ahí.

**Qué invalidaría esta decisión:** que Roberto —o alguien sin acceso al repo—
necesite editarlas, o que cambien tan seguido que un deploy por edición moleste.
En ese caso, Firestore, que ya está andando y ya tiene panel de admin.

## Agregar una pregunta

Crear `content/faq/<slug>.md`. El nombre del archivo es la URL. No hay que
tocar código.

```yaml
---
title: ¿Cómo funciona la cuota?
description: Qué incluye, cómo se paga y desde cuándo corre.
category: Cuota y pagos
audience: both        # public | athlete | both
order: 10             # menor primero, dentro de la categoría
updated: 2026-08-23   # opcional, YYYY-MM-DD
---

El cuerpo, en Markdown (GFM: tablas, listas de tareas, etc.).
```

`title`, `description`, `category` y el cuerpo son obligatorios: si falta alguno
**el build falla**, nombrando el archivo y el campo. Es a propósito — mejor un
error claro que publicar un artículo roto o invisible.

## Audiencias

| `audience` | Visitante | Atleta con sesión |
|---|---|---|
| `public` | ✅ | ✅ |
| `both` (default) | ✅ | ✅ |
| `athlete` | ❌ | ✅ |

El filtro se aplica **en el listado y también en la página del artículo**: sin
sesión, un artículo interno da 404 aunque se adivine la URL. Los internos además
salen con `robots: noindex`.

## Markdown, no MDX

Alcanza para texto, links, listas y tablas. MDX se justificaría sólo si una
respuesta necesitara un componente interactivo (por ejemplo incrustar el diálogo
de Credencial TT). Como el frontmatter y el cuerpo no cambiarían, migrar después
es directo.

Los estilos del cuerpo son la clase `.prose-tt` en `app/globals.css`, escrita a
mano en vez de sumar `@tailwindcss/typography`: son pocos elementos y así queda
alineada con la identidad del sitio en lugar de pelearse con los defaults del
plugin.

## Cuidado con los lockfiles

El repo mantiene `pnpm-lock.yaml` **y** `package-lock.json`, y Vercel usa el de
pnpm. Si agregás una dependencia sólo con npm, el build de producción falla
(ya pasó: ver el commit `fix: update pnpm-lock.yaml with html-to-image`).
Actualizá los dos:

```bash
npm install <paquete>
pnpm install --lockfile-only
```
