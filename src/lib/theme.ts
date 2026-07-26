export const THEMES = [
  { id: "blue", name: "Light Blue", color: "oklch(0.66 0.14 245)" },
  { id: "lavender", name: "Lavender", color: "oklch(0.63 0.15 300)" },
  { id: "mint", name: "Mint Green", color: "oklch(0.62 0.13 165)" },
  { id: "pink", name: "Pink", color: "oklch(0.68 0.16 350)" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

const STORAGE_KEY = "studymate-theme";
const MODE_KEY = "studymate-mode";

export function applyTheme(id: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", id);
  try { localStorage.setItem(STORAGE_KEY, id); } catch {}
}

export type Mode = "light" | "dark";

export function applyMode(mode: Mode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", mode === "dark");
  try { localStorage.setItem(MODE_KEY, mode); } catch {}
}

export function readStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "blue";
  const t = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
  return t && THEMES.some((x) => x.id === t) ? t : "blue";
}

export function readStoredMode(): Mode {
  if (typeof window === "undefined") return "light";
  const m = localStorage.getItem(MODE_KEY);
  return m === "dark" ? "dark" : "light";
}