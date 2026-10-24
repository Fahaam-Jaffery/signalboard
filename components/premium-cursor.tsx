"use client";

import { useEffect, useRef } from "react";

export function PremiumCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches) return;
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    let frame = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let visible = false;
    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!visible) {
        visible = true;
        cursor.classList.add("is-visible");
        dot.classList.add("is-visible");
      }
      if (!frame) frame = window.requestAnimationFrame(() => {
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        frame = 0;
      });
      const target = event.target instanceof Element ? event.target.closest("a, button, input, textarea, select, [role='button'], [data-cursor='hover']") : null;
      cursor.classList.toggle("is-hovering", Boolean(target));
    };
    const leave = () => {
      visible = false;
      cursor.classList.remove("is-visible", "is-hovering");
      dot.classList.remove("is-visible");
    };
    const down = () => cursor.classList.add("is-pressed");
    const up = () => cursor.classList.remove("is-pressed");
    const changeMotion = () => cursor.classList.toggle("is-still", reducedMotion.matches);

    changeMotion();
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    reducedMotion.addEventListener("change", changeMotion);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      reducedMotion.removeEventListener("change", changeMotion);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <>
    <div ref={cursorRef} aria-hidden="true" className="premium-cursor"><span className="premium-cursor-ring"/><span className="premium-cursor-aura"/></div>
    <div ref={dotRef} aria-hidden="true" className="premium-cursor-dot"/>
  </>;
}
