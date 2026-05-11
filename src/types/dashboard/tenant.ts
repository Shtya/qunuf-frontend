import { ContractStatus } from "../global";



export type TenantContractRow = {
    id: string;
    property: {
        id: string;
        imagePath: string;
        name: string;
    }
    status: ContractStatus;
    startDate: Date;
    endDate: Date;
    publishedAt: Date;
    price: number;
    contract: {
        src: string;
        alt?: string;
    }[];
    location: string;
};
