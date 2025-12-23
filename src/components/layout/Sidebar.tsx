import { useState } from 'react';
import { 
  LayoutGrid, 
  Code2, 
  Play, 
  MessageSquare, 
  ChevronLeft,
  ChevronRight,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export type ViewMode = 'canvas' | 'json' | 'execute' | 'ai';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onNewFlow: () => void;
}

const navItems: { id: ViewMode; label: string; shortLabel: string; icon: typeof LayoutGrid; description: string }[] = [
  { id: 'canvas', label: 'Editor Visual', shortLabel: 'Editor', icon: LayoutGrid, description: 'Construa seu fluxo visualmente' },
  { id: 'json', label: 'Editor JSON', shortLabel: 'JSON', icon: Code2, description: 'Edite o código JSON diretamente' },
  { id: 'execute', label: 'Executar', shortLabel: 'Executar', icon: Play, description: 'Execute e veja os logs' },
  { id: 'ai', label: 'Assistente IA', shortLabel: 'IA', icon: MessageSquare, description: 'Crie fluxos com IA' },
];

export const Sidebar = ({ currentView, onViewChange, onNewFlow }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-4 left-4 z-50 lg:hidden w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:relative inset-y-0 left-0 z-40',
        'h-full border-r border-border glass flex flex-col transition-all duration-300',
        // Mobile styles
        'w-64 lg:w-auto',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        // Desktop collapsed state
        isCollapsed ? 'lg:w-16' : 'lg:w-56'
      )}>
        {/* New Flow Button */}
        <div className="p-3">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button 
                onClick={() => {
                  onNewFlow();
                  setIsMobileOpen(false);
                }}
                className={cn(
                  'w-full gap-2',
                  isCollapsed && 'lg:px-0'
                )}
                size="sm"
              >
                <Plus className="w-4 h-4" />
                <span className={cn(isCollapsed && 'lg:hidden')}>Novo Fluxo</span>
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="hidden lg:block">
                Novo Fluxo
              </TooltipContent>
            )}
          </Tooltip>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(({ id, label, shortLabel, icon: Icon, description }) => (
            <Tooltip key={id} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    onViewChange(id);
                    setIsMobileOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                    'hover:bg-secondary/80 active:scale-[0.98]',
                    currentView === id && 'bg-primary/10 text-primary border border-primary/20',
                    currentView !== id && 'text-muted-foreground',
                    isCollapsed && 'lg:justify-center lg:px-0'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className={cn('flex-1 text-left', isCollapsed && 'lg:hidden')}>
                    <span className="text-sm font-medium block">{label}</span>
                    <span className="text-xs text-muted-foreground block lg:hidden">{description}</span>
                  </div>
                </button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="hidden lg:block">
                  <p className="font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>
        
        {/* Collapse Toggle - Desktop Only */}
        <div className="p-3 border-t border-border hidden lg:block">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/80 text-muted-foreground transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm">Recolher</span>
              </>
            )}
          </button>
        </div>
        
        {/* Credits */}
        <div className={cn(
          'p-4 border-t border-border',
          isCollapsed && 'lg:hidden'
        )}>
          <div className="text-xs text-muted-foreground text-center">
            <p className="font-semibold text-foreground">FlowMaster v1.0</p>
            <p className="mt-2">Desenvolvido por</p>
            <p className="text-primary font-medium">João Layon</p>
            <p className="text-[10px] mt-1 opacity-70">Arquiteto de Software</p>
          </div>
        </div>
      </aside>
    </>
  );
};