import { useState } from 'react';
import { Flow, FlowNode, NodeType } from '@/types/flow';
import { FlowNodeComponent } from './FlowNode';
import { NodeConfigPanel } from './NodeConfigPanel';
import { Plus, Zap, Globe, Cog, GitBranch, FileOutput } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FlowCanvasProps {
  flow: Flow;
  onFlowChange: (flow: Flow) => void;
}

const nodeOptions: { type: NodeType; label: string; icon: typeof Zap }[] = [
  { type: 'trigger', label: 'Trigger', icon: Zap },
  { type: 'api', label: 'API Request', icon: Globe },
  { type: 'process', label: 'Process', icon: Cog },
  { type: 'condition', label: 'Condition', icon: GitBranch },
  { type: 'output', label: 'Output', icon: FileOutput },
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

  const selectedNode = flow.steps.find(n => n.id === configuringNodeId) || null;

  const addNode = (type: NodeType) => {
    const id = `${type}_${Date.now()}`;
    const newNode: FlowNode = {
      id,
      type,
      config: getDefaultConfig(type),
    };
    
    onFlowChange({
      ...flow,
      steps: [...flow.steps, newNode],
    });
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
  };

  return (
    <div className="flex-1 flex h-full">
      {/* Canvas Area */}
      <div className="flex-1 bg-canvas-bg canvas-grid p-6 overflow-auto scrollbar-thin relative">
        {/* Flow Name Header */}
        <div className="mb-6">
          <input
            type="text"
            value={flow.nome}
            onChange={(e) => onFlowChange({ ...flow, nome: e.target.value })}
            className="text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 text-foreground"
            placeholder="Flow Name"
          />
          <p className="text-sm text-muted-foreground mt-1">
            {flow.steps.length} step{flow.steps.length !== 1 ? 's' : ''} • Click a node to configure
          </p>
        </div>

        {/* Nodes List */}
        <div className="space-y-6 max-w-md">
          {flow.steps.map((node, index) => (
            <div key={node.id} className="relative">
              {/* Connection Line */}
              {index > 0 && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 h-6 w-0.5 bg-canvas-line" />
              )}
              
              <FlowNodeComponent
                node={node}
                isSelected={selectedNodeId === node.id}
                onSelect={setSelectedNodeId}
                onConfigure={setConfiguringNodeId}
                index={index}
              />
            </div>
          ))}

          {/* Add Node Button */}
          <div className="flex justify-center pt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Add Node
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                {nodeOptions.map(({ type, label, icon: Icon }) => (
                  <DropdownMenuItem 
                    key={type}
                    onClick={() => addNode(type)}
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

        {/* Empty State */}
        {flow.steps.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No nodes yet</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Start by adding a Trigger node to begin your automation flow
              </p>
            </div>
          </div>
        )}
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
