import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { createLovableGateway, STUDY_SYSTEM_PROMPT } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization");
        const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
        if (!token) return new Response("Unauthorized", { status: 401 });

        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );
        const { data: userData, error: userErr } = await supabase.auth.getUser(token);
        if (userErr || !userData.user) return new Response("Unauthorized", { status: 401 });
        const userId = userData.user.id;

        const body = (await request.json()) as { messages: UIMessage[]; threadId: string };
        if (!body.threadId || !Array.isArray(body.messages)) {
          return new Response("Bad request", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        // Verify thread belongs to user
        const { data: thread } = await supabaseAdmin
          .from("threads")
          .select("id,user_id,title")
          .eq("id", body.threadId)
          .maybeSingle();
        if (!thread || thread.user_id !== userId) {
          return new Response("Forbidden", { status: 403 });
        }

        // Persist last user message
        const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
        if (lastUser) {
          const text = lastUser.parts
            ?.map((p) => (p.type === "text" ? p.text : ""))
            .join("") ?? "";
          if (text.trim()) {
            await supabaseAdmin.from("messages").insert({
              thread_id: body.threadId,
              user_id: userId,
              role: "user",
              content: text,
            });
            // auto-title from first user message
            if (thread.title === "New chat") {
              await supabaseAdmin
                .from("threads")
                .update({ title: text.slice(0, 60), updated_at: new Date().toISOString() })
                .eq("id", body.threadId);
            } else {
              await supabaseAdmin
                .from("threads")
                .update({ updated_at: new Date().toISOString() })
                .eq("id", body.threadId);
            }
          }
        }

        const gateway = createLovableGateway();
        const result = streamText({
          model: gateway("google/gemini-2.5-flash"),
          system: STUDY_SYSTEM_PROMPT,
          messages: await convertToModelMessages(body.messages),
          onFinish: async ({ text }) => {
            if (text.trim()) {
              await supabaseAdmin.from("messages").insert({
                thread_id: body.threadId,
                user_id: userId,
                role: "assistant",
                content: text,
              });
            }
          },
        });

        return result.toUIMessageStreamResponse();
      },
    },
  },
});