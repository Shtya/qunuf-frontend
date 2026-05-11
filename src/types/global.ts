

export type Locale = "en" | "ar";

export type Role = 'admin' | 'tenant' | 'landlord';

export type ContractStatus = 'free' | 'reserved';

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',  // voluntary / time-based inactivity
    PENDING_VERIFICATION = 'pending_verification',
    SUSPENDED = 'suspended',  // admin or violation
    DELETED = 'deleted',
}

export enum IdentityType {
    NATIONAL_ID = 'national_id',              // هوية وطنية
    RESIDENCY = 'residency',                  // هوية مقيم
    PREMIUM_RESIDENCY = 'premium_residency',  // إقامة مميزة
    GCC_ID = 'gcc_id',                        // هوية خليجية
    PASSPORT = 'passport',                    // جواز سفر
    OTHER = 'other',                          // أخرى
}
