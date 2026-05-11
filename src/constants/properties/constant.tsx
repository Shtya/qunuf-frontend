import AdminStatusSelect from "@/components/dashboard/Properties/AdminStatusSelect";
import { PropertyCell } from "@/components/molecules/properties/PropertyCell";
import { Property, PropertyStatus, PropertyType, RentType } from "@/types/dashboard/properties";
import { TableColumnType } from "@/types/table";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
export const locationValues = [
    'all',
    'cairo',
    'alexandria',
    'giza'
] as const;

export const subtypeValues = {
    residential: ['condo', 'multiFamily', 'townhomes', 'singleFamily'],
    commercial: ['office', 'retail', 'warehouse', 'industrial']
} as const;

export const bedroomValues = [
    'all',
    '1',
    '2',
    '3',
    '4',
    'fiveAndMore'
] as const;

export const bathroomValues = [
    'all',
    '1',
    '2',
    '3',
    '4',
    'threeAndMore'
] as const;



export const periodValues: RentType[] = [
    RentType.MONTHLY,
    RentType.YEARLY
] as const;

export const propertyTypeValues: PropertyType[] = [
    PropertyType.RESIDENTIAL,
    PropertyType.COMMERCIAL
] as const;

export const furnishedValues: FurnishedType[] = [
    'furnished',
    'unfurnished'
] as const;


export type FurnishedType = "furnished" | "unfurnished";

export const MIN_PRICE = 1;
export const MAX_PRICE = 1000_000;

export const MIN_SCQUAREFEET = 1;
export const MAX_SCQUAREFEET = 100_000;
const today = new Date();
const currentYear = today.getFullYear();
export const MIN_YEARBUILD = 1900;
export const MAX_YEARBUILD = currentYear;

export type FilterState = {
    location: string; //state id
    period: string; // rent type
    type: string;
    subtype: string[];
    furnished: string;  //"furnished" | "unfurnished";
    bathroom: string; // 'all', '1_0', '1_5', '2_0', '2_5', 'threeAndMore' 
    bedroom: string; // 'all', '1', '2', '3', '4', 'fiveAndMore'
    features: string[]; // list of "maidRoom", "backyard", "centralAC", "desertAC", where if exists so true
    priceMin: number; //rent price
    priceMax: number; //rent price
    scquarefeetMin: number; //min area
    scquarefeetMax: number; //max area
    yearBuiltMin: number;
    yearBuiltMax: number;
};



export const featureKeys = [
    "maidRoom",
    "backyard",
    "centralAC",
    "desertAC",
] as const;

export const PropertyColumns = (t: ReturnType<typeof useTranslations>, role: string): TableColumnType<Property>[] => [
    {
        key: 'name',
        label: t('columns.name'),
        cell(value, row) {
            return <PropertyCell property={row} />;
        },
    },
    {
        key: 'status',
        label: t('columns.status'),
        cell(value, row, setRows) {
            const status = value as string;

            // 1. If Admin, show the Select component
            if (role === 'admin') {
                return (
                    <AdminStatusSelect
                        id={row.id}
                        currentStatus={status}
                        setRows={setRows}
                    />
                );
            }

            // 2. If Landlord, show the existing Badge
            const statusMap: Record<string, { bg: string; text: string; dot: string }> = {
                active: { bg: 'bg-[#ECFDF3]', text: 'text-[#027A48]', dot: 'bg-[#027A48]' },
                pending: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', dot: 'bg-[#92400E]' },
                rejected: { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]', dot: 'bg-[#B91C1C]' },
                archived: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-600' },
            };

            const s = statusMap[status] ?? statusMap.pending;

            return (
                <div className={`${s.bg} ${s.text} flex items-center gap-1.5 rounded-full w-fit px-3 py-0.5 text-xs font-medium border-[1px] border-current/10`}>
                    <div className={`w-1.5 h-1.5 ${s.dot} rounded-full animate-pulse`} />
                    <span>{t(`statusOptions.${status}`)}</span>
                </div>
            );
        },
    },
    {
        key: 'isRented',
        label: t('columns.isRented'),
        cell(value) {
            const isRented = value as boolean;
            return (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${isRented ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                    {isRented ? t('occupancyOptions.rented') : t('occupancyOptions.available')}
                </span>
            );
        }
    },
    {
        key: 'propertyType',
        label: t('columns.type'),
        cell: (value) => value ? t(`typeOptions.${value}`) : "—",
    },
    {
        key: 'rentPrice',
        label: t('columns.price'),
        cell: (value) => (
            <span className="font-bold text-secondary">
                {Number(value).toLocaleString()} <small className="font-normal text-gray-500">SAR</small>
            </span>
        ),
    },
    {
        key: 'created_at',
        label: t('columns.createdAt'),
        cell: (value) => value ? format(new Date(value), 'dd/MM/yyyy') : "—",
    },
];