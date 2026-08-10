'use strict';
/* Live-Suche in der Pflegekassen-Liste (Verhinderungspflege-Formulare). */
(function () {
  var input = document.getElementById('kassenSuche');
  if (!input) return;
  var items = [].slice.call(document.querySelectorAll('#kassenListe .kasse-item'));
  var leer = document.getElementById('kassenLeer');

  function apply() {
    var q = input.value.trim().toLowerCase();
    var visible = 0;
    items.forEach(function (it) {
      var match = !q || it.getAttribute('data-name').indexOf(q) > -1;
      it.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    if (leer) leer.hidden = visible > 0;
  }
  input.addEventListener('input', apply);
})();
