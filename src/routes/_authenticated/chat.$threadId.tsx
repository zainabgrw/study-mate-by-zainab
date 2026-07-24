import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { Send, User, Sparkles, Loader2 } from "lucide-react";
import { getThreadMessages } from "@/lib/threads.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "Chat · Study Buddy" },
      { name: "description", content: "Chat with your AI study tutor." },
      { property: "og:title", content: "Chat · Study Buddy" },
      { property: "og:description", content: "Ask your AI study tutor anything." },
    ],
  }),
  component: ChatThread,
});

function toUIMessage(row: { id: string; role: string; content: string }): UIMessage {
  return {
    id: row.id,
    role: row.role as UIMessage["role"],
    parts: [{ type: "text", text: row.content }],
  } as UIMessage;
}

function ChatThread() {
  const { threadId } = Route.useParams();
  const qc = useQueryClient();
  const getMessagesFn = useServerFn(getThreadMessages);

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["messages", threadId],
    queryFn: () => getMessagesFn({ data: { threadId } }),
  });

  const initialMessages = useMemo<UIMessage[]>(
    () => history.map(toUIMessage),
    [history],
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <ChatBox
      key={threadId}
      threadId={threadId}
      initialMessages={initialMessages}
      onFinish={() => qc.invalidateQueries({ queryKey: ["threads"] })}
    />
  );
}

function ChatBox({
  threadId,
  initialMessages,
  onFinish,
}: {
  threadId: string;
  initialMessages: UIMessage[];
  onFinish: () => void;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
          const { data } = await supabase.auth.getSession();
          const headers = new Headers(init?.headers);
          if (data.session?.access_token) {
            headers.set("Authorization", `Bearer ${data.session.access_token}`);
          }
          const bodyRaw = init?.body ? JSON.parse(init.body as string) : {};
          return fetch(input, {
            ...init,
            headers,
            body: JSON.stringify({ ...bodyRaw, threadId }),
          });
        }) as typeof fetch,
      }),
    [threadId],
  );

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onFinish,
    onError: (e) => console.error(e),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId, status]);

  const busy = status === "submitted" || status === "streaming";

  const handleSend = () => {
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
          {messages.length === 0 && (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Ask a study question to begin. Try: <em>"Explain Big-O notation with an example."</em>
            </div>
          )}
          {messages.map((m) => (
            <MessageRow key={m.id} message={m} />
          ))}
          {status === "submitted" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse" /> Thinking…
            </div>
          )}
        </div>
      </div>

      <div className="border-t bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-end gap-2 p-4">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask your Study Buddy anything…"
            className="min-h-[52px] flex-1 resize-none"
          />
          <Button size="icon" onClick={handleSend} disabled={busy || !input.trim()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageRow({ message }: { message: UIMessage }) {
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
      )}
      <div
        className={
          isUser
            ? "max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-primary-foreground"
            : "max-w-[85%] rounded-2xl bg-accent/40 px-4 py-2.5 text-foreground"
        }
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm">{text}</p>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert prose-pre:my-2 prose-p:my-2 prose-headings:my-2">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}