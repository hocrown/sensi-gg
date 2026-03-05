'use client';

import { useState } from 'react';

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: ignore
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 rounded-lg border border-deep-periwinkle/50 text-text-secondary text-xs hover:text-cloud-white hover:border-text-muted transition-colors"
    >
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  );
}
