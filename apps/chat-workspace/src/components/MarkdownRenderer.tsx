'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !className;
            
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-gray-700 text-pink-400 text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
            
            return (
              <div className="rounded-lg overflow-hidden my-4">
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match ? match[1] : 'text'}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    backgroundColor: '#1e1e1e',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                  }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            );
          },
          pre({ children }) {
            return <>{children}</>;
          },
          p({ children }) {
            return <p className="mb-4 leading-relaxed">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-gray-300">{children}</li>;
          },
          a({ href, children }) {
            return (
              <a 
                href={href} 
                className="text-blue-400 hover:text-blue-300 underline" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-gray-600 pl-4 my-4 italic text-gray-400">
                {children}
              </blockquote>
            );
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-4 text-white">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-3 text-white">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-semibold mb-2 text-white">{children}</h3>;
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-gray-700 rounded-lg">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-gray-800">{children}</thead>;
          },
          th({ children }) {
            return <th className="px-4 py-2 text-left text-gray-200 font-semibold border-b border-gray-700">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-2 text-gray-300 border-b border-gray-700">{children}</td>;
          },
          hr() {
            return <hr className="border-gray-700 my-6" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}