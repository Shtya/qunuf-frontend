import { PaymentRow } from "@/types/dashboard/payment";
import { TableRowType } from "@/types/table";
import { useCallback } from "react";

const payments: PaymentRow[] = [
    {
        id: "txn-001",
        property: {
            id: "property-5",
            imagePath: "/properties/property-5.jpg",
            name: "Modern City Loft",
        },
        address: "Nasr City, Cairo",
        type: "Apartment",
        price: 2800,
        date: new Date("2025-10-01"),
    },
    {
        id: "txn-002",
        property: {
            id: "property-2",
            imagePath: "/properties/property-2.jpg",
            name: "Glacier Pines Cabin",
        },
        type: "House",
        address: "Zamalek, Cairo",
        price: 2500,
        date: new Date("2025-10-05"),
    },
    {
        id: "txn-003",
        property: {
            id: "property-3",
            imagePath: "/properties/property-3.jpg",
            name: "Luxury Beachfront Villa",
        },
        type: "House",
        address: "Maadi, Cairo",
        price: 5000,
        date: new Date("2025-10-10"),
    },
];


export function usePayments() {
    const getRows = useCallback(
        async (_signal?: AbortSignal): Promise<{
            rows: TableRowType<PaymentRow>[];
            error?: Error | null;
            totalCount?: number;
        }> => {
            return {
                rows: payments,
                totalCount: payments.length,
                error: null,
            };
        },
        []
    );

    return { getRows };
}
