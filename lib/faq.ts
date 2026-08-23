import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Las preguntas frecuentes son archivos Markdown del repo, no filas en una base.
 * El editor es quien tiene acceso al repositorio, así que git alcanza como CMS:
 * historial, revisión y rollback gratis, y el contenido se sirve desde el edge
 * sin depender de que el VPS del coach esté arriba.
 *
 * Para agregar una: crear `content/faq/<slug>.md` con el frontmatter de abajo.
 * No hay que tocar código.
 */

/** Quién puede ver el artículo. */
export type Audience = "public" | "athlete" | "both";

export interface FaqArticle {
  /** Nombre del archivo sin extensión; es la URL. */
  slug: string;
  title: string;
  /** Resumen de una línea que se muestra en el listado. */
  description: string;
  category: string;
  audience: Audience;
  /** Menor primero dentro de su categoría. */
  order: number;
  /** ISO (YYYY-MM-DD) o null. */
  updated: string | null;
  /** Cuerpo en Markdown. */
  content: string;
}

const DIR = path.join(process.cwd(), "content", "faq");
const AUDIENCES: Audience[] = ["public", "athlete", "both"];

/**
 * Un error de frontmatter rompe el build a propósito, nombrando el archivo y el
 * campo. Es preferible a publicar un artículo sin título o con una audiencia mal
 * escrita que lo dejaría invisible sin que nadie se entere.
 */
function parse(file: string): FaqArticle {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const { data, content } = matter(raw);
  const where = `content/faq/${file}`;

  const title = typeof data.title === "string" ? data.title.trim() : "";
  if (!title) throw new Error(`${where}: falta "title" en el frontmatter`);

  const description = typeof data.description === "string" ? data.description.trim() : "";
  if (!description) throw new Error(`${where}: falta "description" (el resumen del listado)`);

  const category = typeof data.category === "string" ? data.category.trim() : "";
  if (!category) throw new Error(`${where}: falta "category"`);

  const audience = (data.audience ?? "both") as Audience;
  if (!AUDIENCES.includes(audience)) {
    throw new Error(`${where}: "audience" inválida ("${data.audience}"). Válidas: ${AUDIENCES.join(", ")}`);
  }

  if (!content.trim()) throw new Error(`${where}: el artículo está vacío`);

  return {
    slug: file.replace(/\.mdx?$/, ""),
    title,
    description,
    category,
    audience,
    order: typeof data.order === "number" ? data.order : 999,
    updated: normalizeDate(data.updated, where),
    content,
  };
}

/**
 * YAML convierte una fecha sin comillas (`updated: 2026-08-23`) en un `Date`,
 * no en un string. Se aceptan las dos formas y se normaliza a `YYYY-MM-DD`
 * tomando los componentes UTC: el `Date` viene a medianoche UTC, así que usar
 * los getters locales correría la fecha un día hacia atrás en Argentina.
 */
function normalizeDate(value: unknown, where: string): string | null {
  if (value == null) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new Error(`${where}: "updated" no es una fecha válida`);
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    const v = value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      throw new Error(`${where}: "updated" debe ser YYYY-MM-DD (recibido: "${v}")`);
    }
    return v;
  }
  throw new Error(`${where}: "updated" debe ser una fecha YYYY-MM-DD`);
}

/** Se lee una vez por proceso: son archivos del bundle, no cambian en runtime. */
let cache: FaqArticle[] | null = null;

function all(): FaqArticle[] {
  if (cache) return cache;
  const files = fs.existsSync(DIR)
    ? fs.readdirSync(DIR).filter((f) => /\.mdx?$/.test(f))
    : [];
  cache = files
    .map(parse)
    .sort((a, b) => a.category.localeCompare(b.category, "es") || a.order - b.order || a.title.localeCompare(b.title, "es"));
  return cache;
}

function visible(article: FaqArticle, isAthlete: boolean): boolean {
  if (article.audience === "both") return true;
  if (article.audience === "public") return true;
  return isAthlete; // audience === "athlete"
}

/**
 * Artículos que puede ver quien mira. Un visitante sin sesión no ve —ni puede
 * adivinar desde el listado— los que son sólo para atletas.
 */
export function getArticles(isAthlete: boolean): FaqArticle[] {
  return all().filter((a) => visible(a, isAthlete));
}

export function getArticle(slug: string, isAthlete: boolean): FaqArticle | null {
  const found = all().find((a) => a.slug === slug);
  if (!found) return null;
  return visible(found, isAthlete) ? found : null;
}

/** Artículos agrupados por categoría, respetando el orden de `getArticles`. */
export function groupByCategory(articles: FaqArticle[]): { category: string; articles: FaqArticle[] }[] {
  const groups: { category: string; articles: FaqArticle[] }[] = [];
  for (const a of articles) {
    const last = groups[groups.length - 1];
    if (last && last.category === a.category) last.articles.push(a);
    else groups.push({ category: a.category, articles: [a] });
  }
  return groups;
}
