
/* Wedding details interactive map — Leaflet + OpenStreetMap */

(() => {
  'use strict';

  const mapElement = document.getElementById('wedding-map');
  if (!mapElement) return;

  const status = document.getElementById('map-status');
  const resetButton = document.getElementById('map-reset');

  const setStatus = (message) => {
    if (status) status.textContent = message;
  };

  if (typeof L === 'undefined') {
    setStatus('The interactive map could not load. Please try again later.');
    return;
  }

  // MAP LOCATIONS

  const airport = [30.1975, -97.6664];
  const downtown = [30.2650, -97.7450];

  // Illustrative hotel search area, not a confirmed hotel location.
  const hotelRadiusMeters = 800;

  const map = L.map(mapElement, {
    scrollWheelZoom: false
  }).setView([30.24, -97.82], 10);

  // MAP TILES

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>'
    }
  ).addTo(map);

  // CUSTOM MARKERS

  function icon(type, symbol) {
    return L.divIcon({
      className: '',
      html: `
        <div class="wedding-map-pin ${type}">
          <span>${symbol}</span>
        </div>
      `,
      iconSize: [37, 37],
      iconAnchor: [18, 36],
      popupAnchor: [0, -30]
    });
  }

  // AIRPORT

  const airportMarker = L.marker(airport, {
    icon: icon('airport', '✈')
  }).addTo(map);

  airportMarker.bindPopup(`
    <strong>Austin-Bergstrom International Airport (AUS)</strong>
    <br>
    Suggested airport for guests flying into Austin.
    <br>
    <a
      href="https://www.google.com/maps/search/?api=1&query=Austin-Bergstrom+International+Airport"
      target="_blank"
      rel="noopener"
    >
      Open directions ↗
    </a>
  `);

  // POTENTIAL HOTEL AREA

  const hotelArea = L.circle(downtown, {
    radius: hotelRadiusMeters,
    color: '#87927A',
    weight: 2,
    dashArray: '7 6',
    fillColor: '#87927A',
    fillOpacity: 0.18
  }).addTo(map);

  hotelArea.bindPopup(`
    <strong>Potential Hotel Area — Downtown Austin</strong>
    <br>
    We are exploring hotel blocks in this general area.
    The final hotel, booking details, and shuttle pickup
    point are not yet confirmed.
  `);

  // HOTEL AREA LABEL

  const hotelLabel = L.marker(downtown, {
    icon: L.divIcon({
      className: '',
      html: '<div class="hotel-circle-label">🏨 Hotel area</div>',
      iconSize: [110, 30],
      iconAnchor: [55, 15]
    }),
    interactive: false
  }).addTo(map);

  // WEDDING VENUE

  // Look up the venue's coordinates when the map loads.
  const venueAddress =
    'Canyonwood Ridge, 250 S Canyonwood Dr, Dripping Springs, Texas 78620';

  let venueMarker = null;
  let venuePoint = null;

  // FIT MAP TO ALL LOCATIONS

  function fitMap() {
    const bounds = L.latLngBounds([airport, downtown]);

    bounds.extend(hotelArea.getBounds());

    if (venuePoint) {
      bounds.extend(venuePoint);
    }

    map.fitBounds(bounds.pad(0.15), {
      maxZoom: 11,
      animate: false
    });
  }

  fitMap();

  if (resetButton) {
    resetButton.addEventListener('click', fitMap);
  }

  // FIND CANYONWOOD RIDGE

  const query = new URLSearchParams({
    q: venueAddress,
    format: 'json',
    limit: '1'
  });

  fetch(`https://nominatim.openstreetmap.org/search?${query}`, {
    headers: {
      'Accept': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Geocoding unavailable');
      }

      return response.json();
    })
    .then(results => {
      if (!results.length) {
        throw new Error('Venue not found');
      }

      venuePoint = [
        Number(results[0].lat),
        Number(results[0].lon)
      ];

      venueMarker = L.marker(venuePoint, {
        icon: icon('venue', '♥')
      }).addTo(map);

      venueMarker.bindPopup(`
        <strong>Canyonwood Ridge</strong>
        <br>
        Our wedding venue in Dripping Springs, Texas.
        <br>
        <a
          href="https://www.google.com/maps/search/?api=1&query=Canyonwood+Ridge+Dripping+Springs+TX"
          target="_blank"
          rel="noopener"
        >
          Open directions ↗
        </a>
      `);

      fitMap();
    })
    .catch(() => {
      setStatus(
        'The venue pin is temporarily unavailable. You can still view the airport and hotel area.'
      );
    });

  // RESIZE FIX

  window.addEventListener('load', () => {
    map.invalidateSize();
  });

})();

