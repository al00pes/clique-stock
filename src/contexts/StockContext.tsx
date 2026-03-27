import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  description: string;
  minStock: number;
  createdAt: string;
}

export interface Movement {
  id: string;
  productId: string;
  productName: string;
  type: 'entrada' | 'saida';
  quantity: number;
  date: string;
  note: string;
}

interface StockContextType {
  products: Product[];
  movements: Movement[];
  addProduct: (p: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addMovement: (m: Omit<Movement, 'id' | 'date'>) => void;
  getProduct: (id: string) => Product | undefined;
  lowStockProducts: Product[];
  totalProducts: number;
  totalValue: number;
}

const mockProducts: Product[] = [
  { id: '1', name: 'Anel Solitário Ouro 18k', quantity: 12, price: 2890, category: 'Anéis', description: 'Anel solitário com diamante', minStock: 5, createdAt: '2024-01-15' },
  { id: '2', name: 'Colar Pérolas Naturais', quantity: 3, price: 1450, category: 'Colares', description: 'Colar com pérolas naturais', minStock: 5, createdAt: '2024-01-20' },
  { id: '3', name: 'Brinco Gota Prata 925', quantity: 25, price: 189, category: 'Brincos', description: '', minStock: 10, createdAt: '2024-02-01' },
  { id: '4', name: 'Pulseira Riviera', quantity: 2, price: 3200, category: 'Pulseiras', description: 'Pulseira riviera com zircônias', minStock: 3, createdAt: '2024-02-10' },
  { id: '5', name: 'Aliança Ouro Rosé', quantity: 8, price: 1680, category: 'Alianças', description: '', minStock: 5, createdAt: '2024-03-01' },
  { id: '6', name: 'Tornozeleira Prata', quantity: 1, price: 120, category: 'Tornozeleiras', description: 'Tornozeleira delicada', minStock: 5, createdAt: '2024-03-05' },
];

const mockMovements: Movement[] = [
  { id: '1', productId: '1', productName: 'Anel Solitário Ouro 18k', type: 'entrada', quantity: 5, date: '2024-03-20', note: 'Reposição fornecedor' },
  { id: '2', productId: '2', productName: 'Colar Pérolas Naturais', type: 'saida', quantity: 2, date: '2024-03-21', note: 'Venda cliente VIP' },
  { id: '3', productId: '3', productName: 'Brinco Gota Prata 925', type: 'entrada', quantity: 15, date: '2024-03-22', note: 'Compra atacado' },
  { id: '4', productId: '6', productName: 'Tornozeleira Prata', type: 'saida', quantity: 4, date: '2024-03-23', note: 'Venda loja' },
];

const StockContext = createContext<StockContextType | null>(null);

export function StockProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [movements, setMovements] = useState<Movement[]>(mockMovements);

  const addProduct = useCallback((p: Omit<Product, 'id' | 'createdAt'>) => {
    setProducts(prev => [...prev, { ...p, id: crypto.randomUUID(), createdAt: new Date().toISOString().split('T')[0] }]);
  }, []);

  const updateProduct = useCallback((id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const addMovement = useCallback((m: Omit<Movement, 'id' | 'date'>) => {
    const mov: Movement = { ...m, id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0] };
    setMovements(prev => [mov, ...prev]);
    setProducts(prev => prev.map(p => {
      if (p.id === m.productId) {
        const newQty = m.type === 'entrada' ? p.quantity + m.quantity : Math.max(0, p.quantity - m.quantity);
        return { ...p, quantity: newQty };
      }
      return p;
    }));
  }, []);

  const getProduct = useCallback((id: string) => products.find(p => p.id === id), [products]);

  const lowStockProducts = products.filter(p => p.quantity <= p.minStock);
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0);

  return (
    <StockContext.Provider value={{ products, movements, addProduct, updateProduct, deleteProduct, addMovement, getProduct, lowStockProducts, totalProducts, totalValue }}>
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error('useStock must be used within StockProvider');
  return ctx;
}
