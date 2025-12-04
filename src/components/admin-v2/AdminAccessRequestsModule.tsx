// components/admin-v2/AdminAccessRequestsModule.tsx — Admin Access Requests Management
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Trash2, Clock, Mail, Phone, User } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { 
  useAdminRequests, 
  useUpdateAdminRequestStatus,
  useDeleteAdminRequest,
  useApproveAdminRequest,
} from '../../src/hooks/useAdminRequests';
import { AdminRequest } from '../../src/schemas/adminRequests';

export function AdminAccessRequestsModule() {
  const { data: requests, isLoading } = useAdminRequests();
  const updateStatus = useUpdateAdminRequestStatus();
  const deleteRequest = useDeleteAdminRequest();
  const approveRequest = useApproveAdminRequest();
  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null);

  const handleApprove = async (request: AdminRequest) => {
    if (confirm(`Grant admin access to ${request.full_name} (${request.email})?`)) {
      try {
        await approveRequest.mutateAsync({ 
          id: request.id, 
          email: request.email 
        });
      } catch (error) {
        console.error('Failed to approve request:', error);
      }
    }
  };

  const handleReject = async (request: AdminRequest) => {
    if (confirm(`Reject admin access request from ${request.full_name}?`)) {
      try {
        await updateStatus.mutateAsync({ 
          id: request.id, 
          status: 'Rejected' 
        });
      } catch (error) {
        console.error('Failed to reject request:', error);
      }
    }
  };

  const handleDelete = async (request: AdminRequest) => {
    if (confirm(`Delete request from ${request.full_name}? This cannot be undone.`)) {
      try {
        await deleteRequest.mutateAsync(request.id);
      } catch (error) {
        console.error('Failed to delete request:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return { bg: '#FEF3C7', text: '#F59E0B', border: '#FDE68A' };
      case 'Approved':
        return { bg: '#D1FAE5', text: '#10B981', border: '#A7F3D0' };
      case 'Rejected':
        return { bg: '#FEE2E2', text: '#EF4444', border: '#FECACA' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-10 space-y-6">
        {/* Header */}
        <div>
          <h1 style={{ color: '#2A2A2A', marginBottom: '0.5rem' }}>Admin Access Requests</h1>
          <p style={{ color: 'rgba(42, 42, 42, 0.6)' }}>
            Manage requests for admin access to the dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            className="p-6 rounded-2xl border"
            style={{ 
              backgroundColor: '#FEF3C7',
              borderColor: '#FDE68A',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: '0.875rem', color: '#92400E', marginBottom: '0.25rem' }}>
                  Pending
                </p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B', lineHeight: 1 }}>
                  {requests?.filter(r => r.status === 'Pending').length || 0}
                </p>
              </div>
              <Clock size={32} style={{ color: '#F59E0B', opacity: 0.3 }} />
            </div>
          </div>

          <div 
            className="p-6 rounded-2xl border"
            style={{ 
              backgroundColor: '#D1FAE5',
              borderColor: '#A7F3D0',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: '0.875rem', color: '#065F46', marginBottom: '0.25rem' }}>
                  Approved
                </p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981', lineHeight: 1 }}>
                  {requests?.filter(r => r.status === 'Approved').length || 0}
                </p>
              </div>
              <CheckCircle size={32} style={{ color: '#10B981', opacity: 0.3 }} />
            </div>
          </div>

          <div 
            className="p-6 rounded-2xl border"
            style={{ 
              backgroundColor: '#FEE2E2',
              borderColor: '#FECACA',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: '0.875rem', color: '#991B1B', marginBottom: '0.25rem' }}>
                  Rejected
                </p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#EF4444', lineHeight: 1 }}>
                  {requests?.filter(r => r.status === 'Rejected').length || 0}
                </p>
              </div>
              <XCircle size={32} style={{ color: '#EF4444', opacity: 0.3 }} />
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div 
          className="rounded-2xl overflow-hidden border"
          style={{ 
            backgroundColor: '#FFFFFF',
            borderColor: '#E5E7EB',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
          }}
        >
          {isLoading ? (
            <div className="p-12 text-center">
              <motion.div 
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-t-transparent rounded-full mx-auto"
                style={{ borderColor: '#A8DADC', borderTopColor: 'transparent' }}
              />
              <p style={{ marginTop: '1rem', color: '#6B7280' }}>Loading requests...</p>
            </div>
          ) : !requests || requests.length === 0 ? (
            <div className="p-12 text-center">
              <User size={48} style={{ color: '#D1D5DB', margin: '0 auto 1rem' }} />
              <p style={{ color: '#6B7280', fontSize: '1.125rem' }}>No admin requests yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead 
                  style={{ 
                    backgroundColor: '#F9FAFB',
                  }}
                >
                  <tr>
                    <th 
                      className="px-6 py-4 text-left"
                      style={{ 
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Name
                    </th>
                    <th 
                      className="px-6 py-4 text-left"
                      style={{ 
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Contact
                    </th>
                    <th 
                      className="px-6 py-4 text-left"
                      style={{ 
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Message
                    </th>
                    <th 
                      className="px-6 py-4 text-left"
                      style={{ 
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Date
                    </th>
                    <th 
                      className="px-6 py-4 text-left"
                      style={{ 
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Status
                    </th>
                    <th 
                      className="px-6 py-4 text-right"
                      style={{ 
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request, index) => {
                    const statusColors = getStatusColor(request.status);
                    
                    return (
                      <tr 
                        key={request.id}
                        className="transition-colors"
                        style={{ 
                          borderTop: index !== 0 ? '1px solid #F3F4F6' : 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F9FAFB';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <td className="px-6 py-4">
                          <p style={{ fontWeight: '600', color: '#1F2937' }}>
                            {request.full_name}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Mail size={14} style={{ color: '#9CA3AF' }} />
                              <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                                {request.email}
                              </span>
                            </div>
                            {request.phone && (
                              <div className="flex items-center gap-2">
                                <Phone size={14} style={{ color: '#9CA3AF' }} />
                                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                                  {request.phone}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="text-left transition-colors"
                            style={{ 
                              fontSize: '0.875rem',
                              color: '#6B7280',
                              maxWidth: '200px',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#A8DADC';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#6B7280';
                            }}
                          >
                            {request.message || 'No message'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                            {formatDate(request.created_at)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span 
                            className="px-3 py-1 rounded-full inline-block border"
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              backgroundColor: statusColors.bg,
                              color: statusColors.text,
                              borderColor: statusColors.border,
                            }}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {request.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(request)}
                                  disabled={approveRequest.isPending}
                                  className="p-2 rounded-lg transition-all"
                                  style={{ color: '#10B981' }}
                                  title="Approve"
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#D1FAE5';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() => handleReject(request)}
                                  disabled={updateStatus.isPending}
                                  className="p-2 rounded-lg transition-all"
                                  style={{ color: '#EF4444' }}
                                  title="Reject"
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#FEE2E2';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <XCircle size={18} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(request)}
                              disabled={deleteRequest.isPending}
                              className="p-2 rounded-lg transition-all"
                              style={{ color: '#6B7280' }}
                              title="Delete"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#F3F4F6';
                                e.currentTarget.style.color = '#EF4444';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#6B7280';
                              }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedRequest && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setSelectedRequest(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>
                Request from {selectedRequest.full_name}
              </h3>
              <p style={{ color: '#6B7280', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {selectedRequest.message || 'No message provided'}
              </p>
              <button
                onClick={() => setSelectedRequest(null)}
                className="mt-6 px-6 py-2 rounded-lg transition-all"
                style={{ 
                  backgroundColor: '#F3F4F6',
                  color: '#1F2937',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E5E7EB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                }}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}