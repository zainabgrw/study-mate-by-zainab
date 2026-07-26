import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut, Settings as SettingsIcon, Volume2, VolumeX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { THEMES, applyMode, applyTheme, readStoredMode, readStoredTheme, type Mode, type ThemeId } from "@/lib/theme";
import { EDUCATION_LEVELS, LANGUAGES, readProfile, saveProfile, type Profile } from "@/lib/profile";
import { readSoundEnabled, setSoundEnabled } from "@/lib/sound";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [
    { title: "Settings · StudyMate AI" },
    { name: "description", content: "Adjust theme, language, sound, and profile settings." },
  ]}),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [theme, setThemeState] = useState<ThemeId>("blue");
  const [mode, setModeState] = useState<Mode>("light");
  const [sound, setSound] = useState(true);
  const [fontSize, setFontSize] = useState("16");

  useEffect(() => {
    setProfile(readProfile());
    setThemeState(readStoredTheme());
    setModeState(readStoredMode());
    setSound(readSoundEnabled());
    const fs = localStorage.getItem("studymate-fontsize") || "16";
    setFontSize(fs);
    document.documentElement.style.fontSize = `${fs}px`;
  }, []);

  const save = () => {
    if (profile) saveProfile(profile);
    localStorage.setItem("studymate-fontsize", fontSize);
    document.documentElement.style.fontSize = `${fontSize}px`;
    toast.success("Settings saved");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 overflow-y-auto p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><SettingsIcon className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Personalize StudyMate AI.</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Color theme</Label>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setThemeState(t.id); applyTheme(t.id); }}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${theme === t.id ? "border-primary bg-primary/10" : "hover:bg-accent/50"}`}
                >
                  <span className="h-4 w-4 rounded-full border" style={{ background: t.color }} />
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-2 block">Mode</Label>
            <div className="flex gap-2">
              {(["light", "dark"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setModeState(m); applyMode(m); }}
                  className={`rounded-full border px-3 py-1.5 text-sm capitalize transition ${mode === m ? "border-primary bg-primary/10" : "hover:bg-accent/50"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Font size ({fontSize}px)</Label>
            <Input type="range" min={14} max={20} step={1} value={fontSize} onChange={(e) => setFontSize(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sound</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="text-sm">Play soft click sounds on interaction</span>
          </div>
          <Switch checked={sound} onCheckedChange={(v) => { setSound(v); setSoundEnabled(v); }} />
        </CardContent>
      </Card>

      {profile && (
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Name</Label><Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Age</Label><Input value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label>Language</Label>
              <Select value={profile.language} onValueChange={(v) => setProfile({ ...profile, language: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Education</Label>
              <Select value={profile.education} onValueChange={(v) => setProfile({ ...profile, education: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EDUCATION_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={save}>Save changes</Button>
        <Button variant="destructive" onClick={logout} className="gap-2"><LogOut className="h-4 w-4" /> Logout</Button>
      </div>
    </div>
  );
}