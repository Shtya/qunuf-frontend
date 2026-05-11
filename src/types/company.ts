export enum CompanySection {
    VISION = 'vision',
    MISSION = 'mission',
    GOALS = 'goals',
    HISTORY = 'history',
    WHY_US = 'why_us',
}

export interface Team {
    id: string;
    name: string;
    job: string;
    description_en: string;
    description_ar: string;
    imagePath: string;
}

export interface Department {
    id: string;
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    imagePath: string;
}

export interface CompanyInfo {
    id: string;
    section: CompanySection;
    title_en: string;
    title_ar: string;
    content_en: string;
    content_ar: string;
    imagePath?: string;
}
