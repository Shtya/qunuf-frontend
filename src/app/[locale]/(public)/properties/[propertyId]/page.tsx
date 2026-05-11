import PageHeroSection from '@/components/atoms/PageHeroSection';
import { getTranslations } from 'next-intl/server';
import api from '@/libs/axios';
import { Property } from '@/types/dashboard/properties';
import { notFound } from 'next/navigation';
import PropertyDetails from '@/components/pages/PropertyDetails/PropertyDetails';

type Props = {
  params: Promise<{
    propertyId: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  try {
    const { propertyId } = await params;
    const res = await api.get<Property>(`/properties/${propertyId}/details`);
    const property = res.data;
    return { title: property.name };
  } catch {
    return { title: 'Property Details' };
  }
}

export default async function PropertyPage({ params }: Props) {
  const { propertyId } = await params;
  const t = await getTranslations('property.details');

  let propertyData: Property;

  try {
    const res = await api.get<Property>(`/properties/${propertyId}/details`);
    propertyData = res.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <div>
      <PageHeroSection
        title={propertyData.name}
        buttonText={t('seeMore')}
      />
      <PropertyDetails property={propertyData} />
    </div>
  );
}