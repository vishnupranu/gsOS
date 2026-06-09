'use client';

import React, { useState } from 'react';
import { Copy, Check, Edit2, Save, X, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeArtifactProps {
  id: string;
  title: string;
  code: string;
  language?: string;
  onUpdate?: (id: string, newCode: string) => void;
  onDelete?: (id: string) => void;
}

export function CodeArtifact({ id, title, code, language = 'typescript', onUpdate, onDelete }: CodeArtifactProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(code);
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(id, editedCode);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedCode(code);
    setIsEditing(false);
  };

  const handleDownload = () => {
    const ext = language === 'typescript' ? 'ts' : language === 'javascript' ? 'js' : language;
    const filename = `${title.toLowerCase().replace(/\s+/g, '-')}.${ext}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 overflow-hidden my-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-gray-200"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>
          <span className="text-sm font-medium text-gray-200">{title}</span>
          <span className="text-xs text-gray-500 px-2 py-0.5 rounded bg-gray-700">
            {language}
          </span>
        </div>
        
        {!isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1.5 text-gray-400 hover:text-gray-200 rounded hover:bg-gray-700"
              title="Copy code"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 text-gray-400 hover:text-gray-200 rounded hover:bg-gray-700"
              title="Download"
            >
              <Download size={14} />
            </button>
            {onUpdate && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-gray-400 hover:text-gray-200 rounded hover:bg-gray-700"
                title="Edit"
              >
                <Edit2 size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(id)}
                className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-gray-700"
                title="Delete"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="relative">
          {isEditing ? (
            <div className="p-4">
              <textarea
                value={editedCode}
                onChange={(e) => setEditedCode(e.target.value)}
                className="w-full min-h-[200px] p-4 bg-gray-950 text-gray-100 rounded border border-gray-700 font-mono text-sm resize-y focus:outline-none focus:border-blue-500"
                spellCheck={false}
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 rounded border border-gray-600 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded flex items-center gap-1.5"
                >
                  <Save size={14} />
                  Save
                </button>
              </div>
            </div>
          ) : (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={language}
              customStyle={{
                margin: 0,
                padding: '1rem',
                backgroundColor: '#1e1e1e',
                fontSize: '0.875rem',
                lineHeight: '1.5',
              }}
              showLineNumbers
              lineNumberStyle={{
                color: '#6e7681',
                minWidth: '2.5em',
              }}
            >
              {code}
            </SyntaxHighlighter>
          )}
        </div>
      )}
    </div>
  );
}