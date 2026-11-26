"use client";

import { useEffect, useState } from "react";
import { centsToBrlInput, parseBrlToCents } from "@/lib/onboarding";

export function CurrencyField({
  id,
  value,
  onChange,
  autoFocus = false,
  label,
}: {
  id: string;
  value: number | null;
  onChange: (cents: number | null) => void;
  autoFocus?: boolean;
  label: string;
}) {
  const [text, setText] = useState(() => centsToBrlInput(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(centsToBrlInput(value));
  }, [value, focused]);

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="onb-input-shell flex items-center gap-2 rounded-xl px-3.5 py-3">
        <span className="text-[13px] font-bold text-accent">R$</span>
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          autoFocus={autoFocus}
          value={text}
          placeholder="0,00"
          onChange={(event) => {
            const next = event.target.value;
            setText(next);
            onChange(parseBrlToCents(next));
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            const cents = parseBrlToCents(text);
            onChange(cents);
            setText(centsToBrlInput(cents));
          }}
          className="w-full bg-transparent text-[18px] font-medium tracking-[-0.01em] text-neutral-50 outline-none placeholder:text-neutral-600"
        />
      </div>
      <p className="mt-1.5 text-[10px] text-neutral-600">
        Use vírgula para centavos. Ex.: 1.500,00
      </p>
    </div>
  );
}
