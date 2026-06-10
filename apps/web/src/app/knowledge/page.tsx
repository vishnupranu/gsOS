'use client';

import { useState } from 'react';
import { Database, Plus, Search, File, FileText, Table, Globe, Upload } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, Badge } from '@ai-os/design-system';

const demoDocuments = [
  { id: '1', name: 'Product Documentation.pdf', type: 'pdf', size: '2.4 MB', chunks: 156, created: new Date() },
  { id: '2', name: 'API Reference.md', type: 'markdown', size: '128 KB', chunks: 45, created: new Date(Date.now() - 86400000) },
  { id: '3', name: 'Customer Data.csv', type: 'csv', size: '5.6 MB', chunks: 2300, created: new Date(Date.now() - 172800000) },
  { id: '4', name: 'Documentation Site', type: 'website', size: 'N/A', chunks: 890, created: new Date(Date.now() - 604800000) },
];

const typeIcons: Record<string, any> = { pdf: FileText, markdown: File, csv: Table, website: Globe };

export default function KnowledgePage() {
  const [search, setSearch] = useState('');
  const filteredDocs = demoDocuments.filter(doc => doc.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-foreground-secondary mt-1">Manage documents and embeddings</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary"><Upload className="h-4 w-4" />Upload Files</Button>
          <Button className="btn-primary"><Plus className="h-4 w-4" />Add Source</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="p-4"><div className="text-2xl font-bold text-accent-blue">4</div><div className="text-sm text-foreground-secondary">Total Documents</div></Card>
        <Card className="p-4"><div className="text-2xl font-bold text-accent-green">3,391</div><div className="text-sm text-foreground-secondary">Total Chunks</div></Card>
        <Card className="p-4"><div className="text-2xl font-bold text-accent-purple">8.3 MB</div><div className="text-sm text-foreground-secondary">Storage Used</div></Card>
        <Card className="p-4"><div className="text-2xl font-bold text-accent-cyan">1</div><div className="text-sm text-foreground-secondary">Connected Sources</div></Card>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
        <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDocs.map((doc) => {
          const Icon = typeIcons[doc.type] || File;
          return (
            <Card key={doc.id} className="hover:border-accent-blue/50 transition-colors cursor-pointer">
              <CardHeader className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-yellow/10">
                    <Icon className="h-5 w-5 text-accent-yellow" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm truncate">{doc.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="badge-blue">{doc.type.toUpperCase()}</Badge>
                      <span className="text-xs text-foreground-tertiary">{doc.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-foreground-secondary">
                  <span>{doc.chunks} chunks</span>
                  <span>{doc.created.toLocaleDateString()}</span>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}