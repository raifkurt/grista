/**
 * Agent Orchestrator — Contract Net Protocol + BDI coordination
 * Manages 5 specialized agents, routes messages, resolves conflicts,
 * and synthesizes cross-domain insights.
 */
import { AgentId, AgentMessage, AgentStatus, BlackboardEntry, Belief } from './types';
import { generateId } from '../data/utils';

type MessageHandler = (msg: AgentMessage) => void;
type StatusListener = (statuses: AgentStatus[]) => void;

export class AgentOrchestrator {
  private handlers: Map<AgentId, MessageHandler> = new Map();
  private blackboard: Map<string, BlackboardEntry> = new Map();
  private messageLog: AgentMessage[] = [];
  private agentStatuses: Map<AgentId, AgentStatus> = new Map();
  private statusListeners: StatusListener[] = [];
  private taskQueue: { task: string; agentId: AgentId; priority: number }[] = [];

  constructor() {
    this.initializeAgentStatuses();
  }

  private initializeAgentStatuses(): void {
    const agents: { id: AgentId; name: string }[] = [
      { id: 'market', name: 'Piyasa İstihbarat Ajanı' },
      { id: 'financial', name: 'Finansal Risk Ajanı' },
      { id: 'property', name: 'Emlak Değerleme Ajanı' },
      { id: 'wellness', name: 'Sağlık Optimizasyon Ajanı' },
      { id: 'marketing', name: 'Pazarlama Analitik Ajanı' },
      { id: 'orchestrator', name: 'Orkestratör' },
    ];

    for (const { id, name } of agents) {
      this.agentStatuses.set(id, {
        id,
        name,
        state: 'idle',
        beliefs: [],
        activeDesires: [],
        messagesProcessed: 0,
        lastActivity: Date.now(),
        health: 95 + Math.random() * 5,
        performance: 0,
        insights: [],
        alerts: [],
      });
    }
  }

  register(agentId: AgentId, handler: MessageHandler): void {
    this.handlers.set(agentId, handler);
  }

  send(message: AgentMessage): void {
    this.messageLog.push(message);
    if (this.messageLog.length > 500) this.messageLog.shift();

    if (message.to === 'broadcast') {
      for (const [id, handler] of this.handlers) {
        if (id !== message.from) handler(message);
      }
    } else {
      const handler = this.handlers.get(message.to);
      if (handler) handler(message);
    }

    // Update sender's message count
    const status = this.agentStatuses.get(message.from);
    if (status) {
      status.messagesProcessed++;
      status.lastActivity = Date.now();
    }
  }

  updateBlackboard(agentId: AgentId, key: string, value: unknown): void {
    const fullKey = `${agentId}:${key}`;
    this.blackboard.set(fullKey, { agentId, key, value, timestamp: Date.now() });
  }

  readBlackboard(key?: string, agentId?: AgentId): BlackboardEntry[] {
    const entries = Array.from(this.blackboard.values());
    return entries.filter(e =>
      (!key || e.key === key) && (!agentId || e.agentId === agentId)
    );
  }

  updateAgentStatus(agentId: AgentId, updates: Partial<AgentStatus>): void {
    const current = this.agentStatuses.get(agentId);
    if (current) {
      Object.assign(current, updates, { lastActivity: Date.now() });
      this.notifyStatusListeners();
    }
  }

  addInsight(agentId: AgentId, insight: string): void {
    const status = this.agentStatuses.get(agentId);
    if (status) {
      status.insights.unshift(insight);
      if (status.insights.length > 10) status.insights.pop();
    }
  }

  addAlert(agentId: AgentId, alert: string): void {
    const status = this.agentStatuses.get(agentId);
    if (status) {
      status.alerts.unshift(alert);
      if (status.alerts.length > 5) status.alerts.pop();
    }
  }

  addBelief(agentId: AgentId, belief: Belief): void {
    const status = this.agentStatuses.get(agentId);
    if (status) {
      const existing = status.beliefs.findIndex(b => b.key === belief.key);
      if (existing >= 0) {
        status.beliefs[existing] = belief;
      } else {
        status.beliefs.unshift(belief);
        if (status.beliefs.length > 20) status.beliefs.pop();
      }
    }
  }

  getAllStatuses(): AgentStatus[] {
    return Array.from(this.agentStatuses.values());
  }

  getStatus(agentId: AgentId): AgentStatus | undefined {
    return this.agentStatuses.get(agentId);
  }

  getMessageLog(limit = 50): AgentMessage[] {
    return this.messageLog.slice(-limit);
  }

  onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  private notifyStatusListeners(): void {
    const statuses = this.getAllStatuses();
    for (const listener of this.statusListeners) listener(statuses);
  }

  /** Contract Net Protocol: assign best agent for a task */
  assignTask(task: string, candidates: AgentId[]): AgentId {
    const performances = candidates.map(id => ({
      id,
      score: (this.agentStatuses.get(id)?.health ?? 50) +
             (this.agentStatuses.get(id)?.performance ?? 0) * 10,
    }));
    performances.sort((a, b) => b.score - a.score);
    return performances[0]?.id ?? candidates[0];
  }

  /** Synthesize cross-agent insights */
  synthesizeInsights(): string[] {
    const all = Array.from(this.agentStatuses.values())
      .flatMap(s => s.insights.slice(0, 3));
    return all.slice(0, 15);
  }

  systemHealthScore(): number {
    const statuses = this.getAllStatuses();
    const avgHealth = statuses.reduce((s, st) => s + st.health, 0) / statuses.length;
    const activeAgents = statuses.filter(s => s.state !== 'idle' && s.state !== 'error').length;
    return Math.round(avgHealth * 0.7 + (activeAgents / statuses.length) * 100 * 0.3);
  }
}

// Singleton
export const orchestrator = new AgentOrchestrator();
