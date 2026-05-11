import Footer from "@/components/molecules/footer/Footer";
import Header from "@/components/molecules/header/Header";


export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </>
    );
}
