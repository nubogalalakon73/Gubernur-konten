// Tiny event bus to open the AI chat from anywhere on the page.
const EV = "gk:open-chat";

export function openChat(payload = {}) {
  window.dispatchEvent(new CustomEvent(EV, { detail: payload }));
}

export function onOpenChat(handler) {
  const fn = (e) => handler(e.detail || {});
  window.addEventListener(EV, fn);
  return () => window.removeEventListener(EV, fn);
}
