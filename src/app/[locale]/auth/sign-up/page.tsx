
import { getTranslations } from "next-intl/server";
import SignUpClient from "./client";

export async function generateMetadata() {
    const t = await getTranslations('auth.signUp');
    return {
        title: t('title'),
    };
}

export default async function SignUpPage() {
    return <SignUpClient />
}