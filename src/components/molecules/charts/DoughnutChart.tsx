'use client';

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartOptions,
    ChartData,
    TooltipModel,
    Chart,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
    data: number[];
    labels: string[];
    colors?: string[];  // custom slice colors
    centerText?: string;
}

export function DoughnutChart({
    data,
    labels,
    colors,
    centerText
}: DoughnutChartProps) {
    const baseColors =
        colors?.length === data.length
            ? colors
            : [
                'rgba(255, 99, 132, 0.9)',
                'rgba(54, 162, 235, 0.9)',
                'rgba(255, 206, 86, 0.9)',
                'rgba(75, 192, 192, 0.9)',
            ];

    const chartData: ChartData<'doughnut', number[], string> = {
        labels,
        datasets: [
            {
                data,
                backgroundColor: baseColors,
                borderWidth: 0,
                borderRadius: 0,
            },
        ],
    };

    const options: ChartOptions<'doughnut'> = {
        maintainAspectRatio: false,
        cutout: '70%', // full pie
        animation: {
            animateRotate: true,
            animateScale: false,
            duration: 1500,
            easing: 'easeOutCubic',
        },
        plugins: {
            legend: { display: false },

            tooltip: {
                enabled: true,
                displayColors: false,
                borderColor: 'rgba(0,0,0,0.1)',
                borderWidth: 1,
                // scriptable background to match slice
                backgroundColor: (ctx) => {
                    const idx = (ctx.tooltip as TooltipModel<'doughnut'>)
                        .dataPoints![0].dataIndex;
                    return baseColors[idx];
                },
                titleFont: {
                    family: "'DIN Next LT Arabic', 'Poppins', sans-serif",
                    size: 16,
                    weight: 'normal',
                },
                titleColor: '#fff',
                bodyFont: {
                    family: 'Tajawal, sans-serif',
                    size: 14,
                },
                bodyColor: '#fff',
                callbacks: {
                    title: (items) => '',
                    // raw value
                    label: (ctx) => {
                        const value = ctx.formattedValue;
                        const sliceLabel = ctx.label;
                        return `${sliceLabel}: ${value}`;
                    },
                },
            },
        },

        elements: {
            arc: {
                borderRadius: 0,
            },
        },
    };


    const centerTextPlugin = {
        id: 'centerText',
        beforeDraw(chart: Chart) {
            const centerConfig = (chart.options as any)?.elements?.center;
            if (!centerConfig || !centerConfig.text) return;

            const ctx = chart.ctx;
            const txt = centerConfig.text;
            const fontStyle = centerConfig.fontStyle || 'Arial';
            const color = centerConfig.color || '#000';
            const sidePadding = centerConfig.sidePadding || 20;
            const minFontSize = centerConfig.minFontSize || 20;
            const maxFontSize = centerConfig.maxFontSize || 75;

            const sidePaddingCalculated = (sidePadding / 100) * ((chart as any)?.innerRadius * 2);
            ctx.font = `30px ${fontStyle}`;
            const stringWidth = ctx.measureText(txt).width;
            const elementWidth = ((chart as any)?.innerRadius * 2) - sidePaddingCalculated;
            const widthRatio = elementWidth / stringWidth;
            let fontSizeToUse = Math.floor(30 * widthRatio);
            const elementHeight = (chart as any)?.innerRadius * 2;

            fontSizeToUse = Math.min(fontSizeToUse, elementHeight, maxFontSize);
            if (fontSizeToUse < minFontSize) {
                fontSizeToUse = minFontSize;
            }

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `${fontSizeToUse}px ${fontStyle}`;
            ctx.fillStyle = color;

            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;

            ctx.fillText(txt, centerX, centerY);
        },
    };
    return (
        <div className="flex flex-col items-center gap-6 w-full">
            <div className="w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] lg:w-[300px] lg:h-[300px] max-w-full max-h-full">
                <Doughnut data={chartData} options={{
                    ...options,
                    elements: {
                        // @ts-expect-error: 'center' is a custom plugin config
                        center: {
                            text: centerText ?? '',
                            sidePadding: 20,
                            minFontSize: 20,
                            maxFontSize: 40,
                            lineHeight: 25,
                        },
                    },
                }} plugins={[centerTextPlugin]} />
            </div>
            {/* <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-[300px]">
                {labels.map((label, i) => (
                    <li key={i} className="flex items-center gap-2 break-words">
                        <span
                            className="block w-3 h-3 shrink-0 rounded-full"
                            style={{ backgroundColor: baseColors[i] }}
                        />
                        <span className="text-sm font-main">{label}</span>
                    </li>
                ))}
            </ul> */}
        </div>
    );


}
