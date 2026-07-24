export const THEMES = [
  { id: "indigo", name: "Indigo", color: "oklch(0.55 0.22 270)" },
  { id: "emerald", name: "Emerald", color: "oklch(0.58 0.15 160)" },
  { id: "rose", name: "Rose", color: "oklch(0.6 0.2 15)" },
  { id: "amber", name: "Amber", color: "oklch(0.72 0.17 70)" },
  { id: "cyan", name: "Cyan", color: "oklch(0.6 0.13 220)" },
  { id: "slate", name: "Slate", color: "oklch(0.35 0.03 260)" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

const STORAGE_KEY = "study-buddy-theme";
const MODE_KEY = "study-buddy-mode";

export function applyTheme(id: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", id);
  try { localStorage.setItem(STORAGE_KEY, id); } catch {}
}

export function applyMode(mode: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", mode === "dark");
  try { localStorage.setItem(MODE_KEY, mode); } catch {}
}

export function readStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "indigo";
  const t = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
  return t && THEMES.some((x) => x.id === t) ? t : "indigo";
}

export function readStoredMode(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem(MODE_KEY) as "light" | "dark") || "light";
}