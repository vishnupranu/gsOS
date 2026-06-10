import * as React from 'react';
import { cn } from '@ai-os/design-system';
import {
  File,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Upload,
  Download,
  Trash2,
  Copy,
  FileCode,
  FileText,
  Image,
  FileJson,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ai-os/design-system';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  children?: FileItem[];
  isExpanded?: boolean;
}

interface FileExplorerProps {
  files: FileItem[];
  selectedFile?: string;
  onSelect: (id: string) => void;
  onExpand?: (id: string) => void;
  onCreateFolder?: (parentId?: string) => void;
  onUpload?: (parentId?: string) => void;
  onDelete?: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
  onDownload?: (id: string) => void;
  className?: string;
}

const fileIcons: Record<string, React.ReactNode> = {
  'text/plain': <FileText className="h-4 w-4" />,
  'text/javascript': <FileCode className="h-4 w-4" />,
  'text/typescript': <FileCode className="h-4 w-4" />,
  'text/css': <FileCode className="h-4 w-4" />,
  'text/html': <FileCode className="h-4 w-4" />,
  'application/json': <FileJson className="h-4 w-4" />,
  'image/jpeg': <Image className="h-4 w-4" />,
  'image/png': <Image className="h-4 w-4" />,
  'image/gif': <Image className="h-4 w-4" />,
};

function FileTreeItem({
  item,
  depth = 0,
  selectedFile,
  onSelect,
  onExpand,
  onDelete,
  onRename,
  onDownload,
}: {
  item: FileItem;
  depth?: number;
  selectedFile?: string;
  onSelect: (id: string) => void;
  onExpand: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDownload: (id: string) => void;
}) {
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [newName, setNewName] = React.useState(item.name);

  const handleRename = () => {
    if (newName !== item.name && newName.trim()) {
      onRename(item.id, newName);
    }
    setIsRenaming(false);
  };

  const getIcon = () => {
    if (item.type === 'folder') {
      return item.isExpanded ? (
        <FolderOpen className="h-4 w-4 text-accent-yellow" />
      ) : (
        <Folder className="h-4 w-4 text-accent-yellow" />
      );
    }
    const icon = item.mimeType ? fileIcons[item.mimeType] : null;
    return icon || <File className="h-4 w-4" />;
  };

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
          selectedFile === item.id
            ? 'bg-accent-blue/10 text-accent-blue'
            : 'hover:bg-background-tertiary text-foreground-secondary hover:text-foreground'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (item.type === 'folder') {
            onExpand(item.id);
          } else {
            onSelect(item.id);
          }
        }}
      >
        {/* Expand/Collapse */}
        {item.type === 'folder' && (
          <button
            onClick={e => {
              e.stopPropagation();
              onExpand(item.id);
            }}
            className="p-0.5 hover:bg-background-elevated rounded"
          >
            {item.isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        )}
        {item.type === 'file' && <span className="w-4" />}

        {/* Icon */}
        {getIcon()}

        {/* Name */}
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setNewName(item.name);
                setIsRenaming(false);
              }
            }}
            className="flex-1 bg-transparent border border-accent-blue rounded px-1 text-sm"
            autoFocus
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 text-sm truncate">{item.name}</span>
        )}

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={e => e.stopPropagation()}
                className="p-1 rounded hover:bg-background-elevated"
              >
                <MoreHorizontal className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                Rename
              </DropdownMenuItem>
              {item.type === 'file' && (
                <DropdownMenuItem onClick={() => onDownload(item.id)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.name)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy path
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(item.id)}
                className="text-accent-red"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Children */}
      {item.type === 'folder' && item.isExpanded && item.children && (
        <div>
          {item.children.map(child => (
            <FileTreeItem
              key={child.id}
              item={child}
              depth={depth + 1}
              selectedFile={selectedFile}
              onSelect={onSelect}
              onExpand={onExpand}
              onDelete={onDelete}
              onRename={onRename}
              onDownload={onDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({
  files,
  selectedFile,
  onSelect,
  onExpand,
  onDelete,
  onRename,
  onDownload,
  className,
}: FileExplorerProps) {
  return (
    <div className={cn('flex flex-col h-full bg-background-secondary', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="text-sm font-medium">Files</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpload?.()}
            className="p-1.5 rounded hover:bg-background-tertiary text-foreground-secondary"
            title="Upload file"
          >
            <Upload className="h-4 w-4" />
          </button>
          <button
            onClick={() => onCreateFolder?.()}
            className="p-1.5 rounded hover:bg-background-tertiary text-foreground-secondary"
            title="New folder"
          >
            <Folder className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {files.length > 0 ? (
          files.map(file => (
            <FileTreeItem
              key={file.id}
              item={file}
              selectedFile={selectedFile}
              onSelect={onSelect}
              onExpand={onExpand}
              onDelete={onDelete}
              onRename={onRename}
              onDownload={onDownload}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <File className="h-8 w-8 text-foreground-tertiary mb-2" />
            <p className="text-sm text-foreground-tertiary">No files</p>
            <button
              onClick={() => onUpload?.()}
              className="mt-2 text-sm text-accent-blue hover:underline"
            >
              Upload files
            </button>
          </div>
        )}
      </div>
    </div>
  );
}