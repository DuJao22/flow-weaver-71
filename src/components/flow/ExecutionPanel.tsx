import { useState } from 'react';
import { Flow, ExecutionLog, ExecutionResult } from '@/types/flow';
import { Play, Square, Download, Trash2, Clock, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ExecutionPanelProps {
  flow: Flow;
}

const logIcons = {
  info: Info,
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
};

const logColors = {
  info: 'text-blue-400',
  success: 'text-primary',
  error: 'text-destructive',
  warning: 'text-yellow-400',
};

// Simulate flow execution
const executeFlow = async (
  flow: Flow, 
  onLog: (log: ExecutionLog) => void
): Promise<ExecutionResult> => {
  const startedAt = new Date().toISOString();
  const logs: ExecutionLog[] = [];

  const addLog = (log: ExecutionLog) => {
    logs.push(log);
    onLog(log);
  };

  addLog({
    timestamp: new Date().toISOString(),
    nodeId: 'system',
    type: 'info',
    message: `Starting execution of flow: ${flow.nome}`,
  });

  let output = '';
  let previousData: unknown = null;

  for (const step of flow.steps) {
    addLog({
      timestamp: new Date().toISOString(),
      nodeId: step.id,
      type: 'info',
      message: `Executing node: ${step.id} (${step.type})`,
    });

    // Simulate execution delay
    await new Promise(r => setTimeout(r, 500 + Math.random() * 500));

    try {
      switch (step.type) {
        case 'trigger':
          addLog({
            timestamp: new Date().toISOString(),
            nodeId: step.id,
            type: 'success',
            message: 'Trigger activated',
            data: { mode: (step.config as any).mode },
          });
          break;

        case 'api':
          const apiConfig = step.config as any;
          // Simulate API call
          addLog({
            timestamp: new Date().toISOString(),
            nodeId: step.id,
            type: 'info',
            message: `${apiConfig.method} ${apiConfig.url}`,
          });
          
          // Simulate response
          previousData = {
            status: 200,
            data: { message: 'Sample API response', timestamp: new Date().toISOString() },
          };
          
          addLog({
            timestamp: new Date().toISOString(),
            nodeId: step.id,
            type: 'success',
            message: 'API request successful',
            data: previousData,
          });
          break;

        case 'process':
          const processConfig = step.config as any;
          addLog({
            timestamp: new Date().toISOString(),
            nodeId: step.id,
            type: 'info',
            message: `Processing data with action: ${processConfig.action}`,
          });
          
          if (processConfig.action === 'format_txt') {
            output = JSON.stringify(previousData, null, 2);
          }
          
          addLog({
            timestamp: new Date().toISOString(),
            nodeId: step.id,
            type: 'success',
            message: 'Data processed successfully',
          });
          break;

        case 'condition':
          const condConfig = step.config as any;
          addLog({
            timestamp: new Date().toISOString(),
            nodeId: step.id,
            type: 'info',
            message: `Evaluating condition: ${condConfig.field} ${condConfig.operator} ${condConfig.value}`,
          });
          
          addLog({
            timestamp: new Date().toISOString(),
            nodeId: step.id,
            type: 'success',
            message: 'Condition evaluated: true',
          });
          break;

        case 'output':
          const outputConfig = step.config as any;
          output = output || JSON.stringify(previousData || { result: 'Flow completed' }, null, 2);
          
          addLog({
            timestamp: new Date().toISOString(),
            nodeId: step.id,
            type: 'success',
            message: `Output generated in ${outputConfig.format} format`,
            data: { format: outputConfig.format, size: output.length },
          });
          break;
      }
    } catch (error) {
      addLog({
        timestamp: new Date().toISOString(),
        nodeId: step.id,
        type: 'error',
        message: `Error in node: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      
      return {
        flowId: flow.id || 'unknown',
        status: 'error',
        startedAt,
        completedAt: new Date().toISOString(),
        logs,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  addLog({
    timestamp: new Date().toISOString(),
    nodeId: 'system',
    type: 'success',
    message: 'Flow execution completed successfully',
  });

  return {
    flowId: flow.id || 'unknown',
    status: 'success',
    startedAt,
    completedAt: new Date().toISOString(),
    logs,
    output,
  };
};

export const ExecutionPanel = ({ flow }: ExecutionPanelProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  const handleExecute = async () => {
    if (flow.steps.length === 0) {
      toast.error('Cannot execute empty flow');
      return;
    }

    setIsRunning(true);
    setLogs([]);
    setResult(null);

    try {
      const executionResult = await executeFlow(flow, (log) => {
        setLogs(prev => [...prev, log]);
      });
      setResult(executionResult);
      
      if (executionResult.status === 'success') {
        toast.success('Flow executed successfully');
      } else {
        toast.error('Flow execution failed');
      }
    } catch (error) {
      toast.error('Execution error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleDownloadOutput = () => {
    if (!result?.output) return;
    
    const blob = new Blob([result.output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flow.nome || 'output'}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Output downloaded');
  };

  const clearLogs = () => {
    setLogs([]);
    setResult(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas-bg">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border glass">
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleExecute} 
            disabled={isRunning}
            size="sm"
            className="gap-2"
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Execute Flow
              </>
            )}
          </Button>
          
          {result?.output && (
            <Button variant="outline" size="sm" onClick={handleDownloadOutput}>
              <Download className="w-4 h-4 mr-2" />
              Download Output
            </Button>
          )}
        </div>
        
        <Button variant="ghost" size="sm" onClick={clearLogs} disabled={logs.length === 0}>
          <Trash2 className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>

      {/* Logs */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No execution logs yet</p>
              <p className="text-sm">Click "Execute Flow" to run your automation</p>
            </div>
          ) : (
            logs.map((log, index) => {
              const Icon = logIcons[log.type];
              return (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50 animate-fade-in"
                >
                  <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', logColors[log.type])} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-secondary">
                        {log.nodeId}
                      </span>
                    </div>
                    <p className="text-sm">{log.message}</p>
                    {log.data && (
                      <pre className="mt-2 p-2 rounded bg-secondary/50 text-xs font-mono overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Result Summary */}
      {result && (
        <div className={cn(
          'p-4 border-t',
          result.status === 'success' ? 'bg-primary/10 border-primary/30' : 'bg-destructive/10 border-destructive/30'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {result.status === 'success' ? (
                <CheckCircle className="w-5 h-5 text-primary" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive" />
              )}
              <span className="font-medium">
                {result.status === 'success' ? 'Execution Successful' : 'Execution Failed'}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              Duration: {Math.round((new Date(result.completedAt).getTime() - new Date(result.startedAt).getTime()) / 1000)}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
