import type { AthleteProfile } from '@/lib/coachApi';

/**
 * Qué datos le faltan al perfil del atleta, en el orden en que se muestran.
 * `birthDate` ausente (no `null`) es un panel que todavía no tiene el campo: no
 * se le pide al atleta algo que no podría guardar.
 */
export function missingProfileFields(profile: AthleteProfile): string[] {
  const missing: string[] = [];
  if (profile.birthDate === null) missing.push('fecha de nacimiento');
  if (!profile.email) missing.push('email');
  if (!profile.phone) missing.push('teléfono');
  if (!profile.avatarKey) missing.push('foto de perfil');
  return missing;
}

/** «email, teléfono y foto de perfil». */
export function listInSpanish(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}
