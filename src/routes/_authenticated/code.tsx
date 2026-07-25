import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Code2, Loader2 } from "lucide-react";
import { codeAssist } from "@/lib/tools.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LANGS = ["C++", "Python", "Java", "JavaScript", "TypeScript", "HTML", "CSS", "Go", "Rust"];
type Action = "explain" | "bugs" | "optimize" | "convert";

export const Route = createFileRoute("/_authenticated/code")({
  head: () => ({ meta: [
    { title: "Code Helper · StudyMate AI" },
    { name: "description", content: "Explain, debug, optimize, or convert code with AI." },
  ]}),
  component: CodeHelperPage,
});

function CodeHelperPage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("Python");
  const [action, setAction] = useState<Action>("explain");
  const [target, setTarget] = useState("JavaScript");
  const fn = useServerFn(codeAssist);
  const run = useMutation({
    mutationFn: () => fn({ data: { code, language, action, target } }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 overflow-y-auto p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Code2 className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold">Code Helper</h1>
          <p className="text-sm text-muted-foreground">Explain · Find bugs · Optimize · Convert.</p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LANGS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Action</Label>
              <Select value={action} onValueChange={(v) => setAction(v as Action)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="explain">Explain</SelectItem>
                  <SelectItem value="bugs">Find bugs</SelectItem>
                  <SelectItem value="optimize">Optimize</SelectItem>
                  <SelectItem value="convert">Convert to…</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {action === "convert" && (
              <div className="space-y-1.5">
                <Label>Target</Label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LANGS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Code</Label>
            <Textarea rows={10} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste your code here…" className="font-mono text-xs" />
          </div>
          <Button disabled={!code.trim() || run.isPending} onClick={() => run.mutate()}>
            {run.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Run"}
          </Button>
        </CardContent>
      </Card>

      {run.data && (
        <Card className="animate-in-up">
          <CardContent className="prose prose-sm max-w-none pt-6 dark:prose-invert prose-pre:my-2">
            <ReactMarkdown>{run.data.markdown}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}