'use client';

import { Property, PropertyStatus } from '@/types/dashboard/properties';
import { useTranslations } from 'next-intl';
import { MdDelete, MdModeEdit } from 'react-icons/md';
import { BiArchiveIn, BiArchiveOut, BiBuilding } from 'react-icons/bi';
import { FaStar } from 'react-icons/fa';
import { getDashboardHref } from '@/utils/dashboardPaths';
import { PropertyColumns } from '@/constants/properties/constant';
import DataView from '@/components/molecules/DateViewTable/DataView';
import { MenuActionItem } from '@/components/molecules/DateViewTable/MenuActionList';
import ActionPopup from '@/components/atoms/ActionPopup';
import { FaHome } from 'react-icons/fa';
import { useProperties } from '@/hooks/properties/useProperties';
import { useAuth } from '@/contexts/AuthContext';
import { FilterConfig, TableRowType } from '@/types/table';
import api from '@/libs/axios';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import PropertyDetailsPopup from './PropertyDetailsPopup';
import PropertyReviewsPopup from './PropertyReviewsPopup';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import Popup from '@/components/atoms/Popup';

export default function PropertiesDataView() {
  const t = useTranslations('dashboard.properties.table');
  const { getRows, exportRows } = useProperties();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { user, role } = useAuth();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId && (!selectedProperty || selectedProperty.id !== viewId)) {
      // We pass a partial object; the popup handles the full fetch
      setSelectedProperty({ id: viewId } as Property);
    } else if (!viewId && selectedProperty) {
      setSelectedProperty(null);
    }
  }, [searchParams]);

  const handleSetSelected = (property: Property | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (property) {
      params.set('view', property.id);
      setSelectedProperty(property);
    } else {
      params.delete('view');
      setSelectedProperty(null);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const statusOptions = [
    { label: t('statusOptions.all'), value: 'all' },
    { label: t('statusOptions.pending'), value: 'pending' },
    { label: t('statusOptions.active'), value: 'active' },
    { label: t('statusOptions.inactive'), value: 'inactive' },
    { label: t('statusOptions.rejected'), value: 'rejected' },
  ];

  const typeOptions = [
    { label: t('typeOptions.all'), value: 'all' },
    { label: t('typeOptions.residential'), value: 'residential' },
    { label: t('typeOptions.commercial'), value: 'commercial' },
  ];

  const rentedOptions = [
    { label: t('occupancyOptions.all'), value: 'all' },
    { label: t('occupancyOptions.rented'), value: 'true' },
    { label: t('occupancyOptions.available'), value: 'false' },
  ];

  const propertyFilters: FilterConfig[] = [
    {
      key: 'status',
      label: t('filters.status'),
      type: 'select',
      options: statusOptions,
      default: 'all',
    },
    {
      key: 'propertyType',
      label: t('filters.propertyType'),
      type: 'select',
      options: typeOptions,
      default: 'all',
    },
    {
      key: 'isRented',
      label: t('filters.occupancy'),
      type: 'select',
      options: rentedOptions,
      default: 'all',
    },
  ];

  const columns = useMemo(() => PropertyColumns(t, role), [t, role]);

  return (
    <>
      <DataView<Property>
        key={'properties'}
        columns={columns}
        getRows={getRows}
        onExport={exportRows}
        filters={propertyFilters} // إضافة الفلاتر هنا
        showSearch={true}
        searchPlaceholder={t('searchPlaceholder')}
        showActions={true}
        actionsMenuItems={(row: Property): MenuActionItem[] =>
          [
            {
              label: t('viewDetails'),
              Icon: FaHome,
              onClick: () => handleSetSelected(row),
            },
            {
              label: row.status === 'archived' ? t('restoreProperty') : t('archiveProperty'),
              Icon: row.status === 'archived' ? BiArchiveOut : BiArchiveIn,
              Child: ArchivePropertyPopup,
              show: role === 'landlord' && ![PropertyStatus.REJECTED, PropertyStatus.INACTIVE].includes(row.status),
            },
            {
              label: t('editProperty'),
              Icon: MdModeEdit,
              link: `/dashboard/properties/${row.id}/edit`,
              show: role === 'landlord',
            },
            {
              label: t('viewReviews'),
              Icon: FaStar,
              Child: PropertyReviewsPopup,
              show: true,
            },
          ].filter(Boolean) as MenuActionItem[]
        }
        actionButton={{
          show: role === 'landlord' || role === 'admin',
          label: t('addProperty'),
          MobileIcon: BiBuilding,
          href: getDashboardHref('addProperty'),
        }}
        pageSize={10}
      />
      {selectedProperty && (
        <Popup show={true} onClose={() => handleSetSelected(null)}>
          <PropertyDetailsPopup row={selectedProperty} onClose={() => handleSetSelected(null)} />
        </Popup>
      )}
    </>
  );
}

function ArchivePropertyPopup({ row, onClose, setRows }: { row: Property; onClose: () => void; setRows?: React.Dispatch<React.SetStateAction<TableRowType<Property>[] | null>> }) {
  const t = useTranslations('dashboard.properties');
  const [isLoading, setIsLoading] = useState(false);

  // Check if property is currently archived
  const isArchived = row.status === PropertyStatus.ARCHIVED;

  const handleToggleArchive = async () => {
    setIsLoading(true);
    try {
      // Using the same endpoint as a toggle
      await api.patch(`/properties/${row.id}/archive`);

      toast.success(isArchived ? t('archive.restoreSuccess') : t('archive.success'));
      const newStatus = isArchived ? PropertyStatus.PENDING : PropertyStatus.ARCHIVED;
      if (setRows) {
        setRows(prevRows => {
          if (!prevRows) return null;
          return prevRows.map(item => (item.id === row.id ? { ...item, status: newStatus } : item));
        });
      }

      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('archive.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ActionPopup
      title={isArchived ? t('archive.restoreTitle') : t('archive.title')}
      subtitle={`${isArchived ? t('archive.restoreSubtitle') : t('archive.subtitle')} "${row.name}"?`}
      MainIcon={isArchived ? BiArchiveOut : BiArchiveIn}
      mainIconColor={isArchived ? '#22C55E' : '#FFA500'} // Green for restore, Orange for archive
      cancelText={t('cancel')}
      actionText={isLoading ? t('archive.loading') : isArchived ? t('archive.restoreAction') : t('archive.actionText')}
      onCancel={onClose}
      isDisabled={isLoading}
      onAction={handleToggleArchive}
    />
  );
}
