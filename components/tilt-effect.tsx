"use client";

import { useEffect } from "react";

// Deliberately gentle: a few degrees reads as depth without the page shifting
// around under the cursor.
const MAX_TILT_DEGREES = 3;
const HOVER_LIFT_PX = -3;

/**
 * Drives the depth effects declared in globals.css:
 *
 * - `.tilt-card` rotates slightly toward the pointer and settles flat on exit
 * - `.reveal-3d` eases into place the first time it scrolls into view
 *
 * Both use event delegation / a single observer, so cards rendered later (route
 * changes, filtered lists) are picked up without re-registering listeners.
 * Everything is skipped for coarse pointers and reduced-motion users.
 */
export function TiltEffect() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let activeCard: HTMLElement | null = null;

    function resetCard(card: HTMLElement) {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--tilt-lift", "0px");
      card.style.setProperty("--tilt-glow", "0");
    }

    function handlePointerMove(pointerEvent: PointerEvent) {
      const target = pointerEvent.target as HTMLElement | null;
      const card = target?.closest<HTMLElement>(".tilt-card:not(.tilt-none)") ?? null;

      if (card !== activeCard) {
        if (activeCard) resetCard(activeCard);
        activeCard = card;
      }

      if (!card) return;

      const bounds = card.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      // -0.5 .. 0.5 relative to the centre of the card.
      const offsetX = (pointerEvent.clientX - bounds.left) / bounds.width - 0.5;
      const offsetY = (pointerEvent.clientY - bounds.top) / bounds.height - 0.5;

      card.style.setProperty("--tilt-y", `${(offsetX * MAX_TILT_DEGREES * 2).toFixed(2)}deg`);
      card.style.setProperty("--tilt-x", `${(-offsetY * MAX_TILT_DEGREES * 2).toFixed(2)}deg`);
      card.style.setProperty("--tilt-lift", `${HOVER_LIFT_PX}px`);
      card.style.setProperty("--tilt-glow", "1");
      card.style.setProperty("--tilt-glow-x", `${((offsetX + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty("--tilt-glow-y", `${((offsetY + 0.5) * 100).toFixed(1)}%`);
    }

    function handlePointerLeave() {
      if (activeCard) resetCard(activeCard);
      activeCard = null;
    }

    if (hasFinePointer && !prefersReducedMotion) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      document.addEventListener("pointerleave", handlePointerLeave);
    }

    // Older engines without IntersectionObserver would otherwise leave every
    // reveal stuck at opacity 0.
    if (typeof IntersectionObserver === "undefined") {
      document.querySelectorAll(".reveal-3d").forEach((element) => element.classList.add("is-visible"));
      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerleave", handlePointerLeave);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );

    function observeReveals() {
      document.querySelectorAll<HTMLElement>(".reveal-3d:not(.is-visible)").forEach((element) => {
        if (prefersReducedMotion) {
          element.classList.add("is-visible");
          return;
        }
        observer.observe(element);
      });
    }

    observeReveals();

    // Pick up sections that mount after the first paint (client data, route changes).
    const mutationObserver = new MutationObserver(observeReveals);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
