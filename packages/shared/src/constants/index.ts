// Constants for AI OS

// API Constants
export const API_VERSION = 'v1';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
export const API_TIMEOUT = 30000;
export const API_RETRY_ATTEMPTS = 3;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const PAGE_SIZES = [10, 20, 50, 100];

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'text/markdown',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
export const UPLOAD_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

// Model Constants
export const SUPPORTED_MODELS = {
  openai: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  google: ['gemini-pro', 'gemini-pro-vision'],
  deepseek: ['deepseek-chat'],
  qwen: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
  mistral: ['mistral-large', 'mistral-medium', 'mistral-small'],
  grok: ['xai'],
  openrouter: ['openrouter/*'],
  ollama: ['llama2', 'mistral', 'codellama'],
  lmstudio: ['*'],
} as const;

export const DEFAULT_MODEL = 'gpt-4-turbo';
export const EMBEDDING_MODEL = 'text-embedding-3-small';

// Pricing (per 1M tokens)
export const MODEL_PRICING = {
  'gpt-4-turbo': { input: 10, output: 30 },
  'gpt-4': { input: 30, output: 60 },
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
  'claude-3-opus': { input: 15, output: 75 },
  'claude-3-sonnet': { input: 3, output: 15 },
  'claude-3-haiku': { input: 0.25, output: 1.25 },
  'gemini-pro': { input: 0.5, output: 1.5 },
  'gemini-pro-vision': { input: 1, output: 2 },
  'deepseek-chat': { input: 0.5, output: 2 },
  'qwen-turbo': { input: 0.5, output: 1.5 },
  'qwen-plus': { input: 2, output: 8 },
  'qwen-max': { input: 20, output: 60 },
  'mistral-large': { input: 4, output: 12 },
  'mistral-medium': { input: 2.7, output: 8.1 },
  'mistral-small': { input: 0.2, output: 0.6 },
} as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '100 messages/month',
      '3 conversations',
      'Basic models',
      'Community support',
    ],
    limits: {
      messages: 100,
      conversations: 3,
      agents: 1,
      workflows: 1,
      storage: 100 * 1024 * 1024, // 100MB
      apiCalls: 0,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 20,
    features: [
      'Unlimited messages',
      'Unlimited conversations',
      'All models',
      'Priority support',
      'Agent creation',
      'Workflow automation',
    ],
    limits: {
      messages: -1,
      conversations: -1,
      agents: 10,
      workflows: 10,
      storage: 10 * 1024 * 1024 * 1024, // 10GB
      apiCalls: 10000,
    },
  },
  team: {
    id: 'team',
    name: 'Team',
    price: 50,
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Shared workspaces',
      'Admin dashboard',
      'SSO integration',
      'Analytics',
    ],
    limits: {
      messages: -1,
      conversations: -1,
      agents: 50,
      workflows: 50,
      storage: 100 * 1024 * 1024 * 1024, // 100GB
      apiCalls: 100000,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 200,
    features: [
      'Everything in Team',
      'Custom models',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'On-premise option',
    ],
    limits: {
      messages: -1,
      conversations: -1,
      agents: -1,
      workflows: -1,
      storage: -1,
      apiCalls: -1,
    },
  },
} as const;

// Agent Types
export const AGENT_TYPES = [
  { id: 'research', name: 'Research Agent', description: 'Web search and research capabilities' },
  { id: 'developer', name: 'Developer Agent', description: 'Code generation and debugging' },
  { id: 'designer', name: 'Designer Agent', description: 'UI/UX design assistance' },
  { id: 'marketing', name: 'Marketing Agent', description: 'Marketing content and strategy' },
  { id: 'seo', name: 'SEO Agent', description: 'SEO optimization and analysis' },
  { id: 'browser', name: 'Browser Agent', description: 'Web automation and scraping' },
  { id: 'data-analyst', name: 'Data Analyst Agent', description: 'Data analysis and visualization' },
  { id: 'product-manager', name: 'Product Manager Agent', description: 'Product planning and management' },
] as const;

