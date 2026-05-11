// --- Enums (Must match Backend exactly) ---

import { Property } from "./properties";
import { User } from "./user";

export enum ContractStatus {
    DRAFT = 'draft',
    PENDING_TENANT_ACCEPTANCE = 'pending_tenant_acceptance',
    PENDING_LANDLORD_ACCEPTANCE = 'pending_landlord_acceptance',
    PENDING_SIGNATURE = 'pending_signature',
    ACTIVE = 'active',
    EXPIRED = 'expired',
    CANCELLED = 'cancelled',
    TERMINATED = 'terminated',
    PENDING_TERMINATION = "pending_termination"
}

// These are referenced in your entity; ensure they match your property.entity.ts
export type RentType = 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
export type PropertyType = 'residential' | 'commercial';
export type ResidentialSubType = 'apartment' | 'villa' | 'floor' | 'studio';
export type CommercialSubType = 'shop' | 'office' | 'warehouse' | 'showroom';

// --- Supporting Interfaces ---

export interface UserSnapshot {
    name: string;
    email: string;
    nationality: string;
    phoneNumber: string;
    identityType: string;
    identityOtherType?: string | null;
    identityNumber: string;
    identityIssueCountry: string;
    birthDate: string;
    shortAddress: string;
}

export interface PropertySnapshot {
    name: string;
    type: PropertyType;
    subType: ResidentialSubType | CommercialSubType | string;
    propertyNumber: string;
    nationalAddressCode: string;
    stateName: string;
    area: number;
    capacity?: number;
    isFurnished: boolean;
    constructionDate: string | Date;
    complexName?: string;
    insurancePolicyNumber?: string;
    ownershipType: string;
    electricityMeter?: string;
    waterMeter?: string;
    gasMeter?: string;
    features: string[];
    facilities: {
        livingRooms?: number;
        parking?: number;
        elevators?: number;
        bathrooms?: number;
        securityEntrances?: number;
        bedrooms?: number;
        maidRoom?: boolean;
        kitchen?: number;
        store?: number;
        backyard?: boolean;
        centralAC?: boolean;
        desertAC?: boolean;
        majlis?: number;
        rooms?: number;
    };
    ownershipDocument: {
        type: string;
        number: string;
        date: string | Date;
        issuedBy: string;
        ownerIdNumber: string;
        documentImage: { path: string; filename: string; } | null;
    };
}

export interface PaymentInstallment {
    dueDate: string | Date;
    amount: number;
    isPaid: boolean;
    paymentDate?: string | Date;
}

// --- Main Contract Interface ---

export interface Contract {
    id: string; // From CoreEntity
    created_at: string;
    // Relations (Full Objects)
    landlord?: User; // You can replace 'any' with your User interface
    tenant?: User;
    property?: Property;

    // Foreign Keys
    landlordId: string;
    tenantId: string;
    propertyId: string;

    // Snapshots
    landlordSnapshot: UserSnapshot;
    tenantSnapshot: UserSnapshot;
    propertySnapshot: PropertySnapshot;

    // Financials & Terms
    contractNumber: string | null;
    startDate: string;
    endDate: string;
    contractDate: string | null;
    totalAmount: number;
    securityDeposit: number;
    rentType: RentType;
    platformFeePercentage: number;
    platformFeeAmount: number;

    // Schedule & Logic
    paymentSchedule: PaymentInstallment[];
    originalTerms: string;
    currentTerms: string;
    ejarPdfPath: string | null;

    // Termination logic
    terminationInitiatedAt: string | null;
    terminationEffectiveDate: string | null;

    // Renewal & Incentives
    shouldSendRenewalNotify: boolean;
    renewalDiscountAmount: number;
    requiredMonthsForIncentive: number | null;
    durationInMonths: number;
    status: ContractStatus;
    isReviewed: boolean;
}