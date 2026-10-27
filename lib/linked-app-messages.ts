import type { LinkedApp } from './oauth-return';

export type LinkResultMessage = { kind: 'success' | 'error' | 'message'; text: string };

/** Lo que se le dice al atleta al volver de vincular Strava o Garmin, según el resultado. */
export const LINK_RESULT_MESSAGES: Record<LinkedApp, Record<string, LinkResultMessage>> = {
  strava: {
    connected: { kind: 'success', text: '¡Listo! Vinculaste tu Strava. Estamos trayendo tus actividades.' },
    cancelled: { kind: 'message', text: 'No se vinculó Strava. Podés hacerlo cuando quieras.' },
    taken: { kind: 'error', text: 'Esa cuenta de Strava ya está vinculada a otro atleta.' },
    scope: { kind: 'error', text: 'Para ver tus estadísticas, dejá marcado el permiso de ver tus actividades.' },
    expired: { kind: 'error', text: 'El enlace venció o ya se usó. Volvé a la app y probá vincular de nuevo.' },
    error: { kind: 'error', text: 'No pudimos vincular Strava. Probá de nuevo en un momento.' },
  },
  garmin: {
    connected: { kind: 'success', text: '¡Listo! Vinculaste Garmin Connect. Ya podés mandar tus entrenamientos al reloj.' },
    cancelled: { kind: 'message', text: 'No se vinculó Garmin Connect. Podés hacerlo cuando quieras.' },
    taken: { kind: 'error', text: 'Esa cuenta de Garmin ya está vinculada a otro atleta.' },
    permission: {
      kind: 'error',
      text: 'Quedó vinculado, pero sin el permiso de importar entrenamientos. Activalo para Grupo TT en Garmin Connect.',
    },
    expired: { kind: 'error', text: 'El enlace venció o ya se usó. Volvé a la app y probá vincular de nuevo.' },
    error: { kind: 'error', text: 'No pudimos vincular Garmin Connect. Probá de nuevo en un momento.' },
  },
};
