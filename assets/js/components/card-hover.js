export const initCardHover = () => {
  const cards = document.querySelectorAll(".card");
  if (!cards.length) return;

  cards.forEach((card) => {
    const onMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--x", `${x}px`);
      card.style.setProperty("--y", `${y}px`);
    };

    const onLeave = () => {
      card.style.removeProperty("--x");
      card.style.removeProperty("--y");
    };

    card.addEventListener("mousemove", onMove, { passive: true });
    card.addEventListener("mouseleave", onLeave, { passive: true });
  });
};
