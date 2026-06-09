'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import type { FileAttachment } from '@/types/index';

interface FileUploadProps {
  onFilesUploaded: (files: FileAttachment[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  className?: string;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  error?: string;
}

export function FileUpload({ 
  onFilesUploaded, 
  maxFiles = 5, 
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'text/*': ['.txt', '.md', '.json', '.csv'],
    'application/json': ['.json'],
  },
  className = '',
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newUploadingFiles: UploadingFile[] = acceptedFiles.slice(0, maxFiles).map((file) => ({
      id: nanoid(),
      file,
      progress: 0,
    }));

    setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

    // Process files
    for (const uploadingFile of newUploadingFiles) {
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === uploadingFile.id ? { ...f, progress } : f
            )
          );
        }

        // Read file content
        const content = await readFileAsBase64(uploadingFile.file);
        
        // Create attachment
        const attachment: FileAttachment = {
          id: uploadingFile.id,
          name: uploadingFile.file.name,
          type: uploadingFile.file.type,
          size: uploadingFile.file.size,
          content: content,
          preview: uploadingFile.file.type.startsWith('image/')
            ? content
            : undefined,
        };

        // Remove from uploading and add to results
        setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadingFile.id));
        onFilesUploaded([attachment]);
      } catch (error) {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadingFile.id
              ? { ...f, error: 'Upload failed' }
              : f
          )
        );
      }
    }
  }, [maxFiles, onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
  });

  const removeFile = (id: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className={className}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-3">
          <div className={`p-3 rounded-full ${isDragActive ? 'bg-blue-500/20' : 'bg-gray-800'}`}>
            <Upload className={`w-6 h-6 ${isDragActive ? 'text-blue-400' : 'text-gray-400'}`} />
          </div>
          
          <div>
            <p className="text-gray-200 font-medium">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              or click to select files
            </p>
          </div>
          
          <p className="text-gray-600 text-xs">
            Max {maxFiles} files, up to {Math.round(maxSize / 1024 / 1024)}MB each
          </p>
        </div>
      </div>

      {/* Uploading files */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadingFiles.map((uploadingFile) => (
            <div
              key={uploadingFile.id}
              className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
            >
              <div className="p-2 bg-gray-700 rounded">
                <File className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 truncate">
                  {uploadingFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(uploadingFile.file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              
              {uploadingFile.error ? (
                <span className="text-red-400 text-sm">{uploadingFile.error}</span>
              ) : uploadingFile.progress < 100 ? (
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${uploadingFile.progress}%` }}
                    />
                  </div>
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                </div>
              ) : (
                <span className="text-green-400 text-sm">Done</span>
              )}
              
              <button
                onClick={() => removeFile(uploadingFile.id)}
                className="p-1 text-gray-400 hover:text-gray-200"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper to read file as base64
async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Return data URL for images, base64 for others
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Display component for attached files
interface FileAttachmentListProps {
  attachments: FileAttachment[];
  onRemove?: (id: string) => void;
}

export function FileAttachmentList({ attachments, onRemove }: FileAttachmentListProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700"
        >
          {attachment.preview ? (
            <img
              src={attachment.preview}
              alt={attachment.name}
              className="w-8 h-8 object-cover rounded"
            />
          ) : (
            <File className="w-4 h-4 text-gray-400" />
          )}
          
          <div className="flex flex-col">
            <span className="text-sm text-gray-200 max-w-[150px] truncate">
              {attachment.name}
            </span>
            <span className="text-xs text-gray-500">
              {(attachment.size / 1024).toFixed(1)} KB
            </span>
          </div>
          
          {onRemove && (
            <button
              onClick={() => onRemove(attachment.id)}
              className="p-1 text-gray-400 hover:text-red-400"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}