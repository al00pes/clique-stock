import { useAuth } from '@/contexts/AuthContext';
import { useStock } from '@/contexts/StockContext';
import { Package, AlertTriangle, DollarSign, TrendingDown, Plus, Minus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const fadeIn = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.08, duration: 0.3 },
});

export default function Dashboard() {
  const { user } = useAuth();
  const { totalProducts, totalValue, lowStockProducts } = useStock();
  const navigate = useNavigate();

  const stats = [
    { label: 'Total de Produtos', value: totalProducts, icon: Package, color: 'text-accent' },
    { label: 'Estoque Baixo', value: lowStockProducts.length, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Valor em Estoque', value: `R$ ${totalValue.toLocaleString('pt-BR')}`, icon: DollarSign, color: 'text-success' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Olá, {user?.name}! Aqui está o resumo do seu estoque.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} {...fadeIn(i)} className="stat-card flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-muted ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div {...fadeIn(3)} className="flex flex-wrap gap-3">
        <Button onClick={() => navigate('/produtos?new=1')} className="gold-gradient text-gold-foreground hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" /> Adicionar Produto
        </Button>
        <Button variant="outline" onClick={() => navigate('/movimentacoes?new=1')}>
          <Minus className="w-4 h-4 mr-2" /> Dar Baixa
        </Button>
        <Button variant="outline" onClick={() => navigate('/produtos')}>
          <Search className="w-4 h-4 mr-2" /> Buscar Produto
        </Button>
      </motion.div>

      {lowStockProducts.length > 0 && (
        <motion.div {...fadeIn(4)} className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-destructive" />
            <h2 className="text-lg font-semibold text-foreground">Produtos com Estoque Baixo</h2>
          </div>
          <div className="space-y-3">
            {lowStockProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-destructive">{p.quantity} un.</p>
                  <p className="text-xs text-muted-foreground">Mín: {p.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
