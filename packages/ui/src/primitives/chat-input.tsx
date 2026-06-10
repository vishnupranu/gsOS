import * as React from 'react';
import { cn } from '@ai-os/design-system';
import { Send, Paperclip, Image, Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@ai-os/design-system';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  showAttachments?: boolean;
  showVoiceInput?: boolean;
  className?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  isLoading = false,
  disabled = false,
  placeholder = 'Type a message...',
  maxLength = 100000,
  showAttachments = true,
  showVoiceInput = true,
  className,
}: ChatInputProps) {
  const [isRecording, setIsRecording] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSend();
      }
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  React.useEffect(() => {
    adjustTextareaHeight();
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // In production, implement Web Speech API or similar
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Process recording
  };

  return (
    <div
      className={cn(
        'relative flex items-end gap-2 p-4 border-t border-border bg-background',
        className
      )}
    >
      {/* Attachments */}
      {showAttachments && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-2 rounded-md hover:bg-background-tertiary text-foreground-secondary transition-colors"
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="p-2 rounded-md hover:bg-background-tertiary text-foreground-secondary transition-colors"
            title="Attach image"
          >
            <Image className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="w-full min-h-[44px] max-h-[200px] resize-none rounded-lg border border-border bg-background-elevated px-4 py-3 text-sm placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent disabled:opacity-50"
          rows={1}
        />
        
        {/* Character count */}
        {maxLength < 10000 && (
          <div className="absolute right-3 bottom-3 text-xs text-foreground-tertiary">
            {value.length.toLocaleString()} / {maxLength.toLocaleString()}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Voice input */}
        {showVoiceInput && (
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              'p-2 rounded-md transition-colors',
              isRecording
                ? 'bg-accent-red text-white hover:bg-accent-red/90'
                : 'hover:bg-background-tertiary text-foreground-secondary'
            )}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            <Mic className="h-5 w-5" />
          </button>
        )}

        {/* Send / Stop */}
        {isLoading ? (
          <Button
            variant="outline"
            size="icon"
            onClick={onStop}
            className="h-11 w-11"
            title="Stop"
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            onClick={onSend}
            disabled={!value.trim() || disabled}
            className="h-11 w-11"
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-red text-white text-sm">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Recording...
        </div>
      )}
    </div>
  );
}