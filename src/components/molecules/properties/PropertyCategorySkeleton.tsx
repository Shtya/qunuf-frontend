export default function PropertyCategorySkeleton() {
    return (
        <div className="relative w-full max-w-full h-[484px] rounded-[24px] bg-gray-200 overflow-hidden flex flex-col gap-6 animate-pulse">
            {/* Accent corner blocks */}
            <div className="z-[1] absolute top-0 rtl:start-0 ltr:end-0 bg-gray-200 rounded-tr-[24px] w-[94px] h-[47px]" />
            <div className="z-[1] absolute top-0 rtl:start-0 ltr:end-0 bg-gray-200 rounded-tr-[24px] w-[47px] h-[94px]" />

            {/* Image placeholder */}
            <div className="relative w-full h-full bg-gray-300 rounded-[24px]" />

            {/* Text placeholders */}
            <div className="space-y-4 z-[1] ms-2 me-6 mb-4">
                <div className="h-6 w-2/3 bg-gray-300 rounded" />
                <div className="h-4 w-1/2 bg-gray-300 rounded" />
                <div className="h-6 w-1/3 bg-gray-300 rounded" />
            </div>
        </div>
    );
}
