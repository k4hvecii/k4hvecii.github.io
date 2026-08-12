export function initParallax() {
  const panel = document.querySelector("#hero-panel");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!panel || !canHover || reduceMotion) return;

  panel.addEventListener("pointermove", (event) => {
    const rect = panel.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 2.4;
    const rotateX = (0.5 - y) * 2.4;
    panel.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
  });
  panel.addEventListener("pointerleave", () => { panel.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) translateY(0)"; });
}
