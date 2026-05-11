import {Cairo, Inter, Open_Sans, Roboto_Mono} from 'next/font/google';
import "../styles/globals.css";
import ServerProviders from "./ServerProviders";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${arabicFont.variable} ${openSans.variable} ${robotoMono.variable} ${inter.variable}`}>
      <body className="">
        <ServerProviders>
          {children}
        </ServerProviders>
      </body>
    </html>
  );
}