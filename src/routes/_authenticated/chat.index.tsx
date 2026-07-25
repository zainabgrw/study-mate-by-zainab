import { createFileRoute, Link } from "@tanstack/react-router";
import { BrainCircuit, CalendarDays, MessageSquare, Layers, Lightbulb } from "lucide-react";
import { Logo, Wordmark } from "@/components/logo";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: ChatHome,
});

function ChatHome() {
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
        <Feature icon={<MessageSquare className="h-5 w-5" />} title="New chat" desc="Click + in sidebar" />
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