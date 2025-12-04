import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { PageHeader } from './PageHeader';
import { DataTable } from './DataTable';
import { Modal } from './Modal';
import { Button } from './Button';
import { StatusBadge } from './StatusBadge';
import { useToast } from './Toast';
import { Calendar, Phone, Mail, User } from 'lucide-react';

export default function BookingRequestsModule() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const { showToast, ToastContainer } = useToast();

  // Mock data
  const requests = [
    { 
      id: 1, 
      client: 'Ravi Kumar',
      email: 'ravi@example.com',
      phone: '+91 98765 43210',
      eventDate: '2025-11-15',
      eventType: 'Wedding',
      guests: 500,
      status: 'Pending',
      notes: 'Looking for premium wedding package with catering'
    },
    { 
      id: 2, 
      client: 'Priya Sharma',
      email: 'priya@company.com',
      phone: '+91 98765 43211',
      eventDate: '2025-11-20',
      eventType: 'Conference',
      guests: 200,
      status: 'Confirmed',
      notes: 'Corporate event with AV equipment needed'
    },
    { 
      id: 3, 
      client: 'Anil Menon',
      email: 'anil@example.com',
      phone: '+91 98765 43212',
      eventDate: '2025-11-22',
      eventType: 'Birthday',
      guests: 100,
      status: 'Pending',
      notes: 'Kids birthday party setup required'
    },
    { 
      id: 4, 
      client: 'Deepa Nair',
      email: 'deepa@example.com',
      phone: '+91 98765 43213',
      eventDate: '2025-11-25',
      eventType: 'Corporate',
      guests: 150,
      status: 'Rejected',
      notes: 'Date conflict with another booking'
    },
  ];

  const handleView = (request: any) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = (status: string) => {
    showToast('success', `Booking request ${status.toLowerCase()} successfully`);
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-10 space-y-6">
        <PageHeader title="Manage Booking Requests" />

      {/* Calendar View Placeholder */}
      <div className="bg-white rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.08)] p-6">
        <h3 className="text-lg text-[#2B2B2B] mb-4">Calendar View</h3>
        <div className="h-[300px] bg-gradient-to-br from-[#F9F7F2] to-[#EAE7E2] rounded-lg flex items-center justify-center">
          <p className="text-[#2B2B2B]/60">Mini Calendar - Shows booking dates</p>
        </div>
      </div>

      {/* Requests Table */}
      <DataTable
        columns={[
          { key: 'client', label: 'Client Name' },
          { key: 'phone', label: 'Phone' },
          { key: 'eventDate', label: 'Event Date' },
          { key: 'eventType', label: 'Event Type' },
          { key: 'guests', label: 'Guests' },
          { 
            key: 'status', 
            label: 'Status',
            render: (value) => (
              <StatusBadge 
                status={value} 
                variant={getStatusVariant(value)} 
              />
            )
          },
        ]}
        data={requests}
        onView={handleView}
      />

      {/* View Request Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
        title="Booking Request Details"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            {/* Client Information */}
            <div className="space-y-4">
              <h4 className="text-sm text-[#2B2B2B]/60 uppercase tracking-wide">Client Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-[#F9F7F2] rounded-lg">
                  <User className="w-5 h-5 text-[#C29A5D]" />
                  <div>
                    <p className="text-xs text-[#2B2B2B]/60">Name</p>
                    <p className="text-sm text-[#2B2B2B]">{selectedRequest.client}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#F9F7F2] rounded-lg">
                  <Phone className="w-5 h-5 text-[#C29A5D]" />
                  <div>
                    <p className="text-xs text-[#2B2B2B]/60">Phone</p>
                    <p className="text-sm text-[#2B2B2B]">{selectedRequest.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#F9F7F2] rounded-lg">
                  <Mail className="w-5 h-5 text-[#C29A5D]" />
                  <div>
                    <p className="text-xs text-[#2B2B2B]/60">Email</p>
                    <p className="text-sm text-[#2B2B2B]">{selectedRequest.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#F9F7F2] rounded-lg">
                  <Calendar className="w-5 h-5 text-[#C29A5D]" />
                  <div>
                    <p className="text-xs text-[#2B2B2B]/60">Event Date</p>
                    <p className="text-sm text-[#2B2B2B]">{selectedRequest.eventDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-3">
              <h4 className="text-sm text-[#2B2B2B]/60 uppercase tracking-wide">Event Details</h4>
              <div className="grid grid-cols-2 gap-4 p-4 bg-[#F9F7F2] rounded-lg">
                <div>
                  <p className="text-xs text-[#2B2B2B]/60 mb-1">Event Type</p>
                  <p className="text-sm text-[#2B2B2B]">{selectedRequest.eventType}</p>
                </div>
                <div>
                  <p className="text-xs text-[#2B2B2B]/60 mb-1">Expected Guests</p>
                  <p className="text-sm text-[#2B2B2B]">{selectedRequest.guests}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <h4 className="text-sm text-[#2B2B2B]/60 uppercase tracking-wide">Notes</h4>
              <div className="p-4 bg-[#F9F7F2] rounded-lg">
                <p className="text-sm text-[#2B2B2B]">{selectedRequest.notes}</p>
              </div>
            </div>

            {/* Current Status */}
            <div className="space-y-3">
              <h4 className="text-sm text-[#2B2B2B]/60 uppercase tracking-wide">Current Status</h4>
              <StatusBadge 
                status={selectedRequest.status} 
                variant={getStatusVariant(selectedRequest.status)} 
              />
            </div>

            {/* Action Buttons */}
            {selectedRequest.status === 'Pending' && (
              <div className="flex gap-3 pt-4 border-t border-[#EAE7E2]">
                <Button 
                  variant="primary" 
                  className="flex-1"
                  onClick={() => handleStatusUpdate('Confirmed')}
                >
                  Confirm Booking
                </Button>
                <Button 
                  variant="danger" 
                  className="flex-1"
                  onClick={() => handleStatusUpdate('Rejected')}
                >
                  Reject Request
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

        {ToastContainer}
      </div>
    </AdminLayout>
  );
}
