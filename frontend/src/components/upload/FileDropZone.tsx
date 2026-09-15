import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  UploadCloud,
  FileText,
  Lock,
  X,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';

interface FileDropZoneProps {
  onUpload: (file: File, password?: string) => Promise<void>;
  isUploading: boolean;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ onUpload, isUploading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = ['.pdf', '.csv', '.xlsx', '.xls', '.txt'];

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    const fileName = file.name.toLowerCase();
    const isValid = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMsg('Unsupported format. Please upload PDF, CSV, Excel (.xlsx/.xls), or TXT.');
      return;
    }

    setSelectedFile(file);
    if (fileName.endsWith('.pdf')) {
      setShowPasswordField(true);
    } else {
      setShowPasswordField(false);
      setPassword('');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPassword('');
    setShowPasswordField(false);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile, password.trim() ? password.trim() : undefined);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isPDF = selectedFile?.name.toLowerCase().endsWith('.pdf');
  const isExcel =
    selectedFile?.name.toLowerCase().endsWith('.xlsx') ||
    selectedFile?.name.toLowerCase().endsWith('.xls');

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.csv,.xlsx,.xls,.txt"
        className="hidden"
        onChange={handleFileSelect}
      />

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-primary bg-primary/10 scale-[0.99]'
              : 'border-border hover:border-primary/60 hover:bg-muted/30 bg-card'
          }`}
        >
          <div className="max-w-md mx-auto space-y-3">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Click to browse or drag and drop statement file
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports Bank PDF (encrypted/regular), CSV, Excel spreadsheets, or Plain Text
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground">
                PDF
              </span>
              <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground">
                CSV
              </span>
              <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground">
                XLSX / XLS
              </span>
              <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground">
                TXT
              </span>
            </div>

            {errorMsg && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-destructive pt-2">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
          {/* File Selected Card */}
          <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-accent/40 border border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {isPDF ? (
                  <FileText className="h-5 w-5" />
                ) : isExcel ? (
                  <FileSpreadsheet className="h-5 w-5" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-foreground truncate max-w-[280px] sm:max-w-md">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span className="uppercase font-semibold text-[10px] text-primary">
                    {selectedFile.name.split('.').pop()}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              disabled={isUploading}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* PDF Password Field */}
          {showPasswordField && (
            <div className="space-y-1.5 p-3.5 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  PDF Statement Password (Optional)
                </label>
                <span className="text-[10px] text-muted-foreground">e.g. DOB or PAN</span>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank if statement is not password protected"
                className="h-9 text-xs bg-background"
                disabled={isUploading}
              />
              <p className="text-[10px] text-muted-foreground">
                Passwords are used exclusively in-memory during local parsing and are never stored.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={isUploading}
              className="h-9 text-xs font-medium"
            >
              Choose Different File
            </Button>

            <Button
              size="sm"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="h-9 px-5 text-xs font-semibold gap-2 shadow-sm"
            >
              {isUploading ? (
                <>
                  <UploadCloud className="h-4 w-4 animate-bounce" />
                  <span>Uploading & Sanitizing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Upload & Ingest Statement</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
