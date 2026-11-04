/**
 * TERRENOS EN SALTA — Guarda las consultas del formulario web en Google Sheets
 *
 * Es una copia de referencia: el script que funciona está en script.google.com
 * (cuenta terrenosensalta.ar@gmail.com, "Proyecto sin título", publicado como aplicación web).
 * Si lo cambiás allá: Implementar → Administrar implementaciones → editar (lápiz) →
 * Versión: "Nueva versión". Así la URL sigue siendo la misma.
 */

const PLANILLA_ID = '1wOhZiU0nvJyx-f03JFGTMD_bgwJVogOiYKSLAEI3eYg';
const LARGOS = { nombre: 120, whatsapp: 40, barrio: 60, pago: 40, mensaje: 800 };

function texto_(valor, largo) {
  const t = String(valor == null ? '' : valor).trim().slice(0, largo);
  // Evita que un texto que empieza con "=" se tome como fórmula en la planilla
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function respuesta_(datos) {
  return ContentService.createTextOutput(JSON.stringify(datos)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    // "web" es un campo oculto: solo lo completan los robots de spam
    if (d.web) return respuesta_({ ok: true });
    if (!d.nombre || !d.whatsapp) return respuesta_({ ok: false, error: 'datos' });
    SpreadsheetApp.openById(PLANILLA_ID).getSheets()[0].appendRow([
      new Date(),
      texto_(d.nombre, LARGOS.nombre),
      texto_(d.whatsapp, LARGOS.whatsapp),
      texto_(d.barrio, LARGOS.barrio),
      texto_(d.pago, LARGOS.pago),
      texto_(d.mensaje, LARGOS.mensaje),
      'Nueva',
      ''
    ]);
    return respuesta_({ ok: true });
  } catch (err) {
    return respuesta_({ ok: false, error: 'interno' });
  } finally {
    lock.releaseLock();
  }
}
