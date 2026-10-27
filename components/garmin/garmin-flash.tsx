'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { LINK_RESULT_MESSAGES } from '@/lib/linked-app-messages';

const MESSAGES = LINK_RESULT_MESSAGES.garmin;

/** El resultado de volver de Garmin (`?garmin=`): se avisa una vez y se limpia la URL. */
export function GarminFlash({ result }: { result?: string }) {
  useEffect(() => {
    const message = result ? MESSAGES[result] : undefined;
    if (!message) return;
    if (message.kind === 'message') toast(message.text);
    else toast[message.kind](message.text);
    const url = new URL(window.location.href);
    url.searchParams.delete('garmin');
    window.history.replaceState(window.history.state, '', url);
  }, [result]);

  return null;
}
