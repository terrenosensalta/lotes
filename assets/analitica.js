/* Analítica del sitio: Google Analytics 4 y píxel de Meta (Facebook/Instagram).
 *
 * GA_ID: ID de medición de GA4 (propiedad "terrenosensalta.ar", cuenta "Terrenos en Salta").
 *   Analytics > Administrar > Flujos de datos > Web > "ID de medición".
 * PIXEL_ID: ID del píxel / conjunto de datos de Meta (solo números).
 *   Administrador de eventos > Conjuntos de datos > el del sitio > "ID".
 *   Mientras esté vacío, el píxel no se carga.
 * Todo se carga solo en terrenosensalta.ar (no en pruebas locales).
 *
 * Además de las visitas, mide:
 *   - contacto_whatsapp: clic en cualquier enlace a WhatsApp   (Meta: Contact)
 *   - como_llegar: clic en "Cómo llegar" (Google Maps)          (Meta: FindLocation)
 *   - abrir_calculadora: clic hacia la calculadora de financiación (Meta: ViewContent)
 *   - generate_lead: consulta enviada con el formulario         (Meta: Lead)
 */
(function () {
  var GA_ID = "G-2FVZV0JTJP";
  var PIXEL_ID = "";

  window.medir = function () {};
  // Solo en el dominio real: así las pruebas locales no ensucian los datos.
  if (location.hostname !== "terrenosensalta.ar") return;

  var gaActivo = /^G-[A-Z0-9]{6,}$/.test(GA_ID) && GA_ID !== "G-XXXXXXXXXX";
  var pixelActivo = /^\d{10,20}$/.test(PIXEL_ID);
  if (!gaActivo && !pixelActivo) return;

  if (gaActivo) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", GA_ID);

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
  }

  if (pixelActivo) {
    // Código base del píxel de Meta.
    !function (f, b, e, v, n, t, sc) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0";
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; sc = b.getElementsByTagName(e)[0]; sc.parentNode.insertBefore(t, sc);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", PIXEL_ID);
    fbq("track", "PageView");
  }

  // Equivalencias con los eventos estándar de Meta.
  var EVENTOS_META = {
    contacto_whatsapp: "Contact",
    como_llegar: "FindLocation",
    abrir_calculadora: "ViewContent",
    generate_lead: "Lead"
  };

  var pagina = location.pathname.replace(/^\/$/, "/index.html");

  window.medir = function (evento, datos) {
    var d = datos || {};
    d.pagina = pagina;
    if (gaActivo) gtag("event", evento, d);
    if (pixelActivo && EVENTOS_META[evento]) {
      fbq("track", EVENTOS_META[evento], { content_name: d.barrio || pagina });
    }
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
