import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Lightbulb, Loader2 } from "lucide-react";
import { explainTopic } from "@/lib/tools.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/topic")({
  head: () => ({ meta: [
    { title: "Topic Explainer · StudyMate AI" },
    { name: "description", content: "Get simple + detailed AI explanations of any topic with examples and exam tips." },
  ]}),
  component: TopicPage,
});

function TopicPage() {
  const [topic, setTopic] = useState("");
  const fn = useServerFn(explainTopic);
  const gen = useMutation({
    mutationFn: () => fn({ data: { topic } }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 overflow-y-auto p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Lightbulb className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold">Topic Explainer</h1>
          <p className="text-sm text-muted-foreground">Simple + detailed breakdowns with examples and exam tips.</p>
        </div>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 gap-3 pt-6 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <Label>Topic</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Quantum entanglement" />
          </div>
          <div className="flex items-end">
            <Button disabled={!topic.trim() || gen.isPending} onClick={() => gen.mutate()}>
              {gen.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Explain"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {gen.data && (
        <Card className="animate-in-up">
          <CardContent className="prose prose-sm max-w-none pt-6 dark:prose-invert">
            <ReactMarkdown>{gen.data.markdown}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}