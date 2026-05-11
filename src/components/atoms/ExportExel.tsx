import { useId, useState } from "react";
import SecondaryButton from "./buttons/SecondaryButton";
import Dropdown, { MenuProps, TriggerProps } from "./Dropdown";
import { CiExport } from "react-icons/ci";
import Popup from "./Popup";
import Tooltip from "./Tooltip";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { tv } from "tailwind-variants";

const exportVariants = tv({
    slots: {
        container: "space-y-4 bg-dashboard-bg p-2 md:p-4 rounded-2xl w-full max-w-md animate-in fade-in zoom-in duration-200",
        radioLabel: "inline-flex items-center gap-2 cursor-pointer group p-2 rounded-xl hover:bg-secondary/5 transition-colors",
        radioInput: "w-4 h-4 border-secondary text-secondary focus:ring-secondary accent-secondary",
        numberInput: "w-full border border-gray/20 py-2 px-3 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none",
        primaryBtn: "bg-primary hover:bg-primary-hover text-white rounded-xl py-2.5 px-6 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/10",
        ghostBtn: "text-dark/60 hover:text-dark hover:bg-gray/10 rounded-xl py-2.5 px-6 text-sm font-semibold transition-all"
    }
});


export default function ExportExel({ hasRows, onExport }: { hasRows?: boolean, onExport?: (limit: number) => Promise<void> }) {
    const [showPopup, setShowPopup] = useState(false);
    const t = useTranslations('dashboard.filter.export');

    return (
        <div>
            {/* Desktop Dropdown */}
            <Dropdown
                className="hidden md:block"
                Trigger={(props) => <ExportExelTrigger {...props} disabled={!hasRows} />}
                Menu={(props) => <ExportExelMenu disabled={!hasRows} {...props} onExport={onExport} />}
                position="bottom-right"
            />

            {/* Mobile Trigger */}
            <div className="block md:hidden w-fit">
                <Tooltip content={t('trigger')}>
                    <button
                        disabled={!hasRows}
                        className={cn(
                            "p-2.5 rounded-xl border border-gray/20 bg-dashboard-bg transition-all active:scale-95 disabled:opacity-40",
                            "hover:border-secondary hover:bg-secondary/5"
                        )}
                        onClick={() => setShowPopup(true)}
                    >
                        <CiExport size={22} className='shrink-0 text-secondary' />
                    </button>
                </Tooltip>
            </div>

            <Popup show={showPopup} onClose={() => setShowPopup(false)}>
                <ExportExelMenu disabled={!hasRows} onClose={() => setShowPopup(false)} onExport={onExport} />
            </Popup>
        </div>
    );
}

function ExportExelTrigger({ isOpen, onToggle, disabled }: TriggerProps) {
    const t = useTranslations('dashboard.filter.export');

    return (
        <SecondaryButton
            disabled={disabled}
            className={cn(
                "flex gap-2 items-center border border-gray/20 bg-dashboard-bg px-5 py-2.5 rounded-xl transition-all duration-150",
                isOpen && "border-secondary ring-4 ring-secondary/5"
            )}
            onClick={onToggle}
        >
            <CiExport size={18} className={cn("transition-transform", isOpen && "scale-110")} />
            <span className="text-nowrap">{t('trigger')}</span>
        </SecondaryButton>
    );
}

function ExportExelMenu({ onClose, onExport, disabled }: { disabled: boolean, onClose?: () => void, onExport?: (limit: number) => Promise<void> }) {
    const t = useTranslations('dashboard.filter.export');
    const [isLoading, setLoading] = useState(false);
    const [scope, setScope] = useState<'current' | 'more'>('current');
    const [maxRows, setMaxRows] = useState(100);
    const searchParams = useSearchParams();
    const instanceId = useId();
    const styles = exportVariants();

    async function handleExport() {
        if (!onExport) return;
        setLoading(true);
        const currentLimit = Number(searchParams.get('limit')) || 10;
        const limitToSend = scope === 'current' ? currentLimit : maxRows;
        await onExport(limitToSend);
        setLoading(false);
        onClose?.();
    }

    return (
        <div className={styles.container()}>
            <div className="space-y-3">
                <div className="text-xs font-bold text-secondary uppercase tracking-wider">{t('scope')}</div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className={styles.radioLabel()}>
                        <input
                            type="radio"
                            name={`export-scope-${instanceId}`}
                            className={styles.radioInput()}
                            checked={scope === 'current'}
                            onChange={() => setScope('current')}
                        />
                        <span className="text-sm font-medium text-dark">{t('currentTable')}</span>
                    </label>
                    <label className={styles.radioLabel()}>
                        <input
                            type="radio"
                            name={`export-scope-${instanceId}`}
                            className={styles.radioInput()}
                            checked={scope === 'more'}
                            onChange={() => setScope('more')}
                        />
                        <span className="text-sm font-medium text-dark">{t('moreData')}</span>
                    </label>
                </div>
            </div>

            <div className={cn("space-y-2 transition-all duration-200", scope !== 'more' && "opacity-40 grayscale pointer-events-none")}>
                <label className="block text-sm font-semibold text-dark" htmlFor="max-rows">{t('moreData')}</label>
                <input
                    id="max-rows"
                    type="number"
                    className={styles.numberInput()}
                    value={maxRows}
                    disabled={scope !== 'more'}
                    onChange={(e) => setMaxRows(Math.min(1000, Math.max(1, Number(e.target.value) || 0)))}
                />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray/5">
                <button
                    className={styles.primaryBtn()}
                    disabled={disabled || isLoading}
                    onClick={handleExport}
                >
                    {isLoading ? t('exporting') : t('export')}
                </button>
                <button className={styles.ghostBtn()} onClick={onClose}>{t('cancel')}</button>
            </div>
        </div>
    );
}
