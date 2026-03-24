import React, { useState, useRef, useEffect } from "react";
import { type RaceType } from "@/data/raceData";
import { type TrainingParams, mkProf, mdParse } from "@/utils/raceHelpers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Loader2, Bot, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CoachChatProps {
  raceType: RaceType;
  params: TrainingParams;
  wks: number | null;
  plans: Record<string, string>;
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

/** Parse SSE stream and extract text content deltas */
function parseSSEChunk(chunk: string): string {
  let text = "";
  const lines = chunk.split("\n");
  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) text += delta;
      } catch {
        // not valid JSON, skip
      }
    }
  }
  return text;
}

const QUICK_QUESTIONS = [
  "What should my long run pace be?",
  "How do I fuel during the race?",
  "Best taper strategy?",
  "What if I miss a week of training?",
];

const CoachChat: React.FC<CoachChatProps> = ({ raceType, params, wks, plans, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (overrideInput?: string) => {
    const userMsg = (overrideInput || input).trim();
    if (!userMsg || streaming) return;

    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setStreaming(true);

    try {
      const profile = mkProf(raceType, params, wks);
      const planContext = Object.entries(plans)
        .map(([k, v]) => `[${k.toUpperCase()}]: ${v.slice(0, 600)}`)
        .join("\n\n");

      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/race-coach-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
            profile,
            planContext,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Coach unavailable");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete lines from the buffer
          const extracted = parseSSEChunk(buffer);
          if (extracted) {
            assistantContent += extracted;
            buffer = ""; // Clear processed buffer
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: assistantContent };
              return updated;
            });
          }
        }
        // Process any remaining buffer
        if (buffer.trim()) {
          const remaining = parseSSEChunk(buffer);
          if (remaining) {
            assistantContent += remaining;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: assistantContent };
              return updated;
            });
          }
        }
      }

      // If no content was extracted (fallback for non-SSE responses)
      if (!assistantContent) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "I received your question but couldn't parse the response. Please try again.",
          };
          return updated;
        });
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev.filter((m) => !(m.role === "assistant" && m.content === "")),
        { role: "assistant", content: err.message || "Sorry, I couldn't connect to the coach right now. Please try again." },
      ]);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="font-semibold text-foreground text-sm">AI Race Coach</span>
            <p className="text-xs text-muted-foreground">{raceType.icon} {raceType.name} specialist</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Bot className="h-8 w-8 text-primary/60" />
            </div>
            <div>
              <p className="font-medium text-foreground">Your AI Race Coach</p>
              <p className="text-muted-foreground text-sm mt-1">
                Ask me anything about your {raceType.name} training — pacing, nutrition, recovery, race-day strategy...
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
              {QUICK_QUESTIONS.map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <Card className={`max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground border-primary" : ""}`}>
              <CardContent className="p-3">
                {msg.role === "assistant" ? (
                  msg.content ? (
                    <div
                      className="text-sm prose prose-sm max-w-none [&_strong]:text-foreground"
                      dangerouslySetInnerHTML={{ __html: mdParse(msg.content) }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs">Thinking...</span>
                    </div>
                  )
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </CardContent>
            </Card>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your coach anything..."
            disabled={streaming}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || streaming}>
            {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CoachChat;
