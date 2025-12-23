import { useState, useRef, useEffect } from 'react';
import { Flow, AIMessage } from '@/types/flow';
import { Send, Bot, User, Sparkles, Loader2, Wand2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AIAssistantProps {
  flow: Flow;
  onFlowChange: (flow: Flow) => void;
}

// Sample AI responses for demo (will be replaced with real AI when Cloud is enabled)
const generateAIResponse = async (message: string, flow: Flow): Promise<string> => {
  await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('criar') || lowerMessage.includes('create') || lowerMessage.includes('novo')) {
    return `Posso ajudar você a criar um fluxo! Baseado no seu pedido, sugiro:

1. **Trigger** - Para iniciar o fluxo manualmente ou por webhook
2. **API Request** - Para buscar dados de uma API externa
3. **Process** - Para transformar os dados recebidos
4. **Output** - Para gerar o resultado final

Quer que eu crie esse fluxo para você? Basta confirmar ou me dar mais detalhes sobre o que precisa.`;
  }
  
  if (lowerMessage.includes('validar') || lowerMessage.includes('validate') || lowerMessage.includes('verificar')) {
    const hasSteps = flow.steps.length > 0;
    const hasTrigger = flow.steps.some(s => s.type === 'trigger');
    const hasOutput = flow.steps.some(s => s.type === 'output');
    
    if (!hasSteps) {
      return `⚠️ **Análise do Fluxo**

O fluxo está vazio! Adicione pelo menos um Trigger para começar.

**Estrutura recomendada:**
1. Trigger → Inicia a automação
2. API/Process → Executa a lógica
3. Output → Gera o resultado`;
    }
    
    let issues = [];
    if (!hasTrigger) issues.push('- Falta um node **Trigger** para iniciar');
    if (!hasOutput) issues.push('- Falta um node **Output** para finalizar');
    
    if (issues.length > 0) {
      return `⚠️ **Análise do Fluxo: "${flow.nome}"**

Encontrei alguns pontos a melhorar:
${issues.join('\n')}

Quer que eu adicione esses nodes automaticamente?`;
    }
    
    return `✅ **Análise do Fluxo: "${flow.nome}"**

O fluxo parece estar bem estruturado!
- ${flow.steps.length} steps configurados
- Trigger: ${hasTrigger ? 'Presente' : 'Ausente'}
- Output: ${hasOutput ? 'Presente' : 'Ausente'}

O fluxo está pronto para execução.`;
  }
  
  if (lowerMessage.includes('melhorar') || lowerMessage.includes('otimizar') || lowerMessage.includes('improve')) {
    return `💡 **Sugestões de Melhoria**

1. **Tratamento de Erros** - Adicione um node Condition após chamadas API para verificar status
2. **Logging** - Use nodes Process para registrar dados importantes
3. **Validação** - Verifique os dados de entrada antes de processá-los

Posso implementar alguma dessas melhorias?`;
  }
  
  if (lowerMessage.includes('ajuda') || lowerMessage.includes('help')) {
    return `🤖 **Assistente de Fluxos**

Eu posso ajudar você a:
- **Criar fluxos** a partir de descrições em linguagem natural
- **Validar** a estrutura do seu fluxo
- **Sugerir melhorias** para otimizar a automação
- **Explicar** como cada node funciona

Exemplos de comandos:
- "Crie um fluxo para buscar dados de uma API"
- "Valide meu fluxo atual"
- "Como funciona o node de Process?"

No que posso ajudar?`;
  }
  
  return `Entendi sua solicitação! Para o fluxo "${flow.nome}" com ${flow.steps.length} steps, posso ajudar você a:

1. **Adicionar nodes** - Expanda seu fluxo com mais funcionalidades
2. **Configurar** - Ajuste as propriedades de cada node
3. **Validar** - Verifique se o fluxo está correto

O que você gostaria de fazer?`;
};

export const AIAssistant = ({ flow, onFlowChange }: AIAssistantProps) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: 'assistant',
      content: `Olá! Sou o assistente de IA do FlowMaster. Posso ajudar você a criar, validar e otimizar seus fluxos de automação.

Experimente me pedir:
- "Crie um fluxo para buscar dados de uma API"
- "Valide meu fluxo atual"
- "Como posso melhorar esse fluxo?"`,
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
      
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
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
    { label: 'Validar Fluxo', prompt: 'Valide meu fluxo atual' },
    { label: 'Sugerir Melhorias', prompt: 'Como posso melhorar esse fluxo?' },
    { label: 'Criar Fluxo', prompt: 'Crie um fluxo de exemplo para buscar dados de API' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas-bg">
      {/* Header */}
      <div className="p-4 border-b border-border glass">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">Assistente IA</h3>
            <p className="text-xs text-muted-foreground">Powered by AI</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={cn(
                'flex gap-3 animate-fade-in',
                msg.role === 'user' ? 'flex-row-reverse' : ''
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                msg.role === 'user' ? 'bg-primary/20' : 'bg-accent/20'
              )}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-primary" />
                ) : (
                  <Bot className="w-4 h-4 text-accent" />
                )}
              </div>
              <div className={cn(
                'max-w-[80%] rounded-xl p-3',
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card border border-border'
              )}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs opacity-60 mt-2">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <div className="bg-card border border-border rounded-xl p-3">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-border flex gap-2 overflow-x-auto scrollbar-thin">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => {
              setInput(action.prompt);
            }}
            className="flex-shrink-0"
          >
            <Wand2 className="w-3 h-3 mr-1" />
            {action.label}
          </Button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border glass">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            size="icon"
            className="flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
