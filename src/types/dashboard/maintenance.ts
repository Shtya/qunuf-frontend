

export type MaintenanceType = "Electrical" | "Plumbing" | "HVAC";

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
