/* Analítica del sitio (Google Analytics 4).
 *
 * Para activarla: reemplazá G-XXXXXXXXXX por tu ID de medición de GA4
 * (Analytics > Administrar > Flujos de datos > Web > "ID de medición").
 * Mientras siga el valor de ejemplo, no se carga nada.
 *
 * Además de las visitas, mide:
 *   - contacto_whatsapp: clic en cualquier enlace a WhatsApp
 *   - como_llegar: clic en "Cómo llegar" (Google Maps)
 *   - abrir_calculadora: clic hacia la calculadora de financiación
 *   - generate_lead: consulta enviada con el formulario (lo llama cada página)
 */
(function () {
  var GA_ID = "G-XXXXXXXXXX";

  window.medir = function () {};
  var activo = /^G-[A-Z0-9]{6,}$/.test(GA_ID) && GA_ID !== "G-XXXXXXXXXX";
  // Solo en el dominio real: así las pruebas locales no ensucian los datos.
  if (!activo || location.hostname !== "terrenosensalta.ar") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag("js", new Date());
  gtag("config", GA_ID);

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);

  var pagina = location.pathname.replace(/^\/$/, "/index.html");

  window.medir = function (evento, datos) {
    var d = datos || {};
    d.pagina = pagina;
    gtag("event", evento, d);
  };

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href");
    if (/wa\.me|api\.whatsapp\.com/.test(href)) {
      medir("contacto_whatsapp", { ubicacion: a.className || a.textContent.trim().slice(0, 40) });
    } else if (/google\.[a-z.]+\/maps\/dir/.test(href)) {
      medir("como_llegar");
    } else if (/calculadora\.html/.test(href)) {
      medir("abrir_calculadora");
    }
  }, true);
})();
