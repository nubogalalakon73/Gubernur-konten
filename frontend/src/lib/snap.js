// Loads Midtrans Snap.js once on demand.
let snapPromise = null;

export function loadSnap({ clientKey, isProduction }) {
  if (!clientKey) return Promise.reject(new Error("CLIENT_KEY tidak tersedia"));
  if (typeof window !== "undefined" && window.snap) return Promise.resolve(window.snap);
  if (snapPromise) return snapPromise;

  const src = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  snapPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.snap));
      existing.addEventListener("error", () => reject(new Error("Snap.js gagal dimuat")));
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.setAttribute("data-client-key", clientKey);
    s.async = true;
    s.onload = () => resolve(window.snap);
    s.onerror = () => reject(new Error("Snap.js gagal dimuat"));
    document.head.appendChild(s);
  });
  return snapPromise;
}
