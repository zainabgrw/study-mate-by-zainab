import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { BrainCircuit, Check, Loader2, X } from "lucide-react";
import { generateQuiz, listQuizzes } from "@/lib/study.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type Question = { question: string; options: string[]; answer: number; explanation?: string };

export const Route = createFileRoute("/_authenticated/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz generator · Study Buddy" },
      { name: "description", content: "Generate AI-powered practice quizzes on any subject to test your understanding." },
      { property: "og:title", content: "Quiz generator · Study Buddy" },
      { property: "og:description", content: "Practice with AI-generated quizzes on any topic." },
    ],
  }),
  component: QuizPage,
});

function QuizPage() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const genFn = useServerFn(generateQuiz);
  const listFn = useServerFn(listQuizzes);
  const qc = useQueryClient();

  const { data: history = [] } = useQuery({ queryKey: ["quizzes"], queryFn: () => listFn() });

  const gen = useMutation({
    mutationFn: () => genFn({ data: { topic, count } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz ready!");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BrainCircuit className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Quiz generator</h1>
          <p className="text-sm text-muted-foreground">Generate practice questions on any topic.</p>
        </div>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 gap-3 pt-6 sm:grid-cols-[1fr_120px_auto]">
          <div className="space-y-1.5">
            <Label>Topic</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Newton's laws of motion" />
          </div>
          <div className="space-y-1.5">
            <Label>Questions</Label>
            <Input type="number" min={1} max={10} value={count} onChange={(e) => setCount(Number(e.target.value) || 5)} />
          </div>
          <div className="flex items-end">
            <Button className="w-full" disabled={!topic.trim() || gen.isPending} onClick={() => gen.mutate()}>
              {gen.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {gen.data && <QuizRunner quiz={gen.data.questions as unknown as Question[]} topic={gen.data.topic} />}

      {history.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Recent quizzes</h2>
          {history.map((q) => (
            <Card key={q.id}>
              <CardHeader className="py-3">
                <CardTitle className="text-base">{q.topic}</CardTitle>
                <div className="text-xs text-muted-foreground">
                  {(q.questions as unknown as Question[]).length} questions ·{" "}
                  {new Date(q.created_at).toLocaleString()}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function QuizRunner({ quiz, topic }: { quiz: Question[]; topic: string }) {
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState(false);
  const score = quiz.reduce((n, q, i) => (selected[i] === q.answer ? n + 1 : n), 0);

  return (
    <Card>
      <CardHeader><CardTitle>{topic}</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        {quiz.map((q, i) => (
          <div key={i} className="space-y-2">
            <div className="font-medium">{i + 1}. {q.question}</div>
            <div className="grid gap-2">
              {q.options.map((opt, j) => {
                const chosen = selected[i] === j;
                const correct = revealed && j === q.answer;
                const wrong = revealed && chosen && j !== q.answer;
                return (
                  <button
                    key={j}
                    onClick={() => !revealed && setSelected((s) => ({ ...s, [i]: j }))}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                      correct ? "border-emerald-500 bg-emerald-500/10"
                      : wrong ? "border-destructive bg-destructive/10"
                      : chosen ? "border-primary bg-primary/10"
                      : "hover:bg-accent/40"
                    }`}
                  >
                    {revealed && correct && <Check className="h-4 w-4 text-emerald-600" />}
                    {revealed && wrong && <X className="h-4 w-4 text-destructive" />}
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            {revealed && q.explanation && (
              <p className="text-xs text-muted-foreground">💡 {q.explanation}</p>
            )}
          </div>
        ))}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setRevealed((r) => !r)}>
            {revealed ? "Hide answers" : "Reveal answers"}
          </Button>
          {revealed && <div className="text-sm font-medium">Score: {score} / {quiz.length}</div>}
        </div>
      </CardContent>
    </Card>
  );
}