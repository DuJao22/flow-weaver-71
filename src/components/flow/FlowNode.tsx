import { memo } from 'react';
import { FlowNode as FlowNodeType, NodeType } from '@/types/flow';
import { 
  Zap, 
  Globe, 
  Cog, 
  GitBranch, 
  FileOutput,
  GripVertical,
  Settings
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

const nodeColors: Record<NodeType, string> = {
  trigger: 'node-trigger',
  api: 'node-api',
  process: 'node-process',
  condition: 'node-condition',
  output: 'node-output',
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
  const colorClass = nodeColors[node.type];

  return (
    <div
      className={cn(
        'node-card cursor-pointer group animate-fade-in',
        colorClass,
        isSelected && 'ring-2 ring-primary glow-primary'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onSelect(node.id)}
    >
      <div className="flex items-center gap-3">
        <div className="cursor-grab opacity-50 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4" />
        </div>
        
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          'bg-secondary/50'
        )}>
          <Icon className="w-5 h-5 text-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{label}</p>
          <p className="text-xs text-muted-foreground truncate">
            {node.id}
          </p>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConfigure(node.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-secondary rounded-lg"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
      
      {/* Connection point */}
      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-3 h-3 rounded-full bg-canvas-line border-2 border-card" />
      </div>
      
      {/* Top connection point (except for first node) */}
      {index > 0 && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-3 h-3 rounded-full bg-canvas-line border-2 border-card" />
        </div>
      )}
    </div>
  );
});

FlowNodeComponent.displayName = 'FlowNode';
