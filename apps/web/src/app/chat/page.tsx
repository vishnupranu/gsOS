'use client';

import { useState } from 'react';
import { ChatMessage, ChatInput, ConversationSidebar, ModelSelector } from '@ai-os/ui';
import { MessageSquare, MoreHorizontal, Settings, Share2 } from 'lucide-react';
import { Button } from '@ai-os/design-system';
import type { Message, Conversation } from '@ai-os/shared';

const demoConversations: Conversation[] = [
  { id: '1', title: 'Python Web Scraper Development', model: 'gpt-4-turbo', messages: [], context: undefined, metadata: { isPinned: true, isArchived: false, tags: ['coding', 'python'], branchCount: 0 }, organizationId: 'org1', createdById: 'user1', createdAt: new Date(), updatedAt: new Date(), lastMessageAt: new Date() },
  { id: '2', title: 'Marketing Strategy Discussion', model: 'gpt-4-turbo', messages: [], context: undefined, metadata: { isPinned: false, isArchived: false, tags: ['marketing'], branchCount: 0 }, organizationId: 'org1', createdById: 'user1', createdAt: new Date(), updatedAt: new Date(), lastMessageAt: new Date(Date.now() - 86400000) },
];

const demoMessages: Message[] = [
  { id: '1', role: 'user', content: 'Can you help me create a Python web scraper?', model: 'gpt-4-turbo', tokens: 1200, attachments: undefined, artifacts: undefined, metadata: {}, createdAt: new Date(Date.now() - 3600000) },
  { id: '2', role: 'assistant', content: '# Python Web Scraper\n\nHere\'s a complete web scraper using `requests` and `BeautifulSoup`:\n\n```python\nimport requests\nfrom bs4 import BeautifulSoup\n\nclass WebScraper:\n    def __init__(self, base_url):\n        self.base_url = base_url\n        self.visited = set()\n    \n    def scrape(self, max_pages=10):\n        # Implementation here\n        pass\n```\n\nThis scraper handles relative URLs, avoids revisiting pages, and extracts text from paragraphs.', model: 'gpt-4-turbo', tokens: 2400, attachments: undefined, artifacts: undefined, metadata: { latency: 1200 }, createdAt: new Date(Date.now() - 3500000) },
];

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>('1');
  const [messages, setMessages] = useState<Message[]>(demoMessages);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input, metadata: {}, createdAt: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setTimeout(() => {
      const aiMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: "I'm processing your request. In production, this would stream the AI response in real-time.", metadata: { latency: 800 }, createdAt: new Date() };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-full">
      <div className="w-72 border-r border-border flex-shrink-0">
        <ConversationSidebar conversations={demoConversations} activeId={activeConversationId} onSelect={setActiveConversationId} onNew={() => console.log('New')} />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-4">
            <MessageSquare className="h-5 w-5 text-foreground-secondary" />
            <h1 className="text-lg font-medium">Python Web Scraper Development</h1>
            <ModelSelector models={[]} selectedModel="gpt-4-turbo" onSelect={(model) => console.log(model)} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Share2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} onFeedback={(id, isPositive) => console.log(id, isPositive)} onRetry={(id) => console.log(id)} />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 px-4 py-6 text-foreground-secondary">
              <div className="h-2 w-2 rounded-full bg-accent-blue animate-pulse" />
              <span>AI is thinking...</span>
            </div>
          )}
        </div>

        <ChatInput value={input} onChange={setInput} onSend={handleSend} onStop={() => setIsLoading(false)} isLoading={isLoading} placeholder="Type a message..." />
      </div>
    </div>
  );
}