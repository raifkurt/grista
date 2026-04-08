/**
 * Multi-Agent System — Belief-Desire-Intention (BDI) Architecture
 * Based on the BDI model by Rao & Georgeff (1991)
 */

export type AgentId = 'market' | 'financial' | 'property' | 'wellness' | 'marketing' | 'orchestrator';

export type MessageType =
  | 'request'
  | 'inform'
  | 'propose'
  | 'accept'
  | 'reject'
  | 'result'
  | 'alert'
  | 'query';

export interface AgentMessage {
  id: string;
  from: AgentId;
  to: AgentId | 'broadcast';
  type: MessageType;
  topic: string;
  content: unknown;
  timestamp: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export interface Belief {
  key: string;
  value: unknown;
  confidence: number;   // 0–1
  source: AgentId;
  timestamp: number;
}

export interface Desire {
  id: string;
  description: string;
  priority: number;     // 0–100
  deadline?: number;    // timestamp
  active: boolean;
}

export interface Intention {
  desireId: string;
  plan: string[];
  currentStep: number;
  status: 'active' | 'suspended' | 'completed' | 'failed';
  startedAt: number;
}

export interface AgentStatus {
  id: AgentId;
  name: string;
  state: 'idle' | 'perceiving' | 'deliberating' | 'executing' | 'communicating' | 'error';
  beliefs: Belief[];
  activeDesires: Desire[];
  currentIntention?: Intention;
  messagesProcessed: number;
  lastActivity: number;
  health: number;       // 0–100
  performance: number;  // tasks completed per minute (rolling)
  insights: string[];
  alerts: string[];
}

/** Shared blackboard for inter-agent knowledge sharing */
export interface BlackboardEntry {
  agentId: AgentId;
  key: string;
  value: unknown;
  timestamp: number;
}
