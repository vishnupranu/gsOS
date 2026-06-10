'use client';

import { useState } from 'react';
import { Workflow, Plus, Search, MoreHorizontal, Play, Settings, Trash2, Clock, CheckCircle } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, Badge } from '@ai-os/design-system';

const demoWorkflows = [
  { id: '1', name: 'Content Pipeline', description: 'Automate content creation and publishing', trigger: 'schedule', status: 'active', runs: 156, lastRun: new Date() },
  { id: '2', name: 'Lead Enrichment', description: 'Enrich leads with company data', trigger: 'webhook', status: 'active', runs: 2341, lastRun: new Date(Date.now() - 1800000) },
  { id: '3', name: 'Daily Report', description: 'Generate and send daily reports', trigger: 'schedule', status: 'paused', runs: 89, lastRun: new Date(Date.now() - 172800000) },
];

export default function WorkflowsPage() {
  const [search, setSearch] = useState('');

  const filteredWorkflows = demoWorkflows.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Workflows</h1>
          <p className="text-foreground-secondary mt-1">Visual workflow automation builder</p>
        </div>
        <Button className="btn-primary">
          <Plus className="h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
        <Input placeholder="Search workflows..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkflows.map((workflow) => (
          <Card key={workflow.id} className="hover:border-accent-blue/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-cyan/10">
                    <Workflow className="h-5 w-5 text-accent-cyan" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{workflow.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={workflow.status === 'active' ? 'badge-green' : 'badge-yellow'}>{workflow.status}</Badge>
                      <span className="text-xs text-foreground-tertiary flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {workflow.trigger}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="mt-3">{workflow.description}</CardDescription>
              <div className="flex items-center gap-4 mt-4 text-sm text-foreground-secondary">
                <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-accent-green" /> {workflow.runs} runs</span>
                <span>Last: {workflow.lastRun.toLocaleString()}</span>
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