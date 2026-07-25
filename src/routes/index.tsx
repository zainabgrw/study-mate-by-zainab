import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, Sparkles, Laptop, PenLine, Notebook, ArrowRight, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo, Wordmark } from "@/components/logo";
import heroImg from "@/assets/hero-illustration.jpg";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "StudyMate AI — Your Smart Learning Companion" },
      { name: "description", content: "Ask questions, summarize notes, generate quizzes, create flashcards, plan your studies, and learn smarter with AI." },
      { property: "og:title", content: "StudyMate AI — Your Smart Learning Companion" },
      { property: "og:description", content: "AI tutoring, notes, quizzes, flashcards, mind maps and study plans in one calm, modern app." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
      else setChecking(false);
    });
  }, [navigate]);

  if (checking) return <div className="min-h-screen bg-pastel" />;

  return (
    <div className="relative min-h-screen overflow-hidden bg-pastel">
      {/* Floating decorative icons */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        <BookOpen className="absolute left-[6%] top-[18%] h-10 w-10 text-primary/30 animate-float" />
        <GraduationCap className="absolute right-[10%] top-[14%] h-12 w-12 text-primary/40 animate-float-slow" />
        <Notebook className="absolute left-[12%] bottom-[18%] h-9 w-9 text-primary/30 animate-float-slow" />
        <Laptop className="absolute right-[8%] bottom-[22%] h-10 w-10 text-primary/30 animate-float" />
        <PenLine className="absolute left-[42%] top-[8%] h-7 w-7 text-primary/30 animate-float" />
        <Sparkles className="absolute right-[38%] bottom-[10%] h-8 w-8 text-primary/40 animate-float-slow" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <Logo size={40} />
          <Wordmark className="text-lg" />
        </div>
        <Link to="/auth">
          <Button variant="ghost" className="gap-2">
            <LogIn className="h-4 w-4" /> Sign In
          </Button>
        </Link>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 md:py-16 lg:grid-cols-2">
        <div className="animate-in-up space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border bg-white/60 px-3 py-1 text-xs font-medium text-primary shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Smarter studying, powered by AI
          </div>
          <h1 className="text-5xl font-black leading-tight tracking-tight text-foreground md:text-6xl">
            <Wordmark />
          </h1>
          <p className="text-xl font-medium text-foreground/80">
            Your Smart Learning Companion for Every Subject.
          </p>
          <p className="max-w-lg text-base text-muted-foreground">
            Ask questions, summarize notes, generate quizzes, create flashcards, plan your studies,
            and learn smarter with AI.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/auth" search={{ tab: "signup" } as never}>
              <Button size="lg" className="gap-2 rounded-full px-6 shadow-lg shadow-primary/25 card-lift">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="rounded-full px-6 backdrop-blur">
                Sign In
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 pt-4 text-xs text-muted-foreground">
            <Badge label="AI Chat Tutor" />
            <Badge label="Notes Summarizer" />
            <Badge label="Quiz Generator" />
            <Badge label="Flashcards" />
            <Badge label="Mind Maps" />
            <Badge label="Study Planner" />
          </div>
        </div>

        <div className="relative animate-in-up">
          <div className="glass overflow-hidden rounded-3xl p-2 shadow-2xl shadow-primary/10">
            <img
              src={heroImg}
              alt="Students learning with StudyMate AI illustrations of books, laptops and graduation caps"
              className="w-full rounded-2xl"
              width={1600}
              height={1200}
            />
          </div>
        </div>
      </main>

      <footer className="relative z-10 mx-auto max-w-6xl px-4 pb-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} StudyMate AI · Learn smarter, not harder.
      </footer>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border bg-white/60 px-3 py-1 backdrop-blur">
      {label}
    </span>
  );
}
