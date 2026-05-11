
import { getTranslations } from "next-intl/server";
import ResetPasswordClient from "./client";

export async function generateMetadata() {
    const t = await getTranslations('auth.resetPassword');
    return {
        title: t('title'),
    };
}

export default async function ResetPasswordPage() {
    return <ResetPasswordClient />
}

