import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, MessageCircle, ExternalLink } from 'lucide-react';

export default function Settings() {
  const { whatsappNumber, setWhatsappNumber } = useSettings();
  const [phone, setPhone] = useState(whatsappNumber);

  const handleSave = () => {
    setWhatsappNumber(phone);
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Ajustes gerais do sistema</p>
      </div>

      <div className="bg-card rounded-xl border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">WhatsApp para Pedidos</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Número de WhatsApp que receberá os pedidos do catálogo online. Use o formato com código do país (ex: 5511999999999).
        </p>
        <div className="space-y-2">
          <Label>Número do WhatsApp</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="5511999999999" />
        </div>
        <div className="flex items-center justify-between">
          <a href="/catalogo" target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline inline-flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> Ver catálogo online
          </a>
          <Button onClick={handleSave} className="gold-gradient text-gold-foreground hover:opacity-90">
            <Save className="w-4 h-4 mr-2" /> Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
