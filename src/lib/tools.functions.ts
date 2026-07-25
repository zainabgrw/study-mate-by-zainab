import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableGateway } from "./ai-gateway.server";

const MODEL = "google/gemini-2.5-flash";

function stripJson(text: string): string {
  return text.replace(/```json\s*|\s*```/g, "").trim();
}

// ------------------- FLASHCARDS -------------------
const FlashInput = z.object({
  source: z.string().min(10).max(20000),
  count: z.number().int().min(3).max(20).default(10),
});

export const generateFlashcards = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => FlashInput.parse(i))
  .handler(async ({ data }) => {
    const gateway = createLovableGateway();
    const prompt = `Create ${data.count} study flashcards from the material below.
Return ONLY valid JSON (no fences) shaped as:
{"cards":[{"question":"...","answer":"..."}]}
Keep questions short (<= 20 words) and answers concise (<= 60 words).

MATERIAL:
${data.source}`;
    const { text } = await generateText({ model: gateway(MODEL), prompt });
    const parsed = JSON.parse(stripJson(text)) as { cards: { question: string; answer: string }[] };
    return parsed.cards ?? [];
  });

// ------------------- MIND MAP -------------------
const MindInput = z.object({ topic: z.string().min(2).max(500) });

export const generateMindMap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => MindInput.parse(i))
  .handler(async ({ data }) => {
    const gateway = createLovableGateway();
    const prompt = `Build a mind map for: "${data.topic}".
Return ONLY valid JSON (no fences), 3 levels deep max, shaped as:
{"root":"...","children":[{"label":"...","children":[{"label":"..."}]}]}
Aim for 4-6 main branches with 2-4 sub-branches each.`;
    const { text } = await generateText({ model: gateway(MODEL), prompt });
    return JSON.parse(stripJson(text)) as {
      root: string;
      children: { label: string; children?: { label: string }[] }[];
    };
  });

// ------------------- TOPIC EXPLAINER -------------------
const TopicInput = z.object({ topic: z.string().min(2).max(300) });

export const explainTopic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => TopicInput.parse(i))
  .handler(async ({ data }) => {
    const gateway = createLovableGateway();
    const prompt = `Explain the topic "${data.topic}" for a university student.
Use markdown with the exact sections in this order:
## Simple explanation
## Detailed explanation
## Real-life examples
## Important points
## Exam tips
Keep the whole answer under 700 words. Use bullet lists where helpful.`;
    const { text } = await generateText({ model: gateway(MODEL), prompt });
    return { markdown: text };
  });

// ------------------- CODE HELPER -------------------
const CodeInput = z.object({
  code: z.string().min(1).max(20000),
  language: z.string().min(1).max(40),
  action: z.enum(["explain", "bugs", "optimize", "convert"]),
  target: z.string().max(40).optional(),
});

export const codeAssist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => CodeInput.parse(i))
  .handler(async ({ data }) => {
    const gateway = createLovableGateway();
    let instruction = "";
    switch (data.action) {
      case "explain":
        instruction = `Explain this ${data.language} code step by step for a beginner. Use markdown with a short summary, then a numbered walkthrough.`;
        break;
      case "bugs":
        instruction = `Review this ${data.language} code and list any bugs or issues, with an explanation and the fixed snippet for each.`;
        break;
      case "optimize":
        instruction = `Suggest optimizations for this ${data.language} code (readability, performance, idioms). Provide the improved code in a fenced block.`;
        break;
      case "convert":
        instruction = `Convert this ${data.language} code to ${data.target ?? "Python"}. Preserve behavior. Return the converted code in a fenced block and a brief note about differences.`;
        break;
    }
    const prompt = `${instruction}\n\n\`\`\`${data.language}\n${data.code}\n\`\`\``;
    const { text } = await generateText({ model: gateway(MODEL), prompt });
    return { markdown: text };
  });

// ------------------- NOTES SUMMARIZE / ACTIONS -------------------
const NotesInput = z.object({
  source: z.string().min(10).max(30000),
  action: z.enum(["summarize", "keypoints", "explain", "translate"]),
  targetLanguage: z.string().max(40).optional(),
});

export const notesAssist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => NotesInput.parse(i))
  .handler(async ({ data }) => {
    const gateway = createLovableGateway();
    let instruction = "";
    switch (data.action) {
      case "summarize":
        instruction = "Write a clear, structured markdown summary of the notes below. Use headings and bullets.";
        break;
      case "keypoints":
        instruction = "Extract the most important points from the notes below as a numbered markdown list. 8-15 items max.";
        break;
      case "explain":
        instruction = "Identify the most difficult concepts in the notes and explain each in simple language with an example.";
        break;
      case "translate":
        instruction = `Translate the notes below into ${data.targetLanguage ?? "English"}. Preserve formatting.`;
        break;
    }
    const prompt = `${instruction}\n\nNOTES:\n${data.source}`;
    const { text } = await generateText({ model: gateway(MODEL), prompt });
    return { markdown: text };
  });