export type NodeType = 'trigger' | 'api' | 'process' | 'condition' | 'output';

export interface NodeConfig {
  [key: string]: unknown;
}

export interface TriggerConfig extends NodeConfig {
  mode: 'manual' | 'schedule' | 'webhook';
  schedule?: string;
  webhookUrl?: string;
}

export interface ApiConfig extends NodeConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  body?: string;
}

export interface ProcessConfig extends NodeConfig {
  action: 'format_txt' | 'parse_json' | 'transform' | 'filter' | 'aggregate';
  template?: string;
  expression?: string;
}

export interface ConditionConfig extends NodeConfig {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'exists';
  value: string;
  trueBranch?: string;
  falseBranch?: string;
}

export interface OutputConfig extends NodeConfig {
  format: 'txt' | 'json' | 'csv' | 'log';
  filename?: string;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  config: TriggerConfig | ApiConfig | ProcessConfig | ConditionConfig | OutputConfig;
  position?: { x: number; y: number };
  label?: string;
}

export interface Flow {
  id?: string;
  nome: string;
  description?: string;
  steps: FlowNode[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ExecutionLog {
  timestamp: string;
  nodeId: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  data?: unknown;
}

export interface ExecutionResult {
  flowId: string;
  status: 'success' | 'error' | 'partial';
  startedAt: string;
  completedAt: string;
  logs: ExecutionLog[];
  output?: string;
  error?: string;
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
