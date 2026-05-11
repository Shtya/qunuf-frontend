'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useValues } from '@/contexts/GlobalContext';
import { cn } from '@/lib/utils';
import api from '@/libs/axios';
import toast from 'react-hot-toast';
import {
    LuPlus, LuTrash2, LuChevronDown, LuChevronUp,
    LuCheck, LuX, LuArrowRight
} from 'react-icons/lu';
import { getDashboardHref } from '@/utils/dashboardPaths';
import Uploader from '@/components/molecules/forms/Uploader';
import LocationInput from '@/components/molecules/forms/LocationInput';
import GoogleMapsSearch, { MapPlaceResult } from './GoogleMapsSearch';
import NearbyFacilitiesSection from './NearbySection';
import { FeaturesTagsInput } from './FeaturesTagsInput';
import {
    BuildingType, CommercialSubType, DocumentType, FurnishingStatus, OwnershipType, PaymentCycle,
    PropertyPurpose, PropertyType, PropertyUsage, RentType, ResidentialSubType,
} from '@/types/dashboard/properties';
import type { Control, FieldErrors, UseFormSetValue } from 'react-hook-form';
import type { FileItem } from '@/utils/upload';
import { LucideAlertCircle, LucideLoader2 } from 'lucide-react';

// ── Constants ──────────────────────────────────────────────────────────────────

const today = new Date();
const todayStr = today.toISOString().split('T')[0];
const MAX_PROPERTIES = 10;

// ── Schema ─────────────────────────────────────────────────────────────────────

const bulkEntrySchema = z.object({
    // Section 1: Ownership Documents
    ownershipType: z.nativeEnum(OwnershipType),
    documentType: z.nativeEnum(DocumentType),
    documentNumber: z.string().trim().min(1, 'Required').max(25, 'Max 25 chars'),
    issuedBy: z.string().trim().min(3, 'Min 3 chars').max(250, 'Max 250 chars'),
    documentIssueDate: z.string().min(1, 'Required').refine(val => {
        const d = new Date(val);
        return !isNaN(d.getTime()) && d <= today;
    }, 'Must be a past date'),
    documentIssueLocation: z.string().trim().max(200).optional(),
    ownerIdNumber: z.string().trim().min(3, 'Min 3 chars').max(20, 'Max 20 chars')
        .regex(/^[a-zA-Z0-9]*$/, 'Letters and numbers only'),

    // Section 2: Property Data
    name: z.string().trim().min(3, 'Min 3 chars').max(100, 'Max 100 chars'),
    nationalAddressCode: z.string().trim()
        .length(8, 'Must be exactly 8 characters')
        .regex(/^[A-Z]{4}\d{4}$|^[0-9]{8}$/, 'Format: AAAA1234 or 12345678'),
    buildingType: z.nativeEnum(BuildingType),
    propertyPurpose: z.nativeEnum(PropertyPurpose),
    numberOfFloors: z.coerce.number().min(0, 'Min 0').max(200, 'Max 200'),
    numberOfUnits: z.coerce.number().min(0, 'Min 0').max(10000, 'Max 10,000'),
    numberOfShops: z.coerce.number().min(0).max(10000).optional(),
    stateId: z.string().min(1, 'State is required'),
    propertyNumber: z.string().trim().min(3, 'Min 3 chars').max(20, 'Max 20 chars')
        .regex(/^[a-zA-Z0-9\-\/]+$/, 'Only letters, numbers, dashes, and slashes'),
    complexName: z.string().trim().max(200).optional(),
    constructionDate: z.string().optional(),
    description: z.string().trim().min(20, 'Min 20 chars').max(2000, 'Max 2000 chars'),
    additionalDetails: z.string().trim().max(1500).optional(),
    propertyType: z.nativeEnum(PropertyType),
    position: z.object({
        lat: z.number().nullable().optional(),
        lng: z.number().nullable().optional(),
    }).optional(),
    insurancePolicyNumber: z.string().trim().max(100).optional(),

    // Section 3: Rental Unit
    subType: z.union([z.nativeEnum(ResidentialSubType), z.nativeEnum(CommercialSubType)]),
    unitNumber: z.string().trim().min(1, 'Required').max(50, 'Max 50 chars'),
    floorNumber: z.coerce.number().min(-10, 'Min -10').max(500, 'Max 500'),
    area: z.coerce.number().min(1, 'Min 1 sqm').max(100_000, 'Max 100,000'),
    isFurnished: z.boolean(),
    furnishingStatus: z.nativeEnum(FurnishingStatus).optional(),
    hasKitchenCabinets: z.boolean().optional(),
    hasCombinedAcUnit: z.boolean(),
    acUnitsCount: z.coerce.number().min(0).max(100).optional(),
    electricityMeterNumber: z.string().trim().max(50).optional(),
    electricityMeterReading: z.coerce.number().min(0).optional(),
    gasMeterNumber: z.string().trim().max(50).optional(),
    gasMeterReading: z.coerce.number().min(0).optional(),
    waterMeterNumber: z.string().trim().max(50).optional(),
    waterMeterReading: z.coerce.number().min(0).optional(),
    facilities: z.object({
        bedrooms: z.coerce.number().min(0).optional(),
        bathrooms: z.coerce.number().min(0).optional(),
        livingRooms: z.coerce.number().min(0).optional(),
        kitchen: z.coerce.number().min(0).optional(),
        parking: z.coerce.number().min(0).optional(),
        elevators: z.coerce.number().min(0).optional(),
        store: z.coerce.number().min(0).optional(),
        majlis: z.coerce.number().min(0).optional(),
        rooms: z.coerce.number().min(0).optional(),
        securityEntrances: z.coerce.number().min(0).optional(),
        maidRoom: z.boolean().optional(),
        backyard: z.boolean().optional(),
        centralAC: z.boolean().optional(),
        desertAC: z.boolean().optional(),
    }).optional(),
    capacity: z.coerce.number().min(0).optional(),
    features: z.array(z.string().max(50)).max(30).optional(),
    educationInstitutions: z.array(z.object({
        name: z.string().min(1, 'Required'),
        distance_km: z.coerce.number().min(0.1).max(50),
    })).max(8).optional(),
    healthMedicalFacilities: z.array(z.object({
        name: z.string().min(1, 'Required'),
        distance_km: z.coerce.number().min(0.1).max(50),
    })).max(8).optional(),

    // Section 2 extra
    propertyUsage: z.nativeEnum(PropertyUsage).optional(),

    // Section 4: Tenant Rights
    subleaseAllowed: z.boolean().optional(),
    securityDeposit: z.coerce.number().min(0, 'Min 0'),
    rentPrice: z.coerce.number().min(1, 'Min 1').max(1_000_000, 'Max 1,000,000'),
    rentType: z.nativeEnum(RentType),
    paymentCycle: z.nativeEnum(PaymentCycle),
    brokerageFee: z.coerce.number().min(0).optional(),
    electricityMonthlyAmount: z.coerce.number().min(0).optional(),
    gasMonthlyAmount: z.coerce.number().min(0).optional(),
    waterMonthlyAmount: z.coerce.number().min(0).optional(),
    parkingMonthlyAmount: z.coerce.number().min(0).optional(),
    parkingLotsRented: z.coerce.number().min(0).max(1000).optional(),
    article11: z.string().trim().min(10, 'Min 10 chars').max(3000, 'Max 3,000 chars'),
    additionalTerms: z.string().trim().max(3000).optional(),

    // Gallery
    images: z.any().refine((f) => Array.isArray(f) && f.length > 0, 'At least one image required'),
});

