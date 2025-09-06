import React, { useRef } from 'react';
import { Upload, X, Image } from 'lucide-react';
import { motion } from 'framer-motion';

interface FileInputProps {
  label?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  required?: boolean;
  error?: string;
  className?: string;
  disabled?: boolean;
  preview?: boolean;
}

export const FileInput: React.FC<FileInputProps> = ({
  label,
  value,
  onChange,
  accept = 'image/*',
  required = false,
  error,
  className = '',
  disabled = false,
  preview = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    
    const file = e.dataTransfer.files?.[0] || null;
    if (file && accept.includes(file.type.split('/')[0])) {
      onChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const getPreviewUrl = () => {
    if (value) {
      return URL.createObjectURL(value);
    }
    return null;
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer ${
          error 
            ? 'border-red-300 bg-red-50' 
            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept={accept}
          required={required}
          disabled={disabled}
          className="hidden"
        />
        
        {value ? (
          <div className="space-y-3">
            {preview && value.type.startsWith('image/') && (
              <div className="flex justify-center">
                <img
                  src={getPreviewUrl() || ''}
                  alt="Preview"
                  className="max-w-32 max-h-32 object-cover rounded-lg border"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between bg-white p-3 rounded-md border">
              <div className="flex items-center space-x-2">
                <Image className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 truncate max-w-48">
                  {value.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({(value.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB
            </p>
          </motion.div>
        )}
      </div>
      
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
