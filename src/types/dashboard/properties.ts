// --- Enums ---

import { User } from "./user";

export enum PropertyType {
    COMMERCIAL = 'commercial',
    RESIDENTIAL = 'residential',
}

export enum ResidentialSubType {
    APARTMENT = 'apartment',
    VILLA = 'villa',
    FLOOR = 'floor',
    ROOM = 'room',
    POPULAR_HOUSE = 'popular_house',
    ANNEX = 'annex',
    LABOR_HOUSING = 'labor_housing',
    INDIVIDUAL_HOUSING = 'individual_housing',
    DRIVER_ROOM = 'driver_room',
    FAMILY_HOUSING = 'family_housing',
    OTHER = 'other',
}

export enum CommercialSubType {
    OFFICE = 'office',
    RETAIL_STORE = 'retail_store',
    SHOWROOM = 'showroom',
    WAREHOUSE = 'warehouse',
    WORKSHOP = 'workshop',
    COMMERCIAL_CENTER = 'commercial_center',
    COMMERCIAL_BUILDING = 'commercial_building',
    COMMERCIAL_LABOR_HOUSING = 'commercial_labor_housing',
    KIOSK = 'kiosk',
    LAND = 'land',
    OTHER = 'other',
}

export enum OwnershipType {
    OWNER = 'owner',
    REPRESENTATIVE = 'representative',
}

export enum DocumentType {
    ELECTRONIC_DEED = 'electronic_deed',
    REAL_ESTATE_REGISTRATION = 'real_estate_registration',
    OTHER = 'other',
}

export enum RentType {
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
}

export enum BuildingType {
    BUILDING = 'building',
    VILLA = 'villa',
}

export enum PropertyPurpose {
    RENT = 'rent',
    SALE = 'sale',
}

export enum PropertyUsage {
    RESIDENTIAL_FAMILY = 'residential_family',
    RESIDENTIAL_INDIVIDUAL = 'residential_individual',
}

export enum FurnishingStatus {
    NEW = 'new',
    USED = 'used',
}

export enum PaymentCycle {
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    SEMI_ANNUAL = 'semi_annual',
    ANNUAL = 'annual',
}

export enum PropertyStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    REJECTED = 'rejected',
    ARCHIVED = 'archived',
}

// --- Nested JSON Interfaces ---

export interface NearbyFacility {
    name: string;
    type: string;
    distance_km: number;
}

export interface PropertyImage {
    url: string;
    is_primary: boolean;
}

export interface PropertyFacilities {
    livingRooms?: number;
    parking?: number;
    elevators?: number;
    bathrooms?: number;
    securityEntrances?: number;
    bedrooms?: number;
    kitchen?: number;
    store?: number;
    majlis?: number;
    rooms?: number;
    maidRoom?: boolean;
    backyard?: boolean;
    centralAC?: boolean;
    desertAC?: boolean;
}

// --- Main Property Interface ---

export interface Property {
    id: string; // From CoreEntity
    created_at: string | Date;
    updated_att: string | Date;

    name: string;
    description: string;
    additionalDetails?: string;
    status: PropertyStatus;

    // JSONB Fields
    educationInstitutions: NearbyFacility[] | null;
    healthMedicalFacilities: NearbyFacility[] | null;
    images: PropertyImage[];
    facilities: PropertyFacilities | null;

    // Type Logic
    propertyType: PropertyType;
    subType: ResidentialSubType | CommercialSubType | string;

    // Numeric/Financial
    capacity?: number;
    area: number;
    rentPrice: number;
    securityDeposit: number;

    // Boolean Flags
    isFurnished: boolean;
    isRented: boolean;

    // Identification
    propertyNumber: string;
    insurancePolicyNumber?: string;
    ownershipType: OwnershipType;
    complexName?: string;

    // Legal Documents
    documentType: DocumentType;
    documentIssueDate: string | Date;
    documentNumber: string;
    ownerIdNumber: string;
    issuedBy: string;
    documentImage: { path: string; filename: string; } | null;

    // Address & Geo
    nationalAddressCode: string;
    latitude?: number;
    longitude?: number;
    stateId: string;
    state?: {
        id: string;
        name: string;
        name_ar: string;
        region_code: string;
    };

    // Utility Meters
    gasMeterNumber?: string;
    electricityMeterNumber?: string;
    waterMeterNumber?: string;

    // Meter readings
    electricityMeterReading?: number;
    gasMeterReading?: number;
    waterMeterReading?: number;

    // Document location
    documentIssueLocation?: string;

    // Building details
    buildingType?: BuildingType;
    propertyPurpose?: PropertyPurpose;
    propertyUsage?: PropertyUsage;
    numberOfFloors?: number;
    numberOfUnits?: number;
    numberOfShops?: number;

    // Unit details
    unitNumber?: string;
    floorNumber?: number;
    hasCombinedAcUnit?: boolean;
    acUnitsCount?: number;
    furnishingStatus?: FurnishingStatus;
    hasKitchenCabinets?: boolean;

    // Sublease
    subleaseAllowed?: boolean;

    // Financial extras (Section 10)
    brokerageFee?: number;
    electricityMonthlyAmount?: number;
    gasMonthlyAmount?: number;
    waterMonthlyAmount?: number;
    parkingMonthlyAmount?: number;
    parkingLotsRented?: number;

    // Contract defaults
    paymentCycle?: PaymentCycle;
    article11?: string;
    additionalTerms?: string;

    // Lists
    features?: string[];

    // Meta
    userId: string;
    user?: User,
    constructionDate?: string | Date;
    rentType: RentType;
    slug: string
    averageRating: number | null;
}