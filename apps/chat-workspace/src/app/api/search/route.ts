import { NextRequest, NextResponse } from 'next/server';

// Search interface
interface SearchRequest {
  query: string;
  conversationIds?: string[];
  limit?: number;
  offset?: number;
}

// Simple in-memory search (in production, use a proper search engine)
const conversations: Map<string, { id: string; title: string; messages: Array<{ id: string; content: string; timestamp: Date }> }> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { query, conversationIds, limit = 10, offset = 0 } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const lowerQuery = query.toLowerCase();
    const results: Array<{
      conversationId: string;
      conversationTitle: string;
      messageId: string;
      messageContent: string;
      timestamp: string;
      relevanceScore: number;
    }> = [];

    const idsToSearch = conversationIds?.length 
      ? conversationIds 
      : Array.from(conversations.keys());

    for (const convId of idsToSearch) {
      const conversation = conversations.get(convId);
      if (!conversation) continue;

      for (const message of conversation.messages) {
        const lowerContent = message.content.toLowerCase();
        
        // Calculate relevance score
        let score = 0;
        if (lowerContent === lowerQuery) score = 100;
        else if (lowerContent.startsWith(lowerQuery)) score = 80;
        else if (lowerContent.includes(lowerQuery)) score = 60;
        else {
          // Word matching
          const queryWords = lowerQuery.split(/\s+/);
          const contentWords = lowerContent.split(/\s+/);
          const matchCount = queryWords.filter((w) => contentWords.includes(w)).length;
          score = (matchCount / queryWords.length) * 40;
        }

        if (score > 0) {
          results.push({
            conversationId: convId,
            conversationTitle: conversation.title,
            messageId: message.id,
            messageContent: message.content,
            timestamp: message.timestamp.toISOString(),
            relevanceScore: score,
          });
        }
      }
    }

    // Sort by relevance score
    results.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    const paginatedResults = results.slice(offset, offset + limit);

    return NextResponse.json({
      results: paginatedResults,
      total: results.length,
      query,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Endpoint to index a conversation (called when conversations are saved)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, title, messages } = body;

    if (!conversationId || !messages) {
      return NextResponse.json(
        { error: 'conversationId and messages are required' },
        { status: 400 }
      );
    }

    conversations.set(conversationId, {
      id: conversationId,
      title: title || 'Untitled',
      messages: messages.map((m: { id?: string; content?: string; timestamp?: string }) => ({
        id: m.id || crypto.randomUUID(),
        content: m.content || '',
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Delete conversation from search index
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    conversations.delete(conversationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}