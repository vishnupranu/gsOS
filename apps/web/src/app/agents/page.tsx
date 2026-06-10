'use client';

import { useState } from 'react';
import { Bot, Plus, Search, MoreHorizontal, Play, Settings, Trash2 } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, Badge } from '@ai-os/design-system';

const demoAgents = [
  { id: '1', name: 'Research Agent', description: 'Web research and data gathering agent', type: 'RESEARCH', status: 'active', runs: 245, lastRun: new Date() },
  { id: '2', name: 'Code Assistant', description: 'Programming help and code review', type: 'DEVELOPER', status: 'active', runs: 1024, lastRun: new Date(Date.now() - 3600000) },
  { id: '3', name: 'Marketing Writer', description: 'Content creation and copywriting', type: 'MARKETING', status: 'active', runs: 89, lastRun: new Date(Date.now() - 86400000) },
  { id: '4', name: 'Data Analyst', description: 'Data analysis and visualization', type: 'ANALYST', status: 'inactive', runs: 156, lastRun: new Date(Date.now() - 604800000) },
];

export default function AgentsPage() {
  const [search, setSearch] = useState('');

  const filteredAgents = demoAgents.filter(agent =>
    agent.name.toLowerCase().includes(search.toLowerCase()) ||
    agent.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Agents</h1>
          <p className="text-foreground-secondary mt-1">Create and manage AI agents</p>
        </div>
        <Button className="btn-primary">
          <Plus className="h-4 w-4" />
          Create Agent
        </Button>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
        <Input placeholder="Search agents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className="hover:border-accent-blue/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-purple/10">
                    <Bot className="h-5 w-5 text-accent-purple" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{agent.name}</CardTitle>
                    <Badge className={agent.status === 'active' ? 'badge-green' : 'badge-red'}>{agent.status}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="mt-3">{agent.description}</CardDescription>
              <div className="flex items-center gap-4 mt-4 text-sm text-foreground-secondary">
                <span>{agent.runs} runs</span>
                <span>Last run: {agent.lastRun.toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="secondary" size="sm" className="flex-1">
                  <Play className="h-4 w-4" />
                  Run
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 text-accent-red" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}