"use client";

import { useEffect, useRef, useState } from "react";

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Typewriter({
  text,
  speed = 14,
  enabled = true,
  className,
}: {
  text: string;
  speed?: number;
  enabled?: boolean;
  className?: string;
}) {
  const reduced = useRef(false);
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    reduced.current = prefersReducedMotion();
    if (!enabled || reduced.current) {
      setVisible(text.length);
      return;
    }
    setVisible(0);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisible(index);
      if (index >= text.length) window.clearInterval(timer);
    }, Math.max(8, speed));
    return () => window.clearInterval(timer);
  }, [text, speed, enabled]);

  const done = visible >= text.length;

  return (
    <span className={className}>
      <span aria-hidden="true">
        {text.slice(0, visible)}
        {!done && <span className="onb-caret text-accent">▍</span>}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
