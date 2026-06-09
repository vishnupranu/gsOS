'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Image, Loader2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useChatStore } from '@/lib/store';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CodeArtifact } from './CodeArtifact';
import { FileUpload, FileAttachmentList } from './FileUpload';
import type { Message, FileAttachment } from '@/types/index';

interface ChatInterfaceProps {
  apiEndpoint?: string;
  apiKey?: string;
  className?: string;
}

export function ChatInterface({ apiEndpoint = '/api/chat', apiKey, className = '' }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('openai');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    isStreaming, 
    currentStreamingMessageId,
    activeConversationId,
    createConversation,
    addMessage,
    startStreaming,
    appendStreamingContent,
    finishStreaming,
    cancelStreaming,
    getActiveMessages,
  } = useChatStore();

  const messages = getActiveMessages();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSubmit = async () => {
    if (!input.trim() && attachments.length === 0) return;
    if (isStreaming) return;

    // Create conversation if none exists
    let conversationId = activeConversationId;
    if (!conversationId) {
      const conv = createConversation();
      conversationId = conv.id;
    }

    // Build message content with attachments
    let content = input.trim();
    if (attachments.length > 0) {
      const attachmentDescriptions = attachments
        .map((a) => `[Attached: ${a.name} (${(a.size / 1024).toFixed(1)} KB)]`)
        .join('\n');
      content = `${attachmentDescriptions}\n\n${content}`;
    }

    // Add user message
    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };
    addMessage(conversationId!, userMessage);

    // Clear input
    setInput('');
    setAttachments([]);
    setShowFileUpload(false);

    // Start streaming
    const assistantMessageId = nanoid();
    startStreaming(conversationId!, assistantMessageId);

    // Prepare messages for API
    const apiMessages = [
      ...messages,
      userMessage,
    ].map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'x-api-key': apiKey } : {}),
        },
        body: JSON.stringify({
          messages: apiMessages,
          provider: selectedProvider,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                throw new Error(data.error);
              }
              
              if (data.content) {
                fullContent += data.content;
                appendStreamingContent(data.content);
              }
              
              if (data.done) {
                break;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      finishStreaming(fullContent);

      // Auto-generate title from first message
      if (messages.length === 0 && userMessage.content.length > 0) {
        const title = userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? '...' : '');
        useChatStore.getState().updateConversationTitle(conversationId!, title);
      }
    } catch (error) {
      console.error('Chat error:', error);
      cancelStreaming();
      
      // Add error message
      const errorMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      addMessage(conversationId!, errorMessage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFilesUploaded = (files: FileAttachment[]) => {
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isStreaming={isStreaming && currentStreamingMessageId === message.id}
            />
          ))}
          
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                <MessageSquareIcon className="w-8 h-8 text-gray-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-200 mb-2">
                Start a conversation
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Ask questions, get help with code, brainstorm ideas, and more.
              </p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-800 bg-gray-900/50 p-4">
        <div className="max-w-3xl mx-auto">
          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="mb-3">
              <FileAttachmentList attachments={attachments} onRemove={removeAttachment} />
            </div>
          )}

          {/* File upload panel */}
          {showFileUpload && (
            <div className="mb-3">
              <FileUpload onFilesUploaded={handleFilesUploaded} />
            </div>
          )}

          {/* Input row */}
          <div className="flex items-end gap-3">
            {/* Provider selector */}
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="deepseek">DeepSeek</option>
            </select>

            {/* Attachment button */}
            <button
              onClick={() => setShowFileUpload(!showFileUpload)}
              className="p-2.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
              title="Attach files"
            >
              <Image size={20} />
            </button>

            {/* Input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500 min-h-[48px] max-h-[200px]"
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                }}
              />
            </div>

            {/* Send/Stop button */}
            {isStreaming ? (
              <button
                onClick={cancelStreaming}
                className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors"
                title="Stop"
              >
                <Square size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!input.trim() && attachments.length === 0}
                className="p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl transition-colors"
                title="Send"
              >
                <Send size={20} />
              </button>
            )}
          </div>

          {/* Hint */}
          <p className="mt-2 text-xs text-gray-600 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}

// Message bubble component
interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-3
          ${isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-800 text-gray-100'
          }
        `}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
        
        {/* Artifacts */}
        {message.artifacts?.map((artifact) => (
          <CodeArtifact
            key={artifact.id}
            id={artifact.id}
            title={artifact.title}
            code={artifact.content}
            language={artifact.language}
          />
        ))}
        
        {/* Streaming indicator */}
        {isStreaming && (
          <span className="inline-block ml-2">
            <Loader2 size={14} className="animate-spin" />
          </span>
        )}
      </div>
    </div>
  );
}

// Simple icon component
function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}