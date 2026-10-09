
document.addEventListener("DOMContentLoaded", () => {
  const heading = document.querySelector(
    ".story-title-handwritten"
  );

  if (!heading) return;

  // Respect reduced-motion settings
  if (window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches) {
    return;
  }

  // Check that Vivus loaded
  if (typeof Vivus === "undefined") {
    return;
  }

  new Vivus("story-handwriting", {
    type: "oneByOne",
    duration: 180,
    start: "autostart",
    file: "assets/our-story.svg"
  }, () => {
    heading.classList.add("handwriting-complete");
  });

  heading.classList.add("handwriting-active");
});
