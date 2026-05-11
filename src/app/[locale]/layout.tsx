
import {Cairo, Inter, Open_Sans, Roboto_Mono} from 'next/font/google';
import Providers from "../ServerProviders";
import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import "../../styles/globals.css";



 const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
});

 const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap'
});

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap'
});

const arabicFont = Cairo({
  variable: '--font-arabic',
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap'
});


// export async function generateMetadata() {
//   const t = await getTranslations("root");

//   return {
//     title: {
//       default: t("siteName"),          
//       template: `${t("siteName")} | %s`,  
//     },
//     description: t("description"),
//   };
// }

export async function generateMetadata() {
  return {
    title: {
      default: "Real Estate Platform",
      template: "Real Estate Platform | %s",
    },
    description: "Find your perfect property with our real estate platform. Browse apartments, villas, commercial spaces, and more. Rent or buy with confidence.",
    keywords: "real estate, property, apartments, villas, commercial real estate, rent, buy, property management, Saudi Arabia real estate",
    authors: [{ name: "Real Estate Platform" }],
    openGraph: {
      title: "Real Estate Platform",
      description: "Find your perfect property with our real estate platform. Browse apartments, villas, commercial spaces, and more.",
      type: "website",
      locale: "en",
      siteName: "Real Estate Platform",
      url: "https://qunuf.com",
      images: [
        {
          url: "./qunof.png",
          width: 1200,
          height: 630,
          alt: "Real Estate Platform",
        },
      ],
    }, 
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-verification-code", // Add if you have Google Search Console
    },
    alternates: {
      canonical: "https://qunuf.com",
      languages: {
        en: "https://qunuf.com",
        ar: "https://qunuf.com/ar",
      },
    },
  };
}


export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <>
      <html lang={locale} className={`${arabicFont.variable} ${openSans.variable} ${robotoMono.variable} ${inter.variable}`} dir={locale == 'en' ? 'ltr' : 'rtl'}>

        <body className={`$ `}>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </>
  );
}
