import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { FileText, Loader2, Upload, Download } from "lucide-react";
import { notesAssist } from "@/lib/tools.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { downloadStudyPdf } from "@/lib/pdf";

type Action = "summarize" | "keypoints" | "explain" | "translate";

export const Route = createFileRoute("/_authenticated/notes")({
  head: () => ({ meta: [
    { title: "Upload Notes · StudyMate AI" },
    { name: "description", content: "Upload or paste notes and let AI summarize, extract key points, or translate them." },
  ]}),
  component: NotesPage,
});

function NotesPage() {
  const [source, setSource] = useState("");
  const [fileName, setFileName] = useState<string>("");
  const [translateTo, setTranslateTo] = useState("English");
  const fn = useServerFn(notesAssist);

  const [action, setAction] = useState<Action | null>(null);
  const run = useMutation({
    mutationFn: (a: Action) => {
      setAction(a);
      return fn({ data: { source, action: a, targetLanguage: translateTo } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const onFile = async (f: File) => {
    setFileName(f.name);
    const name = f.name.toLowerCase();
    try {
      if (f.type.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".md")) {
        setSource(await f.text());
      } else if (name.endsWith(".pdf") || f.type === "application/pdf") {
        const pdfjs: any = await import("pdfjs-dist");
        const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
        const buf = await f.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: buf }).promise;
        let text = "";
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((it: any) => it.str).join(" ") + "\n\n";
        }
        setSource(text.trim());
        toast.success(`Extracted ${doc.numPages} page(s) of text`);
      } else if (name.endsWith(".docx")) {
        const mammoth: any = await import("mammoth/mammoth.browser");
        const buf = await f.arrayBuffer();
        const res = await mammoth.extractRawText({ arrayBuffer: buf });
        setSource(res.value);
        toast.success("Loaded DOCX text");
      } else {
        toast.info("Unsupported file type. Paste the content below.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to read file");
    }
  };

  const disabled = source.trim().length < 10 || run.isPending;
  const disabledReason = source.trim().length < 10 ? "Upload a file or paste at least 10 characters" : "";

  return (
    <div className="mx-auto max-w-4xl space-y-6 overflow-y-auto p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><FileText className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold">Upload Notes</h1>
          <p className="text-sm text-muted-foreground">Summarize · Extract key points · Explain concepts · Translate.</p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label className="mb-2 flex items-center gap-2"><Upload className="h-4 w-4" /> Upload file (.txt / .md) or paste below</Label>
            <Input
              type="file"
              accept=".txt,.md,text/plain,application/pdf,.docx,.pptx"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
            />
            {fileName && <div className="mt-1 text-xs text-muted-foreground">Loaded: {fileName} · {source.length} chars</div>}
          </div>
          <div className="space-y-1.5">
            <Label>Content</Label>
            <Textarea rows={10} value={source} onChange={(e) => setSource(e.target.value)} placeholder="Paste your notes or lecture text here…" />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button disabled={disabled} onClick={() => run.mutate("summarize")}>Summarize</Button>
            <Button disabled={disabled} variant="secondary" onClick={() => run.mutate("keypoints")}>Key points</Button>
            <Button disabled={disabled} variant="secondary" onClick={() => run.mutate("explain")}>Explain concepts</Button>
            <Button disabled={disabled} variant="secondary" onClick={() => run.mutate("translate")}>Translate</Button>
          </div>
          {disabledReason && <p className="text-xs text-muted-foreground">{disabledReason}</p>}
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Translate to:</Label>
            <Input className="max-w-[180px]" value={translateTo} onChange={(e) => setTranslateTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {run.isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Working on {action}…
        </div>
      )}
      {run.data && (
        <Card className="animate-in-up">
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <div className="text-sm font-medium text-muted-foreground capitalize">{action ?? "Result"}</div>
            <Button size="sm" variant="outline" onClick={() => downloadStudyPdf({ title: fileName || `Notes — ${action ?? "result"}`, subtitle: action ? `AI ${action}` : undefined, markdown: run.data!.markdown })}>
              <Download className="mr-1 h-4 w-4" /> Download PDF
            </Button>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none pt-4 dark:prose-invert">
            <ReactMarkdown>{run.data.markdown}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}