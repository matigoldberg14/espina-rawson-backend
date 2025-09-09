import React, { useRef } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Upload, X, FileText, Image, Video } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  onFilesChange: (files: FileList | null) => void;
  disabled?: boolean;
  value?: FileList | null;
  description?: string;
  showPreview?: boolean;
}

export default function FileUpload({
  label,
  accept = "image/*,application/pdf",
  multiple = true,
  maxFiles = 10,
  onFilesChange,
  disabled = false,
  value,
  description = "Puedes subir imágenes (JPG, PNG, GIF, WebP) y PDFs",
  showPreview = true,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > maxFiles) {
      alert(`Máximo ${maxFiles} archivos permitidos`);
      return;
    }
    onFilesChange(files);
  };

  const handleClearFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFilesChange(null);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="h-4 w-4 text-blue-500" />;
      default:
        return <Image className="h-4 w-4 text-green-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload">{label}</Label>
      
      <div className="space-y-3">
        {/* Upload Button */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Subir archivos
          </Button>
          
          {value && value.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearFiles}
              disabled={disabled}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>

        {/* Hidden File Input */}
        <Input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />

        {/* File Preview */}
        {showPreview && value && value.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Archivos seleccionados:</Label>
            <div className="border rounded-md p-3 space-y-2 max-h-32 overflow-y-auto">
              {Array.from(value).map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {getFileIcon(file.name)}
                  <span className="flex-1 truncate">{file.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
