// Message types
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
  artifacts?: Artifact[];
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  model?: string;
  provider?: string;
  tokens?: number;
  finishReason?: string;
}

// File attachment types
export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  content?: string;
  preview?: string;
}

// Artifact types
export type ArtifactType = 'code' | 'document' | 'chart' | 'table' | 'image';

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  content: string;
  language?: string;
  metadata?: Record<string, unknown>;
}

// Conversation types
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: ConversationMetadata;
}

export interface ConversationMetadata {
  model?: string;
  provider?: string;
  tags?: string[];
}

// Streaming chunk types
export interface StreamChunk {
  id: string;
  delta: string;
  done: boolean;
  error?: string;
}

// Search types
export interface SearchResult {
  conversationId: string;
  conversationTitle: string;
  messageId: string;
  messageContent: string;
  timestamp: Date;
  relevanceScore: number;
}

export interface SearchOptions {
  query: string;
  limit?: number;
  offset?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Chat state types
export interface ChatState {
  conversations: Map<string, Conversation>;
  activeConversationId: string | null;
  isStreaming: boolean;
  currentStreamingMessage: Message | null;
}

// Provider types for AI integration
export type AIProvider = 
  | 'openai' 
  | 'anthropic' 
  | 'gemini' 
  | 'deepseek' 
  | 'qwen' 
  | 'openrouter' 
  | 'ollama';

export interface ChatConfig {
  provider: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}