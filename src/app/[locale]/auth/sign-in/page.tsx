
import { getTranslations } from "next-intl/server";
import SignInClient from "./client";

export async function generateMetadata() {
    const t = await getTranslations('auth.signIn');
    return {
        title: t('title'),
    };
}

export default async function SignInPage() {
    return <SignInClient />
}

