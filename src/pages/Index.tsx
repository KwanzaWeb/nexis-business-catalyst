import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownToLine, ArrowUpRight, Bot, History, LoaderCircle, LogOut, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { downloadTextAsPdf } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nexis-consultant`;
const API_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const starterMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Olá, eu sou o IsmaBot. Me conte sua ideia de negócio e eu vou montar uma análise FOFA detalhada e um plano de marketing de 50 dias dividido por semanas.",
  },
];

const suggestedIdeas = [
  "Assinatura de cafés especiais para empresas",
  "Plataforma de gestão financeira para MEIs",
  "Clínica digital focada em saúde feminina",
];

const callIsmaBot = async (idea: string, history: ChatMessage[]) => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: API_KEY,
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ idea, history }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.error || "Não foi possível gerar a resposta agora.") as Error & {
      status?: number;
    };
    error.status = response.status;
    throw error;
  }

  return payload.reply as string;
};

const saveConsulta = async (userId: string, idea: string, fullResponse: string) => {
  // Simple extraction: split by FOFA section vs marketing plan
  const fofaMatch = fullResponse.match(/(?:análise\s*fofa|swot|forças)[^]*?(?=plano\s*de\s*marketing|semana\s*1)/i);
  const fofa = fofaMatch ? fofaMatch[0].trim() : fullResponse.substring(0, Math.floor(fullResponse.length / 2));
  const marketing = fullResponse.substring(fofa.length).trim() || fullResponse.substring(Math.floor(fullResponse.length / 2));

  await supabase.from("consultas").insert({
    user_id: userId,
    business_idea: idea,
    fofa_content: fofa,
    marketing_plan: marketing,
    full_response: fullResponse,
  });
};

const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [idea, setIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  const canSubmit = useMemo(() => idea.trim().length >= 10 && !isLoading, [idea, isLoading]);

  const latestStrategy = useMemo(
    () =>
      [...messages]
        .reverse()
        .find(
          (message) =>
            message.role === "assistant" && message.content !== starterMessages[0].content,
        )?.content ?? null,
    [messages],
  );

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedIdea = idea.trim();

    if (trimmedIdea.length < 10) {
      toast.error("Descreva sua ideia com um pouco mais de detalhe.");
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: trimmedIdea };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setIdea("");
    setIsLoading(true);

    try {
      const reply = await callIsmaBot(trimmedIdea, nextMessages);
      setMessages([...nextMessages, { role: "assistant", content: reply }]);

      // Save to database
      if (user) {
        saveConsulta(user.id, trimmedIdea, reply).catch(() => {
          // silent - don't block UX
        });
      }
    } catch (error) {
      const typedError = error as Error & { status?: number };

      if (typedError.status === 429) {
        toast.error("Muitas solicitações seguidas. Tente novamente em instantes.");
      } else if (typedError.status === 402) {
        toast.error("O limite de uso da IA foi atingido. Adicione créditos para continuar.");
      } else {
        toast.error(typedError.message || "O IsmaBot não conseguiu responder agora.");
      }

      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!latestStrategy) {
      toast.error("Gere uma estratégia antes de baixar o PDF.");
      return;
    }

    downloadTextAsPdf({
      title: "Estratégia de negócio — IsmaBot",
      content: latestStrategy,
      fileName: "ismabot-estrategia.pdf",
    });

    toast.success("PDF gerado com sucesso.");
  };

  if (authLoading) {
    return (
      <main className="ismabot-shell flex items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="ismabot-shell">
      <section className="ismabot-grid">
        <div className="ismabot-hero">
          <div className="ismabot-badge">
            <Sparkles className="h-4 w-4" />
            Consultor virtual de estratégia
          </div>

          <div className="space-y-6">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
              IsmaBot transforma uma ideia em direção estratégica acionável.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Digite sua ideia de negócio e receba um diagnóstico FOFA completo, além de um plano de marketing de 50 dias organizado por semanas.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article className="ismabot-stat-card">
              <Bot className="h-5 w-5 text-primary" />
              <div>
                <h2 className="ismabot-stat-title">FOFA detalhada</h2>
                <p className="ismabot-stat-copy">Forças, fraquezas, oportunidades e ameaças com profundidade prática.</p>
              </div>
            </article>

            <article className="ismabot-stat-card">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <h2 className="ismabot-stat-title">50 dias por semanas</h2>
                <p className="ismabot-stat-copy">Plano de marketing com foco em priorização, canais e execução.</p>
              </div>
            </article>

            <article className="ismabot-stat-card sm:col-span-2 xl:col-span-1">
              <ArrowUpRight className="h-5 w-5 text-primary" />
              <div>
                <h2 className="ismabot-stat-title">Histórico salvo</h2>
                <p className="ismabot-stat-copy">Suas análises ficam salvas na sua conta para consultar quando quiser.</p>
              </div>
            </article>
          </div>
        </div>

        <section className="ismabot-panel" aria-label="Chat com o IsmaBot">
          <div className="ismabot-panel-header">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">IsmaBot</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Digite sua ideia de negócio</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => navigate("/historico")}>
                <History className="h-4 w-4" />
                Histórico
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={!latestStrategy || isLoading}
              >
                <ArrowDownToLine className="h-4 w-4" />
                PDF
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
              <div className="ismabot-dot" aria-hidden="true" />
            </div>
          </div>

          <div className="ismabot-suggestions" aria-label="Sugestões de ideias">
            {suggestedIdeas.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="ismabot-chip"
                onClick={() => setIdea(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="ismabot-chat" role="log" aria-live="polite">
            {messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={message.role === "assistant" ? "ismabot-message-assistant" : "ismabot-message-user"}
              >
                <span className="ismabot-message-label">{message.role === "assistant" ? "IsmaBot" : "Você"}</span>
                <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/95">{message.content}</p>
              </article>
            ))}

            {isLoading && (
              <article className="ismabot-message-assistant">
                <span className="ismabot-message-label">IsmaBot</span>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Estruturando sua análise estratégica...
                </div>
              </article>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="ismabot-form" onSubmit={handleGenerate}>
            <label htmlFor="business-idea" className="sr-only">
              Ideia de negócio
            </label>
            <Textarea
              id="business-idea"
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              placeholder="Ex.: Quero lançar uma plataforma de assinatura para produtos naturais com foco em mães que buscam praticidade e alimentação saudável."
              className="min-h-[132px] resize-none border-0 bg-transparent px-0 py-0 text-base shadow-none focus-visible:ring-0"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                O IsmaBot responde com análise FOFA + plano semanal de marketing.
              </p>
              <Button type="submit" size="lg" className="min-w-44" disabled={!canSubmit}>
                {isLoading ? "Analisando..." : "Gerar estratégia"}
              </Button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
};

export default Index;
