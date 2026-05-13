// ─── Enums (must mirror backend) ────────────────────────────────────────────

export type MaintenanceType = 'Electrical' | 'Plumbing' | 'HVAC';

export type ServiceCategory =
    | 'electrical'
    | 'plumbing'
    | 'hvac'
    | 'carpentry'
    | 'painting'
    | 'cleaning'
    | 'security'
    | 'landscaping'
    | 'general'
    | 'other';

export type ProviderStatus = 'active' | 'inactive' | 'suspended';

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';

export type RecurrenceType = 'once' | 'daily' | 'weekly' | 'monthly' | 'annually';

export type ScheduleStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export type WorkOrderStatus =
    | 'scheduled'
    | 'in_progress'
    | 'completed'
    | 'closed'
    | 'overdue'
    | 'cancelled';

// ─── Entities ────────────────────────────────────────────────────────────────

export interface ServiceProvider {
    id: string;
    name: string;
    email?: string;
    phone: string;
    serviceCategory: ServiceCategory;
    description?: string;
    status: ProviderStatus;
    slaHours?: number;
    averageRating?: number | null;
    address?: string;
    created_at: string;
    updated_at: string;
}

export interface MaintenanceItem {
    id: string;
    propertyId: string;
    property?: { id: string; name: string };
    name: string;
    description?: string;
    location?: string;
    unitNumber?: string;
    priority: MaintenancePriority;
    category: ServiceCategory;
    created_at: string;
}

export interface MaintenanceSchedule {
    id: string;
    propertyId: string;
    property?: { id: string; name: string };
    maintenanceItemId?: string;
    maintenanceItem?: MaintenanceItem;
    providerId?: string;
    provider?: ServiceProvider;
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    recurrenceType: RecurrenceType;
    recurrenceInterval?: number;
    nextRunDate?: string;
    status: ScheduleStatus;
    notificationDaysBefore?: number[];
    createdById: string;
    created_at: string;
}

export interface WorkOrder {
    id: string;
    propertyId: string;
    property?: { id: string; name: string };
    scheduleId?: string;
    schedule?: MaintenanceSchedule;
    providerId?: string;
    provider?: ServiceProvider;
    createdById: string;
    createdBy?: { id: string; name: string; imagePath?: string };
    assignedTenantId?: string;
    assignedTenant?: { id: string; name: string };
    title: string;
    description?: string;
    status: WorkOrderStatus;
    priority: MaintenancePriority;
    category?: ServiceCategory;
    dueDate?: string;
    completedDate?: string;
    notes?: string;
    attachments?: { url: string; filename: string }[];
    tenantRating?: number;
    tenantRatingComment?: string;
    tenantAccessApproved: boolean;
    created_at: string;
    updated_at: string;
}

// ─── API response wrappers ────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// ─── Legacy card type (kept for backward compat) ─────────────────────────────

export interface MaintenanceRequestCardType {
    type: MaintenanceType;
    location: string;
    requestId: string;
    issue: string;
    user: {
        name: string;
        imageSrc: string;
    };
}
