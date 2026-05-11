
import { PropertyCell } from "@/components/molecules/properties/PropertyCell";
import { PaymentRow } from "@/types/dashboard/payment";
import { TableColumnType } from "@/types/table";
import { format } from "date-fns";
import { useTranslations } from "next-intl";


export const getPaymentColumns = (t: ReturnType<typeof useTranslations>): TableColumnType<PaymentRow>[] => {


    return [
        {
            key: 'id',
            label: t('transactionId'),
        },
        {
            key: 'property',
            label: t('property'),
            cell(value) {
                return <PropertyCell {...value} />;
            },
        },
        {
            key: 'address',
            label: t('propertyAddress'),
            cell(value) {
                return value;
            },
        },
        {
            key: 'type',
            label: t('propertyType'),
            cell(value) {
                return t(value === 'Apartment' ? 'apartment' : 'house');
            },
        },
        {
            key: 'price',
            label: t('price'),
            cell(value) {
                return `${value.toLocaleString()} $`;
            },
        },
        {
            key: 'date',
            label: t('date'),
            cell(value) {
                return format(new Date(value), 'dd MMM yyyy');
            },
        },
    ];
}