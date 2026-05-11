'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import AboutCard from './AboutCard';
import messagesEn from '@/../messages/en.json';
import messagesAr from '@/../messages/ar.json';

import api from '@/libs/axios';
import { CompanySection, type CompanyInfo } from '@/types/company';
import Popup from '@/components/atoms/Popup';
import AboutSectionForm from './AboutSectionForm';
import { ErrorCard } from '@/components/atoms/ErrorCard';

const defaultImages: Record<string, string> = {
  [CompanySection.VISION]: '/about/vision.jpg',
  [CompanySection.MISSION]: '/about/mission.jpg',
  [CompanySection.GOALS]: '/about/goals.jpg',
  [CompanySection.HISTORY]: '/about/History.jpg',
  [CompanySection.WHY_US]: '/about/Why.jpg',
};

export default function LargeCardSection() {
  const t = useTranslations('dashboard.admin.about');
  const [items, setItems] = useState<Record<string, CompanyInfo | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tComman = useTranslations('comman');

  const [showPopup, setShowPopup] = useState(false);
  const [editedItem, setEditedItem] = useState<{ sectionKey: string | null, item: CompanyInfo | null }>({ sectionKey: null, item: null })

  //get default for massages 
  const aboutEn = (messagesEn as any)?.dashboard?.admin?.about;
  const aboutAr = (messagesAr as any)?.dashboard?.admin?.about;
  const safeKey = editedItem.sectionKey
    ? editedItem.sectionKey.toLowerCase()
    : null; // e.g. 'vision' -> 'VISION'
  const titleEn = safeKey ? aboutEn?.[safeKey]?.defaultTitle ?? '' : '';
  const titleAr = safeKey ? aboutAr?.[safeKey]?.defaultTitle ?? '' : '';

  function onClose() {
    setEditedItem({ sectionKey: null, item: null })
    setShowPopup(false)
  }

  function onOpen({ sectionKey, item }: { sectionKey: string | null, item: CompanyInfo | null }) {
    setEditedItem({ sectionKey, item })
    setShowPopup(true)
  }
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/company-info');
      const data: CompanyInfo[] = res.data || [];

      const map: Record<string, CompanyInfo> = {};
      data.forEach((it) => (map[it.section] = it));

      const result: Record<CompanySection, CompanyInfo | null> = {
        [CompanySection.VISION]: map[CompanySection.VISION] ?? null,
        [CompanySection.MISSION]: map[CompanySection.MISSION] ?? null,
        [CompanySection.GOALS]: map[CompanySection.GOALS] ?? null,
        [CompanySection.HISTORY]: map[CompanySection.HISTORY] ?? null,
        [CompanySection.WHY_US]: map[CompanySection.WHY_US] ?? null,
      };

      setItems(result);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load data");
      setItems({
        [CompanySection.VISION]: null,
        [CompanySection.MISSION]: null,
        [CompanySection.GOALS]: null,
        [CompanySection.HISTORY]: null,
        [CompanySection.WHY_US]: null,
      });
    } finally {
      setLoading(false);
    }
  }, [tComman]);

  useEffect(() => {
    fetchData();
  }, []);

  const sectionsOrder: CompanySection[] = [
    CompanySection.HISTORY,
    CompanySection.WHY_US,
    CompanySection.VISION,
    CompanySection.MISSION,
    CompanySection.GOALS,
  ];


  function handleOnSave(updatedItem: CompanyInfo) {
    setItems((prev) => ({
      ...prev,
      [updatedItem.section]: updatedItem,
    }));
  }


  if (!loading && error) {
    return (
      <ErrorCard
        message={error}
        onAction={() => {
          fetchData();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
      </div>

      {loading
        ? Array.from({ length: 3 }).map((_, idx) => <SkeletonCard key={idx} />)
        : sectionsOrder.map((sectionKey) => (
          <AboutCard
            key={sectionKey}
            onOpen={onOpen}
            sectionKey={sectionKey}
            item={items[sectionKey] ?? null}
          />
        ))}

      {/* Popup */}
      <Popup
        show={showPopup}
        onClose={onClose}
        className="w-full md:w-[720px]"
        headerContent={
          <p className="text-[24px] font-bold text-dark text-center">
            {editedItem.sectionKey
              ? t(`${editedItem.sectionKey}.title`, { fallback: titleEn })
              : ''}
          </p>
        }

      >
        <AboutSectionForm
          key={editedItem?.item?.id}
          initialData={{
            title_en: editedItem?.item?.title_en || titleEn || '',
            title_ar: editedItem?.item?.title_ar || titleAr || '',
            content_en: editedItem?.item?.content_en || '',
            content_ar: editedItem?.item?.content_ar || '',
            image: editedItem?.item?.imagePath
          }}
          onSave={handleOnSave}
          id={editedItem?.item?.id || ''}
          sectionKey={editedItem?.sectionKey || ''}
          onCancel={onClose}
          cancelText={tComman('cancel')}
          actionText={tComman('save')}
        />
      </Popup>
    </div>
  );
}


function SkeletonCard() {
  return (
    <div className="flex flex-col md:flex-row bg-card-bg rounded-[14px] w-full mx-auto animate-pulse">
      <div className="w-[250px] h-[250px] rounded-[12px] bg-gray-300 m-3 shrink-0" />
      <div className="flex flex-col gap-2 flex-1 m-4 md:m-5">
        <div className="h-8 bg-gray-300 w-1/2 mb-4 rounded" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded" />
          <div className="h-4 bg-gray-300 w-5/6 rounded" />
          <div className="h-4 bg-gray-300 w-2/3 rounded" />
        </div>
        <div className="flex items-center justify-center md:justify-start mt-4">
          <div className="h-10 w-24 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
}
