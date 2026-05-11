import { UserRole } from "@/constants/user";
import { IdentityType, Role, UserStatus } from "../global";


// Frontend User Interface
export interface User {
    id: string; // from CoreEntity
    email: string;
    pendingEmail?: string;
    name: string;
    role: UserRole;
    status: UserStatus;

    // Profile Information
    imagePath: string | null;
    phoneNumber: string | null;
    birthDate: string | null; // ISO string from Postgres 'date'

    // Identity and Country
    nationalityId: string | null;
    nationality?: { id: string; name: string; name_ar: string; } | null;

    identityType: IdentityType | null;
    identityNumber: string | null;
    identityOtherType: string | null;

    identityIssueCountryId: string | null;
    identityIssueCountry?: { id: string; name: string; name_ar: string; } | null;

    // Address
    // address?: {
    //     id: string;
    //     stateId: string;
    //     state: { id: string; name: string };
    //     city: string;
    //     streetName: string;
    //     buildingNumber: string;
    //     postalCode?: string | null;
    //     additionalNumber?: string | null;
    // } | null;

    shortAddress: string | null;

    // Stats
    notificationUnreadCount: number;
    notificationsEnabled: boolean;
    lastLogin: string | null;

    // Metadata from CoreEntity
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}
