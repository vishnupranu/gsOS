'use client';

import { useState } from 'react';
import { FileExplorer } from '@ai-os/ui';
import { Button } from '@ai-os/design-system';
import { PanelRight, Terminal, GitBranch, Play, Save, RotateCcw, Bot } from 'lucide-react';

const demoFiles = [
  { id: '1', name: 'src', type: 'folder' as const, children: [
    { id: '2', name: 'components', type: 'folder' as const, children: [
      { id: '3', name: 'Button.tsx', type: 'file' as const },
      { id: '4', name: 'Card.tsx', type: 'file' as const },
    ]},
    { id: '5', name: 'App.tsx', type: 'file' as const },
    { id: '6', name: 'index.tsx', type: 'file' as const },
  ]},
  { id: '7', name: 'package.json', type: 'file' as const },
  { id: '8', name: 'tsconfig.json', type: 'file' as const },
];

const demoCode = `import { Button } from './components/Button';
import { Card } from './components/Card';

interface AppProps {
  title: string;
}

export function App({ title }: AppProps) {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <h1>{title}</h1>
      <Card>
        <p>Count: {count}</p>
        <Button onClick={() => setCount(c => c + 1)}>
          Increment
        </Button>
      </Card>
    </div>
  );
}`;

export default function IDEPage() {
  const [code, setCode] = useState(demoCode);

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-border bg-background-secondary">
        <FileExplorer files={demoFiles} onFileSelect={(file) => console.log('Selected:', file)} selectedFile="App.tsx" />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background-secondary">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8"><Save className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><RotateCcw className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2"><Bot className="h-4 w-4" />AI Assistant</Button>
            <Button variant="secondary" size="sm" className="gap-2"><Play className="h-4 w-4" />Run</Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8"><GitBranch className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><PanelRight className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="flex-1 bg-[#1e1e1e]">
          <textarea value={code} onChange={(e) => setCode(e.target.value)} className="w-full h-full p-4 bg-transparent text-foreground font-mono text-sm resize-none focus:outline-none" spellCheck={false} />
        </div>

        <div className="h-48 border-t border-border bg-[#0d0d0d]">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
            <span className="text-xs text-foreground-secondary">TERMINAL</span>
          </div>
          <div className="p-4 font-mono text-sm text-foreground-secondary">
            <div>$ npm run dev</div>
            <div className="text-accent-green mt-1">Ready - http://localhost:3000</div>
          </div>
        </div>
      </div>
    </div>
  );
}