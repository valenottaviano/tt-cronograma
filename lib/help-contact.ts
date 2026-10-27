/** El WhatsApp del botón de ayuda de la app (Carolina, que también resuelve las contraseñas). */
export const HELP_WHATSAPP = '5493815816540';

export function helpWhatsappUrl(text: string): string {
  return `https://wa.me/${HELP_WHATSAPP}?text=${encodeURIComponent(text)}`;
}
