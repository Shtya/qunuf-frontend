'use client';

import React, { useEffect, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useDebounce } from "@/hooks/useDebounce"
import { formatLargeNumber } from '@/utils/helpers';
import { useLocale } from 'next-intl';


interface PriceRangeSliderProps {
    value: { min: number, max: number }
    range?: { min: number, max: number }
    onChange: (range: { min: number; max: number }) => void;
    showCurrencySymbol?: boolean;
}
export default function PriceRangeSlider({ range, value, onChange, showCurrencySymbol = true }: PriceRangeSliderProps) {
    const locale = useLocale();
    const isRTL = locale === 'ar';

    // Map internalValue directly to the prop for instant control
    const internalValue: [number, number] = [value.min, value.max];

    return (
        <div className="pb-2 ">
            <div className="range-slider relative px-2">
                {/* Value labels above handles */}
                <div className="flex justify-between">
                    <div className="text-sm text-[var(--neutral-700)] font-medium">
                        {showCurrencySymbol ? "$" : ""}
                        {formatLargeNumber(internalValue[0])}
                    </div>
                    <div className="text-sm text-[var(--neutral-700)] font-medium">
                        {showCurrencySymbol ? "$" : ""}
                        {formatLargeNumber(internalValue[1])}
                    </div>
                </div>


                <Slider
                    range
                    min={range?.min}
                    max={range?.max}
                    reverse={isRTL} // Flips progress and handle interaction for Arabic
                    value={internalValue}
                    onChange={(val: number | number[]) => {
                        if (Array.isArray(val)) {
                            onChange({ min: val[0], max: val[1] });
                        }
                    }}
                    styles={{
                        track: { backgroundColor: 'var(--primary)', height: 6 },
                        rail: { height: 6 },
                        handle: {
                            borderColor: '#E9EFFE',
                            backgroundColor: 'var(--primary)',
                            width: 18,
                            height: 18,
                        },
                    }}
                    ariaLabelForHandle={['Min', 'Max']}
                />
            </div>
        </div>
    );
}