import { useState } from 'react';
import { Flow, FlowNode, NodeType } from '@/types/flow';
import { FlowNodeComponent } from './FlowNode';
import { NodeConfigPanel } from './NodeConfigPanel';
import { Plus, Zap, Globe, Cog, GitBranch, FileOutput, Workflow, Trash2, Copy, MoveUp, MoveDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FlowCanvasProps {
  flow: Flow;
  onFlowChange: (flow: Flow) => void;
}

const nodeOptions: { type: NodeType; label: string; icon: typeof Zap; description: string }[] = [
  { type: 'trigger', label: 'Trigger', icon: Zap, description: 'Inicia o fluxo' },
  { type: 'api', label: 'API Request', icon: Globe, description: 'Requisição HTTP' },
  { type: 'process', label: 'Process', icon: Cog, description: 'Processa dados' },
  { type: 'condition', label: 'Condition', icon: GitBranch, description: 'Lógica condicional' },
  { type: 'output', label: 'Output', icon: FileOutput, description: 'Gera saída' },
];

const getDefaultConfig = (type: NodeType) => {
  switch (type) {
    case 'trigger':
      return { mode: 'manual' as const };
    case 'api':
      return { url: '', method: 'GET' as const, headers: {} };
    case 'process':
      return { action: 'format_txt' as const };
    case 'condition':
      return { field: '', operator: 'equals' as const, value: '' };
    case 'output':
      return { format: 'txt' as const };
  }
};

export const FlowCanvas = ({ flow, onFlowChange }: FlowCanvasProps) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [configuringNodeId, setConfiguringNodeId] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);

  const selectedNode = flow.steps.find(n => n.id === configuringNodeId) || null;

  const addNode = (type: NodeType, afterIndex?: number) => {
    const id = `${type}_${Date.now()}`;
    const newNode: FlowNode = {
      id,
      type,
      label: nodeOptions.find(n => n.type === type)?.label || type,
      config: getDefaultConfig(type),
    };
    
    const newSteps = [...flow.steps];
    if (afterIndex !== undefined && afterIndex >= 0) {
      newSteps.splice(afterIndex + 1, 0, newNode);
    } else {
      newSteps.push(newNode);
    }
    
    onFlowChange({
      ...flow,
      steps: newSteps,
    });
    
    toast.success(`Node ${newNode.label} adicionado`);
  };

  const updateNode = (updatedNode: FlowNode) => {
    onFlowChange({
      ...flow,
      steps: flow.steps.map(n => n.id === updatedNode.id ? updatedNode : n),
    });
  };

  const deleteNode = (id: string) => {
    onFlowChange({
      ...flow,
      steps: flow.steps.filter(n => n.id !== id),
    });
    toast.success('Node removido');
  };

  const duplicateNode = (node: FlowNode, index: number) => {
    const newNode: FlowNode = {
      ...node,
      id: `${node.type}_${Date.now()}`,
      label: `${node.label} (cópia)`,
      config: { ...node.config },
    };
    
    const newSteps = [...flow.steps];
    newSteps.splice(index + 1, 0, newNode);
    
    onFlowChange({
      ...flow,
      steps: newSteps,
    });
    
    toast.success('Node duplicado');
  };

  const moveNode = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= flow.steps.length) return;
    
    const newSteps = [...flow.steps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    
    onFlowChange({
      ...flow,
      steps: newSteps,
    });
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Canvas Area */}
      <div className="flex-1 bg-canvas-bg canvas-grid p-4 sm:p-6 overflow-auto scrollbar-thin relative">
        {/* Flow Header */}
        <div className="mb-6 p-4 rounded-xl bg-card/50 border border-border backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Workflow className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <Input
                    value={flow.nome}
                    onChange={(e) => onFlowChange({ ...flow, nome: e.target.value })}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                    className="text-lg font-bold h-8 px-2"
                    autoFocus
                  />
                ) : (
                  <h2 
                    className="text-lg sm:text-xl font-bold cursor-pointer hover:text-primary transition-colors truncate"
                    onClick={() => setIsEditingName(true)}
                  >
                    {flow.nome || 'Nome do Fluxo'}
                  </h2>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {flow.steps.length} node{flow.steps.length !== 1 ? 's' : ''} • Clique em um node para configurar
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="gap-2 w-full sm:w-auto">
                    <Plus className="w-4 h-4" />
                    <span className="sm:inline">Adicionar</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {nodeOptions.map(({ type, label, icon: Icon, description }) => (
                    <DropdownMenuItem 
                      key={type}
                      onClick={() => addNode(type)}
                      className="gap-3 cursor-pointer py-2.5"
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        type === 'trigger' && 'bg-node-trigger/20 text-node-trigger',
                        type === 'api' && 'bg-node-api/20 text-node-api',
                        type === 'process' && 'bg-node-process/20 text-node-process',
                        type === 'condition' && 'bg-node-condition/20 text-node-condition',
                        type === 'output' && 'bg-node-output/20 text-node-output',
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {flow.description && (
            <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
              {flow.description}
            </p>
          )}
        </div>

        {/* Nodes List */}
        <div className="space-y-4 max-w-lg mx-auto">
          {flow.steps.map((node, index) => (
            <div key={node.id} className="relative group">
              {/* Connection Line */}
              {index > 0 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                  <div className="h-4 w-0.5 bg-canvas-line" />
                </div>
              )}
              
              <FlowNodeComponent
                node={node}
                isSelected={selectedNodeId === node.id}
                onSelect={setSelectedNodeId}
                onConfigure={setConfiguringNodeId}
                index={index}
              />
              
              {/* Node Actions - Mobile friendly */}
              <div className={cn(
                'flex items-center justify-center gap-1 mt-2 transition-all',
                'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
              )}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveNode(index, 'up')}
                  disabled={index === 0}
                  className="h-7 w-7 p-0"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveNode(index, 'down')}
                  disabled={index === flow.steps.length - 1}
                  className="h-7 w-7 p-0"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => duplicateNode(node, index)}
                  className="h-7 w-7 p-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteNode(node.id)}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                
                {/* Add node between */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 px-2 gap-1">
                      <Plus className="w-3 h-3" />
                      <span className="text-xs">Inserir</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48">
                    {nodeOptions.map(({ type, label, icon: Icon }) => (
                      <DropdownMenuItem 
                        key={type}
                        onClick={() => addNode(type, index)}
                        className="gap-2 cursor-pointer"
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}

          {/* Add Node Button - Empty State */}
          {flow.steps.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                <Zap className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum node ainda</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                Comece adicionando um Trigger ou peça para a IA criar um fluxo completo
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="lg" className="gap-2">
                    <Plus className="w-5 h-5" />
                    Adicionar Primeiro Node
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  {nodeOptions.map(({ type, label, icon: Icon, description }) => (
                    <DropdownMenuItem 
                      key={type}
                      onClick={() => addNode(type)}
                      className="gap-3 cursor-pointer py-2.5"
                    >
                      <Icon className="w-5 h-5" />
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* Config Panel */}
      {configuringNodeId && (
        <NodeConfigPanel
          node={selectedNode}
          onClose={() => setConfiguringNodeId(null)}
          onSave={updateNode}
          onDelete={deleteNode}
        />
      )}
    </div>
  );
};