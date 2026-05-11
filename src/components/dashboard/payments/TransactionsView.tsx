import { useTranslations } from "next-intl";
import RentalIncomeCard from "./RentalIncomeCard";

export default function TransactionsView() {
    const t = useTranslations('dashboard.payments.paymentMethods');

    return (
        <>
            <h2 className="text-lg font-medium my-4">{t('recentTransactions')}</h2>
            <div className="mt-5 space-y-4">
                <RentalIncomeCard />
                <RentalIncomeCard />
            </div>
        </>
    );
}
