import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Network, Loader2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { generateMindMap } from "@/lib/tools.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type Node = { label: string; children?: Node[] };
type Map = { root: string; children: Node[] };

export const Route = createFileRoute("/_authenticated/mindmap")({
  head: () => ({ meta: [
    { title: "Mind Map · StudyMate AI" },
    { name: "description", content: "Generate visual mind maps from any topic." },
  ]}),
  component: MindMapPage,
});

function MindMapPage() {
  const [topic, setTopic] = useState("");
  const [map, setMap] = useState<Map | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const genFn = useServerFn(generateMindMap);

  const gen = useMutation({
    mutationFn: () => genFn({ data: { topic } }),
    onSuccess: (m) => { setMap(m); setZoom(1); setPan({ x: 0, y: 0 }); toast.success("Mind map ready"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-4 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Network className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold">Mind Map</h1>
          <p className="text-sm text-muted-foreground">Visualize any topic as connected concepts.</p>
        </div>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 gap-3 pt-6 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <Label>Topic</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Photosynthesis" />
          </div>
          <div className="flex items-end">
            <Button disabled={!topic.trim() || gen.isPending} onClick={() => gen.mutate()}>
              {gen.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {map && (
        <div className="relative flex-1 overflow-hidden rounded-2xl border bg-white/40 backdrop-blur">
          <div className="absolute right-3 top-3 z-10 flex gap-1">
            <Button size="icon" variant="outline" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
            <Button size="icon" variant="outline" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
            <Button size="icon" variant="outline" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}><RotateCcw className="h-4 w-4" /></Button>
          </div>
          <div
            className="h-full w-full cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => { dragRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }; }}
            onMouseMove={(e) => { if (dragRef.current) setPan({ x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y }); }}
            onMouseUp={() => { dragRef.current = null; }}
            onMouseLeave={() => { dragRef.current = null; }}
          >
            <div
              className="origin-center transition-transform"
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
            >
              <MindTree map={map} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MindTree({ map }: { map: Map }) {
  const branches = map.children ?? [];
  return (
    <div className="flex min-h-[500px] items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-2xl bg-primary px-5 py-3 font-bold text-primary-foreground shadow-lg">
          {map.root}
        </div>
        <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 md:grid-cols-3">
          {branches.map((b, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm ${TINTS[i % TINTS.length]}`}>
                {b.label}
              </div>
              {b.children && b.children.length > 0 && (
                <div className="flex flex-col items-center gap-1 border-l-2 border-dashed border-primary/30 pl-3">
                  {b.children.map((c, j) => (
                    <div key={j} className="rounded-lg bg-accent/70 px-3 py-1 text-xs text-accent-foreground">
                      {c.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const TINTS = [
  "bg-[oklch(0.93_0.05_240)] text-foreground",
  "bg-[oklch(0.92_0.06_300)] text-foreground",
  "bg-[oklch(0.93_0.06_160)] text-foreground",
  "bg-[oklch(0.93_0.06_350)] text-foreground",
  "bg-[oklch(0.93_0.05_60)] text-foreground",
  "bg-[oklch(0.93_0.05_200)] text-foreground",
];