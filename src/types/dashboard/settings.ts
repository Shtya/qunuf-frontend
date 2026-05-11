// Define Settings type (adapt to your entity fields)
export interface Settings {
    privacyPolicy_en?: string | null;
    termsOfService_en?: string | null;
    privacyPolicy_ar?: string | null;
    termsOfService_ar?: string | null;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    fax?: string | null;
    name?: string | null;
    description_ar?: string | null;
    description_en?: string | null;
    facebook?: string | null;
    twitter?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
    pinterest?: string | null;
    tiktok?: string | null;
    youtube?: string | null;
    platformPercent?: number;
    adminUserId?: string;
    defaultContractTerms?: string | null;
}
