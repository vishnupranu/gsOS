import * as React from 'react';
import { cn } from '@ai-os/design-system';
import { Avatar, AvatarFallback, AvatarImage } from '@ai-os/design-system';
import { Message, MessageRole } from '@ai-os/shared';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Edit2,
  Trash2,
  RefreshCw,
  Bot,
  User,
} from 'lucide-react';
import { useCopyToClipboard } from '@ai-os/design-system';

interface ChatMessageProps {
  message: Message;
  onFeedback?: (messageId: string, isPositive: boolean) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onRetry?: (messageId: string) => void;
  showActions?: boolean;
  className?: string;
}

export function ChatMessage({
  message,
  onFeedback,
  onEdit,
  onDelete,
  onRetry,
  showActions = true,
  className,
}: ChatMessageProps) {
  const { copied, copy } = useCopyToClipboard();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedContent, setEditedContent] = React.useState(message.content);

  const handleCopy = () => {
    copy(message.content);
  };

  const handleEdit = () => {
    if (editedContent !== message.content) {
      onEdit?.(message.id, editedContent);
    }
    setIsEditing(false);
  };

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        'group relative flex gap-4 px-4 py-6',
        isUser ? 'bg-background-secondary' : 'bg-transparent',
        className
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-accent-blue text-white">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-accent-purple text-white">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-sm">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          <span className="text-xs text-foreground-tertiary">
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
          {message.tokens && (
            <span className="text-xs text-foreground-tertiary">
              {message.tokens} tokens
            </span>
          )}
        </div>

        {/* Message Body */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedContent}
              onChange={e => setEditedContent(e.target.value)}
              className="w-full min-h-[100px] rounded-md border border-border bg-background p-3 text-sm resize-y"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="px-3 py-1.5 text-sm bg-accent-blue text-white rounded-md hover:bg-accent-blue/90"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditedContent(message.content);
                  setIsEditing(false);
                }}
                className="px-3 py-1.5 text-sm bg-background-tertiary rounded-md hover:bg-background-elevated"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match;
                  
                  if (isInline) {
                    return (
                      <code
                        className="rounded bg-background-tertiary px-1.5 py-0.5 font-mono text-xs"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }

                  return (
                    <div className="relative group/code">
                      <button
                        onClick={() => copy(String(children))}
                        className="absolute right-2 top-2 p-1.5 rounded-md bg-background-elevated opacity-0 group-hover/code:opacity-100 hover:bg-background-tertiary transition-opacity"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-accent-green" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                        }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  );
                },
                pre({ children }) {
                  return <>{children}</>;
                },
                a({ href, children }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-blue hover:underline"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.attachments.map(attachment => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-background-tertiary text-sm"
              >
                <span className="text-foreground-secondary">
                  {attachment.type === 'image' ? '🖼️' : '📎'}
                </span>
                <span className="truncate max-w-[200px]">{attachment.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tool Uses */}
        {message.metadata?.tools && (message.metadata.tools as unknown[]).length > 0 && (
          <div className="mt-3 space-y-2">
            {(message.metadata.tools as { name: string; status: string }[]).map((tool, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs text-foreground-secondary"
              >
                <span className="w-2 h-2 rounded-full bg-accent-blue" />
                <span className="font-mono">{tool.name}</span>
                <span className="text-foreground-tertiary">({tool.status})</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {showActions && !isEditing && (
          <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-background-tertiary text-foreground-secondary"
              title="Copy"
            >
              {copied ? (
                <Check className="h-4 w-4 text-accent-green" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            
            {isUser && onEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-md hover:bg-background-tertiary text-foreground-secondary"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            
            {isAssistant && onFeedback && (
              <>
                <button
                  onClick={() => onFeedback(message.id, true)}
                  className="p-1.5 rounded-md hover:bg-background-tertiary text-foreground-secondary"
                  title="Good response"
                >
                  <ThumbsUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onFeedback(message.id, false)}
                  className="p-1.5 rounded-md hover:bg-background-tertiary text-foreground-secondary"
                  title="Bad response"
                >
                  <ThumbsDown className="h-4 w-4" />
                </button>
              </>
            )}
            
            {isAssistant && onRetry && message.metadata?.error && (
              <button
                onClick={() => onRetry(message.id)}
                className="p-1.5 rounded-md hover:bg-background-tertiary text-foreground-secondary"
                title="Retry"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            
            <button
              className="p-1.5 rounded-md hover:bg-background-tertiary text-foreground-secondary"
              title="More"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Error */}
        {message.metadata?.error && (
          <div className="mt-3 p-3 rounded-md bg-accent-red/10 border border-accent-red/20">
            <p className="text-sm text-accent-red">{message.metadata.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}