'use client'

import { Controller, SubmitHandler, useForm, useWatch } from "react-hook-form";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import z from "zod";
import {
    BuildingType, CommercialSubType, DocumentType, FurnishingStatus, OwnershipType, PaymentCycle,
    Property, PropertyPurpose, PropertyType, PropertyUsage, RentType, ResidentialSubType
} from "@/types/dashboard/properties";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import api from "@/libs/axios";
import { useRouter } from "@/i18n/navigation";
import { useValues } from "@/contexts/GlobalContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import Uploader from "@/components/molecules/forms/Uploader";
import LocationInput from "@/components/molecules/forms/LocationInput";
import { FeaturesTagsInput } from "./FeaturesTagsInput";
import NearbyFacilitiesSection from "./NearbySection";
import GoogleMapsSearch, { MapPlaceResult } from "./GoogleMapsSearch";
import { FileItem } from "@/utils/upload";
import { LuChevronDown, LuChevronUp } from 'react-icons/lu';
import { LucideLoader2 } from 'lucide-react';

const today = new Date();
const todayStr = today.toISOString().split('T')[0];
const currentYear = today.getFullYear();

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

export const getPropertySchema = (t: (key: string, params?: any) => string, strict = true) => {
    const requiredNumber = z.coerce.number().min(1, { message: t("validation.min", { min: 1 }) });
    const optionalNumber = z.coerce.number().min(0, { message: t("validation.min", { min: 0 }) }).optional();
    const strictNumber = (min: number, max: number) =>
        z.coerce.number().min(min, { message: t("validation.min", { min }) }).max(max, { message: t("validation.max", { max }) });

    return z.object({
        name: z.string().trim().min(3, { message: t("validation.min", { min: 3 }) }).max(100).nonempty({ message: t("validation.required") }),
        description: z.string().trim().min(20, { message: t("validation.min", { min: 20 }) }).max(2000).nonempty({ message: t("validation.required") }),
        additionalDetails: z.string().trim().max(1500).optional(),

        // ── Section 1: Ownership Documents ──
        ownershipType: z.enum(OwnershipType),
        documentType: z.enum(DocumentType),
        documentNumber: z.string().trim().max(25).nonempty({ message: t("validation.required") }),
        documentIssueDate: z.string().trim().nonempty({ message: t("validation.required") })
            .refine(val => { const d = new Date(val); return !isNaN(d.getTime()) && d <= today; },
                { message: t("validation.max", { max: today.toISOString().split("T")[0] }) }),
        issuedBy: z.string().trim().max(250).nonempty({ message: t("validation.required") }),
        documentIssueLocation: z.string().trim().max(200).optional(),
        ownerIdNumber: z.string().trim().min(3, { message: t("validation.min", { min: 3 }) })
            .regex(/^[a-zA-Z0-9]*$/).max(20).nonempty({ message: t("validation.required") }),
        insurancePolicyNumber: z.string().trim().max(100).optional(),

        // ── Section 2: Property Data ──
        nationalAddressCode: z.string().trim().length(8, { message: t("validation.max", { max: 8 }) })
            .regex(/^[A-Z]{4}\d{4}$|^[0-9]{8}$/, { message: t("validation.invalidFormat") }),
        buildingType: strict ? z.enum(BuildingType) : z.enum(BuildingType).optional(),
        propertyPurpose: strict ? z.enum(PropertyPurpose) : z.enum(PropertyPurpose).optional(),
        numberOfFloors: strict
            ? strictNumber(0, 200)
            : z.coerce.number().min(0).max(200).optional(),
        numberOfUnits: strict
            ? strictNumber(0, 10000)
            : z.coerce.number().min(0).max(10000).optional(),
        numberOfShops: z.coerce.number().min(0).max(10000).optional(),
        propertyType: z.enum(PropertyType),
        subType: z.union([z.enum(ResidentialSubType), z.enum(CommercialSubType)]),
        rentType: z.enum(RentType),
        complexName: z.string().trim().max(200).optional(),
        propertyNumber: z.string().trim().min(3).max(20)
            .regex(/^[a-zA-Z0-9\-\/]+$/, { message: t("validation.invalidFormat") })
            .nonempty({ message: t("validation.required") }),
        stateId: z.string().nonempty({ message: t("validation.required") }),
        position: z.object({
            lat: z.number().nullable().optional(),
            lng: z.number().nullable().optional(),
        }),
        constructionDate: z.string().trim().optional()
            .refine(val => {
                if (!val) return true;
                const year = new Date(val).getFullYear();
                return year >= 1900 && year <= currentYear;
            }, { message: t("validation.yearRange", { min: 1900, max: currentYear }) }),

        // ── Section 3: Rental Unit ──
        unitNumber: strict
            ? z.string().trim().min(1, { message: t("validation.required") }).max(50)
            : z.string().trim().max(50).optional(),
        floorNumber: strict
            ? z.coerce.number().min(-10).max(500)
            : z.coerce.number().min(-10).max(500).optional(),
        area: requiredNumber
            .refine(val => val >= 1, { message: t("validation.min", { min: 1 }) })
            .refine(val => val <= 100_000, { message: t("validation.max", { max: 100_000 }) }),
        isFurnished: z.boolean(),
        furnishingStatus: z.enum(FurnishingStatus).optional(),
        hasKitchenCabinets: z.boolean().optional(),
        hasCombinedAcUnit: z.boolean().optional(),
        acUnitsCount: z.coerce.number().min(0).max(100).optional(),
        facilities: z.object({
            livingRooms: optionalNumber,
            parking: optionalNumber,
            elevators: optionalNumber,
            bathrooms: optionalNumber,
            bedrooms: optionalNumber,
            kitchen: optionalNumber,
            store: optionalNumber,
            majlis: optionalNumber,
            rooms: optionalNumber,
            securityEntrances: optionalNumber,
            maidRoom: z.boolean().optional(),
            backyard: z.boolean().optional(),
            centralAC: z.boolean().optional(),
            desertAC: z.boolean().optional(),
        }).optional(),
        gasMeterNumber: z.string().max(50).optional(),
        electricityMeterNumber: z.string().max(50).optional(),
        waterMeterNumber: z.string().max(50).optional(),
        electricityMeterReading: z.coerce.number().min(0).optional(),
        gasMeterReading: z.coerce.number().min(0).optional(),
        waterMeterReading: z.coerce.number().min(0).optional(),
        features: z.array(z.string().max(50, { message: t("validation.features.tagTooLong", { max: 50 }) }))
            .max(30, { message: t("validation.features.maxTags", { max: 30 }) }).optional(),
        educationInstitutions: z.array(z.object({
            name: z.string().min(1, { message: t("validation.required") }),
            distance_km: z.coerce.number()
                .min(0.1, { message: t("validation.nearby.distanceTooShort", { min: 0.1 }) })
                .max(50, { message: t("validation.nearby.distanceTooFar", { max: 50 }) })
        })).max(8, { message: t("validation.nearby.maxFacilities", { max: 8 }) }).optional(),
        healthMedicalFacilities: z.array(z.object({
            name: z.string().min(1, { message: t("validation.required") }),
            distance_km: z.coerce.number()
                .min(0.1, { message: t("validation.nearby.distanceTooShort", { min: 0.1 }) })
                .max(50, { message: t("validation.nearby.distanceTooFar", { max: 50 }) })
        })).max(8, { message: t("validation.nearby.maxFacilities", { max: 8 }) }).optional(),

        // ── Section 4: Tenant Rights ──
        subleaseAllowed: z.boolean().optional(),
        securityDeposit: requiredNumber,
        rentPrice: requiredNumber
            .refine(val => val >= 1, { message: t("validation.min", { min: 1 }) })
            .refine(val => val <= 1_000_000, { message: t("validation.max", { max: 1_000_000 }) }),
        capacity: optionalNumber,
        brokerageFee: optionalNumber,
        electricityMonthlyAmount: optionalNumber,
        gasMonthlyAmount: optionalNumber,
        waterMonthlyAmount: optionalNumber,
        parkingMonthlyAmount: optionalNumber,
        parkingLotsRented: z.coerce.number().min(0).max(1000).optional(),
        paymentCycle: strict ? z.enum(PaymentCycle) : z.enum(PaymentCycle).optional(),
        article11: strict
            ? z.string().trim().min(10, { message: t("validation.min", { min: 10 }) }).max(3000)
            : z.string().trim().max(3000).optional(),
        additionalTerms: z.string().trim().max(3000).optional(),

        // ── Section 2 extra ──
        propertyUsage: z.enum(PropertyUsage).optional(),

        // ── Gallery ──
        images: z.any().refine(
            (files) => Array.isArray(files) && files.length > 0,
            { message: t("validation.atLeastOne") }
        ),
        documentImage: z.any().optional(),
    });
};

