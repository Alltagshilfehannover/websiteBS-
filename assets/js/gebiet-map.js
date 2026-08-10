/* =========================================================================
   Alltagshilfe Hannover – Interaktive Einsatzgebiet-Karte (Leaflet + OSM).
   Liest window.GEBIET_ORTE / GEBIET_CENTER / GEBIET_HQ (in der Seite gesetzt).
   ========================================================================= */
(function () {
  'use strict';
  if (typeof L === 'undefined') return;
  var el = document.getElementById('gebiet-map');
  if (!el) return;

  var orte   = window.GEBIET_ORTE   || [];
  var center = window.GEBIET_CENTER || [52.3759, 9.7320];
  var hq     = window.GEBIET_HQ;

  var map = L.map(el, { scrollWheelZoom: false, zoomControl: true });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>-Mitwirkende'
  }).addTo(map);

  // Einzugsgebiet – weicher Radius um Hannover
  L.circle(center, { radius: 27000, color: '#B85234', weight: 2, opacity: .6,
    fillColor: '#E8925E', fillOpacity: .10 }).addTo(map);

  var bounds = [];

  if (hq) {
    var hqIcon = L.divIcon({ className: 'gm-hq', html: '★', iconSize: [30, 30], iconAnchor: [15, 15] });
    L.marker([hq.lat, hq.lng], { icon: hqIcon, zIndexOffset: 1000, title: hq.name })
      .addTo(map)
      .bindPopup('<b>' + hq.name + '</b><br>Bahnhofstraße 85<br>31515 Wunstorf');
    bounds.push([hq.lat, hq.lng]);
  }

  orte.forEach(function (o) {
    var isStadtteil = o.t === 'Stadtteil';
    var m = L.circleMarker([o.lat, o.lng], {
      radius: isStadtteil ? 7 : 8, color: '#fff', weight: 2,
      fillColor: isStadtteil ? '#B85234' : '#2E7D5B', fillOpacity: .95
    }).addTo(map);
    m.bindPopup('<b>' + o.n + '</b><br><a href="../haushaltshilfe-' + o.s + '/">Haushaltshilfe in ' + o.n + ' &rarr;</a>');
    m.bindTooltip(o.n, { direction: 'top', offset: [0, -6] });
    bounds.push([o.lat, o.lng]);
  });

  if (bounds.length) map.fitBounds(bounds, { padding: [34, 34] });
  else map.setView(center, 10);

  // Scroll-Zoom nur bei Fokus/Klick auf die Karte (verhindert versehentliches Zoomen beim Scrollen)
  map.on('focus', function () { map.scrollWheelZoom.enable(); });
  map.on('blur',  function () { map.scrollWheelZoom.disable(); });
})();
