import { TooltipDP } from "@/components/molecules/charts/ChartTooltip";
import { TooltipItem, TooltipModel } from "chart.js";
import { useState } from "react";


export default function useChartToolTip() {
    const [tooltipData, setTooltipData] = useState<{ dps: TooltipDP[]; left: number; top: number }>({
        dps: [],
        left: 0,
        top: 0,
    });

    const [showTip, setShowTip] = useState(false);

    function handleTooltip(context: { tooltip: any }) {

        const tip = context.tooltip as TooltipModel<'line'>;

        if (tip.opacity === 0 && showTip) {
            setShowTip(false);
            return;
        }
        // map ChartJS points → our TooltipDP
        const dps = tip.dataPoints!.map((pt: TooltipItem<'line'>) => ({
            label: pt.dataset.label || '',
            value: pt.formattedValue,
            color: pt.dataset.borderColor as string,
        }));

        if (tooltipData.left !== tip.caretX) {

            setTooltipData({
                dps,
                left: tip.caretX,
                top: tip.caretY,
            });
            setShowTip(true);
        }

    }

    return { tooltipData, showTip, handleTooltip, setShowTip };
}