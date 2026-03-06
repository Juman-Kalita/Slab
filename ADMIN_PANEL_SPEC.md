# Admin Panel Specification

## Overview
Complete admin panel with full control over the system, employee management, and activity tracking.

## Default Credentials
- **Admin Username**: solvix
- **Admin Password**: sahil123

## Features

### 1. Authentication System
- **Admin Login**: Full access to all features
- **Employee Login**: Limited to operational tasks (issue materials, record payments, etc.)
- **Role-based access control**
- **Session management**

### 2. Admin Dashboard Features

#### A. Employee Management
- Create new employee accounts (username, password, full name)
- View all employees
- Edit employee details
- Deactivate/activate employee accounts
- View employee activity history

#### B. Customer Management (Full CRUD)
- Edit customer name
- Edit customer contact details
- Edit customer address
- Edit registration name
- Delete customers (with confirmation)
- View complete customer history

#### C. Site Management
- Edit site names
- Edit site locations
- Move materials between sites
- Delete sites (with material return)

#### D. Material Management
- Edit material quantities for any site
- Adjust material types
- Return materials on behalf of customers
- Edit material issue dates

#### E. Inventory Management
- Edit material type prices (rent, loading charges)
- Edit material type names
- Add new material types
- Edit inventory quantities
- Set grace periods

#### F. Payment Management
- Edit payment amounts
- Edit payment dates
- Delete payment records
- Adjust customer balances
- Edit advance deposits

#### G. System Settings
- Change admin password
- Configure material types
- Set system-wide defaults
- Export data

### 3. Activity Tracking
- All actions logged with:
  - Employee/admin who performed action
  - Timestamp
  - Action type
  - Entity affected
  - Before/after values
- Activity log viewer
- Filter by employee, date range, action type

### 4. Real-time Updates
- All changes immediately reflected in employee dashboards
- Automatic refresh on data changes
- Conflict resolution for concurrent edits

## Database Schema

### Users Table
```sql
- id (UUID, primary key)
- username (unique)
- password_hash
- role (admin/employee)
- full_name
- created_at
- created_by (references users)
- is_active
```

### Activity Log Table
```sql
- id (UUID, primary key)
- user_id (references users)
- action
- entity_type
- entity_id
- details (JSONB)
- timestamp
```

## Implementation Plan

### Phase 1: Authentication & User Management
1. Create auth service
2. Update login page with role detection
3. Create employee management UI
4. Implement session management

### Phase 2: Admin Dashboard
1. Create admin layout
2. Implement customer editing
3. Implement site editing
4. Implement material editing

### Phase 3: Inventory & Settings
1. Material type editor
2. Price editor
3. Inventory adjuster
4. Settings panel

### Phase 4: Activity Tracking
1. Activity logger service
2. Activity log viewer
3. Employee activity reports

## Security Considerations
- Password hashing (bcrypt in production)
- Role-based route protection
- Audit logging for all changes
- Session timeout
- CSRF protection

## UI Components Needed
- AdminDashboard.tsx
- EmployeeManagement.tsx
- CustomerEditor.tsx
- SiteEditor.tsx
- MaterialEditor.tsx
- InventoryEditor.tsx
- ActivityLog.tsx
- SettingsPanel.tsx
- ChangePasswordDialog.tsx

## API Endpoints Needed
- User CRUD operations
- Activity logging
- Customer/Site/Material editing
- Inventory management
- Settings management
