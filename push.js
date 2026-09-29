/* ====== NOTIFICACIONES PUSH ======
   Reemplazá esta URL por la de tu Worker de Cloudflare (sin barra final). */
const PUSH_BACKEND = "https://recordatorios-cantos-backend.recordatorios-cantos.workers.dev";
(function () {
  const $ = id => document.getElementById(id);
  const btn = $("btn-push"), test = $("btn-push-test"), estado = $("push-estado"), aviso = $("push-aviso");
  if (!btn) return;

  const ASKED = "cantos_push_pedido_v1";
  const soportado = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const configurado = !PUSH_BACKEND.includes("TU-SUBDOMINIO");
  const JSON_HDR = { "Content-Type": "application/json" };

  function b64ToU8(s) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    return Uint8Array.from(atob(s), c => c.charCodeAt(0));
  }

  async function claveServidor() {
    const r = await fetch(PUSH_BACKEND + "/config");
    if (!r.ok) throw new Error("no se pudo contactar al servidor");
    return (await r.json()).publicKey;
  }

  async function enviarSuscripcion(sub) {
    const r = await fetch(PUSH_BACKEND + "/subscribe", {
      method: "POST", headers: JSON_HDR, body: JSON.stringify({ subscription: sub.toJSON() })
    });
    if (!r.ok) throw new Error("el servidor rechazó la suscripción (" + r.status + ")");
  }

  async function suscribir() {
    const reg = await navigator.serviceWorker.ready;
    const key = b64ToU8(await claveServidor());
    let sub = await reg.pushManager.getSubscription();
    if (sub && sub.options && sub.options.applicationServerKey) {
      const cur = new Uint8Array(sub.options.applicationServerKey);
      if (cur.length !== key.length || cur.some((v, i) => v !== key[i])) { await sub.unsubscribe(); sub = null; }
    }
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    await enviarSuscripcion(sub); // se re-sincroniza en cada apertura
    return sub;
  }

  function pintar(activo) {
    if (activo) {
      btn.textContent = "✅ Notificaciones activadas";
      btn.classList.add("done");
      btn.disabled = true;
      test.hidden = false;
      estado.textContent = "Vas a recibir el recordatorio los viernes a las 18:00 (hora de Argentina).";
    } else {
      btn.textContent = "ACTIVAR NOTIFICACIONES";
      btn.classList.remove("done");
      btn.disabled = false;
      test.hidden = true;
    }
  }

  async function activar() {
    aviso.textContent = "";
    if (!configurado) { aviso.textContent = "⚠️ Falta configurar PUSH_BACKEND en push.js"; return; }
    btn.disabled = true;
    try {
      const permiso = await Notification.requestPermission();
      localStorage.setItem(ASKED, "1");
      if (permiso !== "granted") {
        pintar(false);
        aviso.textContent = permiso === "denied"
          ? "⚠️ Las notificaciones están bloqueadas. Activalas desde los ajustes del navegador o de la app."
          : "No se activaron las notificaciones.";
        return;
      }
      await suscribir();
      pintar(true);
    } catch (e) {
      pintar(false);
      aviso.textContent = "⚠️ No se pudo activar: " + (e.message || e);
    }
  }

  async function probar() {
    test.disabled = true;
    aviso.textContent = "Enviando…";
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) throw new Error("no hay suscripción en este dispositivo");
      await enviarSuscripcion(sub);
      const r = await fetch(PUSH_BACKEND + "/test", { method: "POST", headers: JSON_HDR, body: JSON.stringify({ endpoint: sub.endpoint }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || ("error " + r.status));
      aviso.textContent = "📨 Enviada. Debería llegar en unos segundos.";
    } catch (e) {
      aviso.textContent = "⚠️ No se pudo enviar: " + (e.message || e);
    } finally {
      setTimeout(() => { test.disabled = false; }, 5000);
    }
  }

  async function iniciar() {
    if (!soportado) {
      btn.disabled = true;
      estado.textContent = "Este navegador no admite notificaciones push. En iPhone hay que instalar la app en la pantalla de inicio (iOS 16.4 o superior).";
      return;
    }
    btn.addEventListener("click", activar);
    test.addEventListener("click", probar);
    if (!configurado) { aviso.textContent = "⚠️ Falta configurar PUSH_BACKEND en push.js"; return; }

    if (Notification.permission === "granted") {
      try { await suscribir(); pintar(true); }
      catch (e) { pintar(false); aviso.textContent = "⚠️ " + (e.message || e); }
    } else if (Notification.permission === "default" && !localStorage.getItem(ASKED)) {
      activar(); // primera apertura: pedir permiso
    } else {
      pintar(false);
    }
  }
  iniciar();
})();
