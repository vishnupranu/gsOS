'use client';

import { useState } from 'react';
import { Search, Bell, HelpCircle, Moon, Sun, Menu } from 'lucide-react';
import { Button, Input } from '@ai-os/design-system';

export function Topbar() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('light');
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-background-secondary px-6">
      <Button variant="ghost" size="icon" className="lg:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
        <Input placeholder="Search conversations, agents, workflows..." className="pl-9 h-9" />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" title="Help">
          <HelpCircle className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" title="Notifications" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent-red text-[10px] text-white flex items-center justify-center">3</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}