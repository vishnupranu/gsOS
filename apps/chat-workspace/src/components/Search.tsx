'use client';

import React, { useState, useCallback } from 'react';
import { Search as SearchIcon, X, Clock, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import type { SearchResult } from '@/types/index';

interface SearchProps {
  onSearch: (query: string) => Promise<SearchResult[]>;
  onSelectResult: (result: SearchResult) => void;
  className?: string;
}

export function Search({ onSearch, onSelectResult, className = '' }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (query.trim().length < 2) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const searchResults = await onSearch(query);
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setIsOpen(false);
  };

  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-500/30 text-yellow-200 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <SearchIcon size={16} />
          <span className="text-sm">Search conversations...</span>
          <kbd className="ml-4 px-2 py-0.5 text-xs bg-gray-700 rounded border border-gray-600">
            ⌘K
          </kbd>
        </button>
      )}

      {/* Search modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Search panel */}
          <div className="relative w-full max-w-2xl mx-4 bg-gray-900 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
              <SearchIcon className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search conversations..."
                className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 outline-none text-lg"
                autoFocus
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="p-1 text-gray-500 hover:text-gray-300"
                >
                  <X size={18} />
                </button>
              )}
              <button
                onClick={handleSearch}
                disabled={isSearching || query.trim().length < 2}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {!hasSearched && (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Type to search your conversation history</p>
                  <p className="text-sm mt-1">Press Enter to search</p>
                </div>
              )}

              {hasSearched && results.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No results found for &ldquo;{query}&rdquo;</p>
                  <p className="text-sm mt-1">Try different keywords</p>
                </div>
              )}

              {results.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wide">
                    {results.length} result{results.length !== 1 ? 's' : ''}
                  </div>
                  
                  {results.map((result, index) => (
                    <button
                      key={`${result.conversationId}-${result.messageId}`}
                      onClick={() => {
                        onSelectResult(result);
                        setIsOpen(false);
                      }}
                      className="w-full p-3 text-left rounded-lg hover:bg-gray-800 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-800 rounded-lg">
                          <MessageSquare className="w-4 h-4 text-gray-400" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-200 truncate">
                              {result.conversationTitle}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              {format(new Date(result.timestamp), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          
                          <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                            {highlightMatch(
                              result.messageContent.length > 200 
                                ? result.messageContent.slice(0, 200) + '...'
                                : result.messageContent,
                              query
                            )}
                          </p>
                        </div>
                        
                        <span className="text-xs text-gray-600 group-hover:text-gray-400">
                          #{index + 1}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-800 bg-gray-900/50">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Enter</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Esc</kbd>
                  Close
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for keyboard shortcut
export function useSearchShortcut(onOpen: () => void) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onOpen]);
}