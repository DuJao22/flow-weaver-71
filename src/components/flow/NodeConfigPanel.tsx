import { useState, useEffect } from 'react';
import { FlowNode, TriggerConfig, ApiConfig, ProcessConfig, ConditionConfig, OutputConfig } from '@/types/flow';
import { X, Save, Trash2, Zap, Globe, Cog, GitBranch, FileOutput, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NodeConfigPanelProps {
  node: FlowNode | null;
  onClose: () => void;
  onSave: (node: FlowNode) => void;
  onDelete: (id: string) => void;
}

const nodeIcons = {
  trigger: Zap,
  api: Globe,
  process: Cog,
  condition: GitBranch,
  output: FileOutput,
};

const nodeColors = {
  trigger: 'text-[hsl(var(--node-trigger))]',
  api: 'text-[hsl(var(--node-api))]',
  process: 'text-[hsl(var(--node-process))]',
  condition: 'text-[hsl(var(--node-condition))]',
  output: 'text-[hsl(var(--node-output))]',
};

export const NodeConfigPanel = ({ node, onClose, onSave, onDelete }: NodeConfigPanelProps) => {
  const [editedNode, setEditedNode] = useState<FlowNode | null>(null);

  useEffect(() => {
    setEditedNode(node ? { ...node, config: { ...node.config } } : null);
  }, [node]);

  if (!editedNode) return null;

  const Icon = nodeIcons[editedNode.type];

  const updateConfig = (key: string, value: unknown) => {
    setEditedNode(prev => prev ? {
      ...prev,
      config: { ...prev.config, [key]: value }
    } : null);
  };

  const updateLabel = (label: string) => {
    setEditedNode(prev => prev ? { ...prev, label } : null);
  };

  const handleSave = () => {
    if (editedNode) {
      onSave(editedNode);
      toast.success('Configuração salva!');
      onClose();
    }
  };

  const handleDelete = () => {
    if (editedNode) {
      onDelete(editedNode.id);
      onClose();
    }
  };

  const renderConfigFields = () => {
    switch (editedNode.type) {
      case 'trigger':
        const triggerConfig = editedNode.config as TriggerConfig;
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  O Trigger define como o fluxo será iniciado. Escolha manual para execução via botão, schedule para agendamento, ou webhook para receber eventos externos.
                </p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Modo de Ativação</Label>
              <Select 
                value={triggerConfig.mode} 
                onValueChange={(v) => updateConfig('mode', v)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">
                    <div className="flex flex-col">
                      <span>Manual</span>
                      <span className="text-xs text-muted-foreground">Executar via botão</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="schedule">
                    <div className="flex flex-col">
                      <span>Agendado</span>
                      <span className="text-xs text-muted-foreground">Execução automática</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="webhook">
                    <div className="flex flex-col">
                      <span>Webhook</span>
                      <span className="text-xs text-muted-foreground">Receber eventos</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {triggerConfig.mode === 'schedule' && (
              <div>
                <Label className="text-sm font-medium">Expressão Cron</Label>
                <Input 
                  value={triggerConfig.schedule || ''} 
                  onChange={(e) => updateConfig('schedule', e.target.value)}
                  placeholder="*/5 * * * * (a cada 5 minutos)"
                  className="mt-1.5 font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Formato: minuto hora dia mês dia_semana
                </p>
              </div>
            )}
            
            {triggerConfig.mode === 'webhook' && (
              <div>
                <Label className="text-sm font-medium">URL do Webhook</Label>
                <Input 
                  value={triggerConfig.webhookUrl || ''} 
                  onChange={(e) => updateConfig('webhookUrl', e.target.value)}
                  placeholder="/webhook/meu-endpoint"
                  className="mt-1.5 font-mono"
                />
              </div>
            )}
          </div>
        );

      case 'api':
        const apiConfig = editedNode.config as ApiConfig;
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Configure a requisição HTTP para integrar com APIs externas. A resposta será passada para o próximo node.
                </p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">URL da API</Label>
              <Input 
                value={apiConfig.url || ''} 
                onChange={(e) => updateConfig('url', e.target.value)}
                placeholder="https://api.exemplo.com/endpoint"
                className="mt-1.5 font-mono text-sm"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Método HTTP</Label>
              <Select 
                value={apiConfig.method || 'GET'} 
                onValueChange={(v) => updateConfig('method', v)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET - Buscar dados</SelectItem>
                  <SelectItem value="POST">POST - Enviar dados</SelectItem>
                  <SelectItem value="PUT">PUT - Atualizar completo</SelectItem>
                  <SelectItem value="PATCH">PATCH - Atualizar parcial</SelectItem>
                  <SelectItem value="DELETE">DELETE - Remover</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Headers (JSON)</Label>
              <Textarea 
                value={JSON.stringify(apiConfig.headers || {}, null, 2)} 
                onChange={(e) => {
                  try {
                    updateConfig('headers', JSON.parse(e.target.value));
                  } catch {}
                }}
                placeholder='{"Content-Type": "application/json"}'
                className="mt-1.5 font-mono text-xs"
                rows={3}
              />
            </div>
            
            {(apiConfig.method === 'POST' || apiConfig.method === 'PUT' || apiConfig.method === 'PATCH') && (
              <div>
                <Label className="text-sm font-medium">Body (JSON)</Label>
                <Textarea 
                  value={apiConfig.body || ''} 
                  onChange={(e) => updateConfig('body', e.target.value)}
                  placeholder='{"chave": "valor"}'
                  className="mt-1.5 font-mono text-xs"
                  rows={4}
                />
              </div>
            )}
          </div>
        );

      case 'process':
        const processConfig = editedNode.config as ProcessConfig;
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Processe e transforme os dados recebidos do node anterior antes de passar para o próximo.
                </p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Ação de Processamento</Label>
              <Select 
                value={processConfig.action || 'format_txt'} 
                onValueChange={(v) => updateConfig('action', v)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="format_txt">Formatar como Texto</SelectItem>
                  <SelectItem value="parse_json">Parse JSON</SelectItem>
                  <SelectItem value="transform">Transformar Dados</SelectItem>
                  <SelectItem value="filter">Filtrar Itens</SelectItem>
                  <SelectItem value="aggregate">Agregar Dados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Template / Expressão</Label>
              <Textarea 
                value={processConfig.template || processConfig.expression || ''} 
                onChange={(e) => updateConfig('template', e.target.value)}
                placeholder="Use {{data}} para referenciar dados do node anterior"
                className="mt-1.5 font-mono text-xs"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Variáveis: {'{{data}}'}, {'{{previousData}}'}, {'{{index}}'}
              </p>
            </div>
          </div>
        );

      case 'condition':
        const conditionConfig = editedNode.config as ConditionConfig;
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Defina uma condição para controlar o fluxo de execução baseado nos dados.
                </p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Campo a Verificar</Label>
              <Input 
                value={conditionConfig.field || ''} 
                onChange={(e) => updateConfig('field', e.target.value)}
                placeholder="data.status ou response.code"
                className="mt-1.5 font-mono text-sm"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Operador</Label>
              <Select 
                value={conditionConfig.operator || 'equals'} 
                onValueChange={(v) => updateConfig('operator', v)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Igual a</SelectItem>
                  <SelectItem value="contains">Contém</SelectItem>
                  <SelectItem value="greater">Maior que</SelectItem>
                  <SelectItem value="less">Menor que</SelectItem>
                  <SelectItem value="exists">Existe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Valor Esperado</Label>
              <Input 
                value={conditionConfig.value || ''} 
                onChange={(e) => updateConfig('value', e.target.value)}
                placeholder="success, 200, true..."
                className="mt-1.5"
              />
            </div>
          </div>
        );

      case 'output':
        const outputConfig = editedNode.config as OutputConfig;
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Configure como o resultado final do fluxo será gerado e disponibilizado para download.
                </p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Formato de Saída</Label>
              <Select 
                value={outputConfig.format || 'txt'} 
                onValueChange={(v) => updateConfig('format', v)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="txt">Arquivo de Texto (.txt)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="log">Log no Console</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Nome do Arquivo</Label>
              <Input 
                value={outputConfig.filename || ''} 
                onChange={(e) => updateConfig('filename', e.target.value)}
                placeholder="output (sem extensão)"
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                A extensão será adicionada automaticamente
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={cn(
        'fixed right-0 top-0 h-full w-full sm:w-96 z-50',
        'lg:relative lg:w-80 lg:z-auto',
        'glass border-l border-border flex flex-col animate-slide-in-right'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center bg-secondary', nodeColors[editedNode.type])}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Configurar Node</h3>
              <p className="text-xs text-muted-foreground capitalize">{editedNode.type}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Nome do Node</Label>
              <Input 
                value={editedNode.label || ''} 
                onChange={(e) => updateLabel(e.target.value)}
                placeholder="Ex: Buscar Usuários"
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">ID do Node</Label>
              <Input 
                value={editedNode.id} 
                disabled
                className="mt-1.5 opacity-60 font-mono text-xs"
              />
            </div>
            
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-semibold mb-4">Configurações</h4>
              {renderConfigFields()}
            </div>
          </div>
        </ScrollArea>
        
        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-2">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete}
            className="flex-1 gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </Button>
          <Button 
            size="sm"
            onClick={handleSave}
            className="flex-1 gap-1.5"
          >
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </div>
      </div>
    </>
  );
};