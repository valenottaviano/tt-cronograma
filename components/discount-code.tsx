"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface DiscountCodeProps {
  code: string;
}

export function DiscountCode({ code }: DiscountCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="w-full flex items-center justify-between bg-yellow-400/10 hover:bg-yellow-400/20 border border-dashed border-yellow-400/20 px-4 py-2 rounded-lg font-medium text-lg text-yellow-200 transition-colors mb-2 group text-left"
    >
      <span>{code}</span>
      <div className="flex items-center gap-2 text-sm opacity-70 group-hover:opacity-100 transition-opacity">
        {copied ? (
          <>
            <span className="text-xs">¡Copiado!</span>
            <Check className="w-4 h-4" />
          </>
        ) : (
          <>
            <span className="text-xs hidden group-hover:inline">Copiar</span>
            <Copy className="w-4 h-4" />
          </>
        )}
      </div>
    </button>
  );
}
