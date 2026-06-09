'use client';

import { ChatInterface } from '@/components/ChatInterface';

export default function HomePage() {
  return (
    <main className="h-screen flex flex-col">
      <ChatInterface />
    </main>
  );
}