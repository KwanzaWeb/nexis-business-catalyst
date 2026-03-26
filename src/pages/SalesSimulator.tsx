import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, DollarSign, TrendingUp, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

const SalesSimulator = () => {
  const navigate = useNavigate();
  const [price, setPrice] = useState(50);
  const [cost, setCost] = useState(20);
  const [dailySales, setDailySales] = useState(10);
  const [growthRate, setGrowthRate] = useState(5);

  const weeks = useMemo(() => {
    const result: { week: number; sales: number; revenue: number; profit: number; cumProfit: number }[] = [];
    let cumProfit = 0;
    for (let w = 1; w <= 7; w++) {
      const factor = 1 + (growthRate / 100) * (w - 1);
      const weekSales = Math.round(dailySales * 7 * factor);
      const revenue = weekSales * price;
      const profit = weekSales * (price - cost);
      cumProfit += profit;
      result.push({ week: w, sales: weekSales, revenue, profit, cumProfit });
    }
    return result;
  }, [price, cost, dailySales, growthRate]);

  const totalRevenue = weeks.reduce((s, w) => s + w.revenue, 0);
  const totalProfit = weeks.reduce((s, w) => s + w.profit, 0);
  const totalSales = weeks.reduce((s, w) => s + w.sales, 0);

  const maxBar = Math.max(...weeks.map((w) => w.revenue));

  const fmt = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

  return (
    <main className="ismabot-shell">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">IsmaBot</p>
            <h1 className="text-2xl font-semibold text-foreground">Simulador de Vendas</h1>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            { icon: <DollarSign className="h-5 w-5 text-primary" />, label: "Receita Total (50 dias)", value: fmt(totalRevenue) },
            { icon: <TrendingUp className="h-5 w-5 text-primary" />, label: "Lucro Total", value: fmt(totalProfit) },
            { icon: <Users className="h-5 w-5 text-primary" />, label: "Vendas Totais", value: totalSales.toLocaleString("pt-BR") },
          ].map((card) => (
            <div key={card.label} className="ismabot-stat-card">
              {card.icon}
              <div>
                <p className="ismabot-stat-copy">{card.label}</p>
                <p className="text-xl font-bold text-foreground">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Controls */}
          <div className="ismabot-panel min-h-0 gap-5">
            <h2 className="text-lg font-semibold text-foreground">Parâmetros</h2>

            <div className="space-y-5">
              <div>
                <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-foreground">
                  Preço de venda
                  <span className="text-primary">{fmt(price)}</span>
                </label>
                <Slider value={[price]} onValueChange={([v]) => setPrice(v)} min={1} max={500} step={1} />
              </div>

              <div>
                <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-foreground">
                  Custo por unidade
                  <span className="text-primary">{fmt(cost)}</span>
                </label>
                <Slider value={[cost]} onValueChange={([v]) => setCost(v)} min={0} max={400} step={1} />
              </div>

              <div>
                <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-foreground">
                  Vendas diárias iniciais
                  <span className="text-primary">{dailySales}</span>
                </label>
                <Slider value={[dailySales]} onValueChange={([v]) => setDailySales(v)} min={1} max={200} step={1} />
              </div>

              <div>
                <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-foreground">
                  Crescimento semanal
                  <span className="text-primary">{growthRate}%</span>
                </label>
                <Slider value={[growthRate]} onValueChange={([v]) => setGrowthRate(v)} min={0} max={50} step={1} />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Margem de lucro:</strong>{" "}
                {price > 0 ? Math.round(((price - cost) / price) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="ismabot-panel min-h-0 gap-4">
            <h2 className="text-lg font-semibold text-foreground">Projeção por Semana</h2>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {weeks.map((w) => (
                <div key={w.week} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">Semana {w.week}</span>
                    <span className="text-muted-foreground">
                      {w.sales} vendas · {fmt(w.revenue)}
                    </span>
                  </div>
                  <div className="h-7 w-full overflow-hidden rounded-lg bg-secondary/60">
                    <div
                      className="flex h-full items-center rounded-lg px-3 text-xs font-semibold transition-all duration-500"
                      style={{
                        width: `${maxBar > 0 ? (w.revenue / maxBar) * 100 : 0}%`,
                        background: `linear-gradient(90deg, hsl(190, 95%, 68%), hsl(250, 80%, 72%))`,
                        color: "hsl(224, 33%, 8%)",
                      }}
                    >
                      {fmt(w.profit)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 rounded-2xl border border-border/80 bg-card/60 p-4">
              <p className="text-sm text-muted-foreground">
                Em <strong className="text-foreground">50 dias</strong>, com crescimento semanal de{" "}
                <strong className="text-primary">{growthRate}%</strong>, o lucro acumulado será de{" "}
                <strong className="text-foreground">{fmt(totalProfit)}</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SalesSimulator;
