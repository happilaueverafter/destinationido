document.addEventListener("DOMContentLoaded", () => {

  const mapContainer = document.getElementById("wedding-map");
  const resetButton = document.getElementById("map-reset");
  const statusElement = document.getElementById("map-status");

  if (!mapContainer) return;

  if (typeof L === "undefined") {
    console.error("Leaflet did not load.");
    if (statusElement) {
      statusElement.textContent = "Map unavailable.";
    }
    return;
  }

  const locations = window.weddingLocations;

  if (!locations) {
    console.error("Wedding location data not found.");
    if (statusElement) {
      statusElement.textContent =
        "Map locations could not be loaded.";
    }
    return;
  }

  // CREATE MAP

  const map = L.map(mapContainer, {
    scrollWheelZoom: false,
    zoomControl: true
  }).setView([30.25, -97.85], 10);

  // ADD MAP TILES

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }
  ).addTo(map);

  // STORE LOCATIONS FOR AUTO-ZOOM

  const mapObjects = [];

  // CREATE CUSTOM PIN

  function createPin(location) {
    return L.divIcon({
      className: "wedding-location-icon",
      html: `
        <div
          class="wedding-map-pin"
          style="background:${location.color}">
          <span>${location.symbol}</span>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -34]
    });
  }

  // CREATE POPUP

  function createPopup(location) {
    const directions = location.address
      ? `
        <a
          href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}"
          target="_blank"
          rel="noopener noreferrer">
          Get Directions ↗
        </a>
      `
      : "";

    return `
      <strong>${location.name}</strong>
      <p>${location.description}</p>
      ${directions}
    `;
  }

  // ADD LOCATIONS

  Object.values(locations).forEach(location => {

    if (location.type === "area") {

      // SHADED HOTEL AREA

      const circle = L.circle(location.coordinates, {
        radius: location.radius,
        color: location.color,
        weight: 2,
        dashArray: "7 6",
        fillColor: location.color,
        fillOpacity: 0.18
      }).addTo(map);

      circle.bindPopup(createPopup(location));

      mapObjects.push(circle);

      // HOTEL LABEL

      L.marker(location.coordinates, {
        icon: L.divIcon({
          className: "wedding-hotel-label",
          html: `
            <div class="hotel-circle-label">
              ${location.symbol} ${location.shortName}
            </div>
          `,
          iconSize: [160, 30],
          iconAnchor: [80, 15]
        }),
        interactive: false
      }).addTo(map);

    } else {

      // REGULAR LOCATION PIN

      const marker = L.marker(location.coordinates, {
        icon: createPin(location)
      }).addTo(map);

      marker.bindPopup(createPopup(location));

      mapObjects.push(marker);
    }

  });

  // FIT ALL LOCATIONS

  function fitAllLocations() {
    const bounds = L.featureGroup(mapObjects).getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: 11,
        animate: false
      });
    }
  }

  fitAllLocations();

  // RESET MAP BUTTON

  if (resetButton) {
    resetButton.addEventListener("click", fitAllLocations);
  }

  // HANDLE RESIZING

  window.addEventListener("load", () => {
    map.invalidateSize();
    fitAllLocations();
  });

  console.log("Wedding map loaded:", mapObjects.length, "locations");

});
