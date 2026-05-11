import ContactSection from "@/components/pages/contact/ContactSection";
import PageHeroSection from "@/components/atoms/PageHeroSection";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("contact.hero");

    return {
        title: t("title"), // 👈 localized title
    };
}

export default async function ContactUsPage() {
    const t = await getTranslations('contact.hero');

    return (
        <section
            id="contact-us"
            className="relative overflow-hidden pt-10"> 
            <ContactSection />
        </section>
    );
}