import { supabase } from './supabase';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'employee';
  fullName: string;
  isActive: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

const SESSION_KEY = 'rental_user_session';

// Get current user from session
export function getCurrentUser(): User | null {
  const sessionData = sessionStorage.getItem(SESSION_KEY);
  if (!sessionData) return null;
  
  try {
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}

// Save user session
function saveSession(user: User) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// Clear session
export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

// Login
export async function login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', credentials.username)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Simple password check (in production, use bcrypt)
    if (data.password_hash !== credentials.password) {
      return { success: false, error: 'Invalid username or password' };
    }

    const user: User = {
      id: data.id,
      username: data.username,
      role: data.role,
      fullName: data.full_name,
      isActive: data.is_active,
      createdAt: data.created_at
    };

    saveSession(user);
    
    // Log login activity
    await logActivity(user.id, 'login', 'user', user.id, { username: user.username });

    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

// Check if user is admin
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// Log activity
export async function logActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: any
) {
  try {
    await supabase.from('activity_log').insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// Get activity log
export async function getActivityLog(filters?: {
  userId?: string;
  startDate?: string;
  endDate?: string;
  entityType?: string;
}) {
  try {
    let query = supabase
      .from('activity_log')
      .select(`
        *,
        user:users(username, full_name, role)
      `)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.startDate) {
      query = query.gte('timestamp', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('timestamp', filters.endDate);
    }
    if (filters?.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch activity log:', error);
    return [];
  }
}

// Employee Management Functions

export async function createEmployee(employeeData: {
  username: string;
  password: string;
  fullName: string;
}): Promise<{ success: boolean; error?: string }> {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { error } = await supabase.from('users').insert({
      username: employeeData.username,
      password_hash: employeeData.password, // In production, hash this
      role: 'employee',
      full_name: employeeData.fullName,
      created_by: currentUser.id,
      is_active: true
    });

    if (error) {
      if (error.code === '23505') { // Unique violation
        return { success: false, error: 'Username already exists' };
      }
      throw error;
    }

    await logActivity(currentUser.id, 'create_employee', 'user', employeeData.username, employeeData);

    return { success: true };
  } catch (error) {
    console.error('Failed to create employee:', error);
    return { success: false, error: 'Failed to create employee' };
  }
}

export async function getEmployees() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'employee')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(emp => ({
      id: emp.id,
      username: emp.username,
      fullName: emp.full_name,
      isActive: emp.is_active,
      createdAt: emp.created_at
    }));
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return [];
  }
}

export async function updateEmployee(
  employeeId: string,
  updates: { fullName?: string; password?: string; isActive?: boolean }
): Promise<{ success: boolean; error?: string }> {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const updateData: any = {};
    if (updates.fullName) updateData.full_name = updates.fullName;
    if (updates.password) updateData.password_hash = updates.password; // Hash in production
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', employeeId);

    if (error) throw error;

    await logActivity(currentUser.id, 'update_employee', 'user', employeeId, updates);

    return { success: true };
  } catch (error) {
    console.error('Failed to update employee:', error);
    return { success: false, error: 'Failed to update employee' };
  }
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Verify current password
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', currentUser.id)
      .single();

    if (fetchError || !userData) {
      return { success: false, error: 'Failed to verify password' };
    }

    if (userData.password_hash !== currentPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPassword }) // Hash in production
      .eq('id', currentUser.id);

    if (updateError) throw updateError;

    await logActivity(currentUser.id, 'change_password', 'user', currentUser.id, {});

    return { success: true };
  } catch (error) {
    console.error('Failed to change password:', error);
    return { success: false, error: 'Failed to change password' };
  }
}

export async function updateAdminProfile(updates: {
  fullName?: string;
  username?: string;
}): Promise<{ success: boolean; error?: string }> {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const updateData: any = {};
    if (updates.fullName) updateData.full_name = updates.fullName;
    if (updates.username) updateData.username = updates.username;

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', currentUser.id);

    if (error) {
      if (error.code === '23505') { // Unique violation
        return { success: false, error: 'Username already exists' };
      }
      throw error;
    }

    // Update session with new data
    const updatedUser = {
      ...currentUser,
      ...(updates.fullName && { fullName: updates.fullName }),
      ...(updates.username && { username: updates.username })
    };
    saveSession(updatedUser);

    await logActivity(currentUser.id, 'update_profile', 'user', currentUser.id, updates);

    return { success: true };
  } catch (error) {
    console.error('Failed to update profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}


// Get employee history events (actions performed by employee)
export async function getEmployeeHistoryEvents(employeeId: string) {
  try {
    const { data, error } = await supabase
      .from('history_events')
      .select(`
        *,
        sites!inner(
          id,
          site_name,
          customer:customers!inner(
            id,
            name
          )
        )
      `)
      .eq('employee_id', employeeId)
      .order('date', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Transform to match activity log format with detailed information
    return (data || []).map(event => {
      const customerName = event.sites.customer.name;
      const siteName = event.sites.site_name;
      
      let detailsText = `${customerName} - ${siteName}`;
      
      // Add specific details based on action type
      if (event.action === 'Issued') {
        detailsText += ` | Issued ${event.quantity || 0} items`;
        if (event.material_type_id) {
          detailsText += ` (Material ID: ${event.material_type_id.substring(0, 8)}...)`;
        }
      } else if (event.action === 'Payment') {
        const amount = event.amount ? parseFloat(event.amount) : 0;
        detailsText += ` | Collected ₹${amount.toLocaleString('en-IN')}`;
        if (event.payment_method) {
          detailsText += ` via ${event.payment_method}`;
        }
      } else if (event.action === 'Returned') {
        const returned = event.quantity || 0;
        const lost = event.quantity_lost || 0;
        detailsText += ` | Returned ${returned} items`;
        if (lost > 0) {
          detailsText += `, Lost ${lost} items`;
        }
      }

      return {
        id: event.id,
        timestamp: event.date,
        action: event.action,
        entity_type: event.action === 'Issued' ? 'material' : event.action === 'Returned' ? 'return' : 'payment',
        entity_id: detailsText,
        details: {
          customerName,
          siteName,
          materialTypeId: event.material_type_id,
          quantity: event.quantity,
          amount: event.amount ? parseFloat(event.amount) : undefined,
          quantityLost: event.quantity_lost,
          paymentMethod: event.payment_method,
          hasOwnLabor: event.has_own_labor
        }
      };
    });
  } catch (error) {
    console.error('Failed to fetch employee history events:', error);
    return [];
  }
}
