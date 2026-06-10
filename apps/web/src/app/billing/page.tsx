'use client';

import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@ai-os/design-system';
import { Check, CreditCard, Zap, AlertCircle } from 'lucide-react';

const plans = [
  { id: 'free', name: 'Free', price: 0, features: ['3 conversations', '5 agent runs/month', '1 workflow', 'Basic models'] },
  { id: 'pro', name: 'Pro', price: 29, features: ['Unlimited conversations', '100 agent runs/month', '10 workflows', 'All models', 'Priority support'] },
  { id: 'team', name: 'Team', price: 99, features: ['Everything in Pro', '500 agent runs/month', 'Unlimited workflows', 'Team collaboration', 'Admin controls'] },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', features: ['Everything in Team', 'Unlimited usage', 'Custom integrations', 'Dedicated support', 'SLA guarantee'] },
];

export default function BillingPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Billing</h1>
          <p className="text-foreground-secondary mt-1">Manage your subscription and usage</p>
        </div>
        <Button variant="secondary"><CreditCard className="h-4 w-4" />Update Payment</Button>
      </div>

      {/* Current Plan */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-lg font-semibold">Current Plan: Pro</h2>
                <Badge className="badge-green">Active</Badge>
              </div>
              <p className="text-foreground-secondary">Next billing date: January 15, 2025</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">$29<span className="text-sm font-normal text-foreground-secondary">/month</span></div>
              <Button variant="ghost" size="sm">Change Plan</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="p-4"><div className="text-2xl font-bold text-accent-blue">142</div><div className="text-sm text-foreground-secondary">Conversations</div></Card>
        <Card className="p-4"><div className="text-2xl font-bold text-accent-green">67</div><div className="text-sm text-foreground-secondary">Agent Runs <span className="text-foreground-tertiary">/ 100</span></div></Card>
        <Card className="p-4"><div className="text-2xl font-bold text-accent-purple">5</div><div className="text-sm text-foreground-secondary">Workflows <span className="text-foreground-tertiary">/ 10</span></div></Card>
        <Card className="p-4"><div className="text-2xl font-bold text-accent-cyan">$12.45</div><div className="text-sm text-foreground-secondary">This Month</div></Card>
      </div>

      {/* Plans */}
      <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
      <div className="grid grid-cols-4 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.id === 'pro' ? 'border-accent-blue ring-1 ring-accent-blue' : ''}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-2xl font-bold">{plan.price === 'Custom' ? plan.price : `$${plan.price}`}</span>
                {typeof plan.price === 'number' && <span className="text-foreground-secondary">/month</span>}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-accent-green" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant={plan.id === 'pro' ? 'secondary' : 'outline'} className="w-full mt-4">
                {plan.id === 'pro' ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}