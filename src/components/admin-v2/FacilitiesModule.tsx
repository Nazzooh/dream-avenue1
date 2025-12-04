// Dream Avenue — Enhanced Admin Facilities Management with Image Support
// Pastel Luxury Theme with Full CRUD + Supabase Image Storage
import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { AdminGrid } from './AdminGrid';
import { Modal } from './Modal';
import { FormInput } from './FormInput';
import { FormTextarea } from './FormTextarea';
import { FormSelect } from './FormSelect';
import { ImageUploadField } from './ImageUploadField';
import { Button } from './Button';
import { useToast } from './Toast';
import { 
  useFacilities, 
  useCreateFacility, 
  useUpdateFacility, 
  useDeleteFacility 
} from '../../src/hooks/useFacilities';
import { 
  Loader2, 
  Sparkles, 
  Building2, 
  Trees, 
  Sunset, 
  Utensils, 
  Car, 
  Music, 
  Wind, 
  Edit2, 
  Trash2, 
  Plus,
  Image as ImageIcon,
  Grid3x3,
  List,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const iconOptions = [
  { value: 'sparkles', label: '✨ Sparkles', Icon: Sparkles },
  { value: 'building', label: '🏢 Building', Icon: Building2 },
  { value: 'trees', label: '🌳 Trees', Icon: Trees },
  { value: 'sunset', label: '🌅 Sunset', Icon: Sunset },
  { value: 'utensils', label: '🍴 Utensils', Icon: Utensils },
  { value: 'car', label: '🚗 Parking', Icon: Car },
  { value: 'music', label: '🎵 Music', Icon: Music },
  { value: 'wind', label: '💨 AC', Icon: Wind },
];

const getIcon = (iconName: string) => {
  const option = iconOptions.find(opt => opt.value === iconName);
  return option ? option.Icon : Sparkles;
};

type ViewMode = 'grid' | 'table';

export default function FacilitiesModule() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { showToast, ToastContainer } = useToast();

  // React Query hooks
  const { data: facilities = [], isLoading } = useFacilities();
  const createMutation = useCreateFacility();
  const updateMutation = useUpdateFacility();
  const deleteMutation = useDeleteFacility();

  const handleEdit = (facility: any) => {
    setEditingFacility(facility);
    setImageUrl(facility.image_url || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (facility: any) => {
    if (confirm(`Are you sure you want to delete "${facility.title}"?`)) {
      try {
        await deleteMutation.mutateAsync(facility.id);
        showToast('success', '✅ Facility deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        showToast('error', '❌ Failed to delete facility');
      }
    }
  };

  const handleToggleActive = async (facility: any) => {
    try {
      await updateMutation.mutateAsync({
        id: facility.id,
        data: { is_active: !facility.is_active }
      });
      showToast('success', `✅ Facility ${!facility.is_active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Toggle error:', error);
      showToast('error', '❌ Failed to update status');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const facilityData: any = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      icon: formData.get('icon') as string,
      image_url: imageUrl,
      is_active: formData.get('status') === 'Active',
    };

    try {
      if (editingFacility) {
        await updateMutation.mutateAsync({ 
          id: editingFacility.id, 
          data: facilityData 
        });
        showToast('success', '✅ Facility updated successfully');
      } else {
        await createMutation.mutateAsync(facilityData);
        showToast('success', '✅ Facility created successfully');
      }
      setIsModalOpen(false);
      setEditingFacility(null);
      setImageUrl(null);
    } catch (error) {
      console.error('Submit error:', error);
      showToast('error', '❌ Operation failed');
    }
  };

  const handleAddNew = () => {
    setEditingFacility(null);
    setImageUrl(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFacility(null);
    setImageUrl(null);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>
              <Loader2 className="mx-auto mb-4" size={48} style={{ color: 'var(--dream-neon-green)' }} />
            </motion.div>
            <p style={{ color: 'var(--dream-text-secondary)' }}>Loading facilities...</p>
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
          <h1 className="admin-page-title">Facilities Management</h1>
          <p className="admin-page-description">
            Manage and update the Dream Avenue facilities displayed on the main website
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div 
            className="flex items-center rounded-xl p-1"
            style={{
              background: 'rgba(0, 255, 65, 0.1)',
              border: '1px solid rgba(0, 255, 65, 0.2)',
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              className="px-3 py-2 rounded-lg transition-all flex items-center gap-2"
              style={{
                background: viewMode === 'grid' ? 'var(--dream-neon-green)' : 'transparent',
                color: viewMode === 'grid' ? '#1a1a1a' : 'var(--dream-text-secondary)',
                fontWeight: viewMode === 'grid' ? 600 : 400,
              }}
            >
              <Grid3x3 size={16} />
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className="px-3 py-2 rounded-lg transition-all flex items-center gap-2"
              style={{
                background: viewMode === 'table' ? 'var(--dream-neon-green)' : 'transparent',
                color: viewMode === 'table' ? '#1a1a1a' : 'var(--dream-text-secondary)',
                fontWeight: viewMode === 'table' ? 600 : 400,
              }}
            >
              <List size={16} />
              Table
            </button>
          </div>

          <button onClick={handleAddNew} className="admin-btn admin-btn-primary">
            <Plus size={20} />
            Add Facility
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <AdminGrid columns="3">
          {facilities.map((facility, index) => {
            const IconComponent = getIcon(facility.icon);
            return (
              <motion.div
                key={facility.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04, duration: 0.4 }}
                className="admin-card group"
                style={{ overflow: 'hidden' }}
              >
                {/* Facility Image */}
                {facility.image_url ? (
                  <div 
                    className="relative w-full mb-4 rounded-xl overflow-hidden"
                    style={{
                      height: '180px',
                      border: '2px solid rgba(0, 255, 65, 0.2)',
                      boxShadow: '0 4px 15px rgba(0, 255, 65, 0.1)',
                    }}
                  >
                    <img
                      src={facility.image_url}
                      alt={facility.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                      style={{
                        background: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <ImageIcon size={40} style={{ color: 'var(--dream-neon-green)' }} />
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full mb-4 rounded-xl flex items-center justify-center"
                    style={{
                      height: '180px',
                      background: 'linear-gradient(135deg, rgba(0, 255, 65, 0.1), rgba(224, 192, 151, 0.1))',
                      border: '2px dashed rgba(0, 255, 65, 0.3)',
                    }}
                  >
                    <div className="text-center">
                      <ImageIcon size={48} style={{ color: 'var(--dream-text-tertiary)', margin: '0 auto 8px' }} />
                      <p style={{ fontSize: '0.75rem', color: 'var(--dream-text-tertiary)' }}>No image</p>
                    </div>
                  </div>
                )}

                {/* Icon & Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(0, 255, 65, 0.2), rgba(224, 192, 151, 0.2))',
                        border: '2px solid rgba(0, 255, 65, 0.4)',
                      }}
                    >
                      <IconComponent size={24} style={{ color: 'var(--dream-neon-green)' }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {facility.is_active ? (
                      <span className="admin-badge admin-badge-neon">Active</span>
                    ) : (
                      <span className="admin-badge admin-badge-danger">Hidden</span>
                    )}
                  </div>
                </div>

                {/* Facility Title */}
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--dream-text-primary)' }}>
                  {facility.title}
                </h3>

                {/* Description */}
                <p 
                  className="mb-4 leading-relaxed line-clamp-2" 
                  style={{ 
                    color: 'var(--dream-text-secondary)',
                    fontSize: '0.875rem',
                    minHeight: '40px',
                  }}
                >
                  {facility.description || 'No description'}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4" style={{ borderTop: '1px solid rgba(0, 255, 65, 0.2)' }}>
                  <button
                    onClick={() => handleToggleActive(facility)}
                    className="admin-btn admin-btn-sm flex-1 flex items-center justify-center gap-2"
                    style={{
                      background: facility.is_active ? 'rgba(231, 76, 60, 0.1)' : 'rgba(0, 255, 65, 0.1)',
                      color: facility.is_active ? '#E74C3C' : 'var(--dream-neon-green)',
                      border: `1px solid ${facility.is_active ? 'rgba(231, 76, 60, 0.3)' : 'rgba(0, 255, 65, 0.3)'}`,
                    }}
                  >
                    {facility.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                    {facility.is_active ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => handleEdit(facility)}
                    className="admin-btn admin-btn-outline admin-btn-sm flex-1"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(facility)}
                    className="admin-btn admin-btn-danger admin-btn-sm"
                    style={{ minWidth: '44px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AdminGrid>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div 
          className="admin-card"
          style={{ 
            padding: 0, 
            overflow: 'hidden',
            border: '1px solid rgba(0, 255, 65, 0.2)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0, 255, 65, 0.05)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid rgba(0, 255, 65, 0.2)', color: 'var(--dream-text-primary)', fontWeight: 600 }}>
                    Image
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid rgba(0, 255, 65, 0.2)', color: 'var(--dream-text-primary)', fontWeight: 600 }}>
                    Title
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid rgba(0, 255, 65, 0.2)', color: 'var(--dream-text-primary)', fontWeight: 600 }}>
                    Description
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid rgba(0, 255, 65, 0.2)', color: 'var(--dream-text-primary)', fontWeight: 600 }}>
                    Status
                  </th>
                  <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid rgba(0, 255, 65, 0.2)', color: 'var(--dream-text-primary)', fontWeight: 600 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((facility, index) => {
                  const IconComponent = getIcon(facility.icon);
                  return (
                    <motion.tr
                      key={facility.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}
                      style={{ borderBottom: '1px solid rgba(0, 255, 65, 0.1)' }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div className="flex items-center gap-3">
                          {facility.image_url ? (
                            <img
                              src={facility.image_url}
                              alt={facility.title}
                              className="rounded-lg object-cover"
                              style={{ width: '80px', height: '60px', border: '1px solid rgba(0, 255, 65, 0.2)' }}
                            />
                          ) : (
                            <div
                              className="rounded-lg flex items-center justify-center"
                              style={{
                                width: '80px',
                                height: '60px',
                                background: 'rgba(0, 255, 65, 0.05)',
                                border: '1px dashed rgba(0, 255, 65, 0.3)',
                              }}
                            >
                              <ImageIcon size={24} style={{ color: 'var(--dream-text-tertiary)' }} />
                            </div>
                          )}
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                              background: 'linear-gradient(135deg, rgba(0, 255, 65, 0.2), rgba(224, 192, 151, 0.2))',
                              border: '1px solid rgba(0, 255, 65, 0.3)',
                            }}
                          >
                            <IconComponent size={20} style={{ color: 'var(--dream-neon-green)' }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--dream-text-primary)' }}>
                          {facility.title}
                        </div>
                      </td>
                      <td style={{ padding: '16px', maxWidth: '300px' }}>
                        <div 
                          className="line-clamp-2" 
                          style={{ 
                            color: 'var(--dream-text-secondary)', 
                            fontSize: '0.875rem',
                          }}
                        >
                          {facility.description || 'No description'}
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        {facility.is_active ? (
                          <span className="admin-badge admin-badge-neon">Active</span>
                        ) : (
                          <span className="admin-badge admin-badge-danger">Hidden</span>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleToggleActive(facility)}
                            className="admin-btn admin-btn-sm"
                            style={{
                              background: facility.is_active ? 'rgba(231, 76, 60, 0.1)' : 'rgba(0, 255, 65, 0.1)',
                              color: facility.is_active ? '#E74C3C' : 'var(--dream-neon-green)',
                              border: `1px solid ${facility.is_active ? 'rgba(231, 76, 60, 0.3)' : 'rgba(0, 255, 65, 0.3)'}`,
                            }}
                          >
                            {facility.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            onClick={() => handleEdit(facility)}
                            className="admin-btn admin-btn-outline admin-btn-sm"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(facility)}
                            className="admin-btn admin-btn-danger admin-btn-sm"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {facilities.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6" 
               style={{ background: 'rgba(0, 255, 65, 0.1)', border: '2px solid rgba(0, 255, 65, 0.3)' }}>
            <Sparkles size={48} style={{ color: 'var(--dream-neon-green)' }} />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--dream-text-primary)' }}>
            No facilities available
          </h3>
          <p style={{ color: 'var(--dream-text-secondary)' }}>
            Add facilities to showcase your venue's amenities
          </p>
          <button onClick={handleAddNew} className="admin-btn admin-btn-primary mt-6">
            <Plus size={20} />
            Add First Facility
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingFacility ? 'Edit Facility' : 'Add New Facility'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <ImageUploadField
            label="Facility Image"
            value={imageUrl}
            onChange={setImageUrl}
            facilityId={editingFacility?.id}
            bucket="facilities_images"
            maxSize={5}
          />

          <FormInput
            name="title"
            label="Facility Name"
            placeholder="e.g., Ample Parking Space"
            defaultValue={editingFacility?.title}
            required
          />

          <FormTextarea
            name="description"
            label="Description"
            placeholder="Describe this facility..."
            defaultValue={editingFacility?.description}
            required
          />

          <FormSelect
            name="icon"
            label="Icon"
            defaultValue={editingFacility?.icon || 'sparkles'}
            options={iconOptions}
            required
          />

          <FormSelect
            name="status"
            label="Status"
            defaultValue={editingFacility?.is_active ? 'Active' : 'Inactive'}
            options={[
              { value: 'Active', label: 'Active - Show on website' },
              { value: 'Inactive', label: 'Inactive - Hide from website' },
            ]}
            required
          />

          <div className="flex gap-3 justify-end pt-6 border-t" style={{ borderColor: 'rgba(0, 255, 65, 0.2)' }}>
            <Button 
              type="button" 
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <>
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>
                    <Loader2 size={16} />
                  </motion.div>
                  Saving...
                </>
              ) : (
                editingFacility ? 'Update Facility' : 'Add Facility'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {ToastContainer}
    </AdminLayout>
  );
}