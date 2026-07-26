import { useEffect, useState } from "react";
import { Moon, Palette, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { THEMES, applyMode, applyTheme, readStoredMode, readStoredTheme, type Mode, type ThemeId } from "@/lib/theme";

export function ThemePicker() {
  const [theme, setTheme] = useState<ThemeId>("blue");
  const [mode, setMode] = useState<Mode>("light");

  useEffect(() => {
    const t = readStoredTheme();
    const m = readStoredMode();
    setTheme(t);
    setMode(m);
    applyTheme(t);
    applyMode(m);
  }, []);

  const cycleMode = () => {
    const next: Mode = mode === "dark" ? "light" : "dark";
    setMode(next);
    applyMode(next);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme mode"
        onClick={cycleMode}
      >
        {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Color theme">
            <Palette className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Color theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {THEMES.map((t) => (
            <DropdownMenuItem
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                applyTheme(t.id);
              }}
              className="gap-2"
            >
              <span
                className="inline-block h-4 w-4 rounded-full border"
                style={{ background: t.color }}
              />
              <span className="flex-1">{t.name}</span>
              {theme === t.id && <span className="text-xs text-muted-foreground">Active</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}