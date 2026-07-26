import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Loader2, Plus, X, Download, LayoutList, CalendarRange } from "lucide-react";
import { generateTimetable, listTimetables } from "@/lib/study.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { downloadStudyPdf } from "@/lib/pdf";

type Plan = { days: { day: string; focus?: string; blocks: { time: string; task: string }[] }[] };

export const Route = createFileRoute("/_authenticated/timetable")({
  head: () => ({
    meta: [
      { title: "Study Planner · StudyMate AI" },
      { name: "description", content: "Plan subjects across a calendar with a personalized AI study timetable." },
      { property: "og:title", content: "Study Planner · StudyMate AI" },
      { property: "og:description", content: "AI-generated study plans tailored to your goals." },
    ],
  }),
  component: TimetablePage,
});

function TimetablePage() {
  const [goal, setGoal] = useState("");
  const [days, setDays] = useState(7);
  const [hours, setHours] = useState(2);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [examDate, setExamDate] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [view, setView] = useState<"list" | "calendar">("calendar");
  const genFn = useServerFn(generateTimetable);
  const listFn = useServerFn(listTimetables);
  const qc = useQueryClient();

  const { data: history = [] } = useQuery({ queryKey: ["timetables"], queryFn: () => listFn() });

  const gen = useMutation({
    mutationFn: () =>
      genFn({
        data: {
          goal,
          days,
          hoursPerDay: hours,
          subjects,
          examDate: examDate || undefined,
          startDate: startDate || undefined,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timetables"] });
      toast.success("Timetable ready!");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const active = (gen.data?.plan as unknown as Plan) ?? (history[0]?.plan as unknown as Plan | undefined);
  const activeTitle = gen.data?.title ?? history[0]?.title;

  const addSubject = () => {
    const s = subjectInput.trim();
    if (!s) return;
    if (subjects.includes(s)) { setSubjectInput(""); return; }
    setSubjects((prev) => [...prev, s]);
    setSubjectInput("");
  };

  const dateFor = (index: number) => {
    if (!startDate) return null;
    const d = new Date(startDate);
    if (Number.isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + index);
    return d;
  };

  const exportPdf = () => {
    if (!active) return;
    const md = [
      `# ${activeTitle ?? "Study Plan"}`,
      "",
      subjects.length ? `**Subjects:** ${subjects.join(", ")}` : "",
      examDate ? `**Exam date:** ${examDate}` : "",
      "",
      ...active.days.flatMap((d, i) => {
        const date = dateFor(i);
        const header = `## ${d.day}${date ? ` — ${date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}` : ""}`;
        const focus = d.focus ? `_${d.focus}_` : "";
        const blocks = (d.blocks ?? []).map((b) => `- **${b.time}** — ${b.task}`);
        return [header, focus, "", ...blocks, ""];
      }),
    ].join("\n");
    downloadStudyPdf({ title: activeTitle ?? "Study Plan", subtitle: goal || undefined, markdown: md });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 overflow-y-auto p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Study Planner</h1>
          <p className="text-sm text-muted-foreground">A personalized calendar built from your subjects, exam date and goals.</p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1.5">
            <Label>Goal</Label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Prepare for Calculus final in 2 weeks" />
          </div>

          <div className="space-y-1.5">
            <Label>Subjects</Label>
            <div className="flex gap-2">
              <Input
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubject(); } }}
                placeholder="Add a subject and press Enter (e.g. Calculus)"
              />
              <Button type="button" variant="secondary" onClick={addSubject}><Plus className="h-4 w-4" /></Button>
            </div>
            {subjects.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {subjects.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1 pr-1">
                    {s}
                    <button type="button" onClick={() => setSubjects((p) => p.filter((x) => x !== s))} className="ml-1 rounded hover:bg-muted-foreground/20">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Start date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Exam date</Label>
              <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Days</Label>
              <Input type="number" min={1} max={30} value={days} onChange={(e) => setDays(Number(e.target.value) || 7)} />
            </div>
            <div className="space-y-1.5">
              <Label>Hours/day</Label>
              <Input type="number" min={0.5} max={12} step={0.5} value={hours} onChange={(e) => setHours(Number(e.target.value) || 2)} />
            </div>
          </div>

          <Button className="w-full sm:w-auto" disabled={!goal.trim() || gen.isPending} onClick={() => gen.mutate()}>
            {gen.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : "Generate plan"}
          </Button>
        </CardContent>
      </Card>

      {active && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-lg">{activeTitle}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-md border p-0.5">
                <Button size="sm" variant={view === "calendar" ? "default" : "ghost"} onClick={() => setView("calendar")}>
                  <CalendarRange className="mr-1 h-4 w-4" /> Calendar
                </Button>
                <Button size="sm" variant={view === "list" ? "default" : "ghost"} onClick={() => setView("list")}>
                  <LayoutList className="mr-1 h-4 w-4" /> List
                </Button>
              </div>
              <Button size="sm" variant="outline" onClick={exportPdf}>
                <Download className="mr-1 h-4 w-4" /> PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {view === "calendar" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {active.days?.map((d, i) => {
                  const date = dateFor(i);
                  const isExam = examDate && date && date.toISOString().slice(0, 10) === examDate;
                  return (
                    <div key={i} className={`animate-in-up rounded-xl border p-3 card-lift ${isExam ? "border-primary bg-primary/5" : "bg-card"}`}>
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold">{d.day}</div>
                          {date && (
                            <div className="text-xs text-muted-foreground">
                              {date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                            </div>
                          )}
                        </div>
                        {isExam && <Badge>Exam</Badge>}
                      </div>
                      {d.focus && <div className="mb-2 text-xs font-medium text-primary">{d.focus}</div>}
                      <ul className="space-y-1.5">
                        {d.blocks?.map((b, j) => (
                          <li key={j} className="rounded-md bg-muted/50 px-2 py-1.5 text-xs">
                            <div className="font-mono text-[11px] text-muted-foreground">{b.time}</div>
                            <div>{b.task}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {active.days?.map((d, i) => {
                  const date = dateFor(i);
                  return (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="mb-2 flex items-baseline justify-between">
                        <div className="font-semibold">
                          {d.day}
                          {date && <span className="ml-2 text-xs font-normal text-muted-foreground">{date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>}
                        </div>
                        {d.focus && <div className="text-xs text-muted-foreground">{d.focus}</div>}
                      </div>
                      <ul className="space-y-1">
                        {d.blocks?.map((b, j) => (
                          <li key={j} className="flex gap-3 text-sm">
                            <span className="w-28 shrink-0 font-mono text-muted-foreground">{b.time}</span>
                            <span>{b.task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}