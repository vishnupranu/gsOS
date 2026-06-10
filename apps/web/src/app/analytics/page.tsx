'use client';

import { Card, CardHeader, CardTitle, CardContent, Badge } from '@ai-os/design-system';
import { TrendingUp, TrendingDown, MessageSquare, Bot, Workflow, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
  const stats = [
    { label: 'Total Messages', value: '12,458', change: '+12%', trend: 'up', icon: MessageSquare, color: 'text-accent-blue' },
    { label: 'Agent Runs', value: '3,891', change: '+8%', trend: 'up', icon: Bot, color: 'text-accent-purple' },
    { label: 'Workflow Runs', value: '892', change: '-3%', trend: 'down', icon: Workflow, color: 'text-accent-cyan' },
    { label: 'Total Cost', value: '$456.78', change: '+15%', trend: 'up', icon: DollarSign, color: 'text-accent-green' },
  ];

  const usageByModel = [
    { model: 'GPT-4 Turbo', messages: 8420, percentage: 67.5, cost: '$289.45' },
    { model: 'Claude 3 Opus', messages: 2156, percentage: 17.3, cost: '$98.23' },
    { model: 'Gemini Pro', messages: 1567, percentage: 12.6, cost: '$52.10' },
    { model: 'DeepSeek V2', messages: 315, percentage: 2.5, cost: '$17.00' },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-foreground-secondary mt-1">Monitor usage and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <Badge className={stat.trend === 'up' ? 'badge-green' : 'badge-red'}>
                  {stat.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {stat.change}
                </Badge>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-foreground-secondary">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Usage by Model</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usageByModel.map((model) => (
                <div key={model.model}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{model.model}</span>
                    <span className="text-sm text-foreground-secondary">{model.messages} msgs · {model.cost}</span>
                  </div>
                  <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                    <div className="h-full bg-accent-blue rounded-full" style={{ width: `${model.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: '2 min ago', action: 'New conversation started', user: 'John D.' },
                { time: '5 min ago', action: 'Agent run completed', user: 'Sarah M.' },
                { time: '12 min ago', action: 'Workflow triggered', user: 'System' },
                { time: '18 min ago', action: 'Document uploaded', user: 'Mike R.' },
                { time: '25 min ago', action: 'New user joined', user: 'Emily S.' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <div className="text-sm">{activity.action}</div>
                    <div className="text-xs text-foreground-secondary">{activity.user}</div>
                  </div>
                  <span className="text-xs text-foreground-tertiary">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}