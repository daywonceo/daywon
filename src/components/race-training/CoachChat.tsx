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

const CoachChat: React.FC<CoachChatProps> = ({ raceType, params, wks, plans, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setStreaming(true);

    try {
      const profile = mkProf(raceType, params, wks);
      const planContext = Object.entries(plans)
        .map(([k, v]) => `${k}: ${v.slice(0, 500)}`)
        .join("\n");

      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/race-coach-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: userMsg }],
            profile,
            planContext,
          }),
        }
      );

      if (!response.ok) throw new Error("Coach unavailable");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: assistantContent };
            return updated;
          });
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't connect to the coach right now. Please try again." },
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
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">AI Race Coach</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <Bot className="h-12 w-12 text-primary/40 mx-auto" />
            <p className="text-muted-foreground text-sm">
              Ask me anything about your {raceType.name} training plan — pacing, nutrition, recovery, race-day strategy...
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["What should my long run pace be?", "How do I fuel during the race?", "Best taper strategy?"].map((q) => (
                <Button key={q} variant="outline" size="sm" onClick={() => { setInput(q); }}>
                  {q}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <Card className={`max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground" : ""}`}>
              <CardContent className="p-3">
                {msg.role === "assistant" ? (
                  <div
                    className="text-sm prose prose-sm max-w-none [&_strong]:text-foreground"
                    dangerouslySetInnerHTML={{ __html: mdParse(msg.content) }}
                  />
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </CardContent>
            </Card>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {streaming && messages[messages.length - 1]?.content === "" && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Coach is thinking...</span>
          </div>
        )}
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
            placeholder="Ask your coach..."
            disabled={streaming}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || streaming}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CoachChat;
