const CACHE = "cantos-v3";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./push.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== location.origin
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copia = response.clone();

        caches.open(CACHE).then(cache => {
          cache.put(event.request, copia);
        });

        return response;
      })
      .catch(() =>
        caches.match(event.request).then(
          response => response || caches.match("./index.html")
        )
      )
  );
});

/* ===== PUSH ===== */

self.addEventListener("push", event => {
  let datos = {};

  try {
    datos = event.data
      ? event.data.json()
      : {};
  } catch (error) {
    datos = {
      body: event.data
        ? event.data.text()
        : ""
    };
  }

  event.waitUntil(
    self.registration.showNotification(
      datos.title || "🔔 Recordatorio de cantos",
      {
        body: datos.body || "Tenés un nuevo recordatorio.",
        icon: "./icon-192.png",
        badge: "./icon-192.png",
        tag: datos.tag || "cantos",
        data: {
          url: datos.url || "./"
        }
      }
    )
  );
});

/* ===== CLICK EN LA NOTIFICACIÓN ===== */

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const destino = new URL(
    event.notification.data?.url || "./",
    self.registration.scope
  ).href;

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(lista => {

      for (const cliente of lista) {
        if (
          cliente.url.startsWith(self.registration.scope) &&
          "focus" in cliente
        ) {
          return cliente.focus();
        }
      }

      return clients.openWindow(destino);
    })
  );
});const CACHE = "cantos-v3";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./push.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== location.origin
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copia = response.clone();

        caches.open(CACHE).then(cache => {
          cache.put(event.request, copia);
        });

        return response;
      })
      .catch(() =>
        caches.match(event.request).then(
          response => response || caches.match("./index.html")
        )
      )
  );
});

/* ===== PUSH ===== */

self.addEventListener("push", event => {
  let datos = {};

  try {
    datos = event.data
      ? event.data.json()
      : {};
  } catch (error) {
    datos = {
      body: event.data
        ? event.data.text()
        : ""
    };
  }

  event.waitUntil(
    self.registration.showNotification(
      datos.title || "🔔 Recordatorio de cantos",
      {
        body: datos.body || "Tenés un nuevo recordatorio.",
        icon: "./icon-192.png",
        badge: "./icon-192.png",
        tag: datos.tag || "cantos",
        data: {
          url: datos.url || "./"
        }
      }
    )
  );
});

/* ===== CLICK EN LA NOTIFICACIÓN ===== */

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const destino = new URL(
    event.notification.data?.url || "./",
    self.registration.scope
  ).href;

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(lista => {

      for (const cliente of lista) {
        if (
          cliente.url.startsWith(self.registration.scope) &&
          "focus" in cliente
        ) {
          return cliente.focus();
        }
      }

      return clients.openWindow(destino);
    })
  );
});const CACHE = "cantos-v3";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./push.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== location.origin
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copia = response.clone();

        caches.open(CACHE).then(cache => {
          cache.put(event.request, copia);
        });

        return response;
      })
      .catch(() =>
        caches.match(event.request).then(
          response => response || caches.match("./index.html")
        )
      )
  );
});

/* ===== PUSH ===== */

self.addEventListener("push", event => {
  let datos = {};

  try {
    datos = event.data
      ? event.data.json()
      : {};
  } catch (error) {
    datos = {
      body: event.data
        ? event.data.text()
        : ""
    };
  }

  event.waitUntil(
    self.registration.showNotification(
      datos.title || "🔔 Recordatorio de cantos",
      {
        body: datos.body || "Tenés un nuevo recordatorio.",
        icon: "./icon-192.png",
        badge: "./icon-192.png",
        tag: datos.tag || "cantos",
        data: {
          url: datos.url || "./"
        }
      }
    )
  );
});

/* ===== CLICK EN LA NOTIFICACIÓN ===== */

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const destino = new URL(
    event.notification.data?.url || "./",
    self.registration.scope
  ).href;

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(lista => {

      for (const cliente of lista) {
        if (
          cliente.url.startsWith(self.registration.scope) &&
          "focus" in cliente
        ) {
          return cliente.focus();
        }
      }

      return clients.openWindow(destino);
    })
  );
});
