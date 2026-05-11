type PropertyFilterInputWrapperProps = {
    label: string;
    children: React.ReactNode;
};

export default function PropertyFilterInputWrapper({ label, children }: PropertyFilterInputWrapperProps) {
    return (
        <div className="flex flex-col gap-6">
            <label className="text-input text-sm font-semibold">{label}</label>
            {children}
        </div>
    );
}
