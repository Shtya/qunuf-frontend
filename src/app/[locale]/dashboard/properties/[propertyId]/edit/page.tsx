'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PropertiesForm from "@/components/dashboard/Properties/PropertiesForm";
import api from "@/libs/axios";
import { Property } from "@/types/dashboard/properties";
import { toast } from "react-hot-toast";
import NotFound from "@/app/not-found";

export default function EditPage() {
    const params = useParams();
    const router = useRouter();
    const propertyId = params?.propertyId;

    const [propertyData, setPropertyData] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!propertyId) return;

        const fetchProperty = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/properties/${propertyId}/full-details`);
                setPropertyData(response.data);
            } catch (error: any) {
                console.error("Failed to fetch property:", error);
                toast.error("Property not found or access denied");
                router.push("/dashboard/properties"); // Redirect back if error
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [propertyId, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
            </div>
        );
    }

    if (!propertyData) {
        return NotFound(); // Logic in useEffect handles the redirect
    }

    return (
        <div className="p-4 md:p-8">
            <PropertiesForm initialData={propertyData} />
        </div>
    );
}