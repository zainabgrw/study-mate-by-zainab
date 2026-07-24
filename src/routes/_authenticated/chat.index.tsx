import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, BrainCircuit, CalendarDays, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: ChatHome,
});

function ChatHome() {
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <BookOpen className="h-8 w-8" />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Study Buddy</h1>
        <p className="mt-2 text-muted-foreground">
          Ask any question, generate practice quizzes, or plan your week.
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        <Feature icon={<MessageSquare className="h-5 w-5" />} title="New chat" desc="Click + in the sidebar" />
        <Link to="/quiz">
          <Feature icon={<BrainCircuit className="h-5 w-5" />} title="Quiz me" desc="Practice any topic" />
        </Link>
        <Link to="/timetable">
          <Feature icon={<CalendarDays className="h-5 w-5" />} title="Plan week" desc="Build a study schedule" />
        </Link>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 text-left transition hover:border-primary hover:shadow-sm">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </div>
      <div className="font-medium">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </div>
  );
}