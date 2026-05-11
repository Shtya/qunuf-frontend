
import { getTranslations } from "next-intl/server";
import ForgotPasswordClient from "./client";



export async function generateMetadata() {
    const t = await getTranslations('auth.forgotPassword');
    return {
        title: t('title'),
    };
}

export default async function ForgotPasswordPage() {
    return <ForgotPasswordClient />
}


