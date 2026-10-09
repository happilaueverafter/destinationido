
/* ==========================================================
   DAVIS & KAYLEE — WEDDING DETAILS MAP

   Requires:
   - Leaflet 1.9.4
   - js/details-locations.js
   - #wedding-map in details.html

   Features:
   - Custom wedding location markers
   - Shaded hotel search area
   - Clickable location popups
   - Google Maps directions links
   - Automatic zoom to show all locations
   - Reset map button
   - Responsive map sizing
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* --------------------------------------------------------
     1. FIND HTML ELEMENTS
     -------------------------------------------------------- */

  const mapContainer = document.getElementById("wedding-map");
  const resetButton = document.getElementById("map-reset");
  const statusElement = document.getElementById("map-status");

  if (!mapContainer) {
    console.error("Wedding map: #wedding-map was not found.");
    return;
  }

  function showStatus(message) {
    if (statusElement) {
      statusElement.textContent = message;
    }
  }


  /* --------------------------------------------------------
     2. CHECK DEPENDENCIES
     -------------------------------------------------------- */

  if (typeof L === "undefined") {
    console.error("Wedding map: Leaflet is not loaded.");

    showStatus(
      "The map couldn't load. Please refresh the page."
    );

    return;
  }

  if (!window.weddingLocations) {
    console.error(
      "Wedding map: details-locations.js is missing or did not load."
    );

    showStatus(
      "Map locations couldn't be loaded."
    );

    return;
  }

  const locations = Object.values(window.weddingLocations);

  if (locations.length === 0) {
    showStatus("No map locations have been added yet.");
    return;
  }


  /* --------------------------------------------------------
     3. CREATE MAP
     -------------------------------------------------------- */

  const map = L.map(mapContainer, {
    center: [30.25, -97.85],
    zoom: 10,
    zoomControl: true,
    scrollWheelZoom: false
  });


  /* --------------------------------------------------------
     4. ADD OPENSTREETMAP TILES
     -------------------------------------------------------- */

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,

      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'
    }
  ).addTo(map);


  /* --------------------------------------------------------
     5. HELPER: ESCAPE TEXT FOR HTML
     -------------------------------------------------------- */

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }


  /* --------------------------------------------------------
     6. HELPER: CREATE CUSTOM MAP PIN
     -------------------------------------------------------- */
   function createPin(location) {
      const iconName = location.icon || "map-pin";
      return L.divIcon({
         className: "wedding-location-icon",

         html: `
            <div 
               class="wedding-map-pin"
               style="background-color: ${location.color || "#87927A"};"
            >
               <i data-lucide="${iconName}"></i>
            </div>
         `,

         iconSize: [38, 38],
         iconAnchor: [19, 38],
         popupAnchor: [0, -35]
      });
   }

   function refreshLucideIcons() {
      if (window.lucide) {
      lucide.createIcons({
        attrs: {
           "stroke-width": 1.8
        }
      });
  }


  /* --------------------------------------------------------
     7. HELPER: CREATE LOCATION POPUP
     -------------------------------------------------------- */

  function createPopup(location) {

    const name = escapeHTML(location.name);
    const description = escapeHTML(location.description);
    const address = location.address
      ? escapeHTML(location.address)
      : "";

    let directionsLink = "";

    // Only show directions for actual locations.
    // The hotel search area is not a confirmed hotel.

    if (location.address && location.type !== "area") {

      const query = encodeURIComponent(location.address);

      directionsLink = `
        <a
          href="https://www.google.com/maps/search/?api=1&query=${query}"
          target="_blank"
          rel="noopener noreferrer"
          class="map-directions-link"
        >
          Get Directions ↗
        </a>
      `;
    }

    return `
      <div class="wedding-map-popup">

        <strong>${name}</strong>

        ${address
          ? `<p class="popup-address">${address}</p>`
          : ""
        }

        <p>${description}</p>

        ${directionsLink}

      </div>
    `;
  }


  /* --------------------------------------------------------
     8. STORE MAP OBJECTS
     -------------------------------------------------------- */

  // Used to automatically fit all locations into view.

  const mapObjects = [];


  /* --------------------------------------------------------
     9. ADD LOCATIONS TO MAP
     -------------------------------------------------------- */

  locations.forEach((location) => {

    if (
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      console.warn(
        "Wedding map: Invalid coordinates for",
        location.name
      );

      return;
    }

    const coordinates = location.coordinates;


    /* ------------------------------------------------------
       HOTEL SEARCH AREA
       ------------------------------------------------------ */

    if (location.type === "area") {

      const circle = L.circle(coordinates, {
        radius: location.radius || 800,

        color: location.color || "#87927A",

        weight: 2,
        opacity: 1,
        dashArray: "7 6",

        fill: true,
        fillColor: location.color || "#87927A",
        fillOpacity: 0.28,
        interactive: true
      }).addTo(map);

      circle.bringToFront();
      circle.bindPopup(createPopup(location));

      mapObjects.push(circle);


      // Add a label in the center of the circle.

      const hotelLabel = L.divIcon({
        className: "wedding-hotel-label",

        html: `
          <div class="hotel-circle-label">
            <i data-lucide="${escapeHTML(location.icon || "hotel")}"></i>
            <span>${escapeHTML(location.shortName || location.name)}</span>
          </div>
        `,

        iconSize: [160, 30],
        iconAnchor: [80, 15]
      });

      L.marker(coordinates, {
        icon: hotelLabel,
        interactive: false,
        keyboard: false
      }).addTo(map);

      return;
    }


    /* ------------------------------------------------------
       AIRPORT / VENUE / OTHER POINT LOCATIONS
       ------------------------------------------------------ */

    const marker = L.marker(coordinates, {
      icon: createPin(location),
      title: location.name
    }).addTo(map);

    marker.bindPopup(createPopup(location));

    mapObjects.push(marker);

  });


  /* --------------------------------------------------------
     10. FIT ALL LOCATIONS INTO VIEW
     -------------------------------------------------------- */

  function fitAllLocations() {

    if (mapObjects.length === 0) {
      return;
    }

    const group = L.featureGroup(mapObjects);
    const bounds = group.getBounds();

    if (!bounds.isValid()) {
      return;
    }

    map.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 11,
      animate: false
    });

  }

  fitAllLocations();


  /* --------------------------------------------------------
     11. RESET MAP BUTTON
     -------------------------------------------------------- */

  if (resetButton) {

    resetButton.addEventListener("click", () => {

      map.closePopup();

      fitAllLocations();

    });

  }


  /* --------------------------------------------------------
     12. HANDLE MAP RESIZING
     -------------------------------------------------------- */

  // Helps Leaflet calculate the correct dimensions after
  // the page finishes loading.

  window.addEventListener("load", () => {

    map.invalidateSize();

    fitAllLocations();

  });

  // Also handle changes in the map container's dimensions.

  if ("ResizeObserver" in window) {

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    resizeObserver.observe(mapContainer);

  }



/* --------------------------------------------------------
   13. FINISHED
   -------------------------------------------------------- */

showStatus("");

refreshLucideIcons();

console.log(
  `Wedding map initialized with ${mapObjects.length} locations.`
);

});

