/* ====== CONFIGURACIÓN ======
   Números de WhatsApp en formato internacional, SOLO dígitos.
   Argentina (celular): 549 + código de área (sin 0) + número (sin 15).
   Ejemplo Posadas: 5493764123456
   Mientras tengan "X" el botón avisa que falta cargar el número. */
const PHONES = {
  Mishel:  "5493765143776",
  Daiana:  "5493765237746",
  Dario:   "5493764917185",
  Isma:    "5494764580771",
  Susana:  "5493764511353",
  Antonia: "5492966524901",
  Mariana: "5493764819408",
  Eliana:  "5493764323454"
};

/* Fechas en formato AAAA-MM-DD */
const TURNOS = [
  { fecha: "2026-10-03", personas: ["Mishel", "Daiana"] },
  { fecha: "2026-10-10", personas: ["Dario", "Isma"] },
  { fecha: "2026-10-17", personas: ["Daiana", "Mishel"] },
  { fecha: "2026-10-24", personas: ["Susana", "Antonia"] },
  { fecha: "2026-10-31", personas: ["Mariana", "Eliana"] },
  { fecha: "2026-11-07", personas: ["Mishel", "Isma"] },
  { fecha: "2026-11-14", personas: ["Daiana", "Antonia"] },
  { fecha: "2026-11-21", personas: ["Susana", "Dario"] },
  { fecha: "2026-11-28", personas: ["Mariana", "Isma"] },
  { fecha: "2026-12-05", personas: ["Dario", "Eliana"] },
  { fecha: "2026-12-12", personas: ["Eliana", "Antonia"] },
  { fecha: "2026-12-19", personas: ["Susana", "Mariana"] },
  { fecha: "2026-12-26", personas: ["Mishel", "Dario"] }
];

/* ====== LÓGICA ====== */
const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const DIAS = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const STORE_KEY = "cantos_estado_v1";

function parseFecha(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }

function indiceProximo(hoy) {
  const h = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return TURNOS.findIndex(t => parseFecha(t.fecha) >= h);
}

function fechaLarga(s) {
  const d = parseFecha(s);
  return DIAS[d.getDay()] + " " + String(d.getDate()).padStart(2, "0") + " de " + MESES[d.getMonth()];
}
function fechaCorta(s) { const d = parseFecha(s); return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0"); }

function armarMensaje(nombre, fecha) {
  const d = parseFecha(fecha);
  return "Hola " + nombre + " 👋 Te recuerdo que este sábado " + d.getDate() + " de " + MESES[d.getMonth()] + " te toca preparar los cantos. ¡Gracias!";
}

function armarLink(nombre, fecha) {
  const num = String(PHONES[nombre] || "").replace(/\D/g, "");
  if (!/^\d{10,15}$/.test(num) || /X/i.test(PHONES[nombre] || "")) return null;
  return "https://wa.me/" + num + "?text=" + encodeURIComponent(armarMensaje(nombre, fecha));
}

function leerEstado() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; } }
function guardarEstado(e) { try { localStorage.setItem(STORE_KEY, JSON.stringify(e)); } catch (err) {} }

if (typeof module !== "undefined") {
  module.exports = { TURNOS, PHONES, indiceProximo, armarMensaje, armarLink, fechaLarga, fechaCorta, parseFecha };
}

