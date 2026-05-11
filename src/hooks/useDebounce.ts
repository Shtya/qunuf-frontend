import { useEffect, useState } from "react";

type UseDebounceProps = {
  value: any;
  onDebounce?: (val: any) => void;
  delay?: number;
};

export function useDebounce({ value, onDebounce, delay = 275 }: UseDebounceProps) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      onDebounce?.(value)
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return { debouncedValue, setDebouncedValue };
}