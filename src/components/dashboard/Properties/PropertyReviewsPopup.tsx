'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import api from '@/libs/axios';
import Popup from '@/components/atoms/Popup';
import { FaStar } from 'react-icons/fa';
import { Property } from '@/types/dashboard/properties';
import { TableRowType } from '@/types/table';

type PropertyReviewsPopupProps = {
    row: Property;
    onClose: () => void;
    setRows?: React.Dispatch<React.SetStateAction<TableRowType<Property>[] | null>>;
    fetchRows?: (signal?: AbortSignal) => Promise<void>;
};

interface Review {
    id: string;
    rate: number;
    reviewText?: string;
    created_at: string;
    tenant: {
        name: string;
        email: string;
    };
}

export default function PropertyReviewsPopup({ row: property, onClose }: PropertyReviewsPopupProps) {
    const t = useTranslations('dashboard.properties.table.reviews');
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const loadReviews = async (cursor?: string, signal?: AbortSignal) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (cursor) params.append('cursor', cursor);
            params.append('limit', '20');

            const res = await api.get(`/reviews/property/${property.id}?${params.toString()}`, { signal });
            const { items, nextCursor: newCursor, hasMore: more } = res.data;

            if (cursor) {
                setReviews(prev => [...prev, ...items]);
            } else {
                setReviews(items);
            }

            setNextCursor(newCursor || null);
            setHasMore(more || false);
        } catch (err: any) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                return; // Exit completely, do not touch loading state
            }
            setError(err?.response?.data?.message || t('loadError'));
        } finally {
            if (!signal || !signal?.aborted) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        setReviews([]);
        setError(null);
        setLoading(true);
        setNextCursor(null);

        abortControllerRef.current = new AbortController();
        loadReviews(undefined, abortControllerRef.current.signal);
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [property.id]);

    const loadMore = () => {
        if (nextCursor && !loading) {
            loadReviews(nextCursor, abortControllerRef.current?.signal);
        }
    };

    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rate, 0) / reviews.length
        : 0;

    return (
        <div className="w-[90vw] max-w-4xl mx-auto max-h-[85vh] overflow-y-auto">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">{t('title')}</h2>
                <p className="text-sm text-gray-600">{property.name}</p>
                {reviews.length > 0 && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    size={20}
                                    className={star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-gray-500">({reviews.length} {t('reviews')})</span>
                    </div>
                )}
            </div>

            {loading && reviews.length === 0 ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-red-500">{error}</p>
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">{t('noReviews')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-semibold text-gray-800">{review.tenant.name}</p>
                                    <p className="text-sm text-gray-500">{review.tenant.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                size={16}
                                                className={star <= review.rate ? 'text-yellow-400' : 'text-gray-300'}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            {review.reviewText && (
                                <p className="text-gray-700 mt-2">{review.reviewText}</p>
                            )}
                        </div>
                    ))}

                    {hasMore && (
                        <div className="text-center pt-4">
                            <button
                                onClick={loadMore}
                                disabled={loading}
                                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-hover transition-colors disabled:opacity-50"
                            >
                                {loading ? t('loading') : t('loadMore')}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