/* ====== INTERFAZ ====== */
if (typeof document !== "undefined") {
  const $ = id => document.getElementById(id);
  const el = {
    fecha: $("fecha"), personas: $("personas"), mensaje: $("mensaje"), estado: $("estado"),
    btn: $("btn-enviar"), reiniciar: $("btn-reiniciar"), aviso: $("aviso"), lista: $("lista"),
    proximo: $("proximo"), envio: $("bloque-envio"), listaBloque: $("bloque-lista"), vacio: $("sin-turnos")
  };

  function abrirWhatsApp(nombre, fecha) {
    const url = armarLink(nombre, fecha);
    if (!url) {
      el.aviso.textContent = "⚠️ Falta cargar el número de " + nombre + " en script.js";
      return false;
    }
    el.aviso.textContent = "";
    const estado = leerEstado();
    estado[fecha] = estado[fecha] || {};
    estado[fecha][nombre] = true;
    guardarEstado(estado);
    const w = window.open(url, "_blank", "noopener");
    if (!w) window.location.href = url;
    return true;
  }

  function render() {
    const i = indiceProximo(new Date());
    if (i === -1) {
      el.proximo.hidden = el.envio.hidden = el.listaBloque.hidden = true;
      el.vacio.hidden = false;
      return;
    }
    el.vacio.hidden = true;
    el.proximo.hidden = el.envio.hidden = el.listaBloque.hidden = false;

    const turno = TURNOS[i];
    const hechos = leerEstado()[turno.fecha] || {};
    const pendiente = turno.personas.find(p => !hechos[p]);

    el.fecha.textContent = "📅 " + fechaLarga(turno.fecha);
    el.personas.innerHTML = "";
    turno.personas.forEach(p => {
      const d = document.createElement("div");
      d.className = "person";
      d.innerHTML = "<span>👤</span>";
      d.appendChild(document.createTextNode(p));
      el.personas.appendChild(d);
    });

    el.mensaje.textContent = armarMensaje(pendiente || turno.personas[0], turno.fecha);

    el.estado.innerHTML = "";
    turno.personas.forEach(p => {
      const li = document.createElement("li");
      const t = document.createElement("span");
      const ok = !!hechos[p];
      t.className = ok ? "ok" : "pend";
      t.textContent = (ok ? "✅ " : "⏳ ") + p + " — " + (ok ? "listo" : "pendiente");
      li.appendChild(t);
      if (ok) {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = "Abrir de nuevo";
        b.addEventListener("click", () => { abrirWhatsApp(p, turno.fecha); });
        li.appendChild(b);
      }
      el.estado.appendChild(li);
    });

    if (pendiente) {
      el.btn.textContent = "📲 ENVIAR A " + turno.personas.join(" Y ").toUpperCase();
      el.btn.classList.remove("done");
    } else {
      el.btn.textContent = "✅ RECORDATORIOS LISTOS";
      el.btn.classList.add("done");
    }

    el.lista.innerHTML = "";
    TURNOS.slice(i, i + 3).forEach((t, k) => {
      const li = document.createElement("li");
      if (k === 0) li.className = "actual";
      const f = document.createElement("span"); f.className = "f"; f.textContent = fechaCorta(t.fecha);
      const n = document.createElement("span"); n.textContent = t.personas.join(" + ");
      li.append(f, n);
      el.lista.appendChild(li);
    });
  }

  el.btn.addEventListener("click", () => {
    const i = indiceProximo(new Date());
    if (i === -1) return;
    const turno = TURNOS[i];
    const hechos = leerEstado()[turno.fecha] || {};
    const pendientes = turno.personas.filter(p => !hechos[p]);

    if (!pendientes.length) {
      el.aviso.textContent = "Ya abriste los dos mensajes. Tocá “Abrir de nuevo” si querés repetir.";
      return;
    }

    // Un solo botón: abre el chat de cada persona pendiente.
    // window.open se ejecuta directamente dentro del clic para evitar bloqueos del navegador.
    let abiertos = 0;
    pendientes.forEach(nombre => {
      const url = armarLink(nombre, turno.fecha);
      if (!url) {
        el.aviso.textContent = "⚠️ Falta cargar el número de " + nombre + " en script.js";
        return;
      }

      const estado = leerEstado();
      estado[turno.fecha] = estado[turno.fecha] || {};
      estado[turno.fecha][nombre] = true;
      guardarEstado(estado);

      const w = window.open(url, "_blank", "noopener");
      if (w) abiertos++;
      else if (abiertos === 0) window.location.href = url;
    });

    if (abiertos > 0 || pendientes.length > 0) {
      el.aviso.textContent = "📲 Se abrieron los mensajes de " + turno.personas.join(" y ") + ".";
      render();
      el.btn.classList.add("pulse");
      setTimeout(() => el.btn.classList.remove("pulse"), 500);
    }
  });

  el.reiniciar.addEventListener("click", () => {
    const i = indiceProximo(new Date());
    if (i === -1) return;
    const estado = leerEstado();
    delete estado[TURNOS[i].fecha];
    guardarEstado(estado);
    el.aviso.textContent = "";
    render();
  });

  document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });
  render();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => { navigator.serviceWorker.register("./sw.js").catch(() => {}); });
  }
}
