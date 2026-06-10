'use client';

import { useState } from 'react';
import { Monitor, Play, Square, Clock, Globe } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@ai-os/design-system';

export default function BrowserPage() {
  const [isRunning, setIsRunning] = useState(false);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Browser Agent</h1>
          <p className="text-foreground-secondary mt-1">Automate web browsing tasks</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary"><Clock className="h-4 w-4" />Schedule</Button>
          <Button className="btn-primary" onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? <><Square className="h-4 w-4" />Stop</> : <><Play className="h-4 w-4" />Start</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Browser Preview */}
        <div className="col-span-2">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background-tertiary rounded-t-lg">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-accent-red" />
                  <div className="h-3 w-3 rounded-full bg-accent-yellow" />
                  <div className="h-3 w-3 rounded-full bg-accent-green" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-2 px-4 py-1 bg-background-primary rounded text-sm text-foreground-secondary">
                    <Globe className="h-4 w-4" />
                    <span>https://example.com</span>
                  </div>
                </div>
              </div>
              <div className="h-[calc(100%-40px)] bg-white p-8 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Monitor className="h-16 w-16 mx-auto mb-4" />
                  <p>Browser preview will appear here</p>
                  <p className="text-sm mt-2">The agent will navigate and interact with websites</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task List */}
        <div>
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle>Active Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { id: 1, task: 'Navigate to Google', status: 'completed' },
                  { id: 2, task: 'Search for "AI tools"', status: 'completed' },
                  { id: 3, task: 'Click first result', status: 'running' },
                  { id: 4, task: 'Extract content', status: 'pending' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-background-tertiary">
                    <div className={`h-2 w-2 rounded-full ${item.status === 'completed' ? 'bg-accent-green' : item.status === 'running' ? 'bg-accent-blue animate-pulse' : 'bg-foreground-muted'}`} />
                    <span className={`text-sm ${item.status === 'running' ? 'font-medium' : ''}`}>{item.task}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="secondary" size="sm" className="w-full justify-start">Take Screenshot</Button>
                  <Button variant="secondary" size="sm" className="w-full justify-start">Extract Data</Button>
                  <Button variant="secondary" size="sm" className="w-full justify-start">Fill Form</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}