import { useState } from 'react';
import { 
  LayoutGrid, 
  Code2, 
  Play, 
  MessageSquare, 
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileJson
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

const navItems: { id: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'canvas', label: 'Editor Visual', icon: LayoutGrid },
  { id: 'json', label: 'Editor JSON', icon: Code2 },
  { id: 'execute', label: 'Executar', icon: Play },
  { id: 'ai', label: 'Assistente IA', icon: MessageSquare },
];

export const Sidebar = ({ currentView, onViewChange, onNewFlow }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={cn(
      'h-full border-r border-border glass flex flex-col transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-56'
    )}>
      {/* New Flow Button */}
      <div className="p-3">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button 
              onClick={onNewFlow}
              className={cn(
                'w-full gap-2',
                isCollapsed && 'px-0'
              )}
            >
              <Plus className="w-4 h-4" />
              {!isCollapsed && 'Novo Fluxo'}
            </Button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">
              Novo Fluxo
            </TooltipContent>
          )}
        </Tooltip>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <Tooltip key={id} delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onViewChange(id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  'hover:bg-secondary/80',
                  currentView === id && 'bg-secondary text-foreground',
                  currentView !== id && 'text-muted-foreground',
                  isCollapsed && 'justify-center px-0'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{label}</span>
                )}
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                {label}
              </TooltipContent>
            )}
          </Tooltip>
        ))}
      </nav>
      
      {/* Collapse Toggle */}
      <div className="p-3 border-t border-border">
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
      {!isCollapsed && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            <p className="font-medium">FlowMaster v1.0</p>
            <p className="mt-1">Desenvolvido por</p>
            <p className="text-primary">João Layon</p>
            <p className="text-[10px] mt-1 opacity-70">Arquiteto de Software</p>
          </div>
        </div>
      )}
    </aside>
  );
};
