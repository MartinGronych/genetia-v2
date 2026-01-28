export const initCarousel = () => {
  document.querySelectorAll("[data-carousel]").forEach((root) => {
    const track = root.querySelector(".carousel__track");
    const prev = root.querySelector(".carousel__btn--prev");
    const next = root.querySelector(".carousel__btn--next");
    const dots = Array.from(root.querySelectorAll(".carousel__dot"));
    if (!track) return;
    const slides = Array.from(track.children);
    let index = 0;
    const go = (i) => {
      index = Math.max(0, Math.min(slides.length - 1, i));
      slides[index]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      dots.forEach((d, di) => d.classList.toggle("carousel__dot--active", di == index));
    };
    prev?.addEventListener("click", () => go(index - 1));
    next?.addEventListener("click", () => go(index + 1));
    dots.forEach((d, di) => d.addEventListener("click", () => go(di)));
  });
};
