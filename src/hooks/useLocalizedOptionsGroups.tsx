import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

type Option = { value: string; label: string; };

interface LocalizedOptionsConfig {
    key: string;              // key for returned object (e.g. "features", "periods")
    translationPath: string;  // sub path under basePath, e.g. "Features" or "Bedrooms"
    options: string[];        // array of { value, ... }
    selectKey?: string;       // ICU message key inside JSON (default: "options")
    variableName?: string;    // ICU variable name (default: "option")
}

export function useLocalizedOptionsGroups(
    configs: LocalizedOptionsConfig[],
    basePath: string
) {
    const t = useTranslations(basePath);

    return useMemo(() => {
        const obj: Record<string, Option[]> = {};

        configs.forEach(
            ({ key, translationPath, options, selectKey = 'options', variableName = 'option' }) => {
                obj[key] = options.map(value => ({
                    value,
                    label: t(`${translationPath}.${selectKey}`, { [variableName]: value })
                }));
            }
        );

        return obj;
    }, [configs, t]);
}
