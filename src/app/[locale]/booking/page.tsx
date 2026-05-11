
import { getTranslations } from 'next-intl/server';
import BookingClient from './client';


export async function generateMetadata() {
    const t = await getTranslations('bookings');
    return {
        title: t('title'),
    };
}


export default function Booking() {
    return <BookingClient />
}
