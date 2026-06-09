import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { 
  Message, 
  Conversation, 
  Artifact, 
  SearchResult,
  MessageRole,
} from '@/types/index';

// Generate IDs
const generateId = () => nanoid();
const generateTimestamp = () => new Date();

// Message creation helpers
function createMessage(
  role: MessageRole,
  content: string,
  options?: Partial<Message>
): Message {
  return {
    id: generateId(),
    role,
    content,
    timestamp: generateTimestamp(),
    ...options,
  };
}

// Store interface
interface ChatStore {
  // State
  conversations: Map<string, Conversation>;
  activeConversationId: string | null;
  isStreaming: boolean;
  currentStreamingMessageId: string | null;
  
  // Actions - Conversations
  createConversation: (title?: string) => Conversation;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  updateConversationTitle: (id: string, title: string) => void;
  
  // Actions - Messages
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  clearMessages: (conversationId: string) => void;
  
  // Actions - Streaming
  startStreaming: (conversationId: string, messageId: string) => void;
  appendStreamingContent: (content: string) => void;
  finishStreaming: (finalContent: string) => void;
  cancelStreaming: () => void;
  
  // Actions - Artifacts
  addArtifact: (conversationId: string, messageId: string, artifact: Artifact) => void;
  updateArtifact: (conversationId: string, messageId: string, artifactId: string, updates: Partial<Artifact>) => void;
  deleteArtifact: (conversationId: string, messageId: string, artifactId: string) => void;
  
  // Actions - Search
  searchConversations: (query: string) => SearchResult[];
  
  // Getters
  getConversation: (id: string) => Conversation | undefined;
  getActiveConversation: () => Conversation | undefined;
  getActiveMessages: () => Message[];
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: new Map(),
  activeConversationId: null,
  isStreaming: false,
  currentStreamingMessageId: null,

  // Conversation actions
  createConversation: (title = 'New Conversation') => {
    const id = generateId();
    const conversation: Conversation = {
      id,
      title,
      messages: [],
      createdAt: generateTimestamp(),
      updatedAt: generateTimestamp(),
    };

    set((state) => {
      const newConversations = new Map(state.conversations);
      newConversations.set(id, conversation);
      return {
        conversations: newConversations,
        activeConversationId: id,
      };
    });

    return conversation;
  },

  deleteConversation: (id) => {
    set((state) => {
      const newConversations = new Map(state.conversations);
      newConversations.delete(id);
      
      const newActiveId = state.activeConversationId === id 
        ? (newConversations.size > 0 ? Array.from(newConversations.keys())[0] : null)
        : state.activeConversationId;

      return {
        conversations: newConversations,
        activeConversationId: newActiveId,
      };
    });
  },

  setActiveConversation: (id) => {
    set({ activeConversationId: id });
  },

  updateConversationTitle: (id, title) => {
    set((state) => {
      const conversation = state.conversations.get(id);
      if (!conversation) return state;

      const newConversations = new Map(state.conversations);
      newConversations.set(id, {
        ...conversation,
        title,
        updatedAt: generateTimestamp(),
      });

      return { conversations: newConversations };
    });
  },

  // Message actions
  addMessage: (conversationId, message) => {
    set((state) => {
      const conversation = state.conversations.get(conversationId);
      if (!conversation) return state;

      const newConversations = new Map(state.conversations);
      newConversations.set(conversationId, {
        ...conversation,
        messages: [...conversation.messages, message],
        updatedAt: generateTimestamp(),
      });

      return { conversations: newConversations };
    });
  },

