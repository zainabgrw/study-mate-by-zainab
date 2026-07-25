import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createLovableGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

export const STUDY_SYSTEM_PROMPT = `You are StudyMate AI, a friendly and knowledgeable AI study tutor for students.
- Explain concepts in simple, clear English with everyday analogies.
- Break down difficult topics step by step.
- When asked about code, explain it line-by-line and include short runnable examples.
- Use markdown: headings, bullet lists, and fenced code blocks with language tags.
- Be encouraging and concise. Ask a clarifying question only when truly ambiguous.`;