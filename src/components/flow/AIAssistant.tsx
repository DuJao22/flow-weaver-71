import { useState, useRef, useEffect } from 'react';
import { Flow, FlowNode, AIMessage, NodeType } from '@/types/flow';
import { Send, Bot, User, Sparkles, Loader2, Wand2, CheckCircle, AlertTriangle, Zap, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AIAssistantProps {
  flow: Flow;
  onFlowChange: (flow: Flow) => void;
}

interface GeneratedFlow {
  nome: string;
  description?: string;
  steps: FlowNode[];
}

// AI that generates functional flows
const generateFlowFromPrompt = (prompt: string): GeneratedFlow | null => {
  const lowerPrompt = prompt.toLowerCase();
  
  // API data fetch flow
  if (lowerPrompt.includes('buscar') || lowerPrompt.includes('api') || lowerPrompt.includes('fetch') || lowerPrompt.includes('dados')) {
    return {
      nome: 'Buscar Dados de API',
      description: 'Fluxo para buscar e processar dados de uma API externa',
      steps: [
        {
          id: 'trigger_1',
          type: 'trigger',
          label: 'Início Manual',
          config: { mode: 'manual' }
        },
        {
          id: 'api_1',
          type: 'api',
          label: 'Chamada API',
          config: { 
            url: 'https://jsonplaceholder.typicode.com/posts/1',
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        },
        {
          id: 'process_1',
          type: 'process',
          label: 'Processar Resposta',
          config: { action: 'parse_json' }
        },
        {
          id: 'output_1',
          type: 'output',
          label: 'Gerar Saída',
          config: { format: 'json', filename: 'dados_api' }
        }
      ]
    };
  }
  
  // Webhook automation flow
  if (lowerPrompt.includes('webhook') || lowerPrompt.includes('receber') || lowerPrompt.includes('evento')) {
    return {
      nome: 'Automação por Webhook',
      description: 'Recebe eventos via webhook e processa automaticamente',
      steps: [
        {
          id: 'trigger_1',
          type: 'trigger',
          label: 'Webhook Receiver',
          config: { mode: 'webhook', webhookUrl: '/webhook/receive' }
        },
        {
          id: 'condition_1',
          type: 'condition',
          label: 'Validar Payload',
          config: { field: 'data.type', operator: 'exists', value: '' }
        },
        {
          id: 'process_1',
          type: 'process',
          label: 'Transformar Dados',
          config: { action: 'transform', template: '{{data}}' }
        },
        {
          id: 'api_1',
          type: 'api',
          label: 'Enviar para API',
          config: { 
            url: 'https://api.exemplo.com/data',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{{previousData}}'
          }
        },
        {
          id: 'output_1',
          type: 'output',
          label: 'Log Resultado',
          config: { format: 'log' }
        }
      ]
    };
  }
  
  // Scheduled task flow
  if (lowerPrompt.includes('agendar') || lowerPrompt.includes('schedule') || lowerPrompt.includes('cron') || lowerPrompt.includes('automático')) {
    return {
      nome: 'Tarefa Agendada',
      description: 'Executa automaticamente em horários definidos',
      steps: [
        {
          id: 'trigger_1',
          type: 'trigger',
          label: 'Agendamento',
          config: { mode: 'schedule', schedule: '0 9 * * *' }
        },
        {
          id: 'api_1',
          type: 'api',
          label: 'Buscar Relatório',
          config: { 
            url: 'https://api.exemplo.com/report',
            method: 'GET',
            headers: {}
          }
        },
        {
          id: 'process_1',
          type: 'process',
          label: 'Formatar Relatório',
          config: { action: 'format_txt', template: 'Relatório: {{data}}' }
        },
        {
          id: 'output_1',
          type: 'output',
          label: 'Salvar TXT',
          config: { format: 'txt', filename: 'relatorio_diario' }
        }
      ]
    };
  }
  
  // Data filter flow
  if (lowerPrompt.includes('filtrar') || lowerPrompt.includes('filter') || lowerPrompt.includes('condição') || lowerPrompt.includes('verificar')) {
    return {
      nome: 'Filtrar e Validar Dados',
      description: 'Filtra dados baseado em condições específicas',
      steps: [
        {
          id: 'trigger_1',
          type: 'trigger',
          label: 'Início',
          config: { mode: 'manual' }
        },
        {
          id: 'api_1',
          type: 'api',
          label: 'Buscar Lista',
          config: { 
            url: 'https://jsonplaceholder.typicode.com/users',
            method: 'GET',
            headers: {}
          }
        },
        {
          id: 'condition_1',
          type: 'condition',
          label: 'Verificar Dados',
          config: { field: 'length', operator: 'greater', value: '0' }
        },
        {
          id: 'process_1',
          type: 'process',
          label: 'Filtrar Ativos',
          config: { action: 'filter', expression: 'item.active === true' }
        },
        {
          id: 'output_1',
          type: 'output',
          label: 'Exportar CSV',
          config: { format: 'csv', filename: 'usuarios_filtrados' }
        }
      ]
    };
  }
  
  // Default simple flow
  if (lowerPrompt.includes('simples') || lowerPrompt.includes('básico') || lowerPrompt.includes('exemplo') || lowerPrompt.includes('teste')) {
    return {
      nome: 'Fluxo Simples',
      description: 'Um fluxo básico para testes',
      steps: [
        {
          id: 'trigger_1',
          type: 'trigger',
          label: 'Trigger Manual',
          config: { mode: 'manual' }
        },
        {
          id: 'process_1',
          type: 'process',
          label: 'Processar',
          config: { action: 'format_txt' }
        },
        {
          id: 'output_1',
          type: 'output',
          label: 'Saída',
          config: { format: 'txt' }
        }
      ]
    };
  }
  
  return null;
};

// Generate AI response
const generateAIResponse = async (message: string, flow: Flow): Promise<{ text: string; generatedFlow?: GeneratedFlow }> => {
  await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
  
  const lowerMessage = message.toLowerCase();
  
  // Create flow commands
  if (lowerMessage.includes('criar') || lowerMessage.includes('create') || lowerMessage.includes('novo') || lowerMessage.includes('gerar') || lowerMessage.includes('fazer')) {
    const generatedFlow = generateFlowFromPrompt(message);
    
    if (generatedFlow) {
      return {
        text: `✅ **Fluxo Gerado: "${generatedFlow.nome}"**

${generatedFlow.description}

**Estrutura do fluxo:**
${generatedFlow.steps.map((step, i) => `${i + 1}. **${step.label}** (${step.type})`).join('\n')}

O fluxo foi criado e está pronto para uso! Você pode:
- Clicar em "Aplicar Fluxo" abaixo para usar esse fluxo
- Ir para o **Editor Visual** para customizar cada node
- **Executar** o fluxo para ver os logs em tempo real`,
        generatedFlow
      };
    }
    
    return {
      text: `🤖 Posso criar diversos tipos de fluxos! Me diga o que você precisa:

**Exemplos de comandos:**
- "Criar fluxo para buscar dados de uma API"
- "Gerar automação com webhook"
- "Fazer tarefa agendada"
- "Criar fluxo para filtrar dados"
- "Fazer um fluxo simples de teste"

Qual tipo de fluxo você gostaria?`
    };
  }
  
  // Validate flow
  if (lowerMessage.includes('validar') || lowerMessage.includes('validate') || lowerMessage.includes('verificar') || lowerMessage.includes('analisar')) {
    const hasSteps = flow.steps.length > 0;
    const hasTrigger = flow.steps.some(s => s.type === 'trigger');
    const hasOutput = flow.steps.some(s => s.type === 'output');
    const hasApi = flow.steps.some(s => s.type === 'api');
    
    if (!hasSteps) {
      return {
        text: `⚠️ **Análise do Fluxo**

O fluxo está vazio! Para começar, peça para eu criar um fluxo:
- "Criar um fluxo para buscar dados de API"
- "Gerar um fluxo simples de teste"

Ou vá para o **Editor Visual** e adicione nodes manualmente.`
      };
    }
    
    let issues: string[] = [];
    let strengths: string[] = [];
    
    if (!hasTrigger) issues.push('⚠️ Falta node **Trigger** para iniciar');
    else strengths.push('✅ Trigger configurado');
    
    if (!hasOutput) issues.push('⚠️ Falta node **Output** para gerar resultado');
    else strengths.push('✅ Output definido');
    
    if (hasApi) strengths.push('✅ Integração com API presente');
    
    if (issues.length === 0) {
      return {
        text: `✅ **Análise Completa: "${flow.nome}"**

**Status: Pronto para execução!**

${strengths.join('\n')}

**Detalhes:**
- Total de steps: ${flow.steps.length}
- Tipos usados: ${[...new Set(flow.steps.map(s => s.type))].join(', ')}

➡️ Vá para **Executar** para rodar o fluxo e ver os logs!`
      };
    }
    
    return {
      text: `📋 **Análise do Fluxo: "${flow.nome}"**

**Pontos fortes:**
${strengths.join('\n') || 'Nenhum ainda'}

**Pendências:**
${issues.join('\n')}

Quer que eu adicione os nodes que estão faltando?`
    };
  }
  
  // Improve flow
  if (lowerMessage.includes('melhorar') || lowerMessage.includes('otimizar') || lowerMessage.includes('improve')) {
    return {
      text: `💡 **Sugestões para "${flow.nome}"**

**1. Tratamento de Erros**
Adicione um node Condition após chamadas API para verificar se a resposta foi bem-sucedida.

**2. Logging**
Use nodes Process para registrar dados importantes durante a execução.

**3. Validação de Entrada**
Adicione condições para validar os dados antes de processá-los.

**4. Output Múltiplo**
Considere gerar saída em diferentes formatos (JSON + TXT).

Quer que eu implemente alguma dessas melhorias?`
    };
  }
  
  // Help
  if (lowerMessage.includes('ajuda') || lowerMessage.includes('help') || lowerMessage.includes('como')) {
    return {
      text: `🤖 **Assistente FlowMaster**

**Comandos disponíveis:**

📝 **Criar Fluxos:**
- "Criar fluxo para buscar dados de API"
- "Gerar automação com webhook"
- "Fazer tarefa agendada diária"

🔍 **Analisar:**
- "Validar meu fluxo"
- "Analisar estrutura"

💡 **Melhorar:**
- "Sugerir melhorias"
- "Otimizar fluxo"

**Tipos de nodes disponíveis:**
- **Trigger**: Inicia a automação (manual, schedule, webhook)
- **API**: Faz requisições HTTP
- **Process**: Transforma dados
- **Condition**: Aplica lógica condicional
- **Output**: Gera resultado final`
    };
  }
  
  // Default response
  return {
    text: `Entendi! Para o fluxo "${flow.nome}" com ${flow.steps.length} steps, posso:

1. **Criar** um novo fluxo do zero
2. **Validar** a estrutura atual
3. **Sugerir melhorias**

O que você gostaria de fazer?`
  };
};

export const AIAssistant = ({ flow, onFlowChange }: AIAssistantProps) => {
  const [messages, setMessages] = useState<(AIMessage & { generatedFlow?: GeneratedFlow })[]>([
    {
      role: 'assistant',
      content: `🤖 **Olá! Sou o Assistente de IA do FlowMaster.**

Posso criar fluxos completos a partir de linguagem natural!

**Experimente:**
- "Criar um fluxo para buscar dados de uma API"
- "Gerar automação com webhook"
- "Fazer tarefa agendada"

Ou me peça para **validar** ou **melhorar** seu fluxo atual.`,
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleApplyFlow = (generatedFlow: GeneratedFlow) => {
    onFlowChange({
      ...flow,
      nome: generatedFlow.nome,
      description: generatedFlow.description,
      steps: generatedFlow.steps,
    });
    toast.success('Fluxo aplicado com sucesso!');
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateAIResponse(input, flow);
      
      const assistantMessage: AIMessage & { generatedFlow?: GeneratedFlow } = {
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toISOString(),
        generatedFlow: response.generatedFlow,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Erro ao processar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: 'Criar Fluxo API', prompt: 'Criar um fluxo para buscar dados de uma API' },
    { label: 'Validar Fluxo', prompt: 'Validar meu fluxo atual' },
    { label: 'Fluxo Simples', prompt: 'Criar um fluxo simples de teste' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas-bg">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border glass">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base">Assistente IA</h3>
            <p className="text-xs text-muted-foreground truncate">Cria fluxos automaticamente</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3 sm:p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className="animate-fade-in">
              <div
                className={cn(
                  'flex gap-2 sm:gap-3',
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                <div className={cn(
                  'w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  msg.role === 'user' ? 'bg-primary/20' : 'bg-accent/20'
                )}>
                  {msg.role === 'user' ? (
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                  )}
                </div>
                <div className={cn(
                  'max-w-[85%] sm:max-w-[80%] rounded-xl p-3',
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card border border-border'
                )}>
                  <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content.split('**').map((part, i) => 
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs opacity-50 mt-2">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              {/* Apply Flow Button */}
              {msg.generatedFlow && (
                <div className="mt-3 ml-10 sm:ml-11">
                  <Button 
                    onClick={() => handleApplyFlow(msg.generatedFlow!)}
                    className="gap-2 w-full sm:w-auto"
                    size="sm"
                  >
                    <Zap className="w-4 h-4" />
                    Aplicar Fluxo
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Gerando...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="px-3 sm:px-4 py-2 border-t border-border">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => {
                setInput(action.prompt);
              }}
              className="flex-shrink-0 text-xs sm:text-sm h-8"
            >
              <Wand2 className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-border glass">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Descreva o fluxo que deseja criar..."
            className="min-h-[44px] max-h-32 resize-none text-sm"
            rows={1}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            size="icon"
            className="flex-shrink-0 h-[44px] w-[44px]"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};