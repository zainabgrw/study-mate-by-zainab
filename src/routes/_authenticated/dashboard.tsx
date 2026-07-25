import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  MessageSquare, FileText, Image as ImageIcon, HelpCircle, CalendarDays,
  BrainCircuit, Layers, Network, Lightbulb, Code2, Sparkles,
} from "lucide-react";
import { readProfile } from "@/lib/profile";
import { Wordmark } from "@/components/logo";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · StudyMate AI" },
      { name: "description", content: "Your StudyMate AI dashboard — chat, notes, quizzes, flashcards, mind maps, planner, and more." },
    ],
  }),
  component: Dashboard,
});

type Tile = {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  tint: string;
};

const TILES: Tile[] = [
  { to: "/chat", icon: <MessageSquare className="h-6 w-6" />, title: "AI Chat Tutor", desc: "Ask any study question", tint: "from-[oklch(0.93_0.05_240)] to-[oklch(0.9_0.06_255)]" },
  { to: "/notes", icon: <FileText className="h-6 w-6" />, title: "Upload Notes", desc: "Summarize · Extract · Explain", tint: "from-[oklch(0.93_0.06_300)] to-[oklch(0.9_0.06_280)]" },
  { to: "/topic", icon: <Lightbulb className="h-6 w-6" />, title: "Topic Explainer", desc: "Deep, exam-ready breakdowns", tint: "from-[oklch(0.93_0.06_160)] to-[oklch(0.9_0.06_140)]" },
  { to: "/quiz", icon: <HelpCircle className="h-6 w-6" />, title: "Quiz Generator", desc: "MCQs with explanations", tint: "from-[oklch(0.93_0.06_350)] to-[oklch(0.9_0.06_330)]" },
  { to: "/flashcards", icon: <Layers className="h-6 w-6" />, title: "Flashcards", desc: "Flip cards from any text", tint: "from-[oklch(0.93_0.05_240)] to-[oklch(0.9_0.06_220)]" },
  { to: "/mindmap", icon: <Network className="h-6 w-6" />, title: "Mind Map", desc: "Visual concept map", tint: "from-[oklch(0.93_0.06_300)] to-[oklch(0.9_0.06_320)]" },
  { to: "/code", icon: <Code2 className="h-6 w-6" />, title: "Code Helper", desc: "Explain · Debug · Optimize · Convert", tint: "from-[oklch(0.93_0.06_160)] to-[oklch(0.9_0.06_180)]" },
  { to: "/timetable", icon: <CalendarDays className="h-6 w-6" />, title: "Study Planner", desc: "Personalized weekly schedule", tint: "from-[oklch(0.93_0.06_350)] to-[oklch(0.9_0.06_10)]" },
  { to: "/quiz", icon: <BrainCircuit className="h-6 w-6" />, title: "Ask Question", desc: "Quick answers on any topic", tint: "from-[oklch(0.93_0.05_240)] to-[oklch(0.9_0.06_260)]" },
  { to: "/notes", icon: <ImageIcon className="h-6 w-6" />, title: "Upload Image", desc: "Coming soon", tint: "from-[oklch(0.93_0.06_300)] to-[oklch(0.9_0.06_290)]" },
];

function Dashboard() {
  const [name, setName] = useState<string>("there");
  useEffect(() => {
    const p = readProfile();
    if (p?.name) setName(p.name.split(" ")[0]);
  }, []);

  return (
    <div className="mx-auto h-full max-w-6xl overflow-y-auto p-6 md:p-8">
      <div className="mb-8 animate-in-up">
        <div className="inline-flex items-center gap-2 rounded-full border bg-white/60 px-3 py-1 text-xs font-medium text-primary shadow-sm backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" /> Powered by AI
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
          Hi {name}, welcome back to <Wordmark />
        </h1>
        <p className="mt-1 text-muted-foreground">Pick a tool to get started — everything is one click away.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {TILES.map((t, i) => (
          <Link key={`${t.to}-${i}`} to={t.to as never}>
            <div
              className={`card-lift group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${t.tint} p-5 shadow-sm animate-in-up`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/70 text-primary shadow-sm backdrop-blur">
                {t.icon}
              </div>
              <div className="mt-4 text-lg font-semibold text-foreground">{t.title}</div>
              <div className="text-sm text-foreground/70">{t.desc}</div>
              <Sparkles className="absolute right-3 top-3 h-4 w-4 text-primary/50 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}