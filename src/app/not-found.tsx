import { Tajawal } from 'next/font/google';
import '../styles/globals.css'
const plexMomo = Tajawal({
    variable: "--font-app",
    display: "swap",
    subsets: ["latin"],
    weight: ["200", "300", "400", "500", "700", "800", "900"],
});


export default function NotFound() {
    return (
        <div className={`flex items-center justify-center min-h-screen bg-gray-50 px-4 ${plexMomo.variable}`}>
            <div className="text-center max-w-2xl">
                {/* Responsive 404 */}
                <h1 className="text-[80px] sm:text-[120px] lg:text-[160px] font-extrabold text-gray-900 mb-6">
                    404
                </h1>

                {/* Responsive subtitle */}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-700 mb-8">
                    Oops, Page not found!
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-4 text-sm sm:text-base lg:text-lg">
                    The page you're looking for is not found (it may have been moved, deleted, or doesn’t exist). Sorry for the inconvenience.
                </p>

                <p className="text-gray-500 mb-10 text-xs sm:text-sm lg:text-base">
                    If you think this is an error or something is broken, click report.
                </p>

                {/* Custom link instead of SecondaryButton */}
                <a
                    href="/"
                    className="inline-block px-6 sm:px-8 lg:px-10 py-2 sm:py-3 lg:py-4 bg-secondary text-white rounded-lg shadow hover:bg-secondary/90 transition"
                >
                    Go to home
                </a>
            </div>
        </div>
    );
}