// Core types for AI OS

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: SubscriptionPlan;
  status: OrganizationStatus;
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export type OrganizationStatus = 'active' | 'inactive' | 'suspended';
export type SubscriptionPlan = 'free' | 'pro' | 'team' | 'enterprise';

export interface OrganizationSettings {
  defaultModel?: string;
  maxTokensPerDay?: number;
  allowedDomains?: string[];
  ssoEnabled?: boolean;
  mfaRequired?: boolean;
  ipWhitelist?: string[];
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Conversation and Message Types
export interface Conversation {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  context?: ConversationContext;
  metadata: ConversationMetadata;
  organizationId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
}

export interface ConversationMetadata {
  tags?: string[];
  isPinned: boolean;
  isArchived: boolean;
  shareCode?: string;
  branchCount: number;
}

export interface ConversationContext {
  files?: string[];
  documents?: string[];
  skills?: string[];
  memory?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  model?: string;
  tokens?: number;
  attachments?: Attachment[];
  artifacts?: Artifact[];
  metadata: MessageMetadata;
  createdAt: Date;
}

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface MessageMetadata {
  citations?: Citation[];
  reasoning?: string;
  tools?: ToolUse[];
  error?: string;
  latency?: number;
}

export interface Attachment {
  id: string;
  type: 'file' | 'image' | 'audio' | 'video';
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface Artifact {
  id: string;
  type: 'code' | 'markdown' | 'html' | 'react' | 'diagram' | 'chart';
  content: string;
  language?: string;
  title?: string;
  metadata?: Record<string, unknown>;
}

export interface Citation {
  documentId: string;
  text: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface ToolUse {
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  status: 'pending' | 'success' | 'error';
}

// Agent Types
export interface Agent {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  model: string;
  prompt: string;
  tools: string[];
  memory?: AgentMemoryConfig;
  settings: AgentSettings;
  organizationId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AgentType =
  | 'research'
  | 'developer'
  | 'designer'
  | 'marketing'
  | 'seo'
  | 'browser'
  | 'data-analyst'
  | 'product-manager';

export interface AgentMemoryConfig {
  type: 'short-term' | 'long-term' | 'hybrid';
  vectorStore?: string;
  retentionDays?: number;
}

export interface AgentSettings {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

// Workflow Types
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  trigger: WorkflowTrigger;
  settings: WorkflowSettings;
  version: number;
  status: WorkflowStatus;
  organizationId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
}

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'error';

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  config?: Record<string, unknown>;
}

export type WorkflowNodeType =
  | 'trigger'
  | 'condition'
  | 'ai'
  | 'mcp'
  | 'api'
  | 'database'
  | 'email'
  | 'agent'
  | 'browser'
  | 'transform'
  | 'filter';

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface WorkflowTrigger {
  type: 'schedule' | 'webhook' | 'event' | 'manual';
  config: Record<string, unknown>;
}

export interface WorkflowSettings {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  concurrency?: number;
}

// Document Types
export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url?: string;
  size?: number;
  metadata: DocumentMetadata;
  embedding?: DocumentEmbedding;
  organizationId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentType =
  | 'pdf'
  | 'docx'
  | 'csv'
  | 'xlsx'
  | 'markdown'
  | 'notion'
  | 'confluence'
  | 'webpage';

export interface DocumentMetadata {
  mimeType?: string;
  source?: string;
  author?: string;
  tags?: string[];
  customFields?: Record<string, string>;
}

export interface DocumentEmbedding {
  vectorId: string;
  model: string;
  dimensions: number;
  chunkCount: number;
}

// MCP Types
export interface MCPConnection {
  id: string;
  name: string;
  type: MCPConnectionType;
  config: MCPConnectionConfig;
  status: ConnectionStatus;
  organizationId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  lastSyncAt?: Date;
}

export type MCPConnectionType =
  | 'github'
  | 'notion'
  | 'slack'
  | 'jira'
  | 'linear'
  | 'airtable'
  | 'supabase'
  | 'postgres'
  | 'google-drive'
  | 'figma';

export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export interface MCPConnectionConfig {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  webhookUrl?: string;
  scopes?: string[];
}

// Billing Types
export interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface UsageRecord {
  id: string;
  organizationId: string;
  userId?: string;
  type: UsageType;
  quantity: number;
  cost: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export type UsageType =
  | 'tokens'
  | 'agent-runs'
  | 'workflow-runs'
  | 'storage'
  | 'api-calls'
  | 'mcp-calls';

// Analytics Types
export interface AnalyticsEvent {
  id: string;
  name: string;
  properties: Record<string, unknown>;
  userId?: string;
  organizationId?: string;
  sessionId?: string;
  timestamp: Date;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  unit?: string;
  timestamp: Date;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  organizationId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
}

export type WidgetType =
  | 'line-chart'
  | 'bar-chart'
  | 'pie-chart'
  | 'counter'
  | 'table'
  | 'funnel'
  | 'heatmap';

export interface DashboardFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
  value: unknown;
}

// API Key Types
export interface APIKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  permissions: string[];
  rateLimit?: number;
  expiresAt?: Date;
  lastUsedAt?: Date;
  organizationId: string;
  createdById: string;
  createdAt: Date;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Record<string, { before: unknown; after: unknown }>;
  metadata?: Record<string, unknown>;
  userId: string;
  organizationId: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// File Types
export interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  path: string;
  mimeType: string;
  metadata?: FileMetadata;
  organizationId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number;
  thumbnail?: string;
  checksum?: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: Record<string, unknown>;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Model Types
export interface Model {
  id: string;
  name: string;
  provider: ModelProvider;
  type: ModelType;
  capabilities: ModelCapabilities;
  pricing: ModelPricing;
  contextWindow: number;
  status: 'active' | 'inactive' | 'deprecated';
}

export type ModelProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'deepseek'
  | 'qwen'
  | 'mistral'
  | 'grok'
  | 'openrouter'
  | 'ollama'
  | 'lmstudio';

export type ModelType = 'chat' | 'embedding' | 'vision' | 'audio';

export interface ModelCapabilities {
  streaming: boolean;
  functionCalling: boolean;
  vision: boolean;
  jsonMode: boolean;
}

export interface ModelPricing {
  input: number;  // per 1M tokens
  output: number; // per 1M tokens
  currency: string;
}

// Routing Types
export interface RoutingStrategy {
  type: 'cost' | 'quality' | 'latency' | 'fallback' | 'custom';
  config: Record<string, unknown>;
}

export interface RouterConfig {
  defaultModel?: string;
  strategies: RoutingStrategy[];
  fallbackChain: string[];
  retryAttempts: number;
  retryDelay: number;
}