import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Type, Image, Palette, LayoutGrid, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Template = {
  id: string;
  name: string;
  heroColor: string;
  accentColor: string;
  layout: "centered" | "split" | "minimal";
};

const templates: Template[] = [
  { id: "modern", name: "Moderno", heroColor: "hsl(190, 95%, 68%)", accentColor: "hsl(250, 80%, 72%)", layout: "centered" },
  { id: "bold", name: "Negrito", heroColor: "hsl(340, 82%, 60%)", accentColor: "hsl(30, 95%, 65%)", layout: "split" },
  { id: "clean", name: "Limpo", heroColor: "hsl(150, 60%, 50%)", accentColor: "hsl(200, 70%, 55%)", layout: "minimal" },
];

type SiteData = {
  templateId: string;
  title: string;
  subtitle: string;
  ctaText: string;
  aboutText: string;
  bgColor: string;
  textColor: string;
};

const defaultData: SiteData = {
  templateId: "modern",
  title: "Meu Negócio",
  subtitle: "Uma frase que descreve o valor do seu produto ou serviço.",
  ctaText: "Começar Agora",
  aboutText: "Somos uma empresa dedicada a entregar o melhor para os nossos clientes.",
  bgColor: "#0d1117",
  textColor: "#e2e8f0",
};

const PhoneMockup = ({ data }: { data: SiteData }) => {
  const template = templates.find((t) => t.id === data.templateId) || templates[0];

  return (
    <div className="relative mx-auto" style={{ width: 280, height: 560 }}>
      {/* Phone frame */}
      <div className="absolute inset-0 rounded-[2.5rem] border-[3px] border-border/80 bg-card shadow-lg" />
      {/* Notch */}
      <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-background" />
      {/* Screen */}
      <div
        className="absolute inset-[3px] overflow-hidden rounded-[2.3rem]"
        style={{ background: data.bgColor }}
      >
        <div className="flex h-full flex-col overflow-y-auto px-4 pt-10 pb-4" style={{ color: data.textColor }}>
          {/* Hero */}
          <div
            className="mb-4 rounded-2xl p-5"
            style={{
              background: `linear-gradient(135deg, ${template.heroColor}22, ${template.accentColor}22)`,
              borderLeft: `3px solid ${template.heroColor}`,
            }}
          >
            <h2 className="mb-2 text-lg font-bold leading-tight">{data.title}</h2>
            <p className="text-xs leading-relaxed opacity-80">{data.subtitle}</p>
          </div>

          {/* CTA */}
          <button
            className="mb-5 w-full rounded-xl py-3 text-sm font-semibold transition-transform active:scale-95"
            style={{ background: template.heroColor, color: "#0d1117" }}
          >
            {data.ctaText}
          </button>

          {/* About */}
          <div className="mb-4 rounded-2xl border border-border/40 p-4">
            <h3 className="mb-2 text-sm font-semibold" style={{ color: template.heroColor }}>
              Sobre
            </h3>
            <p className="text-xs leading-relaxed opacity-75">{data.aboutText}</p>
          </div>

          {/* Features mockup */}
          <div className="grid grid-cols-2 gap-2">
            {["Qualidade", "Rapidez", "Suporte", "Inovação"].map((f) => (
              <div
                key={f}
                className="rounded-xl border border-border/30 p-3 text-center text-xs font-medium"
                style={{ background: `${template.heroColor}11` }}
              >
                {f}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 text-center text-[10px] opacity-40">
            Feito com IsmaBot
          </div>
        </div>
      </div>
    </div>
  );
};

type TabId = "template" | "content" | "style";

const SiteBuilder = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<SiteData>(defaultData);
  const [activeTab, setActiveTab] = useState<TabId>("template");

  const update = (partial: Partial<SiteData>) => setData((prev) => ({ ...prev, ...partial }));

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "template", label: "Template", icon: <LayoutGrid className="h-4 w-4" /> },
    { id: "content", label: "Conteúdo", icon: <Type className="h-4 w-4" /> },
    { id: "style", label: "Estilo", icon: <Palette className="h-4 w-4" /> },
  ];

  return (
    <main className="ismabot-shell">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">IsmaBot</p>
              <h1 className="text-2xl font-semibold text-foreground">Construtor de Sites</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Smartphone className="h-4 w-4" />
            Pré-visualização mobile
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Editor panel */}
          <div className="ismabot-panel min-h-0">
            {/* Tabs */}
            <div className="mb-5 flex gap-2 border-b border-border/80 pb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 space-y-4 overflow-y-auto">
              {activeTab === "template" && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => update({ templateId: t.id })}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        data.templateId === t.id
                          ? "border-primary bg-primary/10"
                          : "border-border/80 bg-card/60 hover:border-primary/40"
                      }`}
                    >
                      <div className="mb-3 flex gap-2">
                        <div className="h-8 w-8 rounded-lg" style={{ background: t.heroColor }} />
                        <div className="h-8 w-8 rounded-lg" style={{ background: t.accentColor }} />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{t.layout}</p>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === "content" && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Título</label>
                    <Input value={data.title} onChange={(e) => update({ title: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Subtítulo</label>
                    <Textarea
                      value={data.subtitle}
                      onChange={(e) => update({ subtitle: e.target.value })}
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Texto do botão</label>
                    <Input value={data.ctaText} onChange={(e) => update({ ctaText: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Sobre</label>
                    <Textarea
                      value={data.aboutText}
                      onChange={(e) => update({ aboutText: e.target.value })}
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === "style" && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Cor de fundo</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={data.bgColor}
                        onChange={(e) => update({ bgColor: e.target.value })}
                        className="h-10 w-14 cursor-pointer rounded-lg border border-border"
                      />
                      <Input value={data.bgColor} onChange={(e) => update({ bgColor: e.target.value })} className="flex-1" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Cor do texto</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={data.textColor}
                        onChange={(e) => update({ textColor: e.target.value })}
                        className="h-10 w-14 cursor-pointer rounded-lg border border-border"
                      />
                      <Input value={data.textColor} onChange={(e) => update({ textColor: e.target.value })} className="flex-1" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex items-start justify-center pt-4">
            <PhoneMockup data={data} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default SiteBuilder;
