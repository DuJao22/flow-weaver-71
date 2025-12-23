import { useState, useEffect } from 'react';
import { FlowNode, NodeType, TriggerConfig, ApiConfig, ProcessConfig, ConditionConfig, OutputConfig } from '@/types/flow';
import { X, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface NodeConfigPanelProps {
  node: FlowNode | null;
  onClose: () => void;
  onSave: (node: FlowNode) => void;
  onDelete: (id: string) => void;
}

export const NodeConfigPanel = ({ node, onClose, onSave, onDelete }: NodeConfigPanelProps) => {
  const [editedNode, setEditedNode] = useState<FlowNode | null>(null);

  useEffect(() => {
    setEditedNode(node ? { ...node, config: { ...node.config } } : null);
  }, [node]);

  if (!editedNode) return null;

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
      onClose();
    }
  };

  const renderConfigFields = () => {
    switch (editedNode.type) {
      case 'trigger':
        const triggerConfig = editedNode.config as TriggerConfig;
        return (
          <div className="space-y-4">
            <div>
              <Label>Trigger Mode</Label>
              <Select 
                value={triggerConfig.mode} 
                onValueChange={(v) => updateConfig('mode', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {triggerConfig.mode === 'schedule' && (
              <div>
                <Label>Cron Expression</Label>
                <Input 
                  value={triggerConfig.schedule || ''} 
                  onChange={(e) => updateConfig('schedule', e.target.value)}
                  placeholder="*/5 * * * *"
                />
              </div>
            )}
          </div>
        );

      case 'api':
        const apiConfig = editedNode.config as ApiConfig;
        return (
          <div className="space-y-4">
            <div>
              <Label>URL</Label>
              <Input 
                value={apiConfig.url || ''} 
                onChange={(e) => updateConfig('url', e.target.value)}
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            <div>
              <Label>Method</Label>
              <Select 
                value={apiConfig.method || 'GET'} 
                onValueChange={(v) => updateConfig('method', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Headers (JSON)</Label>
              <Textarea 
                value={JSON.stringify(apiConfig.headers || {}, null, 2)} 
                onChange={(e) => {
                  try {
                    updateConfig('headers', JSON.parse(e.target.value));
                  } catch {}
                }}
                placeholder='{"Content-Type": "application/json"}'
                className="font-mono text-sm"
                rows={4}
              />
            </div>
            {(apiConfig.method === 'POST' || apiConfig.method === 'PUT' || apiConfig.method === 'PATCH') && (
              <div>
                <Label>Body (JSON)</Label>
                <Textarea 
                  value={apiConfig.body || ''} 
                  onChange={(e) => updateConfig('body', e.target.value)}
                  placeholder='{"key": "value"}'
                  className="font-mono text-sm"
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
            <div>
              <Label>Action</Label>
              <Select 
                value={processConfig.action || 'format_txt'} 
                onValueChange={(v) => updateConfig('action', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="format_txt">Format as Text</SelectItem>
                  <SelectItem value="parse_json">Parse JSON</SelectItem>
                  <SelectItem value="transform">Transform Data</SelectItem>
                  <SelectItem value="filter">Filter Data</SelectItem>
                  <SelectItem value="aggregate">Aggregate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Template / Expression</Label>
              <Textarea 
                value={processConfig.template || processConfig.expression || ''} 
                onChange={(e) => updateConfig('template', e.target.value)}
                placeholder="Enter template or expression..."
                className="font-mono text-sm"
                rows={4}
              />
            </div>
          </div>
        );

      case 'condition':
        const conditionConfig = editedNode.config as ConditionConfig;
        return (
          <div className="space-y-4">
            <div>
              <Label>Field</Label>
              <Input 
                value={conditionConfig.field || ''} 
                onChange={(e) => updateConfig('field', e.target.value)}
                placeholder="data.status"
              />
            </div>
            <div>
              <Label>Operator</Label>
              <Select 
                value={conditionConfig.operator || 'equals'} 
                onValueChange={(v) => updateConfig('operator', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="greater">Greater Than</SelectItem>
                  <SelectItem value="less">Less Than</SelectItem>
                  <SelectItem value="exists">Exists</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input 
                value={conditionConfig.value || ''} 
                onChange={(e) => updateConfig('value', e.target.value)}
                placeholder="success"
              />
            </div>
          </div>
        );

      case 'output':
        const outputConfig = editedNode.config as OutputConfig;
        return (
          <div className="space-y-4">
            <div>
              <Label>Output Format</Label>
              <Select 
                value={outputConfig.format || 'txt'} 
                onValueChange={(v) => updateConfig('format', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="txt">Text File (.txt)</SelectItem>
                  <SelectItem value="json">JSON File (.json)</SelectItem>
                  <SelectItem value="csv">CSV File (.csv)</SelectItem>
                  <SelectItem value="log">Console Log</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Filename (optional)</Label>
              <Input 
                value={outputConfig.filename || ''} 
                onChange={(e) => updateConfig('filename', e.target.value)}
                placeholder="output"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-80 glass border-l border-border h-full flex flex-col animate-slide-in-right">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold">Configure Node</h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-secondary rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        <div>
          <Label>Node Label</Label>
          <Input 
            value={editedNode.label || ''} 
            onChange={(e) => updateLabel(e.target.value)}
            placeholder="Enter label..."
          />
        </div>
        
        <div>
          <Label>Node ID</Label>
          <Input 
            value={editedNode.id} 
            disabled
            className="opacity-60"
          />
        </div>
        
        <div className="pt-2 border-t border-border">
          {renderConfigFields()}
        </div>
      </div>
      
      <div className="p-4 border-t border-border flex gap-2">
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => {
            onDelete(editedNode.id);
            onClose();
          }}
          className="flex-1"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
        <Button 
          size="sm"
          onClick={handleSave}
          className="flex-1"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
};
