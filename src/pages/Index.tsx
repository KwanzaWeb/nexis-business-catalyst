import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Bot, LoaderCircle, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
      "Olá, eu sou o Nexis. Me conte sua ideia de negócio e eu vou montar uma análise FOFA detalhada e um plano de marketing de 50 dias dividido por semanas.",
  },
];

const suggestedIdeas = [
  "Assinatura de cafés especiais para empresas",
  "Plataforma de gestão financeira para MEIs",
  "Clínica digital focada em saúde feminina",
];

const callNexis = async (idea: string, history: ChatMessage[]) => {
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

const Index = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [idea, setIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  const canSubmit = useMemo(() => idea.trim().length >= 10 && !isLoading, [idea, isLoading]);

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
      const reply = await callNexis(trimmedIdea, nextMessages);
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch (error) {
      const typedError = error as Error & { status?: number };

      if (typedError.status === 429) {
        toast.error("Muitas solicitações seguidas. Tente novamente em instantes.");
      } else if (typedError.status === 402) {
        toast.error("O limite de uso da IA foi atingido. Adicione créditos para continuar.");
      } else {
        toast.error(typedError.message || "O Nexis não conseguiu responder agora.");
      }

      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="nexis-shell">
      <section className="nexis-grid">
        <div className="nexis-hero">
          <div className="nexis-badge">
            <Sparkles className="h-4 w-4" />
            Consultor virtual de estratégia
          </div>

          <div className="space-y-6">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
              Nexis transforma uma ideia em direção estratégica acionável.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Digite sua ideia de negócio e receba um diagnóstico FOFA completo, além de um plano de marketing de 50 dias organizado por semanas.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article className="nexis-stat-card">
              <Bot className="h-5 w-5 text-primary" />
              <div>
                <h2 className="nexis-stat-title">FOFA detalhada</h2>
                <p className="nexis-stat-copy">Forças, fraquezas, oportunidades e ameaças com profundidade prática.</p>
              </div>
            </article>

            <article className="nexis-stat-card">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <h2 className="nexis-stat-title">50 dias por semanas</h2>
                <p className="nexis-stat-copy">Plano de marketing com foco em priorização, canais e execução.</p>
              </div>
            </article>

            <article className="nexis-stat-card sm:col-span-2 xl:col-span-1">
              <ArrowUpRight className="h-5 w-5 text-primary" />
              <div>
                <h2 className="nexis-stat-title">Sem banco de dados</h2>
                <p className="nexis-stat-copy">Tudo acontece na sessão atual, sem salvar histórico no backend.</p>
              </div>
            </article>
          </div>
        </div>

        <section className="nexis-panel" aria-label="Chat com o Nexis">
          <div className="nexis-panel-header">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Nexis</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Digite sua ideia de negócio</h2>
            </div>
            <div className="nexis-dot" aria-hidden="true" />
          </div>

          <div className="nexis-suggestions" aria-label="Sugestões de ideias">
            {suggestedIdeas.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="nexis-chip"
                onClick={() => setIdea(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="nexis-chat" role="log" aria-live="polite">
            {messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={message.role === "assistant" ? "nexis-message-assistant" : "nexis-message-user"}
              >
                <span className="nexis-message-label">{message.role === "assistant" ? "Nexis" : "Você"}</span>
                <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/95">{message.content}</p>
              </article>
            ))}

            {isLoading && (
              <article className="nexis-message-assistant">
                <span className="nexis-message-label">Nexis</span>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Estruturando sua análise estratégica...
                </div>
              </article>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="nexis-form" onSubmit={handleGenerate}>
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
                O Nexis responde com análise FOFA + plano semanal de marketing.
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
