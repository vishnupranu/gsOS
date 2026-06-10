import { z } from 'zod';
import type {
  PaginationParams,
  ModelProvider,
  AgentType,
  WorkflowNodeType,
  MCPConnectionType,
} from '../types';

// Common validation patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlPattern = /^https?:\/\/.+/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Zod Schemas

// User schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['owner', 'admin', 'member', 'viewer']).optional().default('member'),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional().nullable(),
  role: z.enum(['owner', 'admin', 'member', 'viewer']).optional(),
  mfaEnabled: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  mfaCode: z.string().optional(),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Organization schemas
export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100),
  slug: z.string().regex(slugPattern, 'Invalid slug format').optional(),
  plan: z.enum(['free', 'pro', 'team', 'enterprise']).optional().default('free'),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  logo: z.string().url().optional().nullable(),
  settings: z.object({
    defaultModel: z.string().optional(),
    maxTokensPerDay: z.number().optional(),
    allowedDomains: z.array(z.string()).optional(),
    ssoEnabled: z.boolean().optional(),
    mfaRequired: z.boolean().optional(),
    ipWhitelist: z.array(z.string()).optional(),
  }).optional(),
});

// Conversation schemas
export const createConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  model: z.string().optional(),
  context: z.object({
    files: z.array(z.string()).optional(),
    documents: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    memory: z.string().optional(),
  }).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(100000),
  attachments: z.array(z.object({
    id: z.string(),
    type: z.enum(['file', 'image', 'audio', 'video']),
    name: z.string(),
    url: z.string(),
    size: z.number(),
    mimeType: z.string(),
  })).optional(),
  stream: z.boolean().optional().default(true),
});

export const branchConversationSchema = z.object({
  messageId: z.string().regex(uuidPattern, 'Invalid message ID'),
  title: z.string().min(1).max(200).optional(),
});

// Agent schemas
export const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  type: z.enum(['research', 'developer', 'designer', 'marketing', 'seo', 'browser', 'data-analyst', 'product-manager'] as const),
  model: z.string().optional(),
  prompt: z.string().min(1).max(10000),
  tools: z.array(z.string()).optional(),
  memory: z.object({
    type: z.enum(['short-term', 'long-term', 'hybrid']),
    vectorStore: z.string().optional(),
    retentionDays: z.number().optional(),
  }).optional(),
  settings: z.object({
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().min(1).max(100000).optional(),
    topP: z.number().min(0).max(1).optional(),
    frequencyPenalty: z.number().min(-2).max(2).optional(),
    presencePenalty: z.number().min(-2).max(2).optional(),
  }).optional(),
});

export const updateAgentSchema = createAgentSchema.partial();

// Workflow schemas
export const createWorkflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  nodes: z.array(z.object({
    id: z.string(),
    type: z.enum(['trigger', 'condition', 'ai', 'mcp', 'api', 'database', 'email', 'agent', 'browser', 'transform', 'filter'] as const),
    position: z.object({ x: z.number(), y: z.number() }),
    data: z.record(z.unknown()),
    config: z.record(z.unknown()).optional(),
  })),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    label: z.string().optional(),
    condition: z.string().optional(),
  })),
  trigger: z.object({
    type: z.enum(['schedule', 'webhook', 'event', 'manual']),
    config: z.record(z.unknown()),
  }),
  settings: z.object({
    timeout: z.number().optional(),
    retryAttempts: z.number().optional(),
    retryDelay: z.number().optional(),
    concurrency: z.number().optional(),
  }).optional(),
});

export const updateWorkflowSchema = createWorkflowSchema.partial();

// Document schemas
export const createDocumentSchema = z.object({
  name: z.string().min(1).max(500),
  type: z.enum(['pdf', 'docx', 'csv', 'xlsx', 'markdown', 'notion', 'confluence', 'webpage'] as const),
  url: z.string().url().optional(),
  metadata: z.object({
    mimeType: z.string().optional(),
    source: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    customFields: z.record(z.string()).optional(),
  }).optional(),
});

// MCP schemas
export const createMCPConnectionSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['github', 'notion', 'slack', 'jira', 'linear', 'airtable', 'supabase', 'postgres', 'google-drive', 'figma'] as const),
  config: z.object({
    apiKey: z.string().optional(),
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
    webhookUrl: z.string().url().optional(),
    scopes: z.array(z.string()).optional(),
  }),
});

export const updateMCPConnectionSchema = createMCPConnectionSchema.partial();

// API Key schemas
export const createAPIKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()).min(1),
  rateLimit: z.number().min(1).optional(),
  expiresAt: z.string().datetime().optional(),
});

export const updateAPIKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  permissions: z.array(z.string()).optional(),
  rateLimit: z.number().min(1).optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// File upload schema
export const fileUploadSchema = z.object({
  name: z.string().min(1).max(500),
  type: z.string(),
  size: z.number().max(10 * 1024 * 1024), // 10MB
  mimeType: z.string(),
});

// Webhook schema
export const webhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()),
  secret: z.string().optional(),
});

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type BranchConversationInput = z.infer<typeof branchConversationSchema>;
export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type CreateMCPConnectionInput = z.infer<typeof createMCPConnectionSchema>;
export type UpdateMCPConnectionInput = z.infer<typeof updateMCPConnectionSchema>;
export type CreateAPIKeyInput = z.infer<typeof createAPIKeySchema>;
export type UpdateAPIKeyInput = z.infer<typeof updateAPIKeySchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type WebhookInput = z.infer<typeof webhookSchema>;