import { useState, useMemo } from 'react';
import { useStock } from '@/contexts/StockContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, ShoppingCart, Plus, Minus, Trash2, Send, Gem, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function Catalog() {
  const { products } = useStock();
  const { whatsappNumber } = useSettings();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [clientName, setClientName] = useState('');

  const availableProducts = products.filter(p => p.quantity > 0);
  const categories = useMemo(() => [...new Set(availableProducts.map(p => p.category).filter(Boolean))], [availableProducts]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = availableProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const addToCart = (product: typeof products[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev;
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.productId !== productId) return i;
      const newQty = i.quantity + delta;
      return newQty <= 0 ? i : { ...i, quantity: newQty };
    }).filter(i => i.quantity > 0));
  };

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(i => i.productId !== productId));
  const cartTotal = cart.reduce((s, i) => s + i.quantity * i.price, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const sendWhatsApp = () => {
    if (!whatsappNumber || cart.length === 0) return;
    const itemsText = cart.map(i => `• ${i.name} x${i.quantity} — R$ ${(i.quantity * i.price).toLocaleString('pt-BR')}`).join('\n');
    const message = `🛍️ *Novo Pedido - EstoqueJóias*\n\n` +
      (clientName ? `*Cliente:* ${clientName}\n\n` : '') +
      `*Itens:*\n${itemsText}\n\n` +
      `*Total: R$ ${cartTotal.toLocaleString('pt-BR')}*\n\n` +
      `Enviado pelo catálogo online.`;
    const phone = whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center">
              <Gem className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">EstoqueJóias</span>
          </div>
          <Button variant="outline" className="relative" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Carrinho
            {cartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs gold-gradient text-gold-foreground border-0">
                {cartCount}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-display font-bold text-foreground">Nosso Catálogo</h1>
          <p className="text-muted-foreground">Escolha suas peças favoritas e envie seu pedido</p>
        </div>

        {/* Search + Categories */}
        <div className="space-y-3">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Buscar produtos..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {categories.length > 0 && (
            <div className="flex gap-2 justify-center flex-wrap">
              <Button variant={!selectedCategory ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(null)}>Todos</Button>
              {categories.map(cat => (
                <Button key={cat} variant={selectedCategory === cat ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(cat)}>
                  {cat}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((p, i) => {
              const inCart = cart.find(c => c.productId === p.id);
              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-40 gold-gradient/10 bg-muted flex items-center justify-center">
                    <Gem className="w-12 h-12 text-accent opacity-40" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-display font-semibold text-foreground">{p.name}</h3>
                      {p.category && <Badge variant="secondary" className="mt-1 text-xs">{p.category}</Badge>}
                      {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-foreground">R$ {p.price.toLocaleString('pt-BR')}</span>
                      {inCart ? (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateCartQty(p.id, -1)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="font-semibold text-foreground w-6 text-center">{inCart.quantity}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateCartQty(p.id, 1)} disabled={inCart.quantity >= p.quantity}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" className="gold-gradient text-gold-foreground hover:opacity-90" onClick={() => addToCart(p)}>
                          <Plus className="w-4 h-4 mr-1" /> Adicionar
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Nenhum produto encontrado</p>
        )}
      </div>

      {/* Cart Dialog */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Seu Carrinho</DialogTitle></DialogHeader>
          {cart.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Carrinho vazio</p>
          ) : (
            <div className="space-y-4">
              <div className="divide-y rounded-lg border">
                {cart.map(item => (
                  <div key={item.productId} className="flex items-center justify-between p-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">R$ {item.price.toLocaleString('pt-BR')} un.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQty(item.productId, -1)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-semibold w-5 text-center text-foreground">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQty(item.productId, 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.productId)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-semibold text-foreground text-lg">
                <span>Total</span>
                <span>R$ {cartTotal.toLocaleString('pt-BR')}</span>
              </div>

              <div className="space-y-2">
                <Input placeholder="Seu nome (opcional)" value={clientName} onChange={e => setClientName(e.target.value)} />
              </div>

              <Button className="w-full gold-gradient text-gold-foreground hover:opacity-90" onClick={sendWhatsApp} disabled={!whatsappNumber}>
                <Send className="w-4 h-4 mr-2" />
                {whatsappNumber ? 'Enviar Pedido por WhatsApp' : 'WhatsApp não configurado'}
              </Button>
              {!whatsappNumber && <p className="text-xs text-destructive text-center">O administrador precisa configurar o número de WhatsApp nas configurações.</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Floating cart button (mobile) */}
      {cartCount > 0 && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="fixed bottom-6 right-6 sm:hidden z-40">
          <Button size="lg" className="rounded-full gold-gradient text-gold-foreground shadow-lg h-14 w-14" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground border-0">
              {cartCount}
            </Badge>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
