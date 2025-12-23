import { useState, useCallback } from 'react';
import { Flow } from '@/types/flow';
import { Header } from '@/components/layout/Header';
import { Sidebar, ViewMode } from '@/components/layout/Sidebar';
import { FlowCanvas } from '@/components/flow/FlowCanvas';
import { JsonEditor } from '@/components/flow/JsonEditor';
import { ExecutionPanel } from '@/components/flow/ExecutionPanel';
import { AIAssistant } from '@/components/flow/AIAssistant';
import { Helmet } from 'react-helmet-async';

const defaultFlow: Flow = {
  nome: 'Novo Fluxo',
  description: '',
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
        <meta name="keywords" content="automação, workflow, fluxo, n8n, visual, editor, API, automação de processos" />
      </Helmet>
      
      <div className="h-screen flex flex-col bg-background overflow-hidden">
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
