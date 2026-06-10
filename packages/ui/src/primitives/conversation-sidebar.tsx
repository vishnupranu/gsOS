import * as React from 'react';
import { cn } from '@ai-os/design-system';
import {
  Search,
  Plus,
  MoreHorizontal,
  Pin,
  Trash2,
  Copy,
  FolderOpen,
  MessageSquare,
  Clock,
  Star,
  Archive,
} from 'lucide-react';
import { Input } from '@ai-os/design-system';
import { ScrollArea } from '@ai-os/design-system';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ai-os/design-system';
import { Conversation } from '@ai-os/shared';

interface ConversationItemProps {
  conversation: Conversation;
  isActive?: boolean;
  onClick?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

function ConversationItem({
  conversation,
  isActive = false,
  onClick,
  onPin,
  onDelete,
  onDuplicate,
}: ConversationItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors',
        isActive
          ? 'bg-accent-blue/10 text-accent-blue'
          : 'hover:bg-background-tertiary text-foreground-secondary hover:text-foreground'
      )}
    >
      <MessageSquare className="h-4 w-4 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{conversation.title}</p>
        <p className="text-xs text-foreground-tertiary truncate">
          {new Date(conversation.lastMessageAt).toLocaleDateString()}
        </p>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={e => e.stopPropagation()}
              className="p-1 rounded hover:bg-background-elevated"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onPin}>
              <Pin className="h-4 w-4 mr-2" />
              {conversation.metadata.isPinned ? 'Unpin' : 'Pin'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-accent-red">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onNew?: () => void;
  onSearch?: (query: string) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  className?: string;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onSearch,
  onDelete,
  onPin,
  onDuplicate,
  className,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredConversations = React.useMemo(() => {
    if (!searchQuery) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(
      c =>
        c.title.toLowerCase().includes(query) ||
        c.metadata.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [conversations, searchQuery]);

  const pinnedConversations = filteredConversations.filter(c => c.metadata.isPinned);
  const recentConversations = filteredConversations.filter(
    c => !c.metadata.isPinned && !c.metadata.isArchived
  );
  const archivedConversations = filteredConversations.filter(c => c.metadata.isArchived);

  return (
    <div className={cn('flex flex-col h-full bg-background-secondary', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
          <Input
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            placeholder="Search conversations..."
            className="pl-9 h-9"
          />
        </div>
        <button
          onClick={onNew}
          className="p-2 rounded-md bg-accent-blue text-white hover:bg-accent-blue/90 transition-colors"
          title="New conversation"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-background-tertiary text-sm text-foreground-secondary hover:text-foreground transition-colors">
              <Clock className="h-4 w-4" />
              History
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-background-tertiary text-sm text-foreground-secondary hover:text-foreground transition-colors">
              <Star className="h-4 w-4" />
              Starred
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-background-tertiary text-sm text-foreground-secondary hover:text-foreground transition-colors">
              <FolderOpen className="h-4 w-4" />
              Folders
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-background-tertiary text-sm text-foreground-secondary hover:text-foreground transition-colors">
              <Archive className="h-4 w-4" />
              Archived
            </button>
          </div>

          {/* Pinned */}
          {pinnedConversations.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-foreground-tertiary uppercase tracking-wider">
                Pinned
              </h3>
              {pinnedConversations.map(conv => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeId}
                  onClick={() => onSelect?.(conv.id)}
                  onPin={() => onPin?.(conv.id)}
                  onDelete={() => onDelete?.(conv.id)}
                  onDuplicate={() => onDuplicate?.(conv.id)}
                />
              ))}
            </div>
          )}

          {/* Recent */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-foreground-tertiary uppercase tracking-wider">
              Recent
            </h3>
            {recentConversations.length > 0 ? (
              recentConversations.map(conv => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeId}
                  onClick={() => onSelect?.(conv.id)}
                  onPin={() => onPin?.(conv.id)}
                  onDelete={() => onDelete?.(conv.id)}
                  onDuplicate={() => onDuplicate?.(conv.id)}
                />
              ))
            ) : (
              <p className="text-sm text-foreground-tertiary py-4 text-center">
                No conversations yet
              </p>
            )}
          </div>

          {/* Archived */}
          {archivedConversations.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-foreground-tertiary uppercase tracking-wider">
                Archived
              </h3>
              {archivedConversations.map(conv => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeId}
                  onClick={() => onSelect?.(conv.id)}
                  onPin={() => onPin?.(conv.id)}
                  onDelete={() => onDelete?.(conv.id)}
                  onDuplicate={() => onDuplicate?.(conv.id)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}