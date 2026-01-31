export const ROLES = {
    ADMIN: 'admin',
    STAFF: 'staff',
    STUDENT: 'student',
    SCIENTIST: 'scientist',
    ENTREPRENEUR: 'entrepreneur',
    POLITICIAN: 'politician',
    RETIREE: 'retiree',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const SLOT_STATUS = {
    AVAILABLE: 'available',
    BOOKED: 'booked',
    CANCELLED: 'cancelled'
} as const;

export type SlotStatus = typeof SLOT_STATUS[keyof typeof SLOT_STATUS];

export const RESOURCE_TYPE = {
    ROOM: 'room',
    EQUIPMENT: 'equipment',
    OTHER: 'other'
} as const;

export type ResourceType = typeof RESOURCE_TYPE[keyof typeof RESOURCE_TYPE];

export const APPOINTMENT_STATUS = {
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    RESCHEDULED: 'rescheduled'
} as const;

export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];

export const PRIORITY = {
    NORMAL: 'normal',
    URGENT: 'urgent'
} as const;

export type Priority = typeof PRIORITY[keyof typeof PRIORITY];

// --- DTOs via Principal Audit Phase 1 ---

export interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    phone?: string;
    organization?: string;
    department?: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    verificationData?: string;
    rejectionReason?: string;
    verifiedAt?: string | Date;
    accessLevel: number;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
}

// --- Pagination & Performance Types ---

export interface PaginationParams {
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    order?: 'asc' | 'desc' | undefined;
}

export interface PaginatedResponse<T> {
    items: T[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
}
