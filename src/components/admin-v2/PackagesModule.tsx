import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { AdminGrid } from './AdminGrid';
import { Modal } from './Modal';
import { FormInput } from './FormInput';
import { FormTextarea } from './FormTextarea';
import { FormSelect } from './FormSelect';
import { Button } from './Button';
import { ImageUploadField } from './ImageUploadField';
import { PackageReorderModal } from './PackageReorderModal';
import { useToast } from './Toast';
import { 
  useAllPackages, 
  useCreatePackage, 
  useUpdatePackage, 
  useDeletePackage 
} from '../../src/hooks/usePackages';
import { Loader2, Package, Edit2, Trash2, Plus, IndianRupee, CheckCircle2, ArrowUpDown } from 'lucide-react';
import { motion } from 'motion/react';

export default function PackagesModule() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [features, setFeatures] = useState<string[]>([]);
  const { showToast, ToastContainer } = useToast();

  // React Query hooks
  const { data: packages = [], isLoading } = useAllPackages();
  const createMutation = useCreatePackage();
  const updateMutation = useUpdatePackage();
  const deleteMutation = useDeletePackage();

  const handleEdit = (pkg: any) => {
    setEditingPackage(pkg);
    setImageUrl(pkg.image_url || '');
    setFeatures(pkg.features || []);
    setIsModalOpen(true);
  };

  const handleDelete = async (pkg: any) => {
    if (confirm(`Are you sure you want to delete "${pkg.name}"?`)) {
      try {
        await deleteMutation.mutateAsync(pkg.id);
        showToast('success', 'Package deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        showToast('error', 'Failed to delete package');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const packageData: any = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseInt(formData.get('price') as string),
      features: features,
      image_url: imageUrl || '',
      is_active: formData.get('status') === 'Active',
    };

    try {
      if (editingPackage) {
        await updateMutation.mutateAsync({ 
          id: editingPackage.id, 
          data: packageData 
        });
        showToast('success', 'Package updated successfully');
      } else {
        await createMutation.mutateAsync(packageData);
        showToast('success', 'Package created successfully');
      }
      setIsModalOpen(false);
      setEditingPackage(null);
      setImageUrl('');
      setFeatures([]);
    } catch (error) {
      console.error('Submit error:', error);
      showToast('error', 'Operation failed');
    }
  };

  const handleAddNew = () => {
    setEditingPackage(null);
    setImageUrl('');
    setFeatures([]);
    setIsModalOpen(true);
  };

  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>
              <Loader2 className="mx-auto mb-4" size={48} style={{ color: 'var(--dream-neon-green)' }} />
            </motion.div>
            <p style={{ color: 'var(--dream-text-secondary)' }}>Loading packages...</p>
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
          <h1 className="admin-page-title">Package Management</h1>
          <p className="admin-page-description">
            Manage event packages, pricing, and features for your venue
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsReorderModalOpen(true)} 
            className="admin-btn admin-btn-outline"
            disabled={packages.length === 0}
          >
            <ArrowUpDown size={20} />
            Reorder
          </button>
          <button onClick={handleAddNew} className="admin-btn admin-btn-primary">
            <Plus size={20} />
            Add Package
          </button>
        </div>
      </div>

      {/* Packages Grid - 3/2/1 Column Layout */}
      <AdminGrid columns="3">
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.04, duration: 0.4 }}
            className="admin-card"
          >
            {/* Package Image */}
            {pkg.image_url && (
              <div className="relative h-48 -mx-8 -mt-8 mb-6 overflow-hidden rounded-t-[20px]">
                <img
                  src={pkg.image_url}
                  alt={pkg.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white text-glow">
                      {pkg.name}
                    </h3>
                    {pkg.is_active ? (
                      <span className="admin-badge admin-badge-neon">Active</span>
                    ) : (
                      <span className="admin-badge admin-badge-danger">Inactive</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* No Image Fallback */}
            {!pkg.image_url && (
              <div className="flex items-center justify-between mb-6 pb-6" style={{ borderBottom: '1px solid rgba(0, 255, 65, 0.2)' }}>
                <h3 className="text-2xl font-bold" style={{ color: 'var(--dream-text-primary)' }}>
                  {pkg.name}
                </h3>
                {pkg.is_active ? (
                  <span className="admin-badge admin-badge-neon">Active</span>
                ) : (
                  <span className="admin-badge admin-badge-danger">Inactive</span>
                )}
              </div>
            )}

            {/* Package Description */}
            <p className="mb-6 leading-relaxed" style={{ color: 'var(--dream-text-secondary)' }}>
              {pkg.description}
            </p>

            {/* Pricing */}
            <div className="flex items-center gap-2 mb-6 p-4 rounded-xl" style={{ background: 'rgba(0, 255, 65, 0.1)', border: '1px solid rgba(0, 255, 65, 0.3)' }}>
              <IndianRupee size={24} style={{ color: 'var(--dream-neon-green)' }} />
              <span className="text-3xl font-bold" style={{ color: 'var(--dream-neon-green)' }}>
                {pkg.price?.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Features List */}
            {pkg.features && pkg.features.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-bold uppercase mb-3" style={{ color: 'var(--dream-gold)', letterSpacing: '1px' }}>
                  Features Included
                </h4>
                <ul className="space-y-2">
                  {pkg.features.slice(0, 4).map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--dream-neon-green)' }} />
                      <span className="text-sm" style={{ color: 'var(--dream-text-secondary)' }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                  {pkg.features.length > 4 && (
                    <li className="text-sm italic" style={{ color: 'var(--dream-text-muted)' }}>
                      +{pkg.features.length - 4} more features
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6" style={{ borderTop: '1px solid rgba(0, 255, 65, 0.2)' }}>
              <button
                onClick={() => handleEdit(pkg)}
                className="admin-btn admin-btn-outline admin-btn-sm flex-1"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(pkg)}
                className="admin-btn admin-btn-danger admin-btn-sm flex-1"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </AdminGrid>

      {/* Empty State */}
      {packages.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6" 
               style={{ background: 'rgba(0, 255, 65, 0.1)', border: '2px solid rgba(0, 255, 65, 0.3)' }}>
            <Package size={48} style={{ color: 'var(--dream-neon-green)' }} />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--dream-text-primary)' }}>
            No packages available
          </h3>
          <p style={{ color: 'var(--dream-text-secondary)' }}>
            Create your first event package
          </p>
          <button onClick={handleAddNew} className="admin-btn admin-btn-primary mt-6">
            <Plus size={20} />
            Add First Package
          </button>
        </div>
      )}

      {/* Reorder Modal */}
      <PackageReorderModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        packages={packages}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPackage(null);
          setImageUrl('');
          setFeatures([]);
        }}
        title={editingPackage ? 'Edit Package' : 'Create New Package'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            name="name"
            label="Package Name"
            placeholder="e.g., Premium Wedding Package"
            defaultValue={editingPackage?.name}
            required
          />

          <FormTextarea
            name="description"
            label="Description"
            placeholder="Describe what's included in this package..."
            defaultValue={editingPackage?.description}
            required
          />

          <FormInput
            name="price"
            label="Price (₹)"
            type="number"
            placeholder="e.g., 50000"
            defaultValue={editingPackage?.price}
            required
          />

          <ImageUploadField
            label="Package Image (Optional)"
            value={imageUrl}
            onChange={setImageUrl}
          />

          {/* Features Manager */}
          <div className="admin-form-group">
            <label className="admin-label">Features</label>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    className="admin-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="admin-btn admin-btn-danger admin-btn-icon"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="admin-btn admin-btn-outline admin-btn-sm"
              >
                <Plus size={16} />
                Add Feature
              </button>
            </div>
          </div>

          <FormSelect
            name="status"
            label="Status"
            defaultValue={editingPackage?.is_active ? 'Active' : 'Inactive'}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
            required
          />

          <div className="flex gap-3 justify-end pt-6 border-t" style={{ borderColor: 'rgba(0, 255, 65, 0.2)' }}>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingPackage(null);
                setImageUrl('');
                setFeatures([]);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingPackage ? 'Update Package' : 'Create Package'}
            </Button>
          </div>
        </form>
      </Modal>

      {ToastContainer}
    </AdminLayout>
  );
}