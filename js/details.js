
/* ==========================================================
   DAVIS & KAYLEE — WEDDING DETAILS MAP

   Requires:
   - Leaflet 1.9.4
   - Lucide icons
   - js/details-locations.js
   - #wedding-map in details.html

   Features:
   - Custom Lucide location markers
   - Shaded downtown hotel search area
   - Location information popups
   - Google Maps directions
   - Automatic zoom to all locations
   - Reset map button
   - Responsive map sizing
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* --------------------------------------------------------
     1. HTML ELEMENTS
     -------------------------------------------------------- */

  const mapContainer = document.getElementById("wedding-map");
  const resetButton = document.getElementById("map-reset");
  const statusElement = document.getElementById("map-status");

  if (!mapContainer) return;

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
    showStatus("The map couldn't load. Please refresh the page.");
    return;
  }

  if (!window.weddingLocations) {
    console.error("Wedding map: Location data is missing.");
    showStatus("Map locations couldn't be loaded.");
    return;
  }

  const locations = Object.values(window.weddingLocations);

  if (!locations.length) {
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

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'
    }
  ).addTo(map);


  /* --------------------------------------------------------
     4. HELPER FUNCTIONS
     -------------------------------------------------------- */

  // Safely insert text into dynamically generated HTML.

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }


  // Convert Lucide placeholders into SVG icons.
  // Run this after markers have been added to the map.

  function refreshLucideIcons() {
    if (!window.lucide) return;

    window.lucide.createIcons({
      attrs: {
        "stroke-width": 1.8
      }
    });
  }


  // Create a custom pin for an airport, venue, or other location.

  function createPin(location) {
    const iconName = escapeHTML(location.icon || "map-pin");
    const color = location.color || "#87927A";

    return L.divIcon({
      className: "wedding-location-icon",

      html: `
        <div
          class="wedding-map-pin"
          style="background-color: ${escapeHTML(color)};"
        >
          <i data-lucide="${iconName}"></i>
        </div>
      `,

      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -20]
    });
  }


  // Generate the information popup for each location.

  function createPopup(location) {
    const name = escapeHTML(location.name || "");
    const description = escapeHTML(location.description || "");
    const address = location.address
      ? escapeHTML(location.address)
      : "";

    let directionsLink = "";

    // Only show directions for confirmed physical locations.
    // The hotel circle is a general area, not a confirmed hotel.

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
     5. ADD LOCATIONS TO MAP
     -------------------------------------------------------- */

  const mapObjects = [];

  locations.forEach((location) => {

    // Skip any locations without valid coordinates.

    if (
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2 ||
      !location.coordinates.every(Number.isFinite)
    ) {
      console.warn(
        "Wedding map: Invalid coordinates for",
        location.name
      );
      return;
    }

    const coordinates = location.coordinates;


    /* ------------------------------------------------------
       HOTEL SEARCH AREA — SHADED CIRCLE
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

      circle.bindPopup(createPopup(location));

      mapObjects.push(circle);


      // Add the hotel area label at the circle's center.

      const hotelLabel = L.divIcon({
        className: "wedding-hotel-label",

        html: `
          <div class="hotel-circle-label">
            <i data-lucide="${escapeHTML(location.icon || "hotel")}"></i>
            <span>
              ${escapeHTML(location.shortName || location.name)}
            </span>
          </div>
        `,

        iconSize: [160, 30],
        iconAnchor: [80, 65]
      });

      const labelMarker = L.marker(coordinates, {
        icon: hotelLabel,
        interactive: true,
        keyboard: true
      }).addTo(map);

      // Clicking the label also opens the hotel area popup.
      labelMarker.bindPopup(createPopup(location));

      return;
    }


    /* ------------------------------------------------------
       AIRPORT / VENUE / OTHER LOCATION PINS
       ------------------------------------------------------ */

    const marker = L.marker(coordinates, {
      icon: createPin(location),
      title: location.name
    }).addTo(map);

    marker.bindPopup(createPopup(location));

    mapObjects.push(marker);

  });


  /* --------------------------------------------------------
     6. FIT ALL LOCATIONS INTO VIEW
     -------------------------------------------------------- */

  function fitAllLocations() {
    if (!mapObjects.length) return;

    const bounds = L.featureGroup(mapObjects).getBounds();

    if (!bounds.isValid()) return;

    map.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 11,
      animate: false
    });
  }

  fitAllLocations();


  /* --------------------------------------------------------
     7. RESET BUTTON
     -------------------------------------------------------- */

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      map.closePopup();
      fitAllLocations();
    });
  }


  /* --------------------------------------------------------
     8. RESPONSIVE MAP HANDLING
     -------------------------------------------------------- */

  window.addEventListener("load", () => {
    map.invalidateSize();
    fitAllLocations();
  });

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    resizeObserver.observe(mapContainer);
  }


  /* --------------------------------------------------------
     9. INITIALIZE LUCIDE ICONS
     -------------------------------------------------------- */

  refreshLucideIcons();

  // Leaflet may recreate marker elements when the map moves.
  // Refresh icons after movement has finished.

  map.on("moveend", refreshLucideIcons);
  map.on("zoomend", refreshLucideIcons);


  /* --------------------------------------------------------
     10. FINISHED
     -------------------------------------------------------- */

  showStatus("");

  console.log(
    `Wedding map initialized with ${mapObjects.length} locations.`
  );

});