type PropertySchemaType = z.infer<ReturnType<typeof getPropertySchema>>;

interface Props {
    initialData?: Property;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PropertiesForm({ initialData }: Props) {
    const tCommon = useTranslations("comman");
    const tEnums = useTranslations("property.enums");
    const t = useTranslations("dashboard.properties.form");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { states, loadingStates } = useValues();
    const locale = useLocale();
    const { user } = useAuth();

    const isEditMode = !!initialData;
    const schema = getPropertySchema(t, !isEditMode);

    const { control, handleSubmit, setValue, formState: { errors }, setError, clearErrors } = useForm<PropertySchemaType>({
        // @ts-expect-error - Type inference issue between z.coerce.number() and useForm generics
        resolver: zodResolver(schema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            additionalDetails: initialData?.additionalDetails || "",
            propertyType: initialData?.propertyType || PropertyType.RESIDENTIAL,
            subType: (initialData?.subType as CommercialSubType | ResidentialSubType) || ResidentialSubType.APARTMENT,
            rentType: initialData?.rentType || RentType.MONTHLY,
            rentPrice: initialData?.rentPrice || 0,
            area: initialData?.area || 0,
            securityDeposit: initialData?.securityDeposit || 0,
            isFurnished: initialData?.isFurnished || false,
            ownershipType: initialData?.ownershipType || OwnershipType.OWNER,
            capacity: initialData?.capacity || 0,
            documentType: initialData?.documentType || DocumentType.ELECTRONIC_DEED,
            documentNumber: initialData?.documentNumber || "",
            documentIssueDate: initialData?.documentIssueDate
                ? new Date(initialData.documentIssueDate).toISOString().split('T')[0]
                : "",
            issuedBy: initialData?.issuedBy || "",
            ownerIdNumber: initialData?.ownerIdNumber || (user?.identityNumber ?? ""),
            insurancePolicyNumber: initialData?.insurancePolicyNumber || "",
            documentIssueLocation: initialData?.documentIssueLocation || "",
            healthMedicalFacilities: initialData?.healthMedicalFacilities || [],
            educationInstitutions: initialData?.educationInstitutions || [],
            propertyNumber: initialData?.propertyNumber || "",
            nationalAddressCode: initialData?.nationalAddressCode || "",
            stateId: initialData?.stateId || "",
            position: {
                lat: Number(initialData?.latitude) || 24.644911,
                lng: Number(initialData?.longitude) || 46.724039,
            },
            features: initialData?.features || [],
            facilities: initialData?.facilities || {},
            gasMeterNumber: initialData?.gasMeterNumber || "",
            electricityMeterNumber: initialData?.electricityMeterNumber || "",
            waterMeterNumber: initialData?.waterMeterNumber || "",
            electricityMeterReading: initialData?.electricityMeterReading ?? undefined,
            gasMeterReading: initialData?.gasMeterReading ?? undefined,
            waterMeterReading: initialData?.waterMeterReading ?? undefined,
            complexName: initialData?.complexName || "",
            constructionDate: initialData?.constructionDate || "",
            buildingType: initialData?.buildingType ?? undefined,
            propertyPurpose: initialData?.propertyPurpose ?? undefined,
            propertyUsage: initialData?.propertyUsage ?? undefined,
            numberOfFloors: initialData?.numberOfFloors ?? undefined,
            numberOfUnits: initialData?.numberOfUnits ?? undefined,
            numberOfShops: initialData?.numberOfShops ?? undefined,
            unitNumber: initialData?.unitNumber || "",
            floorNumber: initialData?.floorNumber ?? undefined,
            hasCombinedAcUnit: initialData?.hasCombinedAcUnit ?? false,
            acUnitsCount: initialData?.acUnitsCount ?? undefined,
            furnishingStatus: initialData?.furnishingStatus ?? undefined,
            hasKitchenCabinets: initialData?.hasKitchenCabinets ?? false,
            subleaseAllowed: initialData?.subleaseAllowed ?? false,
            brokerageFee: initialData?.brokerageFee ?? undefined,
            electricityMonthlyAmount: initialData?.electricityMonthlyAmount ?? undefined,
            gasMonthlyAmount: initialData?.gasMonthlyAmount ?? undefined,
            waterMonthlyAmount: initialData?.waterMonthlyAmount ?? undefined,
            parkingMonthlyAmount: initialData?.parkingMonthlyAmount ?? undefined,
            parkingLotsRented: initialData?.parkingLotsRented ?? undefined,
            paymentCycle: initialData?.paymentCycle ?? undefined,
            article11: initialData?.article11 || "",
            additionalTerms: initialData?.additionalTerms || "",
            images: initialData?.images?.map(img => ({ url: img.url, isPrimary: img.is_primary })) || [],
            documentImage: initialData?.documentImage
                ? [{ url: initialData.documentImage?.path, name: initialData?.documentImage?.filename }]
                : [],
        } as any,
    });

    // ── Map reverse geocode via Nominatim ──
    const positionMap = useWatch({ control, name: "position" });
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        async function handleMapSelect(lat: number, lng: number) {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            const controller = new AbortController();
            abortControllerRef.current = controller;
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
                    { signal: controller.signal }
                );
                const data = await res.json();
                const address = data.address;
                if (address?.country_code !== "sa") { setValue("stateId", ""); return; }
                const regionCode = address["ISO3166-2-lvl4"];
                if (!regionCode) { setValue("stateId", ""); return; }
                const normalize = (str: string) => str.replace(/[-–—]/g, '-');
                const matchedState = states.find(s => normalize(s.region_code) === normalize(regionCode));
                setValue("stateId", matchedState?.id ?? "");
            } catch (err: any) {
                if (err.name !== 'AbortError') setValue("stateId", "");
            } finally {
                if (abortControllerRef.current === controller) abortControllerRef.current = null;
            }
        }
        if (positionMap?.lat && positionMap?.lng) handleMapSelect(positionMap.lat, positionMap.lng);
        return () => { if (abortControllerRef.current) abortControllerRef.current.abort(); };
    }, [positionMap.lat, positionMap.lng, states, setValue]);

    // ── Google Maps place selection ──
    const handleGooglePlaceSelect = useCallback((result: MapPlaceResult) => {
        setValue("position", { lat: result.lat, lng: result.lng });
        if (result.postalCode && /^[0-9]{8}$/.test(result.postalCode)) {
            setValue("nationalAddressCode", result.postalCode);
        }
    }, [setValue]);

    // ── Watches ──
    const selectedPropertyType = useWatch({ control, name: "propertyType" });
    const selectedSubType = useWatch({ control, name: "subType" });
    const watchedRentPrice = useWatch({ control, name: "rentPrice" }) as number;
    const watchedPaymentCycle = useWatch({ control, name: "paymentCycle" });
    const hasCombinedAcUnit = useWatch({ control, name: "hasCombinedAcUnit" });
    const isFurnished = useWatch({ control, name: "isFurnished" });
    const selectedStateId = useWatch({ control, name: "stateId" });

    // Payment auto-calculation
    const paymentsPerYear =
        watchedPaymentCycle === PaymentCycle.MONTHLY ? 12
        : watchedPaymentCycle === PaymentCycle.QUARTERLY ? 4
        : watchedPaymentCycle === PaymentCycle.SEMI_ANNUAL ? 2
        : 1;
    const paymentAmount = watchedRentPrice > 0 ? Math.round(watchedRentPrice / paymentsPerYear) : 0;

    // Sub-type options
    const subTypeOptions = useMemo(() => {
        const isCommercial = selectedPropertyType === PropertyType.COMMERCIAL;
        const subTypeEnum = isCommercial ? CommercialSubType : ResidentialSubType;
        const path = isCommercial ? "commercial" : "residential";
        return Object.values(subTypeEnum).map(val => ({ label: tEnums(`subType.${path}.${val}`), value: val }));
    }, [selectedPropertyType, tEnums]);

    useEffect(() => {
        const isValid = subTypeOptions.some(opt => opt.value === selectedSubType);
        if (!isValid && subTypeOptions.length > 0) setValue("subType", subTypeOptions[0].value as any);
    }, [selectedPropertyType, subTypeOptions, selectedSubType, setValue]);

    // ── Submit ──
    const onSubmit: SubmitHandler<PropertySchemaType> = async (data) => {
        setIsLoading(true);
        const toastId = toast.loading(tCommon("submitting"));
        try {
            const fd = new FormData();

            fd.append("ownershipType", data.ownershipType);
            fd.append("documentType", data.documentType);
            fd.append("documentNumber", data.documentNumber);
            fd.append("documentIssueDate", data.documentIssueDate);
            fd.append("issuedBy", data.issuedBy);
            if (data.documentIssueLocation) fd.append("documentIssueLocation", data.documentIssueLocation);
            fd.append("ownerIdNumber", data.ownerIdNumber);
            if (data.insurancePolicyNumber) fd.append("insurancePolicyNumber", data.insurancePolicyNumber);

            fd.append("name", data.name);
            fd.append("nationalAddressCode", data.nationalAddressCode);
            if (data.buildingType) fd.append("buildingType", data.buildingType);
            if (data.propertyPurpose) fd.append("propertyPurpose", data.propertyPurpose);
            if (data.propertyUsage) fd.append("propertyUsage", data.propertyUsage);
            if (data.numberOfFloors != null) fd.append("numberOfFloors", data.numberOfFloors.toString());
            if (data.numberOfUnits != null) fd.append("numberOfUnits", data.numberOfUnits.toString());
            if (data.numberOfShops != null) fd.append("numberOfShops", data.numberOfShops.toString());
            fd.append("propertyType", data.propertyType);
            fd.append("subType", data.subType);
            fd.append("rentType", data.rentType);
            if (data.complexName) fd.append("complexName", data.complexName);
            fd.append("propertyNumber", data.propertyNumber);
            fd.append("stateId", data.stateId);
            if (data.constructionDate) fd.append("constructionDate", data.constructionDate);
            if (data.position.lat) fd.append("latitude", data.position.lat.toString());
            if (data.position.lng) fd.append("longitude", data.position.lng.toString());
            fd.append("description", data.description);
            if (data.additionalDetails) fd.append("additionalDetails", data.additionalDetails);

            if (data.unitNumber) fd.append("unitNumber", data.unitNumber);
            if (data.floorNumber != null) fd.append("floorNumber", data.floorNumber.toString());
            fd.append("area", data.area.toString());
            fd.append("isFurnished", String(data.isFurnished));
            if (data.furnishingStatus) fd.append("furnishingStatus", data.furnishingStatus);
            if (data.hasKitchenCabinets != null) fd.append("hasKitchenCabinets", String(data.hasKitchenCabinets));
            if (data.hasCombinedAcUnit != null) fd.append("hasCombinedAcUnit", String(data.hasCombinedAcUnit));
            if (data.acUnitsCount != null) fd.append("acUnitsCount", data.acUnitsCount.toString());
            if (data.gasMeterNumber) fd.append("gasMeterNumber", data.gasMeterNumber);
            if (data.electricityMeterNumber) fd.append("electricityMeterNumber", data.electricityMeterNumber);
            if (data.waterMeterNumber) fd.append("waterMeterNumber", data.waterMeterNumber);
            if (data.electricityMeterReading != null) fd.append("electricityMeterReading", data.electricityMeterReading.toString());
            if (data.gasMeterReading != null) fd.append("gasMeterReading", data.gasMeterReading.toString());
            if (data.waterMeterReading != null) fd.append("waterMeterReading", data.waterMeterReading.toString());
            if (data.facilities) {
                Object.entries(data.facilities).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) fd.append(`facilities[${key}]`, value.toString());
                });
            }
            if (data.features && data.features.length > 0) {
                data.features.forEach(f => fd.append("features[]", f));
            }
            if (data.healthMedicalFacilities && data.healthMedicalFacilities.length > 0) {
                data.healthMedicalFacilities.forEach((f, i) => {
                    fd.append(`healthMedicalFacilities[${i}][name]`, f.name);
                    fd.append(`healthMedicalFacilities[${i}][distance_km]`, f.distance_km.toString());
                });
            }
            if (data.educationInstitutions && data.educationInstitutions.length > 0) {
                data.educationInstitutions.forEach((f, i) => {
                    fd.append(`educationInstitutions[${i}][name]`, f.name);
                    fd.append(`educationInstitutions[${i}][distance_km]`, f.distance_km.toString());
                });
            }

            if (data.subleaseAllowed != null) fd.append("subleaseAllowed", String(data.subleaseAllowed));
            fd.append("securityDeposit", data.securityDeposit.toString());
            fd.append("rentPrice", data.rentPrice.toString());
            if (data.capacity != null) fd.append("capacity", data.capacity.toString());
            if (data.brokerageFee != null) fd.append("brokerageFee", data.brokerageFee.toString());
            if (data.electricityMonthlyAmount != null) fd.append("electricityMonthlyAmount", data.electricityMonthlyAmount.toString());
            if (data.gasMonthlyAmount != null) fd.append("gasMonthlyAmount", data.gasMonthlyAmount.toString());
            if (data.waterMonthlyAmount != null) fd.append("waterMonthlyAmount", data.waterMonthlyAmount.toString());
            if (data.parkingMonthlyAmount != null) fd.append("parkingMonthlyAmount", data.parkingMonthlyAmount.toString());
            if (data.parkingLotsRented != null) fd.append("parkingLotsRented", data.parkingLotsRented.toString());
            if (data.paymentCycle) fd.append("paymentCycle", data.paymentCycle);
            if (data.article11) fd.append("article11", data.article11);
            if (data.additionalTerms) fd.append("additionalTerms", data.additionalTerms);

            if (data.documentImage?.file) {
                const docFile = data.documentImage.file;
                if (docFile) fd.append("documentImage", docFile);
            }
            let primaryIndex = 0;
            if (data.images && Array.isArray(data.images)) {
                data.images.forEach((fileItem: any, index: number) => {
                    if (fileItem.file) fd.append("images", fileItem.file);
                    if (fileItem.isPrimary) primaryIndex = index;
                });
            }
            fd.append("primaryImageIndex", primaryIndex.toString());

            if (isEditMode) {
                await api.put(`/properties/${initialData.id}`, fd);
                toast.success(t("messages.updateSuccess"), { id: toastId });
            } else {
                await api.post("/properties", fd);
                toast.success(t("messages.createSuccess"), { id: toastId });
            }
            router.push("/dashboard/properties");
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || tCommon("error"), { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const id = initialData?.id;

    const handleRemoveFile = useCallback(async (file: FileItem, type: 'image' | 'document') => {
        if (!isEditMode || !id) return true;
        try {
            await api.delete(`/properties/${id}/files`, { params: { type, url: file.url } });
            toast.success(tCommon("uploader.success.removed"));
            return true;
        } catch {
            toast.error(tCommon("uploader.errors.deleteFailed"));
            return false;
        }
    }, [id, isEditMode, tCommon]);

    // ─────────────────────────────────────────────────────────────────────────
    // JSX
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="max-w-4xl mx-auto py-6 px-4 space-y-4">

            {/* Header */}
            <div className="rounded-2xl bg-white/80 backdrop-blur-xl ring-1 ring-inset ring-white/70 shadow-[0_2px_1px_rgba(0,0,0,0.04),0_6px_16px_rgba(0,0,0,0.06)] px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-secondary/10 to-primary/10 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-[18px] font-black text-dark">
                            {isEditMode ? t("editTitle") : t("createTitle")}
                        </h1>
                        <p className="text-[12px] text-dark/50 mt-0.5">
                            {isEditMode ? t("editDescription") : t("createDescription")}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit as any)} noValidate className="space-y-4">

                {/* ══ LESSOR INFO (read-only, create mode only) ══ */}
                {!isEditMode && user && (
                    <SectionCard>
                        <InlineSection title={t("lessorInfo")} />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                            <ReadOnlyField label={t("lessorName")} value={user.name} />
                            <ReadOnlyField
                                label={t("lessorIdentityType")}
                                value={user.identityType
                                    ? user.identityType.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
                                    : '—'}
                            />
                            <ReadOnlyField label={t("lessorIdentityNumber")} value={user.identityNumber || '—'} />
                        </div>
                    </SectionCard>
                )}

                {/* ══ SECTION 1: Ownership Documents ══ */}
                <SectionCard>
                    <InlineSection title={t("ownershipDocuments")} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

                        <div>
                            <FieldLabel label={t("ownershipType")} required />
                            <Controller control={control} name="ownershipType"
                                render={({ field }) => (
                                    <select {...field} className={inputCls(false)}>
                                        {Object.values(OwnershipType).map(v => (
                                            <option key={v} value={v}>{tEnums(`ownershipType.${v}` as any)}</option>
                                        ))}
                                    </select>
                                )} />
                        </div>

                        <div>
                            <FieldLabel label={t("documentType")} required />
                            <Controller control={control} name="documentType"
                                render={({ field }) => (
                                    <select {...field} className={inputCls(false)}>
                                        {Object.values(DocumentType).map(v => (
                                            <option key={v} value={v}>{tEnums(`documentType.${v}` as any)}</option>
                                        ))}
                                    </select>
                                )} />
                        </div>

                        <div>
                            <FieldLabel label={t("documentNumber")} required />
                            <Controller control={control} name="documentNumber"
                                render={({ field }) => (
                                    <input {...field} placeholder={t("placeholders.documentNumber")}
                                        className={inputCls(!!errors.documentNumber)} />
                                )} />
                            <FieldError msg={errors.documentNumber?.message} />
                        </div>

                        <div>
                            <FieldLabel label={t("issuedBy")} required />
                            <Controller control={control} name="issuedBy"
                                render={({ field }) => (
                                    <input {...field} placeholder={t("placeholders.issuedBy")}
                                        className={inputCls(!!errors.issuedBy)} />
                                )} />
                            <FieldError msg={errors.issuedBy?.message} />
                        </div>

                        <div>
                            <FieldLabel label={t("documentIssueDate")} required />
                            <Controller control={control} name="documentIssueDate"
                                render={({ field }) => (
                                    <input {...field} type="date" max={todayStr}
                                        className={inputCls(!!errors.documentIssueDate)} />
                                )} />
                            <FieldError msg={errors.documentIssueDate?.message} />
                        </div>

                        <div>
                            <FieldLabel label={t("documentIssueLocation")} />
                            <Controller control={control} name="documentIssueLocation"
                                render={({ field }) => (
                                    <input {...field} placeholder={t("placeholders.documentIssueLocation")}
                                        className={inputCls(false)} />
                                )} />
                        </div>

                        <div>
                            <FieldLabel label={t("ownerIdNumber")} required />
                            <Controller control={control} name="ownerIdNumber"
                                render={({ field }) => (
                                    <input {...field} placeholder={t("placeholders.ownerIdNumber")}
                                        className={inputCls(!!errors.ownerIdNumber)} />
                                )} />
                            <FieldError msg={errors.ownerIdNumber?.message} />
                        </div>

                        <div>
                            <FieldLabel label={t("insurancePolicyNumber")} />
                            <Controller control={control} name="insurancePolicyNumber"
                                render={({ field }) => (
                                    <input {...field} placeholder={t("placeholders.insurancePolicyNumber")}
                                        className={inputCls(false)} />
                                )} />
                        </div>

                        <div className="sm:col-span-2">
                            <FieldLabel label={t("documentImage")} />
                            <Uploader control={control} name="documentImage" accept="application/pdf"
                                onRemoveFile={isEditMode ? (file) => handleRemoveFile(file, "document") : undefined}
                                allowMultiple={false} maxFiles={1} maxSizeMB={30}
                                rules={[
                                    tCommon("uploader.rules.maxSize", { size: 30 }),
                                    tCommon("uploader.rules.maxFiles", { count: 1 }),
                                    tCommon("uploader.rules.onlyPDF"),
                                ]} />
                        </div>
                    </div>
                </SectionCard>

                {/* ══ SECTION 2: Property Data ══ */}
                <SectionCard>
                    <InlineSection title={t("propertyData")} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

                        {/* Title */}
                        <div className="sm:col-span-2">
                            <FieldLabel label={t("title")} required />
                            <Controller control={control} name="name"
                                render={({ field }) => (
                                    <input {...field} placeholder={t("placeholders.name")}
                                        className={inputCls(!!errors.name)} />
                                )} />
                            <FieldError msg={errors.name?.message} />
                        </div>

                        {/* Google Maps Search */}
                        <div className="sm:col-span-2">
                            <GoogleMapsSearch
                                onPlaceSelect={handleGooglePlaceSelect}
                                label={t("searchAddress")}
                                placeholder={t("placeholders.searchAddress")}
                                className="w-full"
                            />
                        </div>

                        {/* National Address Code */}
                        <div>
                            <FieldLabel label={t("nationalAddressCode")} required />
                            <Controller control={control} name="nationalAddressCode"
                                render={({ field }) => (
                                    <input {...field} maxLength={8} placeholder="e.g. RRRE1234"
                                        className={inputCls(!!errors.nationalAddressCode)} />
                                )} />
                            <FieldError msg={errors.nationalAddressCode?.message} />
                        </div>

                        {/* Building Type */}
                        <div>
                            <FieldLabel label={t("buildingType")} required />
                            <Controller control={control} name="buildingType"
                                render={({ field }) => (
                                    <select {...field} className={inputCls(!!errors.buildingType)}>
                                        <option value="">—</option>
                                        {Object.values(BuildingType).map(v => (
                                            <option key={v} value={v}>{tEnums(`buildingType.${v}` as any)}</option>
                                        ))}
                                    </select>
                                )} />
                            <FieldError msg={errors.buildingType?.message} />
                        </div>

                        {/* Property Purpose */}
                        <div>
                            <FieldLabel label={t("propertyPurpose")} required />
                            <Controller control={control} name="propertyPurpose"
                                render={({ field }) => (
                                    <select {...field} className={inputCls(!!errors.propertyPurpose)}>
                                        <option value="">—</option>
                                        {Object.values(PropertyPurpose).map(v => (
                                            <option key={v} value={v}>{tEnums(`propertyPurpose.${v}` as any)}</option>
                                        ))}
                                    </select>
                                )} />
                            <FieldError msg={errors.propertyPurpose?.message} />
                        </div>

                        {/* Property Usage (نوع استخدام العقار) */}
                        <div>
                            <FieldLabel label={t("propertyUsage")} />
                            <Controller control={control} name="propertyUsage"
                                render={({ field }) => (
                                    <select {...field} className={inputCls(false)}>
                                        <option value="">—</option>
                                        {Object.values(PropertyUsage).map(v => (
                                            <option key={v} value={v}>{tEnums(`propertyUsage.${v}` as any)}</option>
                                        ))}
                                    </select>
                                )} />
                        </div>

                        {/* Number of Floors */}
                        <div>
                            <FieldLabel label={t("numberOfFloors")} required />
                            <Controller control={control} name="numberOfFloors"
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0"
                                        className={inputCls(!!errors.numberOfFloors)} />
                                )} />
                            <FieldError msg={errors.numberOfFloors?.message} />
                        </div>

                        {/* Number of Units */}
                        <div>
                            <FieldLabel label={t("numberOfUnits")} required />
                            <Controller control={control} name="numberOfUnits"
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0"
                                        className={inputCls(!!errors.numberOfUnits)} />
                                )} />
                            <FieldError msg={errors.numberOfUnits?.message} />
                        </div>

                        {/* Number of Shops */}
                        <div>
                            <FieldLabel label={t("numberOfShops")} />
                            <Controller control={control} name="numberOfShops"
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0"
                                        className={inputCls(false)} />
                                )} />
                        </div>

                        {/* Parking */}
                        <div>
                            <FieldLabel label={t("parking")} />
                            <Controller control={control} name={"facilities.parking" as any}
                                render={({ field }: any) => (
                                    <input {...field} type="number" min={0} placeholder="0"
                                        className={inputCls(false)} />
                                )} />
                        </div>

                        {/* Property Type */}
                        <div>
                            <FieldLabel label={t("propertyType")} required />
                            <Controller control={control} name="propertyType"
                                render={({ field }) => (
                                    <select {...field} className={inputCls(false)}>
                                        {Object.values(PropertyType).map(v => (
                                            <option key={v} value={v}>{tEnums(`propertyType.${v}` as any)}</option>
                                        ))}
                                    </select>
                                )} />
                        </div>

                        {/* Complex Name */}
                        <div>
                            <FieldLabel label={t("complexName")} />
                            <Controller control={control} name="complexName"
                                render={({ field }) => (
                                    <input {...field} placeholder={t("placeholders.complexName")}
                                        className={inputCls(false)} />
                                )} />
                        </div>

                        {/* Property Number */}
                        <div>
                            <FieldLabel label={t("propertyNumber")} required />
                            <Controller control={control} name="propertyNumber"
                                render={({ field }) => (
                                    <input {...field} placeholder={t("placeholders.propertyNumber")}
                                        className={inputCls(!!errors.propertyNumber)} />
                                )} />
                            <FieldError msg={errors.propertyNumber?.message} />
                        </div>

                        {/* Rent Type */}
                        <div>
                            <FieldLabel label={t("rentType")} required />
                            <Controller control={control} name="rentType"
                                render={({ field }) => (
                                    <select {...field} className={inputCls(false)}>
                                        {Object.values(RentType).map(v => (
                                            <option key={v} value={v}>{tEnums(`rentType.${v}` as any)}</option>
                                        ))}
                                    </select>
                                )} />
                        </div>

                        {/* Construction Date */}
                        <div>
                            <FieldLabel label={t("constructionDate")} />
                            <Controller control={control} name="constructionDate"
                                render={({ field }) => (
                                    <input {...field} type="date" max={todayStr}
                                        className={inputCls(false)} />
                                )} />
                            <FieldError msg={errors.constructionDate?.message} />
                        </div>

                        {/* State */}
                        <div className="sm:col-span-2">
                            <FieldLabel label={t("stateId")} required />
                            <Controller control={control} name="stateId"
                                render={({ field }) => (
                                    <select {...field} className={inputCls(!!errors.stateId)}>
                                        <option value="">
                                            {loadingStates ? "Loading…" : "— Select region —"}
                                        </option>
                                        {(states as { id: string; name: string; name_ar: string }[]).map(s => (
                                            <option key={s.id} value={s.id}>
                                                {locale === 'ar' ? s.name_ar : s.name}
                                            </option>
                                        ))}
                                    </select>
                                )} />
                            <FieldError msg={errors.stateId?.message} />
                        </div>

                        {/* Map */}
                        <div className="sm:col-span-2">
                            <FieldLabel label={t("location")} />
                            <div className="rounded-xl overflow-hidden border border-black/10">
                                <LocationInput showAddress={false} control={control} name="position" />
                            </div>
                            <FieldError msg={errors.position?.lat?.message} />
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-2">
                            <FieldLabel label={t("description")} required />
                            <Controller control={control} name="description"
                                render={({ field }) => (
                                    <textarea {...field} rows={4}
                                        placeholder={t("placeholders.description")}
                                        className={cn(inputCls(!!errors.description), 'resize-none')} />
                                )} />
                            <FieldError msg={errors.description?.message} />
                        </div>

                        {/* Additional Details */}
                        <div className="sm:col-span-2">
                            <FieldLabel label={t("additionalDetails")} />
                            <Controller control={control} name="additionalDetails"
                                render={({ field }) => (
                                    <textarea {...field} rows={3}
                                        placeholder={t("placeholders.additionalDetails")}
                                        className={cn(inputCls(false), 'resize-none')} />
                                )} />
                        </div>
                    </div>
                </SectionCard>

                {/* ══ SECTION 3: Rental Unit ══ */}
                <SectionCard>
                    <InlineSection title={t("rentalUnit")} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

                        {/* Sub Type */}
                        <div>
                            <FieldLabel label={t("subType")} required />
                            <Controller control={control} name="subType"
                                render={({ field }) => (
                                    <select {...field} className={inputCls(!!errors.subType)}>
                                        {subTypeOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                )} />
                            <FieldError msg={errors.subType?.message} />
                        </div>

                        {/* Unit Number */}
                        <div>
                            <FieldLabel label={t("unitNumber")} required />
                            <Controller control={control} name="unitNumber"
                                render={({ field }) => (
                                    <input {...field} placeholder={t("placeholders.unitNumber")}
                                        className={inputCls(!!errors.unitNumber)} />
                                )} />
                            <FieldError msg={errors.unitNumber?.message} />
                        </div>

                        {/* Floor Number */}
                        <div>
                            <FieldLabel label={t("floorNumber")} required />
                            <Controller control={control} name="floorNumber"
                                render={({ field }) => (
                                    <input {...field} type="number" placeholder="0"
                                        className={inputCls(!!errors.floorNumber)} />
                                )} />
                            <FieldError msg={errors.floorNumber?.message} />
                        </div>

                        {/* Area */}
                        <div>
                            <FieldLabel label={t("size")} required />
                            <div className="relative">
                                <Controller control={control} name="area"
                                    render={({ field }) => (
                                        <input {...field} type="number" min={1} placeholder="0"
                                            className={cn(inputCls(!!errors.area), 'pe-10')} />
                                    )} />
                                <span className="absolute inset-y-0 inset-e-3 flex items-center text-[11px] text-dark/40 font-medium pointer-events-none">
                                    m²
                                </span>
                            </div>
                            <FieldError msg={errors.area?.message} />
                        </div>

                        {/* Booleans */}
                        <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <Controller control={control} name="isFurnished"
                                render={({ field }) => (
                                    <BoolToggle label={`${t("isFurnished")} ★`} value={!!field.value} onChange={field.onChange} />
                                )} />
                            <Controller control={control} name="hasKitchenCabinets"
                                render={({ field }) => (
                                    <BoolToggle label={t("hasKitchenCabinets")} value={!!field.value} onChange={field.onChange} />
                                )} />
                            <Controller control={control} name="hasCombinedAcUnit"
                                render={({ field }) => (
                                    <BoolToggle label={`${t("hasCombinedAcUnit")} ★`} value={!!field.value} onChange={field.onChange} />
                                )} />
                            {(['maidRoom', 'backyard', 'centralAC', 'desertAC'] as const).map(key => (
                                <Controller key={key} control={control} name={`facilities.${key}` as any}
                                    render={({ field }: any) => (
                                        <BoolToggle label={t(key)} value={!!field.value} onChange={field.onChange} />
                                    )} />
                            ))}
                        </div>

                        {/* Furnishing Status — shown only when furnished */}
                        {isFurnished && (
                            <div>
                                <FieldLabel label={t("furnishingStatus")} />
                                <Controller control={control} name="furnishingStatus"
                                    render={({ field }) => (
                                        <select {...field} className={inputCls(false)}>
                                            <option value="">—</option>
                                            {Object.values(FurnishingStatus).map(v => (
                                                <option key={v} value={v}>{tEnums(`furnishingStatus.${v}` as any)}</option>
                                            ))}
                                        </select>
                                    )} />
                            </div>
                        )}

                        {/* AC Units Count */}
                        {hasCombinedAcUnit && (
                            <div>
                                <FieldLabel label={t("acUnitsCount")} required />
                                <Controller control={control} name="acUnitsCount"
                                    render={({ field }) => (
                                        <input {...field} type="number" min={0} placeholder="0"
                                            className={inputCls(false)} />
                                    )} />
                            </div>
                        )}
                    </div>

                    {/* Utilities (collapsible) */}
                    <div className="mt-5">
                        <CollapsibleSection title={`${t("utilities")} ${t("(Optional)")}`}>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                                {([
                                    ['electricityMeterNumber', 'electricityMeterReading', t('electricityMeterNumber'), t('electricityMeterReading')],
                                    ['gasMeterNumber', 'gasMeterReading', t('gasMeterNumber'), t('gasMeterReading')],
                                    ['waterMeterNumber', 'waterMeterReading', t('waterMeterNumber'), t('waterMeterReading')],
                                ] as const).map(([numKey, readKey, numLabel, readLabel]) => (
                                    <div key={numKey} className="space-y-2">
                                        <div>
                                            <FieldLabel label={numLabel as string} />
                                            <Controller control={control} name={numKey as any}
                                                render={({ field }) => (
                                                    <input {...field} placeholder={t("Meter number")} className={inputCls(false)} />
                                                )} />
                                        </div>
                                        <div>
                                            <FieldLabel label={`↳ ${readLabel as string}`} />
                                            <Controller control={control} name={readKey as any}
                                                render={({ field }) => (
                                                    <input {...field} type="number" min={0} placeholder="0" className={inputCls(false)} />
                                                )} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleSection>
                    </div>

                    {/* Facilities (collapsible) */}
                    <div className="mt-3">
                        <CollapsibleSection title={`${t("facilities")} ${t("(Optional)")}`}>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                                {(['bedrooms', 'bathrooms', 'livingRooms', 'kitchen', 'elevators', 'store', 'majlis', 'rooms', 'securityEntrances'] as const).map(key => (
                                    <div key={key}>
                                        <FieldLabel label={t(key)} />
                                        <Controller control={control} name={`facilities.${key}` as any}
                                            render={({ field }) => (
                                                <input {...field} type="number" min={0} placeholder="0" className={inputCls(false)} />
                                            )} />
                                    </div>
                                ))}
                            </div>
                        </CollapsibleSection>
                    </div>

                    {/* Features & Nearby */}
                    <div className="mt-5 space-y-5">
                        <FeaturesTagsInput control={control} label={t("features")} name="features"
                            placeholder={t("featuresPlaceholder")} errors={errors} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-black/5">
                            <NearbyFacilitiesSection errors={errors} control={control}
                                name="educationInstitutions" label={t("educationInstitutions")} />
                            <NearbyFacilitiesSection errors={errors} control={control}
                                name="healthMedicalFacilities" label={t("healthMedicalFacilities")} />
                        </div>
                    </div>
                </SectionCard>

                {/* ══ SECTION 4: Tenant Rights ══ */}
                <SectionCard>
                    <InlineSection title={t("tenantRights")} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

                        {/* Sublease Allowed */}
                        <div className="sm:col-span-2">
                            <Controller control={control} name="subleaseAllowed"
                                render={({ field }) => (
                                    <BoolToggle label={t("subleaseAllowed")} value={!!field.value} onChange={field.onChange} />
                                )} />
                        </div>

                        <div>
                            <FieldLabel label={t("securityDeposit")} required />
                            <Controller control={control} name="securityDeposit"
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0"
                                        className={inputCls(!!errors.securityDeposit)} />
                                )} />
                            <FieldError msg={errors.securityDeposit?.message} />
                        </div>

                        <div>
                            <FieldLabel label={t("price")} required />
                            <Controller control={control} name="rentPrice"
                                render={({ field }) => (
                                    <input {...field} type="number" min={1} placeholder="0"
                                        className={inputCls(!!errors.rentPrice)} />
                                )} />
                            <FieldError msg={errors.rentPrice?.message} />
                        </div>

                        <div>
                            <FieldLabel label={t("capacity")} />
                            <Controller control={control} name="capacity"
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0"
                                        className={inputCls(false)} />
                                )} />
                        </div>

                        <div>
                            <FieldLabel label={t("brokerageFee")} />
                            <Controller control={control} name="brokerageFee"
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0"
                                        className={inputCls(false)} />
                                )} />
                        </div>

                        <div>
                            <FieldLabel label={t("parkingLotsRented")} />
                            <Controller control={control} name="parkingLotsRented"
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0"
                                        className={inputCls(false)} />
                                )} />
                        </div>

                        {/* Monthly service amounts */}
                        <div>
                            <FieldLabel label={t("electricityMonthlyAmount")} />
                            <Controller control={control} name="electricityMonthlyAmount"
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0"
                                        className={inputCls(false)} />
                                )} />
                        </div>

                        <div>
                            <FieldLabel label={t("gasMonthlyAmount")} />
                            <Controller control={control} name="gasMonthlyAmount"
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0"
                                        className={inputCls(false)} />
                                )} />
                        </div>

                        <div>
                            <FieldLabel label={t("waterMonthlyAmount")} />
                            <Controller control={control} name="waterMonthlyAmount"
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0"
                                        className={inputCls(false)} />
                                )} />
                        </div>

                        <div>
                            <FieldLabel label={t("parkingMonthlyAmount")} />
                            <Controller control={control} name="parkingMonthlyAmount"
                                render={({ field }) => (
                                    <input {...field} type="number" min={0} placeholder="0"
                                        className={inputCls(false)} />
                                )} />
                        </div>

                        <div>
                            <FieldLabel label={t("paymentCycle")} required />
                            <Controller control={control} name="paymentCycle"
                                render={({ field }) => (
                                    <select {...field} className={inputCls(!!errors.paymentCycle)}>
                                        <option value="">—</option>
                                        {Object.values(PaymentCycle).map(v => (
                                            <option key={v} value={v}>{tEnums(`paymentCycle.${v}` as any)}</option>
                                        ))}
                                    </select>
                                )} />
                            <FieldError msg={errors.paymentCycle?.message} />
                        </div>

                        {/* Auto-calculated payments */}
                        {watchedRentPrice > 0 && watchedPaymentCycle && (
                            <div className="sm:col-span-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/15">
                                <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <p className="text-[11px] text-primary font-semibold">
                                    {t("numberOfPayments")}: <span className="font-black">{paymentsPerYear}</span> × SAR {paymentAmount.toLocaleString()}
                                    <span className="text-dark/40 font-normal"> / {t("paymentPerInstallment")}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Article 11 — highlighted */}
                    <div className="mt-5 rounded-xl border-2 border-amber-300 bg-amber-50 p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="text-[11px] font-black text-amber-700 uppercase tracking-widest">
                                {t("article11")} ★
                            </span>
                            <span className="text-[10px] text-amber-600">{t("article11Critical")}</span>
                        </div>
                        <Controller control={control} name="article11"
                            render={({ field }) => (
                                <textarea
                                    {...field}
                                    rows={5}
                                    placeholder={t("placeholders.article11")}
                                    className={cn(
                                        'w-full px-3 py-2.5 rounded-xl border text-[13px] text-dark font-medium resize-none',
                                        'placeholder:text-dark/30 transition-all duration-150',
                                        'focus:outline-none focus:ring-2 focus:ring-amber-300/50 focus:border-amber-400',
                                        errors.article11
                                            ? 'border-red-400/60 bg-red-50/30'
                                            : 'border-amber-200 bg-white',
                                    )}
                                />
                            )} />
                        <FieldError msg={errors.article11?.message} />
                    </div>

                    {/* Additional Terms */}
                    <div className="mt-4">
                        <FieldLabel label={t("additionalTerms")} />
                        <Controller control={control} name="additionalTerms"
                            render={({ field }) => (
                                <textarea {...field} rows={3}
                                    placeholder={t("placeholders.additionalTerms")}
                                    className={cn(inputCls(false), 'resize-none')} />
                            )} />
                    </div>
                </SectionCard>

                {/* ══ Gallery ══ */}
                <SectionCard>
                    <InlineSection title={`${t("gallery")} ★`} />
                    <div className="mt-4">
                        <p className="text-[11px] text-dark/40 mb-3">
                            {tCommon("uploader.rules.maxFiles", { count: 6 })} · {tCommon("uploader.rules.maxSize", { size: 5 })}
                        </p>
                        <Uploader control={control} name="images" accept="image/*"
                            onRemoveFile={isEditMode ? (file) => handleRemoveFile(file, "image") : undefined}
                            preventRemoveOn={1} allowMultiple maxFiles={6} maxSizeMB={5}
                            rules={[
                                tCommon("uploader.rules.maxSize", { size: 5 }),
                                tCommon("uploader.rules.maxFiles", { count: 6 }),
                            ]} />
                        <FieldError msg={(errors.images as any)?.message} />
                    </div>
                </SectionCard>

                {/* Sticky Submit */}
                <div className="sticky bottom-4 z-20 pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl
                            bg-primary hover:bg-primary/90 text-white
                            text-[14px] font-bold shadow-lg shadow-primary/25
                            transition-all duration-150 disabled:opacity-60 disabled:pointer-events-none"
                    >
                        {isLoading && <LucideLoader2 className="w-4 h-4 animate-spin" />}
                        {isEditMode ? t("update") : t("submit")}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI Helpers (same design system as BulkAddProperties)
// ─────────────────────────────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-2xl bg-white/80 backdrop-blur-xl ring-1 ring-inset ring-white/70 shadow-[0_2px_1px_rgba(0,0,0,0.04),0_6px_16px_rgba(0,0,0,0.06)] px-6 py-5">
            {children}
        </div>
    );
}

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

function ReadOnlyField({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-dark/40 uppercase tracking-widest">{label}</span>
            <span className="text-[13px] font-semibold text-dark/80 px-3 py-2 rounded-xl bg-dark/3 border border-dark/8">
                {value}
            </span>
        </div>
    );
}