type BulkEntry = z.infer<typeof bulkEntrySchema>;

const bulkSchema = z.object({
    properties: z.array(bulkEntrySchema).min(1).max(MAX_PROPERTIES),
});

type BulkForm = z.infer<typeof bulkSchema>;

// ── Result types ───────────────────────────────────────────────────────────────

interface SubmitResult {
    created: { name: string }[];
    failed: { index: number; name: string; error: string }[];
}

// ── Defaults ───────────────────────────────────────────────────────────────────

const defaultEntry = (): BulkEntry => ({
    // Section 1
    ownershipType: OwnershipType.OWNER,
    documentType: DocumentType.ELECTRONIC_DEED,
    documentNumber: '',
    issuedBy: '',
    documentIssueDate: '',
    documentIssueLocation: '',
    ownerIdNumber: '',
    // Section 2
    name: '',
    nationalAddressCode: '',
    buildingType: BuildingType.BUILDING,
    propertyPurpose: PropertyPurpose.RENT,
    propertyUsage: undefined,
    numberOfFloors: 0,
    numberOfUnits: 0,
    numberOfShops: undefined,
    stateId: '',
    propertyNumber: '',
    complexName: '',
    constructionDate: '',
    description: '',
    additionalDetails: '',
    propertyType: PropertyType.RESIDENTIAL,
    position: { lat: 24.644911, lng: 46.724039 },
    insurancePolicyNumber: '',
    // Section 3
    subType: ResidentialSubType.APARTMENT,
    unitNumber: '',
    floorNumber: 0,
    area: 0,
    isFurnished: false,
    furnishingStatus: undefined,
    hasKitchenCabinets: false,
    hasCombinedAcUnit: false,
    acUnitsCount: undefined,
    electricityMeterNumber: '',
    electricityMeterReading: undefined,
    gasMeterNumber: '',
    gasMeterReading: undefined,
    waterMeterNumber: '',
    waterMeterReading: undefined,
    facilities: { bedrooms: 0, bathrooms: 0, livingRooms: 0, kitchen: 1, parking: 0, elevators: 0, store: 0, majlis: 0, rooms: 0, securityEntrances: 0, maidRoom: false, backyard: false, centralAC: false, desertAC: false },
    capacity: undefined,
    features: [],
    educationInstitutions: [],
    healthMedicalFacilities: [],
    // Section 4
    subleaseAllowed: false,
    securityDeposit: 0,
    rentPrice: 0,
    rentType: RentType.YEARLY,
    paymentCycle: PaymentCycle.MONTHLY,
    brokerageFee: undefined,
    electricityMonthlyAmount: undefined,
    gasMonthlyAmount: undefined,
    waterMonthlyAmount: undefined,
    parkingMonthlyAmount: undefined,
    parkingLotsRented: undefined,
    article11: '',
    additionalTerms: '',
    images: [],
});

// ── Main Component ─────────────────────────────────────────────────────────────

