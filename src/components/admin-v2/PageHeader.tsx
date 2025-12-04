import React from 'react';
import { Button } from './Button';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  onAddNew?: () => void;
  addButtonLabel?: string;
}

export function PageHeader({ title, onAddNew, addButtonLabel = 'Add New' }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-2xl text-[#1a1a1a]">{title}</h1>
      {onAddNew && (
        <Button variant="primary" icon={Plus} onClick={onAddNew}>
          {addButtonLabel}
        </Button>
      )}
    </div>
  );
}
