import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { AdminGrid } from './AdminGrid';
import { Modal } from './Modal';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import { Button } from './Button';
import { ImageUploadField } from './ImageUploadField';
import { useToast } from './Toast';
import { 
  useGalleryItems, 
  useCreateGalleryItem, 
  useUpdateGalleryItem, 
  useDeleteGalleryItem 
} from '../../src/hooks/useGallery';
import { Loader2, Image as ImageIcon, Edit2, Trash2, Plus } from 'lucide-react';
import { motion } from 'motion/react';

const categoryOptions = [
  { value: 'weddings', label: 'Weddings' },
  { value: 'corporate', label: 'Corporate Events' },
  { value: 'birthdays', label: 'Birthdays' },
  { value: 'receptions', label: 'Receptions' },
  { value: 'conferences', label: 'Conferences' },
  { value: 'other', label: 'Other' },
];

export default function GalleryModule() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [imageUrl, setImageUrl] = useState<string>('');
  const { showToast, ToastContainer } = useToast();

  // React Query hooks
  const { data: galleryImages = [], isLoading } = useGalleryItems();
  const createMutation = useCreateGalleryItem();
  const updateMutation = useUpdateGalleryItem();
  const deleteMutation = useDeleteGalleryItem();

  const handleEdit = (image: any) => {
    setEditingImage(image);
    setImageUrl(image.image_url);
    setIsModalOpen(true);
  };

  const handleDelete = async (image: any) => {
    if (confirm(`Are you sure you want to delete "${image.title || 'this image'}"?`)) {
      try {
        await deleteMutation.mutateAsync(image.id);
        showToast('success', 'Image deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        showToast('error', 'Failed to delete image');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const imageData: any = {
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      image_url: imageUrl,
    };

    if (!imageUrl) {
      showToast('error', 'Please upload an image');
      return;
    }

    try {
      if (editingImage) {
        await updateMutation.mutateAsync({ 
          id: editingImage.id, 
          data: imageData 
        });
        showToast('success', 'Image updated successfully');
      } else {
        await createMutation.mutateAsync(imageData);
        showToast('success', 'Image added successfully');
      }
      setIsModalOpen(false);
      setEditingImage(null);
      setImageUrl('');
    } catch (error) {
      console.error('Submit error:', error);
      showToast('error', 'Operation failed');
    }
  };

  const handleAddNew = () => {
    setEditingImage(null);
    setImageUrl('');
    setIsModalOpen(true);
  };

  // Filter images by category
  const filteredImages = selectedCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>
              <Loader2 className="mx-auto mb-4" size={48} style={{ color: 'var(--dream-neon-green)' }} />
            </motion.div>
            <p style={{ color: 'var(--dream-text-secondary)' }}>Loading gallery...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Gallery Management</h1>
          <p className="admin-page-description">
            Manage your venue's photo gallery across different event categories
          </p>
        </div>
        <button onClick={handleAddNew} className="admin-btn admin-btn-primary">
          <Plus size={20} />
          Add Image
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-3 flex-wrap mb-8">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
            selectedCategory === 'all'
              ? 'bg-gradient-neon text-[var(--dream-dark-bg)] shadow-lg border-glow'
              : 'bg-[var(--dream-dark-secondary)] text-[var(--dream-text-secondary)] border border-[rgba(0,255,65,0.2)] hover:border-[var(--dream-neon-green)] hover:text-[var(--dream-neon-green)]'
          }`}
        >
          All <span className="opacity-75">({galleryImages.length})</span>
        </button>
        {categoryOptions.map(cat => {
          const count = galleryImages.filter(img => img.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                selectedCategory === cat.value
                  ? 'bg-gradient-neon text-[var(--dream-dark-bg)] shadow-lg border-glow'
                  : 'bg-[var(--dream-dark-secondary)] text-[var(--dream-text-secondary)] border border-[rgba(0,255,65,0.2)] hover:border-[var(--dream-neon-green)] hover:text-[var(--dream-neon-green)]'
              }`}
            >
              {cat.label} <span className="opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Gallery Grid - 3/2/1 Column Layout */}
      <AdminGrid columns="3">
        {filteredImages.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.04, duration: 0.4 }}
            className="gallery-item"
          >
            {/* Image */}
            <div className="relative h-60 overflow-hidden">
              <img
                src={image.image_url}
                alt={image.title || 'Gallery image'}
                className="gallery-item-image"
              />
              
              {/* Hover Overlay with Neon Buttons */}
              <div className="gallery-item-overlay">
                <button
                  onClick={() => handleEdit(image)}
                  className="admin-btn admin-btn-primary admin-btn-sm"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(image)}
                  className="admin-btn admin-btn-danger admin-btn-sm"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
            
            {/* Card Footer Info */}
            <div className="gallery-item-info">
              <h4 className="gallery-item-title">
                {image.title || 'Untitled'}
              </h4>
              <div className="flex items-center justify-between mt-2">
                <span className="gallery-item-category">
                  {image.category}
                </span>
                {image.display_order && (
                  <span className="text-xs" style={{ color: 'var(--dream-text-muted)' }}>
                    Order: {image.display_order}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AdminGrid>

      {/* Empty State */}
      {filteredImages.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6" 
               style={{ background: 'rgba(0, 255, 65, 0.1)', border: '2px solid rgba(0, 255, 65, 0.3)' }}>
            <ImageIcon size={48} style={{ color: 'var(--dream-neon-green)' }} />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--dream-text-primary)' }}>
            No images in this category
          </h3>
          <p style={{ color: 'var(--dream-text-secondary)' }}>
            Add images to showcase your venue
          </p>
          <button onClick={handleAddNew} className="admin-btn admin-btn-primary mt-6">
            <Plus size={20} />
            Add First Image
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingImage(null);
          setImageUrl('');
        }}
        title={editingImage ? 'Edit Gallery Image' : 'Add New Gallery Image'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            name="title"
            label="Image Title"
            placeholder="e.g., Elegant Wedding Reception Hall"
            defaultValue={editingImage?.title}
            required
          />

          <FormSelect
            name="category"
            label="Event Category"
            defaultValue={editingImage?.category || 'weddings'}
            options={categoryOptions}
            required
          />

          <ImageUploadField
            label="Upload Image"
            value={imageUrl}
            onChange={setImageUrl}
          />

          <div className="flex gap-3 justify-end pt-6 border-t" style={{ borderColor: 'rgba(0, 255, 65, 0.2)' }}>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingImage(null);
                setImageUrl('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingImage ? 'Update Image' : 'Add Image'}
            </Button>
          </div>
        </form>
      </Modal>

      {ToastContainer}
    </AdminLayout>
  );
}