
document.addEventListener("DOMContentLoaded", () => {
  const heading = document.querySelector(
    ".story-title-handwritten"
  );

  const container = document.getElementById(
    "story-handwriting"
  );

  if (!heading || !container) return;

  // Keep static text for reduced-motion visitors
  if (window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches) {
    return;
  }

  if (typeof Vivus === "undefined") {
    console.warn("Vivus.js did not load.");
    return;
  }

  const animation = new Vivus(
    "story-handwriting",
    {
      type: "oneByOne",
      duration: 180,
      start: "manual",
      file: "assets/ourStory.svg",
      onReady: () => {
        const svg = container.querySelector("svg");

        if (!svg) return;

        // Ensure the SVG has drawable paths
        const paths = svg.querySelectorAll(
          "path, line, polyline, polygon, circle, ellipse, rect"
        );

        if (!paths.length) {
          console.warn("No SVG drawing paths found.");
          return;
        }

        // Show the SVG only once it's ready
        heading.classList.add("handwriting-active");

        animation.play();
      }
    }
  );
});
