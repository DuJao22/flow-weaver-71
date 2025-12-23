import { memo } from 'react';
import { FlowNode as FlowNodeType, NodeType } from '@/types/flow';
import { 
  Zap, 
  Globe, 
  Cog, 
  GitBranch, 
  FileOutput,
  Settings,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlowNodeProps {
  node: FlowNodeType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onConfigure: (id: string) => void;
  index: number;
}

const nodeIcons: Record<NodeType, typeof Zap> = {
  trigger: Zap,
  api: Globe,
  process: Cog,
  condition: GitBranch,
  output: FileOutput,
};

const nodeLabels: Record<NodeType, string> = {
  trigger: 'Trigger',
  api: 'API Request',
  process: 'Process',
  condition: 'Condition',
  output: 'Output',
};

const nodeDescriptions: Record<NodeType, string> = {
  trigger: 'Inicia o fluxo',
  api: 'Requisição HTTP',
  process: 'Processa dados',
  condition: 'Lógica condicional',
  output: 'Gera resultado',
};

const nodeColors: Record<NodeType, { border: string; bg: string; icon: string }> = {
  trigger: { 
    border: 'border-l-[hsl(var(--node-trigger))]', 
    bg: 'bg-[hsl(var(--node-trigger))]/10',
    icon: 'text-[hsl(var(--node-trigger))]'
  },
  api: { 
    border: 'border-l-[hsl(var(--node-api))]', 
    bg: 'bg-[hsl(var(--node-api))]/10',
    icon: 'text-[hsl(var(--node-api))]'
  },
  process: { 
    border: 'border-l-[hsl(var(--node-process))]', 
    bg: 'bg-[hsl(var(--node-process))]/10',
    icon: 'text-[hsl(var(--node-process))]'
  },
  condition: { 
    border: 'border-l-[hsl(var(--node-condition))]', 
    bg: 'bg-[hsl(var(--node-condition))]/10',
    icon: 'text-[hsl(var(--node-condition))]'
  },
  output: { 
    border: 'border-l-[hsl(var(--node-output))]', 
    bg: 'bg-[hsl(var(--node-output))]/10',
    icon: 'text-[hsl(var(--node-output))]'
  },
};

const getConfigSummary = (node: FlowNodeType): string => {
  const config = node.config as any;
  switch (node.type) {
    case 'trigger':
      return `Modo: ${config.mode || 'manual'}`;
    case 'api':
      return config.url ? `${config.method || 'GET'} ${config.url.substring(0, 30)}...` : 'URL não configurada';
    case 'process':
      return `Ação: ${config.action || 'format_txt'}`;
    case 'condition':
      return config.field ? `${config.field} ${config.operator} ${config.value}` : 'Não configurado';
    case 'output':
      return `Formato: ${config.format || 'txt'}`;
    default:
      return '';
  }
};

export const FlowNodeComponent = memo(({ 
  node, 
  isSelected, 
  onSelect, 
  onConfigure,
  index 
}: FlowNodeProps) => {
  const Icon = nodeIcons[node.type];
  const label = node.label || nodeLabels[node.type];
  const colors = nodeColors[node.type];
  const configSummary = getConfigSummary(node);

  return (
    <div
      className={cn(
        'relative rounded-xl border-l-4 bg-card p-3 sm:p-4 shadow-lg transition-all duration-200 cursor-pointer',
        'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
        colors.border,
        isSelected && 'ring-2 ring-primary glow-primary'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onConfigure(node.id)}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          colors.bg
        )}>
          <Icon className={cn('w-5 h-5 sm:w-6 sm:h-6', colors.icon)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm sm:text-base truncate">{label}</p>
            <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
              #{index + 1}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate mt-0.5">
            {configSummary}
          </p>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConfigure(node.id);
          }}
          className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
          aria-label="Configurar node"
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      
      {/* Connection points */}
      {index > 0 && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-2.5 h-2.5 rounded-full bg-canvas-line border-2 border-card" />
        </div>
      )}
      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-2.5 h-2.5 rounded-full bg-canvas-line border-2 border-card" />
      </div>
    </div>
  );
});

FlowNodeComponent.displayName = 'FlowNode';