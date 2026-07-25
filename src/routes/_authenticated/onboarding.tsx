import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EDUCATION_LEVELS, LANGUAGES, REFERRALS, saveProfile } from "@/lib/profile";
import { Logo, Wordmark } from "@/components/logo";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome · StudyMate AI" },
      { name: "description", content: "Set up your StudyMate AI profile." },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [language, setLanguage] = useState("English");
  const [education, setEducation] = useState("University");
  const [referral, setReferral] = useState("Friend");

  const finish = () => {
    if (!name.trim()) {
      toast.error("Please tell us your name");
      return;
    }
    saveProfile({
      name: name.trim(),
      age,
      language,
      education,
      referral,
      completedAt: new Date().toISOString(),
    });
    toast.success(`Welcome, ${name.split(" ")[0]}!`);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-full items-center justify-center p-4 md:p-8">
      <Card className="glass w-full max-w-xl animate-in-up border-white/40 shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center gap-2">
            <Logo size={40} />
          </div>
          <CardTitle className="mt-2 text-2xl">
            Welcome to <Wordmark />
          </CardTitle>
          <CardDescription className="flex items-center justify-center gap-1">
            <Sparkles className="h-3.5 w-3.5" /> Let's personalize your experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Your name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" />
            </div>
            <div className="space-y-1.5">
              <Label>Age</Label>
              <Input type="number" min={5} max={99} value={age} onChange={(e) => setAge(e.target.value)} placeholder="20" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Preferred language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1"><GraduationCap className="h-4 w-4" /> Education level</Label>
            <Select value={education} onValueChange={setEducation}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EDUCATION_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>How did you hear about StudyMate AI?</Label>
            <Select value={referral} onValueChange={setReferral}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REFERRALS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Button className="mt-2 w-full gap-2" onClick={finish}>
            Finish Setup <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}