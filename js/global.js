
/* ==========================================================
   WANDER — GLOBAL JAVASCRIPT

   01. Load shared header
   02. Detect current page
   03. Highlight active navigation
   04. Handle mobile navigation
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

  /* ------------------------------------------
     01. FIND WEBSITE ROOT
  ------------------------------------------ */

  // Root-level pages use "./"
  // Pages inside folders can specify another path
  const basePath =
    document.documentElement.dataset.base || "./";


  /* ------------------------------------------
     02. LOAD SHARED HEADER
  ------------------------------------------ */

  try {
    const response = await fetch(
      `${basePath}/header.html`
    );

    if (!response.ok) {
      throw new Error(
        `Could not load header: HTTP ${response.status}`
      );
    }

    const headerHTML = await response.text();

    // Insert header at the beginning of the body
    document.body.insertAdjacentHTML(
      "afterbegin",
      headerHTML
    );


    /* ------------------------------------------
       03. FIX NAVIGATION PATHS
    ------------------------------------------ */

    const header = document.querySelector(".site-header");

    if (!header) {
      throw new Error("Header markup not found.");
    }

    header.querySelectorAll("a[href]").forEach(link => {
      const href = link.getAttribute("href");

      if (
        href &&
        !href.startsWith("#") &&
        !href.startsWith("/") &&
        !/^[a-z][a-z0-9+.-]*:/i.test(href)
      ) {
        link.setAttribute("href", basePath + href);
      }
    });


    /* ------------------------------------------
       04. DETECT CURRENT PAGE
    ------------------------------------------ */

    const path = window.location.pathname;

    const currentFile =
      path.split("/").pop() || "index.html";

    const currentPage =
      currentFile.replace(/\.html$/, "");


    /* ------------------------------------------
       05. HIGHLIGHT ACTIVE LINK
    ------------------------------------------ */

    const navLinks = header.querySelectorAll(
      ".site-nav a[data-page]"
    );

    navLinks.forEach(link => {
      if (link.dataset.page === currentPage) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });


    /* ------------------------------------------
       06. MOBILE NAVIGATION
    ------------------------------------------ */

    const menuButton = header.querySelector(".menu-toggle");
    const navigation = header.querySelector(".site-nav");

    if (menuButton && navigation) {

      function closeMenu() {
        navigation.classList.remove("open");

        menuButton.setAttribute(
          "aria-expanded",
          "false"
        );

        menuButton.setAttribute(
          "aria-label",
          "Open navigation"
        );
      }

      menuButton.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("open");

        menuButton.setAttribute(
          "aria-expanded",
          String(isOpen)
        );

        menuButton.setAttribute(
          "aria-label",
          isOpen ? "Close navigation" : "Open navigation"
        );
      });

      // Close mobile menu when navigating
      navigation.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
      });

      // Close mobile menu with Escape
      document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
          closeMenu();
        }
      });

    }

  } catch (error) {
    console.error("WANDER header error:", error);
  }

});
