import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableGateway } from "@/lib/ai-gateway.server";

const QuizInput = z.object({
  topic: z.string().min(2).max(200),
  count: z.number().int().min(1).max(10).default(5),
});

export const generateQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => QuizInput.parse(input))
  .handler(async ({ data, context }) => {
    const gateway = createLovableGateway();
    const prompt = `Create ${data.count} multiple-choice quiz questions on the topic: "${data.topic}".
Return ONLY valid JSON matching this exact shape (no markdown fences, no commentary):
{"questions":[{"question":"...","options":["A","B","C","D"],"answer":0,"explanation":"..."}]}
"answer" is the 0-based index of the correct option. Provide 4 options each.`;
    const { text } = await generateText({
      model: gateway("google/gemini-2.5-flash"),
      prompt,
    });
    let questions: unknown[] = [];
    try {
      const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      questions = parsed.questions ?? [];
    } catch {
      throw new Error("The AI returned an unparseable response. Please try again.");
    }
    const { data: row, error } = await context.supabase
      .from("quizzes")
      .insert({ user_id: context.userId, topic: data.topic, questions: questions as never })
      .select("id,topic,questions,created_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listQuizzes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("quizzes")
      .select("id,topic,questions,created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const TimetableInput = z.object({
  goal: z.string().min(2).max(300),
  days: z.number().int().min(1).max(30).default(7),
  hoursPerDay: z.number().min(0.5).max(12).default(2),
});

export const generateTimetable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TimetableInput.parse(input))
  .handler(async ({ data, context }) => {
    const gateway = createLovableGateway();
    const prompt = `Design a study timetable for a university student.
Goal: ${data.goal}
Duration: ${data.days} days
Hours per day: ${data.hoursPerDay}
Return ONLY valid JSON (no fences, no commentary) shaped as:
{"days":[{"day":"Day 1","focus":"...","blocks":[{"time":"09:00-10:00","task":"..."}]}]}`;
    const { text } = await generateText({
      model: gateway("google/gemini-2.5-flash"),
      prompt,
    });
    let plan: Record<string, unknown> = {};
    try {
      const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
      plan = JSON.parse(cleaned);
    } catch {
      throw new Error("The AI returned an unparseable response. Please try again.");
    }
    const { data: row, error } = await context.supabase
      .from("timetables")
      .insert({ user_id: context.userId, title: data.goal, plan: plan as never })
      .select("id,title,plan,created_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listTimetables = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("timetables")
      .select("id,title,plan,created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });