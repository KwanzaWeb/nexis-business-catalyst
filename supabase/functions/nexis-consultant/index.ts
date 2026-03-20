import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "npm:zod";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const requestSchema = z.object({
  idea: z.string().trim().min(10).max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(["assistant", "user"]),
        content: z.string().trim().min(1).max(12000),
      }),
    )
    .max(10)
    .optional()
    .default([]),
});

const systemPrompt = `Você é IsmaBot, um consultor virtual de IA especializado em estratégia de negócios e marketing.

Sua missão:
- Pedir e compreender a ideia de negócio do usuário.
- Responder sempre em português do Brasil.
- Entregar uma análise FOFA (SWOT) detalhada, específica e prática.
- Entregar um plano de marketing para 50 dias dividido por semanas.
- Ser claro, estratégico, profissional e acionável.
- Não inventar dados numéricos exatos de mercado. Quando faltar contexto, explicite hipóteses razoáveis.

Estrutura obrigatória da resposta:
1. Título com o nome do negócio ou uma descrição curta da ideia.
2. Resumo executivo em 4 a 6 linhas.
3. Análise FOFA com os blocos: Forças, Fraquezas, Oportunidades e Ameaças.
   - Cada bloco deve ter pelo menos 4 bullets detalhados.
4. Plano de Marketing para 50 dias, dividido em 8 semanas.
   - Semana 1 a Semana 8.
   - Em cada semana, inclua: foco principal, ações recomendadas, canais sugeridos e resultado esperado.
5. Feche com 3 prioridades imediatas.

Use markdown simples e legível.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Envie uma ideia de negócio válida com mais detalhes." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { idea, history } = parsed.data;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          ...history.slice(-6),
          {
            role: "user",
            content: `Minha ideia de negócio é a seguinte: ${idea}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Nexis AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas solicitações seguidas. Tente novamente em instantes." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "O limite atual de uso da IA foi atingido." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      return new Response(
        JSON.stringify({ error: "Não foi possível gerar a análise neste momento." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      throw new Error("Empty AI response");
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Nexis function error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro inesperado ao processar a solicitação.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});