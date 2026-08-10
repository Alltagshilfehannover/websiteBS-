/* =========================================================================
   Alltagshilfe Hannover – Kooperationspartner als rotierende Logo-Weltkugel.
   Reines JS, keine externen Bibliotheken. Progressive Enhancement:
   Ohne JS / bei "reduzierte Bewegung" bleiben die Logos als Raster sichtbar.
   ========================================================================= */
(function () {
  'use strict';
  var sphere = document.querySelector('.logo-sphere');
  if (!sphere) return;
  var tags = Array.prototype.slice.call(sphere.querySelectorAll('.logo-sphere__tag'));
  if (tags.length < 2) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return; // Raster-Fallback

  sphere.classList.add('is-active');

  var N = tags.length;
  var pts = [];
  var inc = Math.PI * (3 - Math.sqrt(5));   // goldener Winkel
  for (var i = 0; i < N; i++) {
    var y = 1 - (i / (N - 1)) * 2;           // y von 1 bis -1
    var r = Math.sqrt(Math.max(0, 1 - y * y));
    var phi = i * inc;
    pts.push({ x: Math.cos(phi) * r, y: y, z: Math.sin(phi) * r });
  }

  var rx = -0.15, ry = 0;
  var autoVx = -0.0012, autoVy = 0.0035;
  var vx = autoVx, vy = autoVy;
  var paused = false;
  var W, H, R, cx, cy;

  function size() {
    var rect = sphere.getBoundingClientRect();
    W = rect.width; H = rect.height;
    R = Math.min(W, H) * 0.40;
    cx = W / 2; cy = H / 2;
  }
  size();
  window.addEventListener('resize', size);

  sphere.addEventListener('mousemove', function (e) {
    var rect = sphere.getBoundingClientRect();
    var dx = (e.clientX - rect.left - cx) / cx;
    var dy = (e.clientY - rect.top - cy) / cy;
    vy = dx * 0.016;
    vx = -dy * 0.016;
  });
  sphere.addEventListener('mouseleave', function () { vx = autoVx; vy = autoVy; });

  tags.forEach(function (t) {
    t.addEventListener('mouseenter', function () { paused = true; });
    t.addEventListener('mouseleave', function () { paused = false; });
    t.addEventListener('focus', function () { paused = true; });
    t.addEventListener('blur',  function () { paused = false; });
  });

  var running = true;
  document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) requestAnimationFrame(frame); });

  function frame() {
    if (!running) return;
    if (!paused) { ry += vy; rx += vx; }
    var cosx = Math.cos(rx), sinx = Math.sin(rx), cosy = Math.cos(ry), siny = Math.sin(ry);
    for (var i = 0; i < N; i++) {
      var p = pts[i];
      var x1 = p.x * cosy - p.z * siny;
      var z1 = p.x * siny + p.z * cosy;
      var y1 = p.y * cosx - z1 * sinx;
      var z2 = p.y * sinx + z1 * cosx;           // Tiefe: -1 (hinten) .. 1 (vorn)
      var scale = 0.55 + 0.45 * (z2 + 1) / 2;    // 0.55 .. 1.0
      var el = tags[i];
      var px = cx + x1 * R;
      var py = cy + y1 * R;
      el.style.transform = 'translate(-50%,-50%) translate(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';
      el.style.opacity = (0.4 + 0.6 * (z2 + 1) / 2).toFixed(3);
      el.style.zIndex = String(1000 + Math.round(z2 * 100));
      el.style.pointerEvents = z2 < -0.35 ? 'none' : 'auto';
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
