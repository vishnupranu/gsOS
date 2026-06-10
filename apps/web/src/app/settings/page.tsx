'use client';

import { useState } from 'react';
import { Card, CardContent, Button, Input, Badge } from '@ai-os/design-system';
import { User, Key, Bell, Palette, Shield, Globe } from 'lucide-react';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Globe },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-border p-4">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-accent-blue/10 text-accent-blue' : 'text-foreground-secondary hover:bg-background-tertiary hover:text-foreground'}`}>
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-purple text-white text-xl font-bold">JD</div>
                  <Button variant="secondary" size="sm">Change Avatar</Button>
                </div>
                <div className="grid gap-4">
                  <div><label className="text-sm font-medium mb-2 block">Full Name</label><Input defaultValue="John Doe" /></div>
                  <div><label className="text-sm font-medium mb-2 block">Email</label><Input defaultValue="john@example.com" type="email" /></div>
                  <div><label className="text-sm font-medium mb-2 block">Timezone</label>
                    <select className="input">
                      <option>UTC-8 Pacific Time</option>
                      <option>UTC-5 Eastern Time</option>
                      <option>UTC+0 GMT</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end"><Button className="btn-primary">Save Changes</Button></div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold mb-6">API Keys</h2>
            <Card className="mb-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-medium">Production API Key</div>
                    <div className="text-sm text-foreground-secondary font-mono">sk-****-xxxx-xxxx</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">Copy</Button>
                    <Button variant="ghost" size="sm">Revoke</Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground-tertiary">
                  <Badge className="badge-green">Active</Badge>
                  <span>Created 30 days ago</span>
                  <span>·</span>
                  <span>Last used 2 hours ago</span>
                </div>
              </CardContent>
            </Card>
            <Button className="btn-primary">Create New Key</Button>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold mb-6">Appearance</h2>
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">Theme</label>
                  <div className="flex gap-4">
                    <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-accent-blue bg-accent-blue/5">
                      <div className="h-12 w-16 bg-[#0a0a0a] rounded border border-border" />
                      <span className="text-sm font-medium">Dark</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border">
                      <div className="h-12 w-16 bg-white rounded border border-border" />
                      <span className="text-sm">Light</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border">
                      <div className="h-12 w-16 bg-gradient-to-b from-white to-[#0a0a0a] rounded border border-border" />
                      <span className="text-sm">System</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Font Size</label>
                  <select className="input">
                    <option>Small (14px)</option>
                    <option selected>Medium (16px)</option>
                    <option>Large (18px)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {(activeTab === 'notifications' || activeTab === 'security' || activeTab === 'integrations') && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold mb-6 capitalize">{activeTab}</h2>
            <Card><CardContent className="p-6"><p className="text-foreground-secondary">This section is under development.</p></CardContent></Card>
          </div>
        )}
      </div>
    </div>
  );
}