  updateMessage: (conversationId, messageId, updates) => {
    set((state) => {
      const conversation = state.conversations.get(conversationId);
      if (!conversation) return state;

      const newMessages = conversation.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      );

      const newConversations = new Map(state.conversations);
      newConversations.set(conversationId, {
        ...conversation,
        messages: newMessages,
        updatedAt: generateTimestamp(),
      });

      return { conversations: newConversations };
    });
  },

  deleteMessage: (conversationId, messageId) => {
    set((state) => {
      const conversation = state.conversations.get(conversationId);
      if (!conversation) return state;

      const newConversations = new Map(state.conversations);
      newConversations.set(conversationId, {
        ...conversation,
        messages: conversation.messages.filter((msg) => msg.id !== messageId),
        updatedAt: generateTimestamp(),
      });

      return { conversations: newConversations };
    });
  },

  clearMessages: (conversationId) => {
    set((state) => {
      const conversation = state.conversations.get(conversationId);
      if (!conversation) return state;

      const newConversations = new Map(state.conversations);
      newConversations.set(conversationId, {
        ...conversation,
        messages: [],
        updatedAt: generateTimestamp(),
      });

      return { conversations: newConversations };
    });
  },

  // Streaming actions
  startStreaming: (conversationId, messageId) => {
    set({
      isStreaming: true,
      currentStreamingMessageId: messageId,
    });

    // Add empty streaming message
    const streamingMessage = createMessage('assistant', '');
    set((state) => {
      const conversation = state.conversations.get(conversationId);
      if (!conversation) return state;

      const newConversations = new Map(state.conversations);
      newConversations.set(conversationId, {
        ...conversation,
        messages: [...conversation.messages, { ...streamingMessage, id: messageId }],
        updatedAt: generateTimestamp(),
      });

      return { conversations: newConversations };
    });
  },

  appendStreamingContent: (content) => {
    const { currentStreamingMessageId, activeConversationId } = get();
    if (!currentStreamingMessageId || !activeConversationId) return;

    set((state) => {
      const conversation = state.conversations.get(activeConversationId);
      if (!conversation) return state;

      const newMessages = conversation.messages.map((msg) =>
        msg.id === currentStreamingMessageId
          ? { ...msg, content: msg.content + content }
          : msg
      );

      const newConversations = new Map(state.conversations);
      newConversations.set(activeConversationId, {
        ...conversation,
        messages: newMessages,
      });

      return { conversations: newConversations };
    });
  },

  finishStreaming: (finalContent) => {
    const { currentStreamingMessageId, activeConversationId } = get();
    if (!currentStreamingMessageId || !activeConversationId) return;

    set((state) => {
      const conversation = state.conversations.get(activeConversationId);
      if (!conversation) return state;

      const newMessages = conversation.messages.map((msg) =>
        msg.id === currentStreamingMessageId
          ? { ...msg, content: finalContent }
          : msg
      );

      const newConversations = new Map(state.conversations);
      newConversations.set(activeConversationId, {
        ...conversation,
        messages: newMessages,
        updatedAt: generateTimestamp(),
      });

      return {
        conversations: newConversations,
        isStreaming: false,
        currentStreamingMessageId: null,
      };
    });
  },

  cancelStreaming: () => {
    const { currentStreamingMessageId, activeConversationId } = get();
    
    // Remove the streaming message
    if (currentStreamingMessageId && activeConversationId) {
      set((state) => {
        const conversation = state.conversations.get(activeConversationId);
        if (!conversation) return state;

        const newConversations = new Map(state.conversations);
        newConversations.set(activeConversationId, {
          ...conversation,
          messages: conversation.messages.filter(
            (msg) => msg.id !== currentStreamingMessageId
          ),
        });

        return { conversations: newConversations };
      });
    }

    set({
      isStreaming: false,
      currentStreamingMessageId: null,
    });
  },

  // Artifact actions
  addArtifact: (conversationId, messageId, artifact) => {
    set((state) => {
      const conversation = state.conversations.get(conversationId);
      if (!conversation) return state;

      const newMessages = conversation.messages.map((msg) =>
        msg.id === messageId
          ? { ...msg, artifacts: [...(msg.artifacts || []), artifact] }
          : msg
      );

      const newConversations = new Map(state.conversations);
      newConversations.set(conversationId, {
        ...conversation,
        messages: newMessages,
        updatedAt: generateTimestamp(),
      });

      return { conversations: newConversations };
    });
  },

  updateArtifact: (conversationId, messageId, artifactId, updates) => {
    set((state) => {
      const conversation = state.conversations.get(conversationId);
      if (!conversation) return state;

      const newMessages = conversation.messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              artifacts: msg.artifacts?.map((art) =>
                art.id === artifactId ? { ...art, ...updates } : art
              ),
            }
          : msg
      );

      const newConversations = new Map(state.conversations);
      newConversations.set(conversationId, {
        ...conversation,
        messages: newMessages,
        updatedAt: generateTimestamp(),
      });

      return { conversations: newConversations };
    });
  },

  deleteArtifact: (conversationId, messageId, artifactId) => {
    set((state) => {
      const conversation = state.conversations.get(conversationId);
      if (!conversation) return state;

      const newMessages = conversation.messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              artifacts: msg.artifacts?.filter((art) => art.id !== artifactId),
            }
          : msg
      );

      const newConversations = new Map(state.conversations);
      newConversations.set(conversationId, {
        ...conversation,
        messages: newMessages,
        updatedAt: generateTimestamp(),
      });

      return { conversations: newConversations };
    });
  },

  // Search
  searchConversations: (query) => {
    const { conversations } = get();
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    for (const [conversationId, conversation] of conversations) {
      for (const message of conversation.messages) {
        if (message.content.toLowerCase().includes(lowerQuery)) {
          results.push({
            conversationId,
            conversationTitle: conversation.title,
            messageId: message.id,
            messageContent: message.content,
            timestamp: message.timestamp,
            relevanceScore: 1, // Simple relevance for now
          });
        }
      }
    }

    // Sort by relevance (content length match) then by date
    return results.sort((a, b) => {
      const aMatch = a.messageContent.toLowerCase().includes(lowerQuery);
      const bMatch = b.messageContent.toLowerCase().includes(lowerQuery);
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  },

  // Getters
  getConversation: (id) => get().conversations.get(id),
  
  getActiveConversation: () => {
    const { conversations, activeConversationId } = get();
    return activeConversationId ? conversations.get(activeConversationId) : undefined;
  },
  
  getActiveMessages: () => {
    const conversation = get().getActiveConversation();
    return conversation?.messages ?? [];
  },
}));