// Workflow Node Types
export const WORKFLOW_NODE_TYPES = [
  { id: 'trigger', name: 'Trigger', icon: 'zap', description: 'Starts the workflow' },
  { id: 'condition', name: 'Condition', icon: 'git-branch', description: 'Conditional logic' },
  { id: 'ai', name: 'AI', icon: 'sparkles', description: 'AI model interaction' },
  { id: 'mcp', name: 'MCP', icon: 'plug', description: 'MCP integration' },
  { id: 'api', name: 'API', icon: 'globe', description: 'HTTP request' },
  { id: 'database', name: 'Database', icon: 'database', description: 'Database operation' },
  { id: 'email', name: 'Email', icon: 'mail', description: 'Send email' },
  { id: 'agent', name: 'Agent', icon: 'bot', description: 'AI agent task' },
  { id: 'browser', name: 'Browser', icon: 'monitor', description: 'Browser automation' },
  { id: 'transform', name: 'Transform', icon: 'shuffle', description: 'Data transformation' },
  { id: 'filter', name: 'Filter', icon: 'filter', description: 'Data filtering' },
] as const;

// MCP Connection Types
export const MCP_CONNECTION_TYPES = [
  { id: 'github', name: 'GitHub', icon: 'github', description: 'GitHub integration' },
  { id: 'notion', name: 'Notion', icon: 'notion', description: 'Notion integration' },
  { id: 'slack', name: 'Slack', icon: 'slack', description: 'Slack integration' },
  { id: 'jira', name: 'Jira', icon: 'jira', description: 'Jira integration' },
  { id: 'linear', name: 'Linear', icon: 'linear', description: 'Linear integration' },
  { id: 'airtable', name: 'Airtable', icon: 'airtable', description: 'Airtable integration' },
  { id: 'supabase', name: 'Supabase', icon: 'supabase', description: 'Supabase integration' },
  { id: 'postgres', name: 'PostgreSQL', icon: 'database', description: 'PostgreSQL integration' },
  { id: 'google-drive', name: 'Google Drive', icon: 'google', description: 'Google Drive integration' },
  { id: 'figma', name: 'Figma', icon: 'figma', description: 'Figma integration' },
] as const;

// WebSocket Events
export const WS_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECTION: 'disconnection',
  MESSAGE: 'message',
  TYPING: 'typing',
  PRESENCE: 'presence',
  ERROR: 'error',
  CONVERSATION_UPDATE: 'conversation:update',
  MESSAGE_NEW: 'message:new',
  MESSAGE_UPDATE: 'message:update',
  AGENT_STATUS: 'agent:status',
  WORKFLOW_STATUS: 'workflow:status',
  NOTIFICATION: 'notification',
} as const;

