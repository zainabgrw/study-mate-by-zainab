import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Loader2 } from "lucide-react";
import { generateTimetable, listTimetables } from "@/lib/study.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Plan = { days: { day: string; focus?: string; blocks: { time: string; task: string }[] }[] };

export const Route = createFileRoute("/_authenticated/timetable")({
  head: () => ({
    meta: [
      { title: "Study timetable · Study Buddy" },
      { name: "description", content: "Build a personalized AI study timetable to hit your learning goals." },
      { property: "og:title", content: "Study timetable · Study Buddy" },
      { property: "og:description", content: "AI-generated study plans tailored to your goals." },
    ],
  }),
  component: TimetablePage,
});

function TimetablePage() {
  const [goal, setGoal] = useState("");
  const [days, setDays] = useState(7);
  const [hours, setHours] = useState(2);
  const genFn = useServerFn(generateTimetable);
  const listFn = useServerFn(listTimetables);
  const qc = useQueryClient();

  const { data: history = [] } = useQuery({ queryKey: ["timetables"], queryFn: () => listFn() });

  const gen = useMutation({
    mutationFn: () => genFn({ data: { goal, days, hoursPerDay: hours } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timetables"] });
      toast.success("Timetable ready!");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const active = (gen.data?.plan as unknown as Plan) ?? (history[0]?.plan as unknown as Plan | undefined);
  const activeTitle = gen.data?.title ?? history[0]?.title;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Study timetable</h1>
          <p className="text-sm text-muted-foreground">Get a personalized plan for the week.</p>
        </div>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 gap-3 pt-6 sm:grid-cols-[1fr_100px_100px_auto]">
          <div className="space-y-1.5">
            <Label>Goal</Label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Prepare for Calculus final in 2 weeks" />
          </div>
          <div className="space-y-1.5">
            <Label>Days</Label>
            <Input type="number" min={1} max={30} value={days} onChange={(e) => setDays(Number(e.target.value) || 7)} />
          </div>
          <div className="space-y-1.5">
            <Label>Hours/day</Label>
            <Input type="number" min={0.5} max={12} step={0.5} value={hours} onChange={(e) => setHours(Number(e.target.value) || 2)} />
          </div>
          <div className="flex items-end">
            <Button className="w-full" disabled={!goal.trim() || gen.isPending} onClick={() => gen.mutate()}>
              {gen.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {active && (
        <Card>
          <CardHeader><CardTitle>{activeTitle}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {active.days?.map((d, i) => (
              <div key={i} className="rounded-lg border p-3">
                <div className="mb-2 flex items-baseline justify-between">
                  <div className="font-semibold">{d.day}</div>
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
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}