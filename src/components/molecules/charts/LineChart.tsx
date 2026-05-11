'use client';


import useChartToolTip from '@/hooks/useChartToolTip';
import { createGradiant } from '@/utils/color';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    Filler,
    ChartOptions,
    ChartData,
    ScriptableContext,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ChartTooltip from './ChartTooltip';


ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

interface LineChartProps {
    labels: string[];
    label: string;
    data: number[];
    lineColor?: string;
    curves?: boolean;
    bgGradient?: { from: string; to: string };


}

export function LineChart({
    labels,
    label,
    data,
    lineColor = '#363aed',
    curves = true,
    bgGradient = { from: 'rgba(54, 58, 237, 0.1)', to: 'rgba(54, 58, 237, 0.45)' }
}: LineChartProps) {

    const { handleTooltip, tooltipData, showTip } = useChartToolTip();

    const chartData: ChartData<'line'> = {
        labels,
        datasets: [
            {
                label: label,
                data,
                borderColor: lineColor,
                borderWidth: 4,
                // 👇 scriptable backgroundColor to create gradient
                backgroundColor: (ctx: ScriptableContext<'line'>) => createGradiant(ctx, lineColor, bgGradient),
                fill: 'start',
                tension: curves ? 0.4 : 0,
                pointRadius: curves ? 0 : 4,
                pointHoverRadius: 6,
                pointBackgroundColor: lineColor,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHitRadius: 20,
            },
        ],
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: false, // disable built-in
                external: (context) => handleTooltip(context),
            },
        },
        scales: {
            x: {
                grid: { display: false },

                ticks: {
                    font: {
                        family: "'DIN Next LT Arabic', 'Poppins', sans-serif",
                        size: 12,
                    },
                },
            },
            y: {
                grid: { color: 'rgba(0,0,0,0.05)', lineWidth: 1.5, },
                ticks: {
                    font: {
                        family: "'DIN Next LT Arabic', 'Poppins', sans-serif",
                        size: 12,
                    },
                },
            },
        },
    };

    return (
        <div style={{ position: "relative", width: 'auto', height: '100%' }}>
            <Line data={chartData} options={options} />
            <ChartTooltip tooltipData={tooltipData} visible={showTip} />
        </div>
    );
}
