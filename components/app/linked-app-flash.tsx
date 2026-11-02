'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { LINK_RESULT_MESSAGES } from '@/lib/linked-app-messages';
import type { LinkedApp } from '@/lib/oauth-return';

/** El resultado de volver de vincular una app (`?garmin=`, `?coros=`): se avisa una vez y se limpia la URL. */
export function LinkedAppFlash({ app, result }: { app: LinkedApp; result?: string }) {
  useEffect(() => {
    const message = result ? LINK_RESULT_MESSAGES[app][result] : undefined;
    if (!message) return;
    if (message.kind === 'message') toast(message.text);
    else toast[message.kind](message.text);
    const url = new URL(window.location.href);
    url.searchParams.delete(app);
    window.history.replaceState(window.history.state, '', url);
  }, [app, result]);

  return null;
}
