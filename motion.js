"use strict";
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const duration =
    parseFloat(styles.getPropertyValue("--motion-entrance")) || 560;
  const stagger = parseFloat(styles.getPropertyValue("--motion-stagger")) || 65;
  const easing = styles.getPropertyValue("--motion-ease").trim() || "ease-out";
  const active = new Map();
  let observer;

  // Animate only on arrival; content is never left in a hidden waiting state.
  const enter = (el, delay = 0, image = false) => {
    if (reduce.matches || !el.animate || el.contains(document.activeElement))
      return;
    const animation = el.animate(
      [
        {
          opacity: 0.35,
          transform: image
            ? "translateY(10px) scale(.992)"
            : "translateY(14px)",
        },
        { opacity: 1, transform: "none" },
      ],
      { duration, delay, easing, fill: "backwards" },
    );
    active.set(el, animation);
    const forget = () => active.delete(el);
    animation.onfinish = forget;
    animation.oncancel = forget;
  };
  if (!reduce.matches) {
    document
      .querySelectorAll(".hero-copy > *")
      .forEach((el, i) => enter(el, Math.min(i, 5) * stagger));
    const photo = document.querySelector(".hero-photo");
    if (photo) enter(photo, stagger * 3, true);
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(({ target, isIntersecting }) => {
            if (!isIntersecting) return;
            observer.unobserve(target);
            const siblings = [...target.parentElement.children];
            const isCard = target.matches(
              ".concern, .gallery-item, .steps li, .information-grid > *",
            );
            enter(
              target,
              isCard ? (siblings.indexOf(target) % 3) * stagger : 0,
              target.matches(".gallery-item"),
            );
          });
        },
        { threshold: 0.08 },
      );
      document
        .querySelectorAll(
          ".section h2, .contact h2, .credential-panel, .visit-card, .radio-show, .concern, .gallery-item, .steps li, .information-grid > *",
        )
        .forEach((el) => observer.observe(el));
    }
  }
  const clearEntrances = () => {
    observer?.disconnect();
    active.forEach((animation) => animation.cancel());
    active.clear();
  };
  document.addEventListener("focusin", (event) => {
    active.forEach((animation, el) => {
      if (el.contains(event.target)) animation.cancel();
    });
  });

  // No click interception or pointer capture: calls, maps and touch scrolling remain immediate.
  const controls =
    ".button, .secondary-button, .menu-toggle, .text-link, nav a, summary, .gallery-item, .method-list a";
  let pressed;
  const release = () => {
    pressed?.classList.remove("motion-pressed");
    pressed = null;
  };
  document.addEventListener(
    "pointerdown",
    (event) => {
      release();
      if (event.button !== 0 || reduce.matches) return;
      pressed = event.target.closest(controls);
      if (pressed?.matches(":disabled")) {
        pressed = null;
        return;
      }
      pressed?.classList.add("motion-pressed");
    },
    { passive: true },
  );
  ["pointerup", "pointercancel", "dragstart"].forEach((type) =>
    document.addEventListener(type, release, { passive: true }),
  );
  document.addEventListener(
    "pointerout",
    (event) => {
      if (pressed && !pressed.contains(event.relatedTarget)) release();
    },
    { passive: true },
  );
  window.addEventListener("scroll", release, { passive: true });
  window.addEventListener("blur", release);

  // One event-driven frame for one surface; no perpetual render or scroll loop.
  const surface = document.querySelector(".hero-photo");
  let frame = 0;
  const resetDepth = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    surface?.style.removeProperty("--depth-x");
    surface?.style.removeProperty("--depth-y");
  };
  surface?.addEventListener(
    "pointermove",
    (event) => {
      if (
        event.pointerType !== "mouse" ||
        !fine.matches ||
        reduce.matches ||
        navigator.connection?.saveData ||
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) ||
        frame
      )
        return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = surface.getBoundingClientRect();
        const x = Math.max(
          -0.5,
          Math.min(0.5, (event.clientX - r.left) / r.width - 0.5),
        );
        const y = Math.max(
          -0.5,
          Math.min(0.5, (event.clientY - r.top) / r.height - 0.5),
        );
        surface.style.setProperty("--depth-x", `${-y * 1.2}deg`);
        surface.style.setProperty("--depth-y", `${x * 1.2}deg`);
      });
    },
    { passive: true },
  );
  surface?.addEventListener("pointerleave", resetDepth);
  fine.addEventListener("change", resetDepth);
  reduce.addEventListener("change", () => {
    clearEntrances();
    resetDepth();
    release();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearEntrances();
      resetDepth();
      release();
    }
  });
  window.addEventListener("pagehide", () => {
    clearEntrances();
    resetDepth();
    release();
  });

  // Native anchors retain history, keyboard behavior and browser scroll interruption.
  const header = document.querySelector("header");
  const offset = () =>
    root.style.setProperty(
      "--header-offset",
      `${Math.ceil(header.getBoundingClientRect().height) + 16}px`,
    );
  if (header) {
    offset();
    if ("ResizeObserver" in window) new ResizeObserver(offset).observe(header);
  }
})();
