import { Workflow } from 'lucide-react';

export const Header = () => {
  return (
    <header className="h-12 sm:h-14 border-b border-border glass flex items-center justify-between px-3 sm:px-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Workflow className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base sm:text-lg leading-none">FlowMaster</h1>
          <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Automação de Fluxos</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-[10px] sm:text-xs text-muted-foreground hidden md:block">
          por João Layon
        </span>
      </div>
    </header>
  );
};