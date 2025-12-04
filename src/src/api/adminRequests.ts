// src/api/adminRequests.ts — Admin Access Requests API
import { supabase } from '../../utils/supabase/client';
import { 
  AdminRequest, 
  CreateAdminRequest, 
  UpdateAdminRequestStatus,
  AdminRequestSchema 
} from '../schemas/adminRequests';

/**
 * Fetch all admin access requests
 */
export async function fetchAdminRequests(): Promise<AdminRequest[]> {
  const { data, error } = await supabase
    .from('admin_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin requests:', error);
    throw new Error(error.message);
  }

  return data.map(request => AdminRequestSchema.parse(request));
}

/**
 * Create a new admin access request
 */
export async function createAdminRequest(request: CreateAdminRequest): Promise<AdminRequest> {
  const { data, error } = await supabase
    .from('admin_requests')
    .insert([{
      full_name: request.full_name,
      email: request.email,
      phone: request.phone || null,
      message: request.message,
      status: 'Pending',
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating admin request:', error);
    throw new Error(error.message);
  }

  return AdminRequestSchema.parse(data);
}

/**
 * Update admin request status
 */
export async function updateAdminRequestStatus(
  update: UpdateAdminRequestStatus
): Promise<AdminRequest> {
  const { data, error } = await supabase
    .from('admin_requests')
    .update({ status: update.status })
    .eq('id', update.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating admin request status:', error);
    throw new Error(error.message);
  }

  return AdminRequestSchema.parse(data);
}

/**
 * Delete admin request
 */
export async function deleteAdminRequest(id: string): Promise<void> {
  const { error } = await supabase
    .from('admin_requests')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting admin request:', error);
    throw new Error(error.message);
  }
}

/**
 * Approve admin request and grant admin access
 * This will update the user's profile role to 'admin'
 */
export async function approveAdminRequest(id: string, email: string): Promise<void> {
  // First, update the request status
  await updateAdminRequestStatus({ id, status: 'Approved' });

  // Then, update the user's profile role
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('email', email);

  if (error) {
    console.error('Error granting admin access:', error);
    throw new Error('Failed to grant admin access');
  }
}
