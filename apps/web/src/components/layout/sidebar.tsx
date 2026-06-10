'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Bot, Code, Workflow, Database, Plug, Monitor, Users, Settings, CreditCard, BarChart3, Shield, ChevronDown } from 'lucide-react';
import { cn } from '@ai-os/design-system';

const navigation = [
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Agents', href: '/agents', icon: Bot },
  { name: 'IDE', href: '/ide', icon: Code },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
  { name: 'Knowledge', href: '/knowledge', icon: Database },
  { name: 'MCP', href: '/mcp', icon: Plug },
  { name: 'Browser', href: '/browser', icon: Monitor },
  { name: 'Team', href: '/team', icon: Users },
];

const secondaryNavigation = [
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Admin', href: '/admin', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-background-secondary border-r border-border">
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue text-white font-bold">AI</div>
        <span className="text-lg font-semibold">AI OS</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.name} href={item.href} className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-accent-blue/10 text-accent-blue' : 'text-foreground-secondary hover:bg-background-tertiary hover:text-foreground'
              )}>
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.name} href={item.href} className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-accent-blue/10 text-accent-blue' : 'text-foreground-secondary hover:bg-background-tertiary hover:text-foreground'
                )}>
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="border-t border-border p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-background-tertiary transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-purple text-white text-sm font-medium">JD</div>
          <div className="flex-1 text-left">
            <p className="font-medium">John Doe</p>
            <p className="text-xs text-foreground-tertiary">Pro Plan</p>
          </div>
          <ChevronDown className="h-4 w-4 text-foreground-tertiary" />
        </button>
      </div>
    </div>
  );
}