import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BrainCircuit, MessageSquare, Layers, Lightbulb, Loader2 } from "lucide-react";
import { Logo, Wordmark } from "@/components/logo";
import { createThread } from "@/lib/threads.functions";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: ChatHome,
});

function ChatHome() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const createFn = useServerFn(createThread);
  const createMut = useMutation({
    mutationFn: () => createFn(),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
    },
  });
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-6 p-8 text-center animate-in-up">
      <Logo size={64} />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to <Wordmark /></h1>
        <p className="mt-2 text-muted-foreground">
          Ask any question — or jump into one of your study tools.
        </p>
      </div>
      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => createMut.mutate()}
          disabled={createMut.isPending}
          className="text-left disabled:opacity-60"
        >
          <Feature
            icon={createMut.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquare className="h-5 w-5" />}
            title="New chat"
            desc="Start a fresh conversation"
          />
        </button>
        <Link to="/topic">
          <Feature icon={<Lightbulb className="h-5 w-5" />} title="Explain topic" desc="Full breakdown" />
        </Link>
        <Link to="/quiz">
          <Feature icon={<BrainCircuit className="h-5 w-5" />} title="Quiz me" desc="Practice any topic" />
        </Link>
        <Link to="/flashcards">
          <Feature icon={<Layers className="h-5 w-5" />} title="Flashcards" desc="Flip to learn" />
        </Link>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card-lift rounded-xl border bg-card p-4 text-left">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </div>
      <div className="font-medium">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </div>
  );
}