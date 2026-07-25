import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Layers, Loader2, ChevronLeft, ChevronRight, Shuffle, Bookmark, BookmarkCheck } from "lucide-react";
import { generateFlashcards } from "@/lib/tools.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Card = { question: string; answer: string };

export const Route = createFileRoute("/_authenticated/flashcards")({
  head: () => ({ meta: [
    { title: "Flashcards · StudyMate AI" },
    { name: "description", content: "Generate AI-powered flashcards from any notes." },
  ]}),
  component: FlashcardsPage,
});

function FlashcardsPage() {
  const [source, setSource] = useState("");
  const [count, setCount] = useState(10);
  const [cards, setCards] = useState<Card[]>([]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const genFn = useServerFn(generateFlashcards);

  const gen = useMutation({
    mutationFn: () => genFn({ data: { source, count } }),
    onSuccess: (c) => { setCards(c); setI(0); setFlipped(false); setBookmarks(new Set()); toast.success(`${c.length} cards ready`); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const next = () => { setFlipped(false); setI((v) => (v + 1) % cards.length); };
  const prev = () => { setFlipped(false); setI((v) => (v - 1 + cards.length) % cards.length); };
  const shuffle = () => { setCards((cs) => [...cs].sort(() => Math.random() - 0.5)); setI(0); setFlipped(false); };
  const toggleBookmark = () => {
    setBookmarks((b) => {
      const n = new Set(b);
      if (n.has(i)) n.delete(i); else n.add(i);
      return n;
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 overflow-y-auto p-6">
      <Header title="Flashcards" desc="Turn any notes into flip-card practice." icon={<Layers className="h-5 w-5" />} />

      <Card>
        <CardContent className="space-y-3 pt-6">
          <Label>Paste your notes or topic</Label>
          <Textarea rows={5} value={source} onChange={(e) => setSource(e.target.value)} placeholder="Paste study material here..." />
          <div className="flex items-end gap-3">
            <div className="w-28 space-y-1.5">
              <Label>Count</Label>
              <Input type="number" min={3} max={20} value={count} onChange={(e) => setCount(Number(e.target.value) || 10)} />
            </div>
            <Button disabled={source.trim().length < 10 || gen.isPending} onClick={() => gen.mutate()}>
              {gen.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate flashcards"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {cards.length > 0 && (
        <div className="space-y-4 animate-in-up">
          <div
            className="[perspective:1200px]"
            onClick={() => setFlipped((f) => !f)}
            role="button"
            aria-label="Flip card"
          >
            <div
              className={`relative h-64 w-full rounded-2xl border shadow-lg transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
            >
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-card p-8 text-center [backface-visibility:hidden]">
                <div className="text-xl font-semibold">{cards[i].question}</div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-accent/50 p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <div className="text-base text-accent-foreground">{cards[i].answer}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Card {i + 1} / {cards.length}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={shuffle} aria-label="Shuffle"><Shuffle className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={toggleBookmark} aria-label="Bookmark">
                {bookmarks.has(i) ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="text-center text-xs text-muted-foreground">Click the card to flip.</div>
        </div>
      )}
    </div>
  );
}

function Header({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">{icon}</div>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}