'use strict';
/* Pflegegrad-Check – interaktive, simulierte Einschätzung nach den 6 Modulen
   des Neuen Begutachtungsassessments (NBA / § 15 SGB XI).
   Vereinfachte, transparente Berechnung – ersetzt keine echte Begutachtung. */
(function () {
  var root = document.getElementById('pgcheck');
  if (!root) return;

  var B = window.PGCHECK || { entl: 131, hilf: 42, pflegegeld: { 1: 0, 2: 347, 3: 599, 4: 800, 5: 990 }, stand: '' };

  var SCALES = {
    ability: ['Selbstständig', 'Überwiegend selbstständig', 'Überwiegend auf Hilfe angewiesen', 'Nicht selbstständig'],
    freq:    ['Nie', 'Selten', 'Mehrmals pro Woche', 'Täglich'],
    help:    ['Keine Hilfe nötig', 'Selten Hilfe', 'Häufig Hilfe', 'Tägliche Hilfe']
  };

  var MODULES = [
    { key: 'm1', nr: 1, titel: 'Mobilität', weight: 10, scale: 'ability',
      intro: 'Wie selbstständig können Sie sich bewegen?',
      fragen: ['Sich im Bett umdrehen oder die Lage wechseln',
               'Eine stabile Sitzposition halten',
               'Vom Stuhl oder Bett aufstehen und umsetzen',
               'Sich innerhalb der Wohnung fortbewegen',
               'Treppen steigen'] },
    { key: 'm2', nr: 2, titel: 'Denken & Kommunikation', weight: 15, pair: true, scale: 'ability',
      intro: 'Wie gut klappt es mit Erinnern, Orientierung und Verstehen?',
      fragen: ['Sich örtlich zurechtfinden (Wohnung, Umgebung)',
               'Sich zeitlich orientieren (Tageszeit, Datum)',
               'Sich an kürzliche Ereignisse erinnern',
               'Vertraute Personen erkennen',
               'Alltagsentscheidungen treffen',
               'Aufforderungen verstehen und einem Gespräch folgen'] },
    { key: 'm3', nr: 3, titel: 'Verhalten & Psyche', weight: 15, pair: true, scale: 'freq',
      intro: 'Wie häufig treten belastende Verhaltensweisen auf?',
      fragen: ['Nächtliche Unruhe',
               'Ängste, Panik oder Niedergeschlagenheit',
               'Abwehr von Unterstützung oder Pflege',
               'Unruhiges oder aggressives Verhalten'] },
    { key: 'm4', nr: 4, titel: 'Selbstversorgung', weight: 40, scale: 'ability',
      intro: 'Wie selbstständig meistern Sie Körperpflege, Essen und Toilette?',
      fragen: ['Sich waschen (Gesicht, Oberkörper)',
               'Duschen oder Baden inklusive Haarewaschen',
               'An- und Auskleiden',
               'Essen mundgerecht vorbereiten und essen',
               'Trinken',
               'Die Toilette benutzen',
               'Mit Blasen- oder Darmschwäche umgehen'] },
    { key: 'm5', nr: 5, titel: 'Umgang mit Krankheit & Therapie', weight: 20, scale: 'help',
      intro: 'Wie viel Hilfe brauchen Sie bei Medikamenten, Arztterminen und Anwendungen?',
      fragen: ['Medikamente richtig einnehmen',
               'Messungen oder Anwendungen (z. B. Blutzucker, Verbände, Spritzen)',
               'Arztbesuche und Therapien wahrnehmen',
               'Mit Hilfsmitteln umgehen (z. B. Prothese, Rollator)'] },
    { key: 'm6', nr: 6, titel: 'Alltag & soziale Kontakte', weight: 15, scale: 'ability',
      intro: 'Wie selbstständig gestalten Sie Ihren Tag und Ihre Kontakte?',
      fragen: ['Den Tagesablauf selbst einteilen',
               'Sich selbst beschäftigen',
               'Kontakt zu anderen Menschen pflegen',
               'Ruhe- und Schlafphasen einteilen'] }
  ];

  var answers = {};           // key: "m1-0" -> 0..3
  var step = 0;               // 0 = Intro, 1..6 = Module, 7 = Ergebnis
  var LAST = MODULES.length;  // 6

  function euro(n) { return n.toLocaleString('de-DE') + ' €'; }

  function ratio(mod) {
    var sum = 0, i;
    for (i = 0; i < mod.fragen.length; i++) sum += (answers[mod.key + '-' + i] || 0);
    return sum / (mod.fragen.length * 3);
  }

  function bewerten() {
    var r = {}, i;
    for (i = 0; i < MODULES.length; i++) r[MODULES[i].key] = ratio(MODULES[i]);
    var w = {
      m1: r.m1 * 10,
      m23: Math.max(r.m2 * 15, r.m3 * 15),   // höherer Wert von Modul 2/3 zählt
      m4: r.m4 * 40,
      m5: r.m5 * 20,
      m6: r.m6 * 15
    };
    var total = w.m1 + w.m23 + w.m4 + w.m5 + w.m6;   // 0..100
    var grad = 0;
    if (total >= 90) grad = 5;
    else if (total >= 70) grad = 4;
    else if (total >= 47.5) grad = 3;
    else if (total >= 27) grad = 2;
    else if (total >= 12.5) grad = 1;
    return { total: total, grad: grad };
  }

  function progressBar() {
    var pct = Math.round((Math.min(step, LAST) / LAST) * 100);
    return '<div class="pgc-progress"><div class="pgc-progress__bar" style="width:' + pct + '%"></div>'
      + '<span class="pgc-progress__lbl">Modul ' + Math.min(step, LAST) + ' von ' + LAST + '</span></div>';
  }

  function renderIntro() {
    root.innerHTML =
      '<div class="pgc-card pgc-intro">'
      + '<span class="pgc-badge">Kostenlos &amp; anonym</span>'
      + '<h2>In wenigen Minuten zur ersten Einschätzung</h2>'
      + '<p>Klicken Sie sich durch sechs kurze Themenbereiche – dieselben sechs Module, die auch der Medizinische Dienst bei der offiziellen Begutachtung bewertet. Am Ende sehen Sie einen <b>geschätzten Pflegegrad</b> und die möglichen monatlichen Leistungen.</p>'
      + '<ul class="pgc-facts">'
      +   '<li><b>6</b><span>Module wie im Original</span></li>'
      +   '<li><b>~3</b><span>Minuten</span></li>'
      +   '<li><b>0 €</b><span>unverbindlich</span></li>'
      + '</ul>'
      + '<p class="pgc-hint">Ihre Angaben bleiben allein auf Ihrem Gerät – es werden keine Daten übertragen oder gespeichert.</p>'
      + '<button type="button" class="btn btn--primary btn--lg pgc-start">Check starten</button>'
      + '</div>';
    root.querySelector('.pgc-start').addEventListener('click', function () { go(1); });
  }

  function renderModule(n) {
    var mod = MODULES[n - 1];
    var opts = SCALES[mod.scale];
    var fragenHtml = mod.fragen.map(function (f, i) {
      var name = mod.key + '-' + i;
      var cur = answers[name];
      var choices = opts.map(function (label, val) {
        var id = name + '-' + val;
        var checked = (cur === val) ? ' checked' : '';
        return '<label class="pgc-opt' + (cur === val ? ' is-sel' : '') + '" for="' + id + '">'
          + '<input type="radio" id="' + id + '" name="' + name + '" value="' + val + '"' + checked + '>'
          + '<span>' + label + '</span></label>';
      }).join('');
      return '<fieldset class="pgc-q"><legend class="pgc-q__t"><span class="pgc-q__no">' + (i + 1) + '</span>' + f + '</legend>'
        + '<div class="pgc-opts">' + choices + '</div></fieldset>';
    }).join('');

    root.innerHTML =
      progressBar()
      + '<div class="pgc-card">'
      + '<div class="pgc-modhead"><span class="pgc-modnr">Modul ' + mod.nr + '</span><h2>' + mod.titel + '</h2><p>' + mod.intro + '</p></div>'
      + '<form class="pgc-form">' + fragenHtml + '</form>'
      + '<div class="pgc-nav">'
      +   '<button type="button" class="btn btn--ghost pgc-back">Zurück</button>'
      +   '<button type="button" class="btn btn--primary pgc-next">' + (n === LAST ? 'Ergebnis anzeigen' : 'Weiter') + '</button>'
      + '</div>'
      + '<p class="pgc-skiphint" hidden>Bitte beantworten Sie alle Fragen für ein genaues Ergebnis – oder überspringen Sie mit „Weiter".</p>'
      + '</div>';

    root.querySelectorAll('.pgc-opt input').forEach(function (inp) {
      inp.addEventListener('change', function () {
        var parts = inp.name.split('-');
        answers[inp.name] = parseInt(inp.value, 10);
        // Auswahl-Optik aktualisieren
        var group = inp.closest('.pgc-opts');
        group.querySelectorAll('.pgc-opt').forEach(function (l) { l.classList.remove('is-sel'); });
        inp.closest('.pgc-opt').classList.add('is-sel');
        root.querySelector('.pgc-skiphint').hidden = true;
      });
    });
    root.querySelector('.pgc-back').addEventListener('click', function () { go(n - 1); });
    root.querySelector('.pgc-next').addEventListener('click', function () { go(n + 1); });
  }

  function renderErgebnis() {
    var res = bewerten();
    var g = res.grad;
    var totalTxt = res.total.toLocaleString('de-DE', { maximumFractionDigits: 1 });

    var head, budgetHtml;
    if (g === 0) {
      head = '<div class="pgc-result__badge pgc-result__badge--none">kein<br>Pflegegrad</div>'
        + '<div class="pgc-result__lead"><h2>Vermutlich noch kein Pflegegrad</h2>'
        + '<p>Ihre Einschätzung liegt bei <b>' + totalTxt + ' von 100 Punkten</b> und damit unter der Schwelle von 12,5 Punkten. Das kann sich jederzeit ändern – und Sie können unsere Alltagshilfe auch ohne Pflegegrad privat buchen.</p></div>';
      budgetHtml = '<div class="pgc-callout">' + '<b>Trotzdem einen Antrag stellen?</b> Bei grenzwertigen Fällen lohnt sich oft ein Antrag. Wir unterstützen Sie gern dabei.</div>';
    } else {
      var pg = B.pflegegeld[g] || 0;
      var budget = B.entl + pg + B.hilf;
      var rows = '<div class="pgc-brow"><span>Entlastungsbetrag (§ 45b)</span><b>' + euro(B.entl) + '</b></div>'
        + (pg ? '<div class="pgc-brow"><span>Pflegegeld (§ 37)</span><b>' + euro(pg) + '</b></div>'
              : '<div class="pgc-brow"><span>Pflegegeld</span><b>–</b></div>')
        + '<div class="pgc-brow"><span>Pflegehilfsmittel (§ 40)</span><b>' + euro(B.hilf) + '</b></div>';
      head = '<div class="pgc-result__badge">Pflege-<br>grad <b>' + g + '</b></div>'
        + '<div class="pgc-result__lead"><h2>Geschätzter Pflegegrad ' + g + '</h2>'
        + '<p>Ihre Einschätzung ergibt <b>' + totalTxt + ' von 100 Punkten</b>. Damit wären monatlich bis zu <b>' + euro(budget) + '</b> für Ihre Unterstützung möglich:</p></div>';
      budgetHtml = '<div class="pgc-budget">' + rows
        + '<div class="pgc-budget__total"><span>Mögliches Budget</span><b>' + euro(budget) + '</b><span>pro Monat</span></div></div>'
        + (g >= 2 ? '<p class="pgc-plus">Zusätzlich ab Pflegegrad 2: Verhinderungspflege, wenn Angehörige einmal ausfallen.</p>' : '');
    }

    // Skala der Grade
    var scale = [0, 1, 2, 3, 4, 5].map(function (n) {
      return '<div class="pgc-scale__step' + (n === g ? ' is-on' : '') + '">' + (n === 0 ? '–' : n) + '</div>';
    }).join('');

    root.innerHTML =
      '<div class="pgc-card pgc-result">'
      + '<div class="pgc-result__head">' + head + '</div>'
      + '<div class="pgc-scale" aria-hidden="true">' + scale + '</div>'
      + budgetHtml
      + '<div class="pgc-cta">'
      +   '<a class="btn btn--primary btn--lg" href="/kontakt/">Kostenlos beraten lassen</a>'
      +   '<a class="btn btn--ghost" href="/rechner/">Alle Leistungen im Rechner</a>'
      +   '<button type="button" class="btn btn--ghost pgc-restart">Neu starten</button>'
      + '</div>'
      + '<p class="pgc-disclaimer"><span class="pgc-star">*</span> <b>Simulierte Berechnung.</b> Dies ist eine unverbindliche, vereinfachte Orientierung nach den sechs Modulen des Neuen Begutachtungsassessments (NBA). Sie ersetzt <b>keine</b> ärztliche oder pflegefachliche Begutachtung. Das tatsächliche Ergebnis des Medizinischen Dienstes kann hiervon abweichen – nach oben wie nach unten. ' + (B.stand || '') + '</p>'
      + '</div>';
    root.querySelector('.pgc-restart').addEventListener('click', function () { answers = {}; go(0); });
  }

  function go(n) {
    step = n;
    if (n <= 0) renderIntro();
    else if (n <= LAST) renderModule(n);
    else renderErgebnis();
    // sanft zum Anfang des Moduls scrollen (nicht beim ersten Laden)
    if (n !== 0) {
      var top = root.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
    if (n > 0 && n <= LAST) root.querySelectorAll('input')[0] && root.querySelectorAll('input')[0].focus();
  }

  renderIntro();
})();
