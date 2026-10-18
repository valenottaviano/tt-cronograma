/**
 * Las rutas de la app del atleta (las que llevan la barra de pestañas). Vive
 * aparte de `athlete-app.ts` porque lo importa el layout raíz, que es de cliente.
 */
export const APP_ROUTES = ['/inicio', '/entrenamiento', '/mis-carreras', '/perfil', '/videos'] as const;

export function isAppRoute(pathname: string | null | undefined): boolean {
  return !!pathname && APP_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}
