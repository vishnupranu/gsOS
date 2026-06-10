'use client';

import { useState } from 'react';
import { Users, Plus, Search, Shield, Mail, MoreHorizontal } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from '@ai-os/design-system';

const teamMembers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Owner', status: 'active', avatar: 'JD' },
  { id: '2', name: 'Sarah Miller', email: 'sarah@example.com', role: 'Admin', status: 'active', avatar: 'SM' },
  { id: '3', name: 'Mike Chen', email: 'mike@example.com', role: 'Member', status: 'active', avatar: 'MC' },
  { id: '4', name: 'Emily Scott', email: 'emily@example.com', role: 'Member', status: 'invited', avatar: 'ES' },
];

export default function TeamPage() {
  const [search, setSearch] = useState('');

  const filteredMembers = teamMembers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-foreground-secondary mt-1">Manage team members and permissions</p>
        </div>
        <Button className="btn-primary">
          <Plus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="p-4"><div className="text-2xl font-bold text-accent-blue">4</div><div className="text-sm text-foreground-secondary">Total Members</div></Card>
        <Card className="p-4"><div className="text-2xl font-bold text-accent-green">3</div><div className="text-sm text-foreground-secondary">Active</div></Card>
        <Card className="p-4"><div className="text-2xl font-bold text-accent-yellow">1</div><div className="text-sm text-foreground-secondary">Pending Invite</div></Card>
        <Card className="p-4"><div className="text-2xl font-bold text-accent-purple">2</div><div className="text-sm text-foreground-secondary">Admins</div></Card>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
        <Input placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-purple text-white font-medium">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-foreground-secondary flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={member.role === 'Owner' ? 'badge-blue' : member.role === 'Admin' ? 'badge-green' : 'badge-yellow'}>
                    {member.role === 'Owner' && <Shield className="h-3 w-3 mr-1" />}
                    {member.role}
                  </Badge>
                  <Badge className={member.status === 'active' ? 'badge-green' : 'badge-yellow'}>{member.status}</Badge>
                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}