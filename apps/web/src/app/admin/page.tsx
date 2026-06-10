'use client';

import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@ai-os/design-system';
import { Users, Building2, Bot, Workflow, Activity, Shield, Database, AlertTriangle } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-foreground-secondary mt-1">System administration and monitoring</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary"><Activity className="h-4 w-4" />System Health</Button>
          <Button variant="secondary"><Shield className="h-4 w-4" />Audit Logs</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="p-4 cursor-pointer hover:border-accent-blue/50"><Users className="h-6 w-6 text-accent-blue mb-2" /><div className="text-2xl font-bold">1,234</div><div className="text-sm text-foreground-secondary">Total Users</div></Card>
        <Card className="p-4 cursor-pointer hover:border-accent-blue/50"><Building2 className="h-6 w-6 text-accent-green mb-2" /><div className="text-2xl font-bold">89</div><div className="text-sm text-foreground-secondary">Organizations</div></Card>
        <Card className="p-4 cursor-pointer hover:border-accent-blue/50"><Bot className="h-6 w-6 text-accent-purple mb-2" /><div className="text-2xl font-bold">456</div><div className="text-sm text-foreground-secondary">Active Agents</div></Card>
        <Card className="p-4 cursor-pointer hover:border-accent-blue/50"><Workflow className="h-6 w-6 text-accent-cyan mb-2" /><div className="text-2xl font-bold">234</div><div className="text-sm text-foreground-secondary">Active Workflows</div></Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader><CardTitle>Recent Users</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Alice Johnson', email: 'alice@example.com', org: 'Acme Corp', time: '2 min ago' },
                { name: 'Bob Smith', email: 'bob@example.com', org: 'TechStart', time: '15 min ago' },
                { name: 'Carol White', email: 'carol@example.com', org: 'BigCo', time: '1 hour ago' },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue/10 text-accent-blue text-sm font-medium">{user.name.split(' ').map(n => n[0]).join('')}</div>
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-foreground-secondary">{user.email}</div>
                    </div>
                  </div>
                  <span className="text-xs text-foreground-tertiary">{user.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader><CardTitle>System Health</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'API Server', status: 'healthy', latency: '45ms' },
                { name: 'Database', status: 'healthy', latency: '12ms' },
                { name: 'AI Gateway', status: 'healthy', latency: '180ms' },
                { name: 'Vector DB', status: 'warning', latency: '890ms' },
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-foreground-secondary" />
                    <span className="text-sm">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={service.status === 'healthy' ? 'badge-green' : 'badge-yellow'}>
                      {service.status === 'healthy' ? '●' : <AlertTriangle className="h-3 w-3" />} {service.status}
                    </Badge>
                    <span className="text-xs text-foreground-tertiary">{service.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card>
          <CardHeader><CardTitle>Feature Flags</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'New Chat UI', enabled: true },
                { name: 'Browser Agent', enabled: true },
                { name: 'Workflow Templates', enabled: false },
                { name: 'Advanced Analytics', enabled: false },
              ].map((flag, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm">{flag.name}</span>
                  <input type="checkbox" checked={flag.enabled} className="h-4 w-4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" className="justify-start"><Users className="h-4 w-4 mr-2" />Manage Users</Button>
              <Button variant="secondary" className="justify-start"><Building2 className="h-4 w-4 mr-2" />Manage Orgs</Button>
              <Button variant="secondary" className="justify-start"><Bot className="h-4 w-4 mr-2" />Model Config</Button>
              <Button variant="secondary" className="justify-start"><Shield className="h-4 w-4 mr-2" />Security</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}