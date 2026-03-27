import { useAuth, ModulePermissions } from '@/contexts/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';

const moduleLabels: Record<keyof ModulePermissions, string> = {
  dashboard: 'Dashboard',
  products: 'Produtos',
  movements: 'Movimentações',
  reports: 'Relatórios',
};

export default function UserManagement() {
  const { user, users, updateUserPermissions, deleteUser } = useAuth();

  const otherUsers = users.filter(u => u.id !== user?.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Gerenciar Usuários</h1>
        <p className="text-muted-foreground">Controle de acesso e permissões por módulo</p>
      </div>

      <div className="space-y-4">
        {otherUsers.map((u, i) => (
          <motion.div key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  {u.role === 'admin' ? <Shield className="w-5 h-5 text-accent" /> : <User className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{u.name}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>
                <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                  {u.role === 'admin' ? 'Admin' : 'Usuário'}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteUser(u.id)} className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {u.role !== 'admin' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(Object.keys(moduleLabels) as (keyof ModulePermissions)[]).map(mod => (
                  <div key={mod} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium text-foreground">{moduleLabels[mod]}</span>
                    <Switch
                      checked={u.permissions[mod]}
                      onCheckedChange={checked => {
                        updateUserPermissions(u.id, { ...u.permissions, [mod]: checked });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            {u.role === 'admin' && (
              <p className="text-sm text-muted-foreground">Administradores têm acesso total a todos os módulos.</p>
            )}
          </motion.div>
        ))}
        {otherUsers.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">Nenhum outro usuário cadastrado</div>
        )}
      </div>
    </div>
  );
}
