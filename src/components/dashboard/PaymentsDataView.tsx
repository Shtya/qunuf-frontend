'use client'

import { usePayments } from "@/hooks/usePayments";
import { PaymentRow } from "@/types/dashboard/payment";
import DataView from "../molecules/DateViewTable/DataView";
import { getPaymentColumns } from "@/constants/dashboard/paymentConstants";
import { useTranslations } from "next-intl";


export default function PaymentsDataView() {
    const { getRows } = usePayments();
    const t = useTranslations('dashboard.payments.table');
    return (
        <DataView<PaymentRow>
            columns={getPaymentColumns(t)}
            getRows={getRows}
            showActions={false}
            pageSize={10}
        />
    );
}