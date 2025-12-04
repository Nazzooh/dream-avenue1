import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useReorderPackages } from '../../src/hooks/usePackages';
import { Package } from '../../src/schemas/packages';
import { GripVertical, IndianRupee, Loader2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';

// Utility to reorder items locally
const reorder = (list: Package[], startIndex: number, endIndex: number): Package[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

interface PackageReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: Package[];
}

export function PackageReorderModal({ isOpen, onClose, packages }: PackageReorderModalProps) {
  const [items, setItems] = useState<Package[]>([]);
  const reorderMutation = useReorderPackages();

  // Initialize items when modal opens or packages change
  useEffect(() => {
    if (isOpen && packages.length > 0) {
      setItems([...packages]);
    }
  }, [isOpen, packages]);

  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newOrder = reorder(
      items,
      result.source.index,
      result.destination.index
    );

    setItems(newOrder);
  };

  const handleSaveOrder = async () => {
    // Create updates array with new order_index values
    const updates = items.map((pkg, index) => ({
      id: pkg.id!,
      order_index: index + 1,
    }));

    try {
      await reorderMutation.mutateAsync(updates);
      console.log('✅ Package order updated successfully!');
      onClose();
    } catch (error) {
      console.error('❌ Failed to update order:', error);
      alert('Failed to update order. Check console for details.');
    }
  };

  const handleClose = () => {
    if (!reorderMutation.isPending) {
      setItems([]);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reorder Packages" size="lg">
      <div className="space-y-6">
        {/* Instructions */}
        <div className="p-4 rounded-xl border-2" style={{ 
          background: 'rgba(0, 255, 65, 0.1)', 
          borderColor: 'rgba(0, 255, 65, 0.3)' 
        }}>
          <p className="text-sm" style={{ color: 'var(--dream-text-secondary)' }}>
            <strong style={{ color: 'var(--dream-neon-green)' }}>💡 Drag and drop</strong> to reorder packages. 
            The order you set here will be reflected on your public website and booking pages.
          </p>
        </div>

        {/* Saving Indicator */}
        {reorderMutation.isPending && (
          <p className="text-sm" style={{ color: 'var(--dream-gold)' }}>
            Saving new order...
          </p>
        )}

        {/* Sortable List */}
        <div className="max-h-[500px] overflow-y-auto pr-2">
          {items.length > 0 ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="packages">
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {items.map((pkg, index) => (
                      <Draggable
                        key={pkg.id}
                        draggableId={pkg.id!}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <li
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                              snapshot.isDragging
                                ? 'bg-white/20 shadow-lg scale-105'
                                : 'bg-white/5 hover:bg-white/10'
                            }`}
                            style={{
                              borderColor: snapshot.isDragging 
                                ? 'var(--dream-neon-green)' 
                                : 'rgba(0, 255, 65, 0.2)',
                              ...provided.draggableProps.style,
                            }}
                          >
                            {/* Drag Handle */}
                            <div className="flex-shrink-0 cursor-grab active:cursor-grabbing">
                              <GripVertical size={24} style={{ color: 'var(--dream-neon-green)' }} />
                            </div>

                            {/* Package Image */}
                            {pkg.image_url && (
                              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={pkg.image_url}
                                  alt={pkg.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            {/* Package Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate" style={{ color: 'var(--dream-text-primary)' }}>
                                {pkg.name}
                              </h4>
                              {pkg.price && (
                                <div className="flex items-center gap-1 mt-1">
                                  <IndianRupee size={14} style={{ color: 'var(--dream-gold)' }} />
                                  <span className="text-sm" style={{ color: 'var(--dream-gold)' }}>
                                    {pkg.price.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Status Badge & Order Number */}
                            <div className="flex items-center gap-3">
                              {pkg.is_active ? (
                                <span className="admin-badge admin-badge-neon text-xs">Active</span>
                              ) : (
                                <span className="admin-badge admin-badge-danger text-xs">Inactive</span>
                              )}
                              <span className="text-sm" style={{ color: 'var(--dream-text-muted)' }}>
                                #{index + 1}
                              </span>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="text-center py-8">
              <p style={{ color: 'var(--dream-text-secondary)' }}>No packages to reorder</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-6 border-t" style={{ borderColor: 'rgba(0, 255, 65, 0.2)' }}>
          <Button 
            type="button" 
            variant="outline"
            onClick={handleClose}
            disabled={reorderMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="primary"
            onClick={handleSaveOrder}
            disabled={reorderMutation.isPending || items.length === 0}
          >
            {reorderMutation.isPending ? (
              <>
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>
                  <Loader2 size={18} />
                </motion.div>
                Saving...
              </>
            ) : (
              'Save Order'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}