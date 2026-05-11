
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import ClientProviders from "./ClientProviders";

export default async function ServerProviders({ children }: { children: React.ReactNode }) {
    const messages = await getMessages();

    return (
        <NextIntlClientProvider messages={messages}>
            <ClientProviders>{children}</ClientProviders>
        </NextIntlClientProvider>
    );
}
