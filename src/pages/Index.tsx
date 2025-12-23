import { useState, useCallback } from 'react';
import { Flow } from '@/types/flow';
import { Header } from '@/components/layout/Header';
import { Sidebar, ViewMode } from '@/components/layout/Sidebar';
import { FlowCanvas } from '@/components/flow/FlowCanvas';
import { JsonEditor } from '@/components/flow/JsonEditor';
import { ExecutionPanel } from '@/components/flow/ExecutionPanel';
import { AIAssistant } from '@/components/flow/AIAssistant';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

const defaultFlow: Flow = {
  nome: 'Novo Fluxo',
  description: 'Meu fluxo de automação',
  steps: [],
  createdAt: new Date().toISOString(),
};

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('canvas');
  const [flow, setFlow] = useState<Flow>(defaultFlow);

  const handleFlowChange = useCallback((updatedFlow: Flow) => {
    setFlow({
      ...updatedFlow,
      updatedAt: new Date().toISOString(),
    });
  }, []);

  const handleNewFlow = () => {
    setFlow({
      ...defaultFlow,
      createdAt: new Date().toISOString(),
    });
    setCurrentView('canvas');
    toast.success('Novo fluxo criado!');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'canvas':
        return <FlowCanvas flow={flow} onFlowChange={handleFlowChange} />;
      case 'json':
        return <JsonEditor flow={flow} onFlowChange={handleFlowChange} />;
      case 'execute':
        return <ExecutionPanel flow={flow} />;
      case 'ai':
        return <AIAssistant flow={flow} onFlowChange={handleFlowChange} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>FlowMaster - Automação de Fluxos | Visual Workflow Builder</title>
        <meta name="description" content="FlowMaster é uma plataforma de automação de fluxos visual, similar ao n8n. Crie, edite e execute automações com editor visual, JSON editor, e assistente IA." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#1a1a2e" />
      </Helmet>
      
      <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
        <Header />
        
        <div className="flex-1 flex overflow-hidden">
          <Sidebar 
            currentView={currentView} 
            onViewChange={setCurrentView}
            onNewFlow={handleNewFlow}
          />
          
          <main className="flex-1 overflow-hidden">
            {renderContent()}
          </main>
        </div>
      </div>
    </>
  );
};

export default Index;