"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const SELECTOR = "[data-reveal-auto], [data-stagger-auto]";

/**
 * Liga o reveal de scroll nas páginas internas sem obrigar cada card a ser um
 * componente cliente. Observa os elementos marcados com `data-reveal-auto` ou
 * `data-stagger-auto` e também os que chegam depois (dados assíncronos).
 */
export function AutoReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = new WeakSet<Element>();

    const reveal = (element: Element) => {
      element.setAttribute("data-visible", "true");
    };

    let observer: IntersectionObserver | null = null;
    if (!reduce) {
      const handle: IntersectionObserverCallback = (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          observer?.unobserve(entry.target);
        }
      };
      observer = new IntersectionObserver(handle, {
        threshold: 0.12,
        rootMargin: "0px 0px -6% 0px",
      });
    }

    const register = (root: ParentNode) => {
      root.querySelectorAll(SELECTOR).forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        if (observer) observer.observe(element);
        else reveal(element);
      });
    };

    register(document);

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "attributes") {
          const element = record.target;
          if (element instanceof Element && !seen.has(element)) {
            seen.add(element);
            if (observer) observer.observe(element);
            else reveal(element);
          }
          continue;
        }
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches(SELECTOR) && !seen.has(node)) {
            seen.add(node);
            if (observer) observer.observe(node);
            else reveal(node);
          }
          register(node);
        }
      }
    });
    mutations.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-reveal-auto", "data-stagger-auto"],
    });

    return () => {
      observer?.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
