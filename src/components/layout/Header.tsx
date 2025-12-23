import { Workflow, Github, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header = () => {
  return (
    <header className="h-14 border-b border-border glass flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Workflow className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none">FlowMaster</h1>
          <p className="text-xs text-muted-foreground">Automação de Fluxos</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground hidden sm:block">
          Desenvolvido por João Layon
        </span>
      </div>
    </header>
  );
};
