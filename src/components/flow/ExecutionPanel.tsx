import { useState, useRef, useEffect } from 'react';
import { Flow, ExecutionLog, ExecutionResult, FlowNode } from '@/types/flow';
import { 
  Play, 
  Square, 
  Download, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  Zap,
  Globe,
  Cog,
  GitBranch,
  FileOutput,
  ChevronRight,
  Timer,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
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
  info: 'text-blue-400 bg-blue-400/10',
  success: 'text-primary bg-primary/10',
  error: 'text-destructive bg-destructive/10',
  warning: 'text-yellow-400 bg-yellow-400/10',
};

const nodeIcons = {
  trigger: Zap,
  api: Globe,
  process: Cog,
  condition: GitBranch,
  output: FileOutput,
};

// Execute flow with detailed logs
const executeFlow = async (
  flow: Flow, 
  onLog: (log: ExecutionLog) => void,
  onNodeStart: (nodeId: string) => void,
  onNodeComplete: (nodeId: string, success: boolean) => void
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
    message: `🚀 Iniciando execução do fluxo: "${flow.nome}"`,
  });

  addLog({
    timestamp: new Date().toISOString(),
    nodeId: 'system',
    type: 'info',
    message: `📋 Total de steps: ${flow.steps.length}`,
  });

  let output = '';
  let previousData: unknown = null;

  for (let i = 0; i < flow.steps.length; i++) {
    const step = flow.steps[i];
    onNodeStart(step.id);
    
    addLog({
      timestamp: new Date().toISOString(),
      nodeId: step.id,
      type: 'info',
      message: `▶️ Executando [${i + 1}/${flow.steps.length}]: ${step.label || step.id}`,
      data: { type: step.type, config: step.config },
    });

    // Simulate execution delay
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

    try {
      switch (step.type) {
        case 'trigger':
          const triggerConfig = step.config as any;
          addLog({
            timestamp: new Date().toISOString(),
            nodeId: step.id,
            type: 'success',
            message: `⚡ Trigger ativado (modo: ${triggerConfig.mode})`,
            data: { 
              mode: triggerConfig.mode,
              activatedAt: new Date().toISOString()
            },
          });
          previousData = { triggered: true, mode: triggerConfig.mode };
          break;

        case 'api':
          const apiConfig = step.config as any;
          addLog({
            timestamp: new Date().toISOString(),
            nodeId: step.id,
            type: 'info',
            message: `🌐 Fazendo requisição: ${apiConfig.method} ${apiConfig.url || '[URL não configurada]'}`,
          });
          
          await new Promise(r => setTimeout(r, 300));
          
          // Simulate API response
          const mockResponse = {
            status: 200,
            statusText: 'OK',
            data: { 
              userId: 1,
              id: 1,
              title: 'Dados de exemplo da API',
              body: 'Este é um corpo de resposta simulado da API',
              timestamp: new Date().toISOString()
            },
            headers: {
              'content-type': 'application/json',
              'x-request-id': `req_${Date.now()}`
            }
          };
          
          previousData = mockResponse;
          
          addLog({
            timestamp: new Date().toISOString(),
            nodeId: step.id,
            type: 'success',
            message: `✅ Resposta recebida: ${mockResponse.status} ${mockResponse.statusText}`,
            data: mockResponse,
          });
          break;

        case 'process':
          const processConfig = step.config as any;
          addLog({
            timestamp: new Date().toISOString(),
            nodeId: step.id,
            type: 'info',
            message: `⚙️ Processando dados com ação: ${processConfig.action}`,
          });
          
          await new Promise(r => setTimeout(r, 200));
          
          let processedData: any = previousData;
          
          switch (processConfig.action) {
            case 'format_txt':
              output = `=== Relatório FlowMaster ===\n\nGerado em: ${new Date().toLocaleString()}\n\nDados:\n${JSON.stringify(previousData, null, 2)}`;
              processedData = { formatted: true, length: output.length };
              break;
            case 'parse_json':
              processedData = { parsed: true, data: previousData };
              break;
            case 'transform':
              processedData = { transformed: true, original: previousData };
              break;
            case 'filter':
              processedData = { filtered: true, count: 1 };
              break;
            case 'aggregate':
              processedData = { aggregated: true, summary: previousData };
              break;
          }
          
          previousData = processedData;
          
          addLog({
            timestamp: new Date().toISOString(),
            nodeId: step.id,
            type: 'success',
            message: `✅ Dados processados com sucesso`,
            data: processedData,
          });
          break;

        case 'condition':
          const condConfig = step.config as any;
          addLog({
            timestamp: new Date().toISOString(),
            nodeId: step.id,
            type: 'info',
            message: `🔀 Avaliando condição: ${condConfig.field} ${condConfig.operator} ${condConfig.value || '[qualquer valor]'}`,
          });
          
          await new Promise(r => setTimeout(r, 100));
          
          // Simulate condition evaluation
          const conditionResult = true;
          
          addLog({
            timestamp: new Date().toISOString(),
            nodeId: step.id,
            type: 'success',
            message: `✅ Condição avaliada: ${conditionResult ? 'VERDADEIRO' : 'FALSO'}`,
            data: { 
              condition: `${condConfig.field} ${condConfig.operator} ${condConfig.value}`,
              result: conditionResult 
            },
          });
          break;

        case 'output':
          const outputConfig = step.config as any;
          
          if (!output) {
            output = JSON.stringify(previousData || { result: 'Fluxo executado com sucesso!' }, null, 2);
          }
          
          const finalOutput = {
            format: outputConfig.format,
            filename: outputConfig.filename || 'output',
            size: output.length,
            lines: output.split('\n').length,
            content: output.substring(0, 200) + (output.length > 200 ? '...' : '')
          };
          
          addLog({
            timestamp: new Date().toISOString(),
            nodeId: step.id,
            type: 'success',
            message: `📄 Output gerado: ${outputConfig.format.toUpperCase()} (${output.length} bytes)`,
            data: finalOutput,
          });
          break;
      }
      
      onNodeComplete(step.id, true);
    } catch (error) {
      addLog({
        timestamp: new Date().toISOString(),
        nodeId: step.id,
        type: 'error',
        message: `❌ Erro no node: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      });
      
      onNodeComplete(step.id, false);
      
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
    message: `🎉 Execução concluída com sucesso!`,
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
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const [failedNodes, setFailedNodes] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleExecute = async () => {
    if (flow.steps.length === 0) {
      toast.error('Adicione nodes ao fluxo antes de executar');
      return;
    }

    setIsRunning(true);
    setLogs([]);
    setResult(null);
    setCurrentNodeId(null);
    setCompletedNodes(new Set());
    setFailedNodes(new Set());
    setProgress(0);

    try {
      const executionResult = await executeFlow(
        flow, 
        (log) => {
          setLogs(prev => [...prev, log]);
        },
        (nodeId) => {
          setCurrentNodeId(nodeId);
          const nodeIndex = flow.steps.findIndex(n => n.id === nodeId);
          setProgress((nodeIndex / flow.steps.length) * 100);
        },
        (nodeId, success) => {
          if (success) {
            setCompletedNodes(prev => new Set([...prev, nodeId]));
          } else {
            setFailedNodes(prev => new Set([...prev, nodeId]));
          }
          const nodeIndex = flow.steps.findIndex(n => n.id === nodeId);
          setProgress(((nodeIndex + 1) / flow.steps.length) * 100);
        }
      );
      
      setResult(executionResult);
      setCurrentNodeId(null);
      
      if (executionResult.status === 'success') {
        toast.success('Fluxo executado com sucesso!');
      } else {
        toast.error('Falha na execução do fluxo');
      }
    } catch (error) {
      toast.error('Erro durante a execução');
    } finally {
      setIsRunning(false);
      setProgress(100);
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
    toast.success('Output baixado!');
  };

  const clearLogs = () => {
    setLogs([]);
    setResult(null);
    setCompletedNodes(new Set());
    setFailedNodes(new Set());
    setProgress(0);
  };

  const getNodeStatus = (nodeId: string) => {
    if (currentNodeId === nodeId) return 'running';
    if (completedNodes.has(nodeId)) return 'completed';
    if (failedNodes.has(nodeId)) return 'failed';
    return 'pending';
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full bg-canvas-bg overflow-hidden">
      {/* Execution Timeline - Left Side */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border glass flex-shrink-0 overflow-hidden flex flex-col">
        <div className="p-3 sm:p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm sm:text-base">Pipeline de Execução</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="w-3 h-3" />
              {flow.steps.length} steps
            </div>
          </div>
          
          <Button 
            onClick={handleExecute} 
            disabled={isRunning || flow.steps.length === 0}
            className="w-full gap-2"
            size="sm"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Executar Fluxo
              </>
            )}
          </Button>
          
          {isRunning && (
            <div className="mt-3">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {Math.round(progress)}%
              </p>
            </div>
          )}
        </div>
        
        {/* Nodes Timeline */}
        <ScrollArea className="flex-1 p-3 sm:p-4">
          <div className="space-y-2">
            {flow.steps.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum node no fluxo</p>
              </div>
            ) : (
              flow.steps.map((node, index) => {
                const status = getNodeStatus(node.id);
                const Icon = nodeIcons[node.type];
                
                return (
                  <div 
                    key={node.id}
                    className={cn(
                      'flex items-center gap-3 p-2.5 sm:p-3 rounded-lg border transition-all',
                      status === 'running' && 'bg-primary/10 border-primary animate-pulse',
                      status === 'completed' && 'bg-primary/5 border-primary/30',
                      status === 'failed' && 'bg-destructive/10 border-destructive/30',
                      status === 'pending' && 'bg-card/50 border-border/50'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      status === 'running' && 'bg-primary text-primary-foreground',
                      status === 'completed' && 'bg-primary/20 text-primary',
                      status === 'failed' && 'bg-destructive/20 text-destructive',
                      status === 'pending' && 'bg-secondary text-muted-foreground'
                    )}>
                      {status === 'running' ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : status === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : status === 'failed' ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{node.label || node.id}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{node.type}</p>
                    </div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">#{index + 1}</span>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Logs Panel - Right Side */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Logs Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border glass">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm sm:text-base">Logs de Execução</h3>
            {logs.length > 0 && (
              <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                {logs.length}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {result?.output && (
              <Button variant="outline" size="sm" onClick={handleDownloadOutput} className="gap-1.5 text-xs sm:text-sm">
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={clearLogs} disabled={logs.length === 0} className="gap-1.5 text-xs sm:text-sm">
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Limpar</span>
            </Button>
          </div>
        </div>

        {/* Logs Content */}
        <ScrollArea className="flex-1 p-3 sm:p-4">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Nenhum log ainda</p>
              <p className="text-sm mt-1">Clique em "Executar Fluxo" para iniciar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => {
                const Icon = logIcons[log.type];
                return (
                  <div 
                    key={index}
                    className={cn(
                      'p-3 rounded-lg border border-border/50 animate-fade-in',
                      logColors[log.type]
                    )}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0')} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] sm:text-xs font-mono opacity-70">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          {log.nodeId !== 'system' && (
                            <span className="text-[10px] sm:text-xs font-mono px-1.5 py-0.5 rounded bg-background/50">
                              {log.nodeId}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed">{log.message}</p>
                        {log.data && (
                          <details className="mt-2">
                            <summary className="text-[10px] sm:text-xs cursor-pointer hover:text-primary transition-colors">
                              Ver dados
                            </summary>
                            <pre className="mt-2 p-2 rounded bg-background/50 text-[10px] sm:text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Result Summary */}
        {result && (
          <div className={cn(
            'p-3 sm:p-4 border-t flex-shrink-0',
            result.status === 'success' ? 'bg-primary/10 border-primary/30' : 'bg-destructive/10 border-destructive/30'
          )}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {result.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-primary" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
                <span className="font-medium text-sm sm:text-base">
                  {result.status === 'success' ? 'Execução Concluída' : 'Execução Falhou'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5" />
                  {((new Date(result.completedAt).getTime() - new Date(result.startedAt).getTime()) / 1000).toFixed(1)}s
                </span>
                <span>{flow.steps.length} steps</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};