// Error Codes
export const ERROR_CODES = {
  // Authentication errors (1xxx)
  AUTH_INVALID_CREDENTIALS: { code: 'AUTH_1001', message: 'Invalid credentials' },
  AUTH_TOKEN_EXPIRED: { code: 'AUTH_1002', message: 'Token expired' },
  AUTH_TOKEN_INVALID: { code: 'AUTH_1003', message: 'Invalid token' },
  AUTH_MFA_REQUIRED: { code: 'AUTH_1004', message: 'MFA required' },
  AUTH_SESSION_EXPIRED: { code: 'AUTH_1005', message: 'Session expired' },
  AUTH_PERMISSION_DENIED: { code: 'AUTH_1006', message: 'Permission denied' },

  // Validation errors (2xxx)
  VALIDATION_ERROR: { code: 'VALIDATION_2001', message: 'Validation error' },
  VALIDATION_REQUIRED: { code: 'VALIDATION_2002', message: 'Required field missing' },
  VALIDATION_INVALID_FORMAT: { code: 'VALIDATION_2003', message: 'Invalid format' },
  VALIDATION_TOO_LONG: { code: 'VALIDATION_2004', message: 'Value too long' },
  VALIDATION_TOO_SHORT: { code: 'VALIDATION_2005', message: 'Value too short' },

  // Resource errors (3xxx)
  RESOURCE_NOT_FOUND: { code: 'RESOURCE_3001', message: 'Resource not found' },
  RESOURCE_ALREADY_EXISTS: { code: 'RESOURCE_3002', message: 'Resource already exists' },
  RESOURCE_LIMIT_EXCEEDED: { code: 'RESOURCE_3003', message: 'Resource limit exceeded' },
  RESOURCE_CONFLICT: { code: 'RESOURCE_3004', message: 'Resource conflict' },

  // Rate limit errors (4xxx)
  RATE_LIMIT_EXCEEDED: { code: 'RATE_4001', message: 'Rate limit exceeded' },
  QUOTA_EXCEEDED: { code: 'RATE_4002', message: 'Quota exceeded' },

  // Server errors (5xxx)
  INTERNAL_ERROR: { code: 'SERVER_5001', message: 'Internal server error' },
  SERVICE_UNAVAILABLE: { code: 'SERVER_5002', message: 'Service unavailable' },
  GATEWAY_TIMEOUT: { code: 'SERVER_5003', message: 'Gateway timeout' },

  // AI errors (6xxx)
  AI_MODEL_ERROR: { code: 'AI_6001', message: 'AI model error' },
  AI_CONTEXT_LENGTH: { code: 'AI_6002', message: 'Context length exceeded' },
  AI_CONTENT_FILTER: { code: 'AI_6003', message: 'Content filtered' },
} as const;

// Analytics Events
export const ANALYTICS_EVENTS = {
  // User events
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',

  // Conversation events
  CONVERSATION_CREATE: 'conversation_create',
  CONVERSATION_VIEW: 'conversation_view',
  CONVERSATION_DELETE: 'conversation_delete',
  CONVERSATION_SHARE: 'conversation_share',

  // Message events
  MESSAGE_SEND: 'message_send',
  MESSAGE_RECEIVE: 'message_receive',
  MESSAGE_FEEDBACK: 'message_feedback',

  // Agent events
  AGENT_CREATE: 'agent_create',
  AGENT_RUN: 'agent_run',
  AGENT_COMPLETE: 'agent_complete',

  // Workflow events
  WORKFLOW_CREATE: 'workflow_create',
  WORKFLOW_RUN: 'workflow_run',
  WORKFLOW_COMPLETE: 'workflow_complete',

  // Billing events
  SUBSCRIPTION_UPGRADE: 'subscription_upgrade',
  SUBSCRIPTION_DOWNGRADE: 'subscription_downgrade',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  RECENT_CONVERSATIONS: 'recent_conversations',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  NEW_EDITOR: 'new_editor',
  AGENT_DEBUGGER: 'agent_debugger',
  WORKFLOW_BUILDER: 'workflow_builder',
  KNOWLEDGE_BASE: 'knowledge_base',
  MCP_INTEGRATIONS: 'mcp_integrations',
  BROWSER_AGENT: 'browser_agent',
  VOICE_INPUT: 'voice_input',
  VOICE_OUTPUT: 'voice_output',
  ARTIFACTS: 'artifacts',
  SHARING: 'sharing',
  ANALYTICS: 'analytics',
  TEAM_COLLABORATION: 'team_collaboration',
} as const;

// Cache TTL (in milliseconds)
export const CACHE_TTL = {
  SHORT: 60 * 1000,           // 1 minute
  MEDIUM: 5 * 60 * 1000,      // 5 minutes
  LONG: 30 * 60 * 1000,       // 30 minutes
  VERY_LONG: 60 * 60 * 1000,  // 1 hour
  DAY: 24 * 60 * 60 * 1000,   // 1 day
} as const;

// Environment
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

// Demo content
export const DEMO_CONTENT = {
  WELCOME_MESSAGE: 'Welcome to AI OS! How can I help you today?',
  EXAMPLE_PROMPTS: [
    'Write a Python function to calculate Fibonacci numbers',
    'Explain how neural networks work',
    'Help me draft an email to a potential client',
    'Analyze this code for bugs',
  ],
} as const;