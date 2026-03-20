import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

type Consulta = {
  id: string;
  business_idea: string;
  full_response: string;
  created_at: string;
};

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchConsultas = async () => {
      const { data, error } = await supabase
        .from("consultas")
        .select("id, business_idea, full_response, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Erro ao carregar histórico.");
      } else {
        setConsultas(data || []);
      }
      setLoading(false);
    };
    fetchConsultas();
  }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("consultas").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao apagar consulta.");
    } else {
      setConsultas((prev) => prev.filter((c) => c.id !== id));
      toast.success("Consulta apagada.");
    }
  };

  return (
    <main className="ismabot-shell">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">Histórico de análises</h1>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-muted-foreground py-12 justify-center">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Carregando...
          </div>
        ) : consultas.length === 0 ? (
          <div className="ismabot-form text-center py-12">
            <p className="text-muted-foreground">Nenhuma análise salva ainda.</p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              Criar primeira análise
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {consultas.map((c) => (
              <article
                key={c.id}
                className="rounded-[1.5rem] border border-border/80 bg-card/70 p-5 space-y-3 cursor-pointer transition-colors hover:bg-card/90"
                onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">
                      {new Date(c.created_at).toLocaleString("pt-BR")}
                    </p>
                    <p className="font-medium text-foreground truncate">{c.business_idea}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {expandedId === c.id && (
                  <div className="rounded-xl bg-background/40 p-4 border border-border/50">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/90">{c.full_response}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default History;
