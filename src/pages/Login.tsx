import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Gem, LogIn, UserPlus, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isSignup) {
        if (!name.trim()) { setError('Nome é obrigatório'); setSubmitting(false); return; }
        const err = await signup(name, email, password);
        if (err) setError(err);
      } else {
        const err = await login(email, password);
        if (err) setError(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gold-gradient mb-4">
            <Gem className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">EstoqueJóias</h1>
          <p className="text-muted-foreground mt-2">Controle inteligente do seu estoque</p>
        </div>

        <div className="bg-card rounded-2xl border p-8 shadow-lg">
          <div className="flex gap-2 mb-6">
            <Button variant={!isSignup ? 'default' : 'ghost'} className="flex-1" onClick={() => { setIsSignup(false); setError(''); }}>
              <LogIn className="w-4 h-4 mr-2" /> Entrar
            </Button>
            <Button variant={isSignup ? 'default' : 'ghost'} className="flex-1" onClick={() => { setIsSignup(true); setError(''); }}>
              <UserPlus className="w-4 h-4 mr-2" /> Cadastrar
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full gold-gradient text-gold-foreground font-semibold hover:opacity-90 transition-opacity" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isSignup ? 'Criar conta' : 'Entrar'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
