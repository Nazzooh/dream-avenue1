// Enhanced Image Upload Field with Supabase Storage Integration
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../../utils/supabase/client';

interface ImageUploadFieldProps {
  label: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  onUpload?: (file: File) => Promise<string>;
  bucket?: string;
  folder?: string;
  facilityId?: string;
  error?: string;
  maxSize?: number; // in MB
  accept?: string;
}

export function ImageUploadField({ 
  label, 
  value, 
  onChange, 
  onUpload,
  bucket = 'facilities_images',
  folder = '',
  facilityId,
  error,
  maxSize = 5,
  accept = 'image/jpeg,image/png,image/webp,image/jpg'
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string>(value || '');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      return;
    }

    setUploadError('');
    setUploading(true);
    setUploadProgress(10);

    try {
      // Create preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setUploadProgress(30);
      };
      reader.readAsDataURL(file);

      let publicUrl: string;

      if (onUpload) {
        // Use custom upload handler
        publicUrl = await onUpload(file);
      } else {
        // Default Supabase upload
        const fileExt = file.name.split('.').pop();
        const fileName = `${facilityId || Date.now()}-${Date.now()}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        setUploadProgress(50);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        setUploadProgress(80);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        publicUrl = urlData.publicUrl;
      }

      setUploadProgress(100);
      setUploadSuccess(true);
      onChange(publicUrl);

      // Reset success state after animation
      setTimeout(() => {
        setUploadSuccess(false);
      }, 2000);

    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload image');
      setPreview('');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = async () => {
    if (value && value.startsWith('http')) {
      // Optionally delete from storage
      try {
        const urlParts = value.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = folder ? `${folder}/${fileName}` : fileName;
        
        await supabase.storage
          .from(bucket)
          .remove([filePath]);
      } catch (err) {
        console.error('Error removing file:', err);
      }
    }
    
    setPreview('');
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReplaceClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <label className="block font-medium" style={{ color: 'var(--dream-text-primary)', fontSize: '0.875rem' }}>
        {label}
      </label>

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative group"
          >
            {/* Image Preview */}
            <div 
              className="relative w-full rounded-2xl overflow-hidden"
              style={{
                height: '200px',
                border: '2px solid rgba(0, 255, 65, 0.3)',
                boxShadow: '0 4px 20px rgba(0, 255, 65, 0.15)',
              }}
            >
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
                style={{ transition: 'transform 0.3s ease' }}
              />
              
              {/* Upload Progress Overlay */}
              {uploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>
                    <Loader2 className="mb-3" size={40} style={{ color: 'var(--dream-neon-green)' }} />
                  </motion.div>
                  <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--dream-neon-green), #98CD00)',
                      }}
                    />
                  </div>
                  <p className="text-white text-sm mt-2">Uploading... {uploadProgress}%</p>
                </motion.div>
              )}

              {/* Success Overlay */}
              {uploadSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ 
                    background: 'rgba(0, 255, 65, 0.9)',
                  }}
                >
                  <div className="text-center">
                    <Check size={60} style={{ color: '#1a1a1a', margin: '0 auto' }} />
                    <p className="text-lg font-semibold mt-2" style={{ color: '#1a1a1a' }}>Uploaded!</p>
                  </div>
                </motion.div>
              )}

              {/* Hover Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center gap-3"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(4px)',
                  transition: 'opacity 0.3s ease'
                }}
              >
                <button
                  type="button"
                  onClick={handleReplaceClick}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, var(--dream-neon-green), #98CD00)',
                    color: '#1a1a1a',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  <Upload size={16} />
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                  style={{
                    background: 'rgba(231, 76, 60, 0.9)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  <X size={16} />
                  Remove
                </button>
              </motion.div>
            </div>

            {/* File Info */}
            {value && (
              <div 
                className="mt-2 px-3 py-2 rounded-lg flex items-center gap-2"
                style={{
                  background: 'rgba(0, 255, 65, 0.1)',
                  border: '1px solid rgba(0, 255, 65, 0.2)',
                }}
              >
                <Check size={16} style={{ color: 'var(--dream-neon-green)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--dream-text-secondary)' }}>
                  Image uploaded successfully
                </span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.label
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="block cursor-pointer"
            style={{
              height: '200px',
              border: '2px dashed rgba(0, 255, 65, 0.3)',
              borderRadius: '16px',
              background: 'rgba(0, 255, 65, 0.05)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--dream-neon-green)';
              e.currentTarget.style.background = 'rgba(0, 255, 65, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 255, 65, 0.3)';
              e.currentTarget.style.background = 'rgba(0, 255, 65, 0.05)';
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 255, 65, 0.2), rgba(224, 192, 151, 0.2))',
                  border: '2px solid rgba(0, 255, 65, 0.4)',
                }}
              >
                <Upload size={32} style={{ color: 'var(--dream-neon-green)' }} />
              </div>
              <div className="text-center">
                <p className="font-semibold mb-1" style={{ color: 'var(--dream-text-primary)' }}>
                  Click to upload image
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--dream-text-secondary)' }}>
                  PNG, JPG, WebP up to {maxSize}MB
                </p>
              </div>
            </div>
          </motion.label>
        )}
      </AnimatePresence>

      {/* Hidden file input for replace functionality */}
      {preview && (
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      )}

      {/* Error Message */}
      {(error || uploadError) && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{
            fontSize: '0.75rem',
            color: '#E74C3C',
            background: 'rgba(231, 76, 60, 0.1)',
            border: '1px solid rgba(231, 76, 60, 0.2)',
          }}
        >
          <X size={14} />
          {error || uploadError}
        </motion.p>
      )}
    </div>
  );
}