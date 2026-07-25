const KEY = "studymate-sound";

export function readSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const v = localStorage.getItem(KEY);
  return v === null ? true : v === "1";
}

export function setSoundEnabled(on: boolean) {
  try { localStorage.setItem(KEY, on ? "1" : "0"); } catch {}
}

let ctx: AudioContext | null = null;

export function playClick() {
  if (typeof window === "undefined") return;
  if (!readSoundEnabled()) return;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(880, t);
    o.frequency.exponentialRampToValueAtTime(560, t + 0.09);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.14);
  } catch { /* noop */ }
}

export function installGlobalClickSound() {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const el = e.target as HTMLElement | null;
    if (!el) return;
    if (el.closest('button, [role="button"], a[href]')) playClick();
  };
  document.addEventListener("click", handler, true);
  return () => document.removeEventListener("click", handler, true);
}