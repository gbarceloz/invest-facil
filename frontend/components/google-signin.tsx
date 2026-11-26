"use client";

import { useEffect, useRef, useState } from "react";

type CredentialResponse = { credential?: string };

type GoogleIdentity = {
  initialize: (options: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: string;
      size?: string;
      text?: string;
      shape?: string;
      width?: number;
      logo_alignment?: string;
    },
  ) => void;
  prompt?: () => void;
};

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdentity } };
  }
}

const CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
  "13778080906-ijof2kbic70817sngcs783ga24b7pgqf.apps.googleusercontent.com";

/**
 * Botão oficial do Google Identity Services. Se o script carregar mas não
 * conseguir renderizar (origem não autorizada, bloqueio de terceiros etc.),
 * mostramos um botão alternativo para o usuário ao menos ver a opção e
 * receber uma orientação clara para usar o e-mail.
 */
export function GoogleSignIn({
  onCredential,
  text = "continue_with",
}: {
  onCredential: (credential: string) => void;
  text?: "continue_with" | "signin_with" | "signup_with";
}) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onCredential);
  callback.current = onCredential;
  const [unavailable, setUnavailable] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    const render = () => {
      if (cancelled || !container.current || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        auto_select: false,
        cancel_on_tap_outside: true,
        callback: (response) => {
          if (response.credential) callback.current(response.credential);
        },
      });
      container.current.replaceChildren();
      window.google.accounts.id.renderButton(container.current, {
        theme: "outline",
        size: "large",
        text,
        shape: "pill",
        width: 320,
        logo_alignment: "left",
      });
      window.setTimeout(() => {
        if (!cancelled && container.current?.childElementCount) {
          setUnavailable(false);
        }
      }, 300);
    };

    const existing = document.querySelector<HTMLScriptElement>("script[data-google-gsi]");
    if (window.google?.accounts?.id) {
      render();
    } else if (existing) {
      existing.addEventListener("load", render, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client?hl=pt-BR";
      script.async = true;
      script.defer = true;
      script.dataset.googleGsi = "true";
      script.addEventListener("load", render, { once: true });
      document.head.appendChild(script);
    }

    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled && !container.current?.childElementCount) {
        setUnavailable(true);
      }
    }, 2500);

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      existing?.removeEventListener("load", render);
    };
  }, [text]);

  if (!CLIENT_ID) return null;

  function handleFallback() {
    setNotice(null);
    if (window.google?.accounts?.id?.prompt) {
      window.google.accounts.id.prompt();
      setNotice("Se o Google não abrir, use o e-mail abaixo.");
    } else {
      setNotice("Google indisponível neste domínio. Use o e-mail abaixo.");
    }
  }

  return (
    <div className="space-y-4">
      <div ref={container} className="flex min-h-[40px] justify-center" />
      {unavailable && (
        <button type="button" onClick={handleFallback} className="btn-secondary w-full text-[12px]">
          Continuar com Google
        </button>
      )}
      {notice && (
        <p className="text-center text-[10px] leading-4 text-neutral-500" role="status">
          {notice}
        </p>
      )}
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
          ou
        </span>
        <span className="h-px flex-1 bg-white/10" />
      </div>
    </div>
  );
}
