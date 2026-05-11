import { useMemo } from 'react';

type Option = { label: string; value: number };

const useMinMaxOption = (options: Option[]) => {
    return useMemo(() => {
        return options.reduce(
            (acc, curr) => {
                if (curr.value < acc.minOption.value) acc.minOption = curr;
                if (curr.value > acc.maxOption.value) acc.maxOption = curr;
                return acc;
            },
            { minOption: options[0], maxOption: options[0] }
        );
    }, [options]);
};


export default useMinMaxOption;