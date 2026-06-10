'use client';

import { useState } from 'react';
import { Plug, Plus, Search, RefreshCw, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, Badge } from '@ai-os/design-system';

const demoConnections = [
  { id: '1', name: 'GitHub', type: 'github', status: 'connected', lastSync: new Date(), repos: 12 },
  { id: '2', name: 'Notion', type: 'notion', status: 'connected', lastSync: new Date(Date.now() - 3600000), pages: 45 },
  { id: '3', name: 'Slack', type: 'slack', status: 'connected', lastSync: new Date(Date.now() - 7200000), channels: 8 },
  { id: '4', name: 'Linear', type: 'linear', status: 'disconnected', lastSync: null, issues: 0 },
  { id: '5', name: 'Airtable', type: 'airtable', status: 'connected', lastSync: new Date(Date.now() - 86400000), tables: 3 },
];

export default function MCPPage() {
  const [search, setSearch] = useState('');
  const filteredConnections = demoConnections.filter(conn => conn.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">MCP Connections</h1>
          <p className="text-foreground-secondary mt-1">Manage Model Context Protocol integrations</p>
        </div>
        <Button className="btn-primary"><Plus className="h-4 w-4" />Add Connection</Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="p-4"><div className="text-2xl font-bold text-accent-blue">5</div><div className="text-sm text-foreground-secondary">Total Connections</div></Card>
        <Card className="p-4"><div className="text-2xl font-bold text-accent-green">4</div><div className="text-sm text-foreground-secondary">Connected</div></Card>
        <Card className="p-4"><div className="text-2xl font-bold text-accent-red">1</div><div className="text-sm text-foreground-secondary">Disconnected</div></Card>
        <Card className="p-4"><div className="text-2xl font-bold text-accent-purple">68</div><div className="text-sm text-foreground-secondary">Total Resources</div></Card>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
        <Input placeholder="Search connections..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConnections.map((conn) => (
          <Card key={conn.id} className="hover:border-accent-blue/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${conn.status === 'connected' ? 'bg-accent-green/10' : 'bg-foreground-muted/10'}`}>
                    <Plug className={`h-5 w-5 ${conn.status === 'connected' ? 'text-accent-green' : 'text-foreground-muted'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{conn.name}</CardTitle>
                    <Badge className={conn.status === 'connected' ? 'badge-green' : 'badge-red'}>{conn.status}</Badge>
                  </div>
                </div>
              </div>
              <CardDescription className="mt-3">
                {conn.type === 'github' && `Accessing ${conn.repos} repositories`}
                {conn.type === 'notion' && `Synced ${conn.pages} pages`}
                {conn.type === 'slack' && `Monitoring ${conn.channels} channels`}
                {conn.type === 'linear' && 'No workspaces connected'}
                {conn.type === 'airtable' && `Connected to ${conn.tables} tables`}
              </CardDescription>
              <div className="flex items-center gap-4 mt-4 text-sm text-foreground-secondary">
                {conn.status === 'connected' ? (
                  <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-accent-green" /> Connected</span>
                ) : (
                  <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-accent-red" /> Disconnected</span>
                )}
                {conn.lastSync && <span>Last sync: {conn.lastSync.toLocaleTimeString()}</span>}
              </div>
              <div className="flex gap-2 mt-4">
                {conn.status === 'connected' ? (
                  <Button variant="secondary" size="sm" className="flex-1"><RefreshCw className="h-4 w-4" />Sync Now</Button>
                ) : (
                  <Button className="btn-primary flex-1">Connect</Button>
                )}
                <Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}