export default function BulkAddProperties() {
    const t = useTranslations('dashboard.properties.bulk');
    const tForm = useTranslations('dashboard.properties.form');
    const tEnums = useTranslations('property.enums');
    const tCommon = useTranslations('comman');
    const router = useRouter();
    const locale = useLocale();
    const { states } = useValues();

    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set([0]));
    const [submitting, setSubmitting] = useState(false);
    const [submitProgress, setSubmitProgress] = useState({ current: 0, total: 0 });
    const [result, setResult] = useState<SubmitResult | null>(null);

    const { control, handleSubmit, setValue, formState: { errors } } = useForm<BulkForm>({
        // @ts-expect-error - Type inference issue between z.coerce.number() and useForm generics
        resolver: zodResolver(bulkSchema),
        defaultValues: { properties: [defaultEntry()] },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'properties' });

    const toggleRow = (i: number) =>
        setExpandedRows(prev => {
            const next = new Set(prev);
            next.has(i) ? next.delete(i) : next.add(i);
            return next;
        });

    // ── Submission ──────────────────────────────────────────────────────────────

    const onSubmit = async (data: BulkForm) => {
        setSubmitting(true);
        setSubmitProgress({ current: 0, total: data.properties.length });
        const results: SubmitResult = { created: [], failed: [] };

        for (let i = 0; i < data.properties.length; i++) {
            setSubmitProgress({ current: i + 1, total: data.properties.length });
            const prop = data.properties[i];
            const fd = new FormData();

            // Section 1: Ownership Documents
            fd.append('ownershipType', prop.ownershipType);
            fd.append('documentType', prop.documentType);
            fd.append('documentNumber', prop.documentNumber);
            fd.append('issuedBy', prop.issuedBy);
            fd.append('documentIssueDate', prop.documentIssueDate);
            if (prop.documentIssueLocation) fd.append('documentIssueLocation', prop.documentIssueLocation);
            fd.append('ownerIdNumber', prop.ownerIdNumber);

            // Section 2: Property Data
            fd.append('name', prop.name);
            fd.append('nationalAddressCode', prop.nationalAddressCode);
            fd.append('buildingType', prop.buildingType);
            fd.append('propertyPurpose', prop.propertyPurpose);
            if (prop.propertyUsage) fd.append('propertyUsage', prop.propertyUsage);
            fd.append('numberOfFloors', prop.numberOfFloors.toString());
            fd.append('numberOfUnits', prop.numberOfUnits.toString());
            if (prop.numberOfShops != null) fd.append('numberOfShops', prop.numberOfShops.toString());
            fd.append('stateId', prop.stateId);
            fd.append('propertyNumber', prop.propertyNumber);
            if (prop.complexName) fd.append('complexName', prop.complexName);
            if (prop.constructionDate) fd.append('constructionDate', prop.constructionDate);
            fd.append('description', prop.description);
            if (prop.additionalDetails) fd.append('additionalDetails', prop.additionalDetails);
            fd.append('propertyType', prop.propertyType);
            if (prop.position?.lat) fd.append('latitude', prop.position.lat.toString());
            if (prop.position?.lng) fd.append('longitude', prop.position.lng.toString());
            if (prop.insurancePolicyNumber) fd.append('insurancePolicyNumber', prop.insurancePolicyNumber);

            // Section 3: Rental Unit
            fd.append('subType', prop.subType);
            fd.append('unitNumber', prop.unitNumber);
            fd.append('floorNumber', prop.floorNumber.toString());
            fd.append('area', prop.area.toString());
            fd.append('isFurnished', String(prop.isFurnished));
            if (prop.furnishingStatus) fd.append('furnishingStatus', prop.furnishingStatus);
            if (prop.hasKitchenCabinets != null) fd.append('hasKitchenCabinets', String(prop.hasKitchenCabinets));
            fd.append('hasCombinedAcUnit', String(prop.hasCombinedAcUnit));
            if (prop.acUnitsCount != null) fd.append('acUnitsCount', prop.acUnitsCount.toString());
            if (prop.capacity != null) fd.append('capacity', prop.capacity.toString());
            if (prop.features && prop.features.length > 0) {
                prop.features.forEach((f: string) => fd.append('features[]', f));
            }
            if (prop.educationInstitutions && prop.educationInstitutions.length > 0) {
                prop.educationInstitutions.forEach((f, i) => {
                    fd.append(`educationInstitutions[${i}][name]`, f.name);
                    fd.append(`educationInstitutions[${i}][distance_km]`, f.distance_km.toString());
                });
            }
            if (prop.healthMedicalFacilities && prop.healthMedicalFacilities.length > 0) {
                prop.healthMedicalFacilities.forEach((f, i) => {
                    fd.append(`healthMedicalFacilities[${i}][name]`, f.name);
                    fd.append(`healthMedicalFacilities[${i}][distance_km]`, f.distance_km.toString());
                });
            }
            if (prop.electricityMeterNumber) fd.append('electricityMeterNumber', prop.electricityMeterNumber);
            if (prop.electricityMeterReading != null) fd.append('electricityMeterReading', prop.electricityMeterReading.toString());
            if (prop.gasMeterNumber) fd.append('gasMeterNumber', prop.gasMeterNumber);
            if (prop.gasMeterReading != null) fd.append('gasMeterReading', prop.gasMeterReading.toString());
            if (prop.waterMeterNumber) fd.append('waterMeterNumber', prop.waterMeterNumber);
            if (prop.waterMeterReading != null) fd.append('waterMeterReading', prop.waterMeterReading.toString());
            if (prop.facilities) {
                Object.entries(prop.facilities).forEach(([key, val]) => {
                    if (val != null) fd.append(`facilities[${key}]`, val.toString());
                });
            }

            // Section 4: Tenant Rights
            if (prop.subleaseAllowed != null) fd.append('subleaseAllowed', String(prop.subleaseAllowed));
            fd.append('securityDeposit', prop.securityDeposit.toString());
            fd.append('rentPrice', prop.rentPrice.toString());
            fd.append('rentType', prop.rentType);
            fd.append('paymentCycle', prop.paymentCycle);
            if (prop.brokerageFee != null) fd.append('brokerageFee', prop.brokerageFee.toString());
            if (prop.electricityMonthlyAmount != null) fd.append('electricityMonthlyAmount', prop.electricityMonthlyAmount.toString());
            if (prop.gasMonthlyAmount != null) fd.append('gasMonthlyAmount', prop.gasMonthlyAmount.toString());
            if (prop.waterMonthlyAmount != null) fd.append('waterMonthlyAmount', prop.waterMonthlyAmount.toString());
            if (prop.parkingMonthlyAmount != null) fd.append('parkingMonthlyAmount', prop.parkingMonthlyAmount.toString());
            if (prop.parkingLotsRented != null) fd.append('parkingLotsRented', prop.parkingLotsRented.toString());
            fd.append('article11', prop.article11);
            if (prop.additionalTerms) fd.append('additionalTerms', prop.additionalTerms);

            // Gallery
            const images = Array.isArray(prop.images) ? (prop.images as FileItem[]) : [];
            let primaryIndex = 0;
            images.forEach((img, idx) => {
                if (img.file) fd.append('images', img.file);
                if (img.isPrimary) primaryIndex = idx;
            });
            fd.append('primaryImageIndex', primaryIndex.toString());

            try {
                await api.post('/properties', fd);
                results.created.push({ name: prop.name });
            } catch (err: any) {
                const msg = err?.response?.data?.message;
                results.failed.push({
                    index: i,
                    name: prop.name,
                    error: Array.isArray(msg) ? msg[0] : (msg ?? 'Submission failed'),
                });
            }
        }

        setResult(results);
        setSubmitting(false);
        if (results.created.length > 0) toast.success(t('result.created', { n: results.created.length }));
        if (results.failed.length > 0) toast.error(t('result.failed', { n: results.failed.length }));
    };

    // ── Result screen ───────────────────────────────────────────────────────────

    if (result) {
        return (
            <ResultScreen
                result={result}
                onAddMore={() => setResult(null)}
                onView={() => router.push(getDashboardHref('properties') as any)}
                t={t}
            />
        );
    }

    // ── Main form ───────────────────────────────────────────────────────────────

    return (
        <div className="max-w-4xl mx-auto py-6 px-4 space-y-4">

            {/* Submission overlay */}
            {submitting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
                        <LucideLoader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
                        <h3 className="text-[16px] font-black text-dark mb-1">{t('submitting')}</h3>
                        <p className="text-[13px] text-dark/50 mb-5">
                            {submitProgress.current} / {submitProgress.total}
                        </p>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                                className="bg-primary rounded-full h-2 transition-all duration-300"
                                style={{ width: `${(submitProgress.current / submitProgress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="rounded-2xl bg-white/80 backdrop-blur-xl ring-1 ring-inset ring-white/70 shadow-[0_2px_1px_rgba(0,0,0,0.04),0_6px_16px_rgba(0,0,0,0.06)] px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-secondary/10 to-primary/10 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-[18px] font-black text-dark">{t('title')}</h1>
                        <p className="text-[12px] text-dark/50 mt-0.5">
                            {t('description')}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-3" noValidate>
                {fields.map((field, i) => (
                    <PropertyEntryCard
                        key={field.id}
                        index={i}
                        control={control}
                        errors={errors}
                        setValue={setValue}
                        onRemove={() => remove(i)}
                        canRemove={fields.length > 1}
                        isExpanded={expandedRows.has(i)}
                        onToggle={() => toggleRow(i)}
                        states={states}
                        locale={locale}
                        t={t}
                        tForm={tForm}
                        tEnums={tEnums}
                        tCommon={tCommon}
                        todayStr={todayStr}
                    />
                ))}

                {/* Add property button */}
                <button
                    type="button"
                    onClick={() => {
                        append(defaultEntry());
                        setExpandedRows(prev => new Set([...prev, fields.length]));
                    }}
                    disabled={fields.length >= MAX_PROPERTIES}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl
                        border-2 border-dashed border-primary/25 hover:border-primary/50
                        text-[13px] font-semibold text-primary/60 hover:text-primary
                        bg-primary/3 hover:bg-primary/6
                        transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none"
                >
                    <LuPlus className="w-4 h-4" />
                    {t('addRow')} ({fields.length}/{MAX_PROPERTIES})
                </button>

                {/* Submit bar */}
                <div className="sticky bottom-4 z-20 pt-2">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl
                            bg-primary hover:bg-primary/90 text-white
                            text-[14px] font-bold shadow-lg shadow-primary/25
                            transition-all duration-150 disabled:opacity-60 disabled:pointer-events-none"
                    >
                        {t('submitAll')} ({fields.length})
                    </button>
                </div>
            </form>
        </div>
    );
}

// ── Property Entry Card ────────────────────────────────────────────────────────

interface EntryCardProps {
    index: number;
    control: any;
    errors: FieldErrors<BulkForm>;
    setValue: UseFormSetValue<BulkForm>;
    onRemove: () => void;
    canRemove: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    states: any[];
    locale: string;
    t: any;
    tForm: any;
    tEnums: any;
    tCommon: any;
    todayStr: string;
}

function PropertyEntryCard({
    index, control, errors, setValue, onRemove, canRemove,
    isExpanded, onToggle, states, locale, t, tForm, tEnums, tCommon, todayStr,
}: EntryCardProps) {
    const propertyType = useWatch({ control, name: `properties.${index}.propertyType` });
    const currentSubType: any = useWatch({ control, name: `properties.${index}.subType` });
    const entryName = useWatch({ control, name: `properties.${index}.name` });
    const hasCombinedAcUnit = useWatch({ control, name: `properties.${index}.hasCombinedAcUnit` });
    const isFurnishedValue = useWatch({ control, name: `properties.${index}.isFurnished` });
    const watchedRentPrice = useWatch({ control, name: `properties.${index}.rentPrice` }) as number;
    const watchedPaymentCycle = useWatch({ control, name: `properties.${index}.paymentCycle` });
    const positionMap = useWatch({ control, name: `properties.${index}.position` });

    const entryErrors = errors.properties?.[index];
    const errorCount = entryErrors ? Object.keys(entryErrors).length : 0;

    const residentialSubTypes = Object.values(ResidentialSubType);
    const commercialSubTypes = Object.values(CommercialSubType);
    const subTypes = propertyType === PropertyType.COMMERCIAL ? commercialSubTypes : residentialSubTypes;
    const subTypePath = propertyType === PropertyType.COMMERCIAL ? 'commercial' : 'residential';

    // Auto-calculate payments per year
    const paymentsPerYear =
        watchedPaymentCycle === PaymentCycle.MONTHLY ? 12
        : watchedPaymentCycle === PaymentCycle.QUARTERLY ? 4
        : watchedPaymentCycle === PaymentCycle.SEMI_ANNUAL ? 2
        : 1;
    const paymentAmount = watchedRentPrice > 0 ? Math.round(watchedRentPrice / paymentsPerYear) : 0;

    // Map reverse geocoding
    const abortControllerRef = useRef<AbortController | null>(null);
    useEffect(() => {
        if (!positionMap?.lat || !positionMap?.lng) return;
        const lat = positionMap.lat;
        const lng = positionMap.lng;
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;
        fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
            { signal: controller.signal }
        )
            .then(res => res.json())
            .then(data => {
                const address = data.address;
                if (address?.country_code !== 'sa') { setValue(`properties.${index}.stateId`, ''); return; }
                const regionCode = address['ISO3166-2-lvl4'];
                if (!regionCode) { setValue(`properties.${index}.stateId`, ''); return; }
                const normalize = (s: string) => s.replace(/[-–—]/g, '-');
                const matchedState = states.find((s: any) => normalize(s.region_code) === normalize(regionCode));
                setValue(`properties.${index}.stateId`, matchedState?.id ?? '');
            })
            .catch(err => { if (err.name !== 'AbortError') setValue(`properties.${index}.stateId`, ''); });
        return () => { abortControllerRef.current?.abort(); };
    }, [positionMap?.lat, positionMap?.lng]);

    const handleGooglePlaceSelect = useCallback((result: MapPlaceResult) => {
        setValue(`properties.${index}.position`, { lat: result.lat, lng: result.lng });
        if (result.postalCode && /^[0-9]{8}$/.test(result.postalCode)) {
            setValue(`properties.${index}.nationalAddressCode`, result.postalCode);
        }
    }, [index, setValue]);

    // Reset subType when propertyType changes
    useEffect(() => {
        const validSubTypes: any = propertyType === PropertyType.COMMERCIAL
            ? commercialSubTypes
            : residentialSubTypes;
        if (!validSubTypes.includes(currentSubType)) {
            setValue(`properties.${index}.subType`, validSubTypes[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propertyType]);

    return (
        <div className={cn(
            'rounded-2xl bg-white/80 backdrop-blur-xl ring-1 ring-inset ring-white/70',
            'shadow-[0_2px_1px_rgba(0,0,0,0.04),0_6px_16px_rgba(0,0,0,0.06)]',
            'overflow-hidden transition-all duration-200',
            errorCount > 0 ? 'ring-red-300/60' : 'ring-white/70',
        )}>
            {/* ── Header ── */}
            <div
                className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-black/2 transition-colors select-none"
                onClick={onToggle}
            >
                <span className={cn(
                    'w-7 h-7 rounded-full text-[12px] font-black flex items-center justify-center shrink-0',
                    errorCount > 0 ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary',
                )}>
                    {errorCount > 0 ? <LucideAlertCircle className="w-3.5 h-3.5" /> : index + 1}
                </span>

                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-dark truncate">
                        {entryName || t('propertyN', { n: index + 1 })}
                    </p>
                    {errorCount > 0 && (
                        <p className="text-[10px] text-red-500 font-medium">
                            {errorCount} field{errorCount > 1 ? 's' : ''} need attention
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={e => { e.stopPropagation(); onRemove(); }}
                    disabled={!canRemove}
                    className="w-7 h-7 flex items-center justify-center rounded-lg
                        text-dark/30 hover:text-red-500 hover:bg-red-50
                        transition-all duration-150 disabled:opacity-30"
                >
                    <LuTrash2 className="w-3.5 h-3.5" />
                </button>

                {isExpanded
                    ? <LuChevronUp className="w-4 h-4 text-dark/40 shrink-0" />
                    : <LuChevronDown className="w-4 h-4 text-dark/40 shrink-0" />
                }
            </div>

            {/* ── Body ── */}
            {isExpanded && (
                <div className="px-5 pb-6 border-t border-black/5 pt-5 space-y-6">

                    {/* ══ SECTION 1: Ownership Documents ══ */}
                    <InlineSection title={tForm('ownershipDocuments')} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div>
                            <FieldLabel label={tForm('ownershipType')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.ownershipType`}
                                render={({ field }) => (
                                    <select {...field} className={inputCls(false)}>
                                        {Object.values(OwnershipType).map(v => (
                                            <option key={v} value={v}>{tEnums(`ownershipType.${v}` as any)}</option>
                                        ))}
                                    </select>
                                )}
                            />
                        </div>

                        <div>
                            <FieldLabel label={tForm('documentType')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.documentType`}
                                render={({ field }) => (
                                    <select {...field} className={inputCls(false)}>
                                        {Object.values(DocumentType).map(v => (
                                            <option key={v} value={v}>{tEnums(`documentType.${v}` as any)}</option>
                                        ))}
                                    </select>
                                )}
                            />
                        </div>

                        <div>
                            <FieldLabel label={tForm('documentNumber')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.documentNumber`}
                                render={({ field }) => (
                                    <input {...field} placeholder={tForm('placeholders.documentNumber')}
                                        className={inputCls(!!entryErrors?.documentNumber)} />
                                )}
                            />
                            <FieldError msg={entryErrors?.documentNumber?.message} />
                        </div>

                        <div>
                            <FieldLabel label={tForm('issuedBy')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.issuedBy`}
                                render={({ field }) => (
                                    <input {...field} placeholder={tForm('placeholders.issuedBy')}
                                        className={inputCls(!!entryErrors?.issuedBy)} />
                                )}
                            />
                            <FieldError msg={entryErrors?.issuedBy?.message} />
                        </div>

                        <div>
                            <FieldLabel label={tForm('documentIssueDate')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.documentIssueDate`}
                                render={({ field }) => (
                                    <input {...field} type="date" max={todayStr}
                                        className={inputCls(!!entryErrors?.documentIssueDate)} />
                                )}
                            />
                            <FieldError msg={entryErrors?.documentIssueDate?.message} />
                        </div>

                        <div>
                            <FieldLabel label={tForm('documentIssueLocation')} />
                            <Controller
                                control={control}
                                name={`properties.${index}.documentIssueLocation`}
                                render={({ field }) => (
                                    <input {...field} placeholder={tForm('placeholders.documentIssueLocation')}
                                        className={inputCls(false)} />
                                )}
                            />
                        </div>

                        <div>
                            <FieldLabel label={tForm('ownerIdNumber')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.ownerIdNumber`}
                                render={({ field }) => (
                                    <input {...field} placeholder={tForm('placeholders.ownerIdNumber')}
                                        className={inputCls(!!entryErrors?.ownerIdNumber)} />
                                )}
                            />
                            <FieldError msg={entryErrors?.ownerIdNumber?.message} />
                        </div>
                    </div>

                    {/* ══ SECTION 2: Property Data ══ */}
                    <InlineSection title={tForm('propertyData')} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div className="sm:col-span-2">
                            <FieldLabel label={tForm('title')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.name`}
                                render={({ field }) => (
                                    <input {...field} placeholder={tForm('placeholders.name')}
                                        className={inputCls(!!entryErrors?.name)} />
                                )}
                            />
                            <FieldError msg={entryErrors?.name?.message} />
                        </div>

                        <div>
                            <FieldLabel label={tForm('nationalAddressCode')} required />
                             <Controller
                                control={control}
                                name={`properties.${index}.nationalAddressCode`}
                                render={({ field }) => (
                                    <input {...field} maxLength={8} placeholder="e.g. RRRE1234"
                                        className={inputCls(!!entryErrors?.nationalAddressCode)} />
                                )}
                            />
                            <FieldError msg={entryErrors?.nationalAddressCode?.message} />
                        </div>

                        {/* Insurance Policy Number */}
                        <div>
                            <FieldLabel label={tForm('insurancePolicyNumber')} />
                            <Controller
                                control={control}
                                name={`properties.${index}.insurancePolicyNumber`}
                                render={({ field }) => (
                                    <input {...field} placeholder={tForm('placeholders.insurancePolicyNumber')}
                                        className={inputCls(false)} />
                                )}
                            />
                        </div>

                        {/* Google Maps Search */}
                        <div className="sm:col-span-2">
                            <GoogleMapsSearch
                                onPlaceSelect={handleGooglePlaceSelect}
                                label={tForm('searchAddress')}
                                placeholder={tForm('placeholders.searchAddress')}
                                className="w-full"
                            />
                        </div>

                        {/* Map */}
                        <div className="sm:col-span-2">
                            <FieldLabel label={tForm('location')} />
                            <div className="rounded-xl overflow-hidden border border-black/10">
                                <LocationInput showAddress={false} control={control} name={`properties.${index}.position`} />
                            </div>
                        </div>

                        <div>
                            <FieldLabel label={tForm('buildingType')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.buildingType`}
                                render={({ field }) => (
                                    <select {...field} className={inputCls(!!entryErrors?.buildingType)}>
                                        {Object.values(BuildingType).map(v => (
                                            <option key={v} value={v}>{tEnums(`buildingType.${v}` as any)}</option>
                                        ))}
                                    </select>
                                )}
                            />
                            <FieldError msg={entryErrors?.buildingType?.message} />
                        </div>

                        <div>
                            <FieldLabel label={tForm('propertyPurpose')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.propertyPurpose`}
                                render={({ field }) => (
                                    <select {...field} className={inputCls(!!entryErrors?.propertyPurpose)}>
                                        {Object.values(PropertyPurpose).map(v => (
                                            <option key={v} value={v}>{tEnums(`propertyPurpose.${v}` as any)}</option>
                                        ))}
                                    </select>
                                )}
                            />
                            <FieldError msg={entryErrors?.propertyPurpose?.message} />
                        </div>

                        <div>
                            <FieldLabel label={tForm('propertyUsage')} />
                            <Controller
                                control={control}
                                name={`properties.${index}.propertyUsage`}
                                render={({ field }) => (
                                    <select {...field} className={inputCls(false)}>
                                        <option value="">—</option>
                                        {Object.values(PropertyUsage).map(v => (
                                            <option key={v} value={v}>{tEnums(`propertyUsage.${v}` as any)}</option>
                                        ))}
                                    </select>
                                )}
                            />
                        </div>

                        <div>
                            <FieldLabel label={tForm('numberOfFloors')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.numberOfFloors`}
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0"
                                        className={inputCls(!!entryErrors?.numberOfFloors)} />
                                )}
                            />
                            <FieldError msg={entryErrors?.numberOfFloors?.message} />
                        </div>

                        <div>
                            <FieldLabel label={tForm('numberOfUnits')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.numberOfUnits`}
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0"
                                        className={inputCls(!!entryErrors?.numberOfUnits)} />
                                )}
                            />
                            <FieldError msg={entryErrors?.numberOfUnits?.message} />
                        </div>

                        <div>
                            <FieldLabel label={tForm('numberOfShops')} />
                            <Controller
                                control={control}
                                name={`properties.${index}.numberOfShops`}
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0"
                                        className={inputCls(false)} />
                                )}
                            />
                        </div>

                        <div>
                            <FieldLabel label={tForm('parking')} />
                            <Controller
                                control={control}
                                name={`properties.${index}.facilities.parking`}
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0"
                                        className={inputCls(false)} />
                                )}
                            />
                        </div>

                        <div>
                            <FieldLabel label={tForm('stateId')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.stateId`}
                                render={({ field }) => (
                                    <select {...field} className={inputCls(!!entryErrors?.stateId)}>
                                        <option value="">— {t("Select region")} —</option>
                                        {(states as { id: string; name: string; name_ar: string }[]).map(s => (
                                            <option key={s.id} value={s.id}>
                                                {locale === 'ar' ? s.name_ar : s.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                            <FieldError msg={entryErrors?.stateId?.message} />
                        </div>

                        <div>
                            <FieldLabel label={tForm('propertyNumber')} required />
                             <Controller
                                control={control}
                                name={`properties.${index}.propertyNumber`}
                                render={({ field }) => (
                                    <input {...field} placeholder={tForm('placeholders.propertyNumber')}
                                        className={inputCls(!!entryErrors?.propertyNumber)} />
                                )}
                            />
                            <FieldError msg={entryErrors?.propertyNumber?.message} />
                        </div>

                        <div>
                            <FieldLabel label={tForm('propertyType')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.propertyType`}
                                render={({ field }) => (
                                    <select {...field} className={inputCls(false)}>
                                        {Object.values(PropertyType).map(v => (
                                            <option key={v} value={v}>{tEnums(`propertyType.${v}` as any)}</option>
                                        ))}
                                    </select>
                                )}
                            />
                        </div>

                        <div>
                            <FieldLabel label={tForm('complexName')} />
                            <Controller
                                control={control}
                                name={`properties.${index}.complexName`}
                                render={({ field }) => (
                                    <input {...field} placeholder={tForm('placeholders.complexName')}
                                        className={inputCls(false)} />
                                )}
                            />
                        </div>

                        <div>
                            <FieldLabel label={tForm('constructionDate')} />
                            <Controller
                                control={control}
                                name={`properties.${index}.constructionDate`}
                                render={({ field }) => (
                                    <input {...field} type="date" max={todayStr} className={inputCls(false)} />
                                )}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <FieldLabel label={tForm('description')} required />
                             <Controller
                                control={control}
                                name={`properties.${index}.description`}
                                render={({ field }) => (
                                    <textarea {...field} rows={3}
                                        placeholder={tForm('placeholders.description')}
                                        className={cn(inputCls(!!entryErrors?.description), 'resize-none')} />
                                )}
                            />
                            <FieldError msg={entryErrors?.description?.message} />
                        </div>

                        <div className="sm:col-span-2">
                            <FieldLabel label={tForm('additionalDetails')} />
                            <Controller
                                control={control}
                                name={`properties.${index}.additionalDetails`}
                                render={({ field }) => (
                                    <textarea {...field} rows={2}
                                        placeholder={tForm('placeholders.additionalDetails')}
                                        className={cn(inputCls(false), 'resize-none')} />
                                )}
                            />
                        </div>
                    </div>

                    {/* ══ SECTION 3: Rental Unit ══ */}
                    <InlineSection title={tForm('rentalUnit')} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div>
                            <FieldLabel label={tForm('subType')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.subType`}
                                render={({ field }) => (
                                    <select {...field} className={inputCls(!!entryErrors?.subType)}>
                                        {subTypes.map(v => (
                                            <option key={v} value={v}>
                                                {tEnums(`subType.${subTypePath}.${v}` as any)}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                            <FieldError msg={entryErrors?.subType?.message} />
                        </div>

                        <div>
                            <FieldLabel label={tForm('unitNumber')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.unitNumber`}
                                render={({ field }) => (
                                    <input {...field} placeholder={tForm('placeholders.unitNumber')}
                                        className={inputCls(!!entryErrors?.unitNumber)} />
                                )}
                            />
                            <FieldError msg={entryErrors?.unitNumber?.message} />
                        </div>

                        <div>
                            <FieldLabel label={tForm('floorNumber')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.floorNumber`}
                                render={({ field }) => (
                                    <input {...field} type="number" placeholder="0"
                                        className={inputCls(!!entryErrors?.floorNumber)} />
                                )}
                            />
                            <FieldError msg={entryErrors?.floorNumber?.message} />
                        </div>

                        <div>
                            <FieldLabel label={tForm('size')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.area`}
                                render={({ field }) => (
                                    <input {...field} type="number" min={1} placeholder="0"
                                        className={inputCls(!!entryErrors?.area)} />
                                )}
                            />
                            <FieldError msg={entryErrors?.area?.message} />
                        </div>

                        {/* Booleans row */}
                        <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <Controller
                                control={control}
                                name={`properties.${index}.isFurnished`}
                                render={({ field }) => (
                                    <BoolToggle
                                        label={`${tForm('isFurnished')} ★`}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name={`properties.${index}.hasKitchenCabinets`}
                                render={({ field }) => (
                                    <BoolToggle
                                        label={tForm('hasKitchenCabinets')}
                                        value={!!field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name={`properties.${index}.hasCombinedAcUnit`}
                                render={({ field }) => (
                                    <BoolToggle
                                        label={`${tForm('hasCombinedAcUnit')} ★`}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </div>

                        {/* Furnishing Status — conditional on isFurnished */}
                        {isFurnishedValue && (
                            <div>
                                <FieldLabel label={tForm('furnishingStatus')} />
                                <Controller
                                    control={control}
                                    name={`properties.${index}.furnishingStatus`}
                                    render={({ field }) => (
                                        <select {...field} className={inputCls(false)}>
                                            <option value="">—</option>
                                            {Object.values(FurnishingStatus).map(v => (
                                                <option key={v} value={v}>{tEnums(`furnishingStatus.${v}` as any)}</option>
                                            ))}
                                        </select>
                                    )}
                                />
                            </div>
                        )}

                        {hasCombinedAcUnit && (
                            <div>
                                <FieldLabel label={tForm('acUnitsCount')} required />
                                <Controller
                                    control={control}
                                    name={`properties.${index}.acUnitsCount`}
                                    render={({ field }) => (
                                        <input {...field} type="number" min={0} placeholder="0"
                                            className={inputCls(false)} />
                                    )}
                                />
                            </div>
                        )}
                    </div>

                    {/* Meters */}
                    <CollapsibleSection title={`${tForm('utilities')} ${t("(Optional)")}`}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                            {([
                                ['electricityMeterNumber', 'electricityMeterReading', tForm('electricityMeterNumber'), tForm('electricityMeterReading')],
                                ['gasMeterNumber', 'gasMeterReading', tForm('gasMeterNumber'), tForm('gasMeterReading')],
                                ['waterMeterNumber', 'waterMeterReading', tForm('waterMeterNumber'), tForm('waterMeterReading')],
                            ] as const).map(([numKey, readKey, numLabel, readLabel]) => (
                                <div key={numKey} className="space-y-2">
                                    <div>
                                        <FieldLabel label={numLabel as string} />
                                        <Controller
                                            control={control}
                                            name={`properties.${index}.${numKey}` as any}
                                            render={({ field }) => (
                                                <input {...field} placeholder={t("Meter number")} className={inputCls(false)} />
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel label={`↳ ${readLabel as string}`} />
                                        <Controller
                                            control={control}
                                            name={`properties.${index}.${readKey}` as any}
                                            render={({ field }) => (
                                                <input {...field} type="number" min={0} placeholder="0" className={inputCls(false)} />
                                            )}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CollapsibleSection>

                    {/* Facilities */}
                    <CollapsibleSection title={`${tForm('facilities')} ${t("(Optional)")}`}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                            {(['maidRoom', 'backyard', 'centralAC', 'desertAC'] as const).map(key => (
                                <Controller key={key} control={control} name={`properties.${index}.facilities.${key}` as any}
                                    render={({ field }: any) => (
                                        <BoolToggle label={tForm(key)} value={!!field.value} onChange={field.onChange} />
                                    )} />
                            ))}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                            {(['bedrooms', 'bathrooms', 'livingRooms', 'kitchen', 'elevators', 'store', 'majlis', 'rooms', 'securityEntrances'] as const).map(key => (
                                <div key={key}>
                                    <FieldLabel label={tForm(key)} />
                                    <Controller
                                        control={control}
                                        name={`properties.${index}.facilities.${key}`}
                                        render={({ field }) => (
                                            <input {...field} type="number" min={0} className={inputCls(false)} />
                                        )}
                                    />
                                </div>
                            ))}
                        </div>
                    </CollapsibleSection>

                    {/* Features & Nearby */}
                    <div className="space-y-4">
                        <FeaturesTagsInput
                            control={control}
                            label={tForm('features')}
                            name={`properties.${index}.features` as any}
                            placeholder={tForm('featuresPlaceholder')}
                            errors={errors}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-black/5">
                            <NearbyFacilitiesSection errors={errors} control={control}
                                name={`properties.${index}.educationInstitutions` as any}
                                label={tForm('educationInstitutions')} />
                            <NearbyFacilitiesSection errors={errors} control={control}
                                name={`properties.${index}.healthMedicalFacilities` as any}
                                label={tForm('healthMedicalFacilities')} />
                        </div>
                    </div>

                    {/* ══ SECTION 4: Tenant Rights ══ */}
                    <InlineSection title={tForm('tenantRights')} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Sublease */}
                        <div className="sm:col-span-2">
                            <Controller
                                control={control}
                                name={`properties.${index}.subleaseAllowed`}
                                render={({ field }) => (
                                    <BoolToggle
                                        label={tForm('subleaseAllowed')}
                                        value={!!field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <FieldLabel label={tForm('securityDeposit')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.securityDeposit`}
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0"
                                        className={inputCls(!!entryErrors?.securityDeposit)} />
                                )}
                            />
                            <FieldError msg={entryErrors?.securityDeposit?.message} />
                        </div>

                        <div>
                            <FieldLabel label={tForm('price')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.rentPrice`}
                                render={({ field }) => (
                                    <input {...field} type="number" min={1} placeholder="0"
                                        className={inputCls(!!entryErrors?.rentPrice)} />
                                )}
                            />
                            <FieldError msg={entryErrors?.rentPrice?.message} />
                        </div>

                        <div>
                            <FieldLabel label={tForm('capacity')} />
                            <Controller
                                control={control}
                                name={`properties.${index}.capacity`}
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0" className={inputCls(false)} />
                                )}
                            />
                        </div>

                        <div>
                            <FieldLabel label={tForm('rentType')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.rentType`}
                                render={({ field }) => (
                                    <select {...field} className={inputCls(false)}>
                                        {Object.values(RentType).map(v => (
                                            <option key={v} value={v}>{tEnums(`rentType.${v}` as any)}</option>
                                        ))}
                                    </select>
                                )}
                            />
                        </div>

                        <div>
                            <FieldLabel label={tForm('paymentCycle')} required />
                            <Controller
                                control={control}
                                name={`properties.${index}.paymentCycle`}
                                render={({ field }) => (
                                    <select {...field} className={inputCls(!!entryErrors?.paymentCycle)}>
                                        {Object.values(PaymentCycle).map(v => (
                                            <option key={v} value={v}>{tEnums(`paymentCycle.${v}` as any)}</option>
                                        ))}
                                    </select>
                                )}
                            />
                            <FieldError msg={entryErrors?.paymentCycle?.message} />
                        </div>

                        <div>
                            <FieldLabel label={tForm('brokerageFee')} />
                            <Controller
                                control={control}
                                name={`properties.${index}.brokerageFee`}
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0" className={inputCls(false)} />
                                )}
                            />
                        </div>

                        <div>
                            <FieldLabel label={tForm('parkingLotsRented')} />
                            <Controller
                                control={control}
                                name={`properties.${index}.parkingLotsRented`}
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0" className={inputCls(false)} />
                                )}
                            />
                        </div>

                        <div>
                            <FieldLabel label={tForm('electricityMonthlyAmount')} />
                            <Controller
                                control={control}
                                name={`properties.${index}.electricityMonthlyAmount`}
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0" className={inputCls(false)} />
                                )}
                            />
                        </div>

                        <div>
                            <FieldLabel label={tForm('gasMonthlyAmount')} />
                            <Controller
                                control={control}
                                name={`properties.${index}.gasMonthlyAmount`}
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0" className={inputCls(false)} />
                                )}
                            />
                        </div>

                        <div>
                            <FieldLabel label={tForm('waterMonthlyAmount')} />
                            <Controller
                                control={control}
                                name={`properties.${index}.waterMonthlyAmount`}
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0" className={inputCls(false)} />
                                )}
                            />
                        </div>

                        <div>
                            <FieldLabel label={tForm('parkingMonthlyAmount')} />
                            <Controller
                                control={control}
                                name={`properties.${index}.parkingMonthlyAmount`}
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0" className={inputCls(false)} />
                                )}
                            />
                        </div>

                        {/* Auto-calculated payments */}
                        {watchedRentPrice > 0 && (
                            <div className="sm:col-span-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/15">
                                <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <p className="text-[11px] text-primary font-semibold">
                                    {tForm('numberOfPayments')}: <span className="font-black">{paymentsPerYear}</span> × SAR {paymentAmount.toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Article 11 - highlighted */}
                    <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="text-[11px] font-black text-amber-700 uppercase tracking-widest">
                                {tForm('article11')} ★
                            </span>
                            <span className="text-[10px] text-amber-600">{tForm('article11Critical')}</span>
                        </div>
                        <Controller
                            control={control}
                            name={`properties.${index}.article11`}
                            render={({ field }) => (
                                <textarea
                                    {...field}
                                    rows={4}
                                    placeholder={tForm('placeholders.article11')}
                                    className={cn(
                                        'w-full px-3 py-2.5 rounded-xl border text-[13px] text-dark font-medium resize-none',
                                        'placeholder:text-dark/30 transition-all duration-150',
                                        'focus:outline-none focus:ring-2 focus:ring-amber-300/50 focus:border-amber-400',
                                        !!entryErrors?.article11
                                            ? 'border-red-400/60 bg-red-50/30'
                                            : 'border-amber-200 bg-white',
                                    )}
                                />
                            )}
                        />
                        <FieldError msg={entryErrors?.article11?.message} />
                    </div>

                    {/* Additional Terms */}
                    <div>
                        <FieldLabel label={tForm('additionalTerms')} />
                        <Controller
                            control={control}
                            name={`properties.${index}.additionalTerms`}
                            render={({ field }) => (
                                <textarea {...field} rows={3}
                                    placeholder={tForm('placeholders.additionalTerms')}
                                    className={cn(inputCls(false), 'resize-none')} />
                            )}
                        />
                    </div>

                    {/* ══ Gallery ══ */}
                    <InlineSection title={`${tForm('gallery')} ★`} />
                    <div>
                        <p className="text-[11px] text-dark/40 mb-3">
                            At least 1 image required · {tCommon('uploader.rules.maxFiles', { count: 6 })} · {tCommon('uploader.rules.maxSize', { size: 5 })}
                        </p>
                        <Uploader
                            control={control}
                            name={`properties.${index}.images`}
                            accept="image/*"
                            allowMultiple
                            maxFiles={6}
                            maxSizeMB={5}
                            rules={[
                                tCommon('uploader.rules.maxSize', { size: 5 }),
                                tCommon('uploader.rules.maxFiles', { count: 6 }),
                            ]}
                        />
                        <FieldError msg={(entryErrors?.images as any)?.message} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Result Screen ──────────────────────────────────────────────────────────────

function ResultScreen({
    result, onAddMore, onView, t,
}: { result: SubmitResult; onAddMore: () => void; onView: () => void; t: any }) {
    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <div className="rounded-2xl bg-white/80 backdrop-blur-2xl ring-1 ring-inset ring-white/70
                shadow-[0_2px_1px_rgba(0,0,0,0.04),0_6px_16px_rgba(0,0,0,0.06)] p-8">
                <h2 className="text-[18px] font-black text-dark mb-6">{t('result.title')}</h2>

                {result.created.length > 0 && (
                    <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200/60">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                <LuCheck className="w-3 h-3 text-white" />
                            </span>
                            <p className="text-[13px] font-bold text-green-700">
                                {t('result.created', { n: result.created.length })}
                            </p>
                        </div>
                        <ul className="space-y-1 ps-7">
                            {result.created.map((p, i) => (
                                <li key={i} className="text-[12px] text-green-600 font-medium">{p.name}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {result.failed.length > 0 && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200/60">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                                <LuX className="w-3 h-3 text-white" />
                            </span>
                            <p className="text-[13px] font-bold text-red-600">
                                {t('result.failed', { n: result.failed.length })}
                            </p>
                        </div>
                        <ul className="space-y-2 ps-7">
                            {result.failed.map(f => (
                                <li key={f.index} className="text-[12px] text-red-500 font-medium">
                                    <span className="font-bold">{f.name}</span> — {f.error}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onAddMore}
                        className="flex-1 py-2.5 rounded-xl bg-black/5 hover:bg-black/8
                            text-[13px] font-semibold text-dark/60 hover:text-dark transition-colors"
                    >
                        {t('result.addMore')}
                    </button>
                    <button
                        onClick={onView}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                            bg-primary text-white text-[13px] font-semibold
                            hover:bg-primary/90 shadow-md shadow-primary/20 transition-colors"
                    >
                        {t('result.viewProperties')}
                        <LuArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Shared Helpers ─────────────────────────────────────────────────────────────

function InlineSection({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-secondary/50 rounded-full shrink-0" />
            <span className="text-[10px] font-black text-dark/40 uppercase tracking-[0.15em] whitespace-nowrap">
                {title}
            </span>
            <div className="flex-1 h-px bg-dark/5" />
        </div>
    );
}

function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 w-full text-start"
            >
                <div className="w-3 h-0.5 bg-secondary/50 rounded-full shrink-0" />
                <span className="text-[10px] font-black text-dark/40 uppercase tracking-[0.15em] hover:text-primary transition-colors">
                    {title}
                </span>
                <div className="flex-1 h-px bg-dark/5" />
                {open
                    ? <LuChevronUp className="w-3.5 h-3.5 text-dark/30 shrink-0" />
                    : <LuChevronDown className="w-3.5 h-3.5 text-dark/30 shrink-0" />
                }
            </button>
            {open && children}
        </div>
    );
}

function BoolToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className={cn(
            'flex items-center gap-2.5 cursor-pointer select-none w-full',
            'px-3 py-2.5 rounded-xl border transition-all',
            value ? 'border-secondary/50 bg-secondary/5' : 'border-black/10 bg-black/2',
            'hover:border-secondary/40 hover:bg-secondary/5',
        )}>
            <input
                type="checkbox"
                checked={value}
                onChange={e => onChange(e.target.checked)}
                className="w-4 h-4 rounded accent-primary"
            />
            <span className="text-[12px] font-semibold text-dark">{label}</span>
        </label>
    );
}

function inputCls(hasError: boolean) {
    return cn(
        'w-full px-3 py-2.5 rounded-xl border bg-black/2 text-[13px] text-dark font-medium',
        'placeholder:text-dark/30 transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40',
        hasError
            ? 'border-red-400/60 bg-red-50/30 focus:ring-red-300/40 focus:border-red-400'
            : 'border-black/10 hover:border-black/20',
    );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
    return (
        <label className="block text-[11px] font-bold text-dark/50 uppercase tracking-widest mb-1.5">
            {label}
            {required && <span className="text-red-400 ms-0.5">*</span>}
        </label>
    );
}

function FieldHint({ text }: { text: string }) {
    return <p className="text-[10px] text-dark/35 mb-1.5">{text}</p>;
}

function FieldError({ msg }: { msg?: string }) {
    if (!msg) return null;
    return (
        <p className="flex items-center gap-1 text-[10px] text-red-500 font-medium mt-1">
            <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {msg}
        </p>
    );
}
