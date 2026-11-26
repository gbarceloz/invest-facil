"use client";

import { useEffect, useRef } from "react";

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
 * Botão oficial do Google Identity Services. Sem client ID configurado, o
 * componente não renderiza nada; o login por e-mail continua funcionando.
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
    };

    const existing = document.querySelector<HTMLScriptElement>("script[data-google-gsi]");
    if (window.google?.accounts?.id) {
      render();
    } else if (existing) {
      existing.addEventListener("load", render, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset.googleGsi = "true";
      script.addEventListener("load", render, { once: true });
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      existing?.removeEventListener("load", render);
    };
  }, [text]);

  if (!CLIENT_ID) return null;

  return (
    <div className="space-y-4">
      <div ref={container} className="flex min-h-[40px] justify-center" />
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
