const COLORS = ["#1fd18c", "#5b8def", "#f2c94c", "#f24968", "#a78bfa"];

/**
 * Fires a small, dependency-free confetti burst from the given element
 * (or screen center if omitted) — a quick moment of delight when a demo
 * order goes through. Pure DOM + CSS transitions, no canvas/libraries.
 */
export function celebrate(originEl?: HTMLElement | null) {
    if (typeof window === "undefined") return;

    const rect = originEl?.getBoundingClientRect();
    const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const originY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.inset = "0";
    container.style.pointerEvents = "none";
    container.style.zIndex = "300";
    document.body.appendChild(container);

    const count = 24;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement("span");
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const distance = 70 + Math.random() * 90;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance - 50;
        const size = 6 + Math.random() * 6;
        const rotate = Math.random() * 360;

        Object.assign(particle.style, {
            position: "absolute",
            left: `${originX}px`,
            top: `${originY}px`,
            width: `${size}px`,
            height: `${size}px`,
            background: COLORS[i % COLORS.length],
            borderRadius: Math.random() > 0.5 ? "9999px" : "2px",
            transform: "translate(-50%, -50%) rotate(0deg)",
            opacity: "1",
            transition: "transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 700ms ease-out",
        });
        container.appendChild(particle);

        requestAnimationFrame(() => {
            particle.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rotate}deg)`;
            particle.style.opacity = "0";
        });
    }

    setTimeout(() => container.remove(), 900);
}
