import { Contract } from "./contract";
import { Property } from "./properties";

export enum RenewStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    EXPIRED = 'EXPIRED'
}

export interface RenewRequest {
    id: string;
    createdAt: string;
    updatedAt: string;


    originalContractId: string;
    propertyId: string;
    tenantId: string;


    offeredDiscountAmount: number;
    status: RenewStatus;
    adminNotes?: string | null;


    originalContract?: Contract;
    property?: Property;
    tenant?: any;
}

