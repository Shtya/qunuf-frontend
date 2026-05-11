import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { resolveUrl } from '@/utils/upload'; 

type Property = {
  id: string;
  title: string;
  address: string;
  price: number;
  imageUrl: string;
  slug: string

};
export default function PropertyCard({ property }: { property: any; }) {
  const locale = useLocale()
  const currency = locale === 'ar' ? 'ر.س' : 'SAR';
  const period = property.address.includes('Monthly') || property.address.includes('شهر')
    ? (locale === 'ar' ? '/ شهر' : '/ mo')
    : (locale === 'ar' ? '/ سنة' : '/ yr');

  return (
    <div className='relative w-full max-w-[384px] h-[484px] rounded-[24px] flex items-end bg-light overflow-hidden group shadow-md'>
      {/* ... SVG Decorations and Image as you had them ... */}
      <Image
        src={property.imageUrl ? resolveUrl(property.imageUrl) : '/placeholder.jpg'}
        fill
        alt={property.title}
        className='w-full h-full rounded-[24px] object-cover filter brightness-[0.8] transition-transform duration-500 group-hover:scale-110'
      />

      <div className='absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent'>
        <Link href={`/properties/${property.slug}`} className='block font-bold text-xl text-white hover:text-secondary transition truncate'>
          {property.title}
        </Link>

        {/* Real Value: Type & Rent Frequency instead of long address */}
        <p className='text-[#D4E1FF] text-sm mt-1 font-medium'>
          {property.address}
        </p>

        <div className='text-white mt-3 flex items-baseline gap-1'>
          <span className='font-bold text-2xl'>
            {Number(property.price).toLocaleString()}
          </span>
          <span className='text-sm opacity-90'>{currency} {period}</span>
        </div>

        <div className='mt-5'>
          <Link href={`/properties/${property.slug}`} className='inline-flex items-center rounded-xl bg-secondary hover:bg-secondary-hover text-white px-5 py-2.5 text-sm font-semibold transition-all active:scale-95'>
            {locale === 'ar' ? 'عرض العقار' : 'View Property'}
          </Link>
        </div>
      </div>
    </div>
  );
}