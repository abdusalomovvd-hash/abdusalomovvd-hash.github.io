// Tez ochilish: ilova fayllari darhol saqlangan nusxadan beriladi, yangisi orqada yuklanadi (keyingi ochilishda ishlaydi).
// Shriftlar (Google Fonts) birinchi yuklanganda saqlanadi va keyin internetsiz ham ishlaydi.
const CACHE = "hisobchi-v32";
const FONTS = "hisobchi-fonts-v1";
const CORE = ["./", "index.html", "firebase-config.js", "i18n.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "icons/favicon.svg"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k !== FONTS).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com" || url.hostname === "www.gstatic.com") {
    e.respondWith(caches.open(FONTS).then((c) => c.match(req).then((hit) => {
      const net = fetch(req).then((res) => { if (res && (res.ok || res.type === "opaque")) c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then((c) => c.match(req, { ignoreSearch: true }).then((hit) => {
    const net = fetch(req).then((res) => { if (res && res.ok) c.put(req, res.clone()); return res; });
    if (hit) { net.catch(() => {}); return hit; }
    return net.catch(() => c.match("./"));
  })));
});
