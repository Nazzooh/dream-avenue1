import React from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  loading?: boolean;
}

export function DataTable({ columns, data, onEdit, onDelete, onView, loading }: DataTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.08)] p-6 border border-[#B6F500]/10">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-[#FFFADC] rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.08)] p-12 text-center border border-[#B6F500]/10">
        <p className="text-[#1a1a1a]/60">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-[0_4px_14px_rgba(0,0,0,0.08)] overflow-hidden border border-[#B6F500]/10 rounded-tl-[5px] rounded-tr-[0px] rounded-bl-[16px] rounded-br-[16px] py-[50px] px-[0px]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-[#B6F500]/10 to-[#A4DD00]/10 border-b border-[#B6F500]/20">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-sm text-[#1a1a1a] font-semibold text-[16px] font-normal"
                >
                  {column.label}
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-6 py-4 text-right text-sm text-[#1a1a1a] font-semibold">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className="border-b border-[#E5E7EB] hover:bg-[#B6F500]/5 transition-colors"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 text-sm text-[#1a1a1a]">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {(onEdit || onDelete || onView) && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onView && (
                        <button
                          onClick={() => onView(row)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#98CD00] hover:bg-[#B6F500]/10 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-[#98CD00]" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#B6F500] hover:bg-[#B6F500]/10 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-[#98CD00]" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E74C3C] hover:bg-[#E74C3C]/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-[#E74C3C]" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
