
type AnimatedSecondaryButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    className?: string;
    position?: 'start' | 'end';
    primary?: boolean;
    large?: boolean;
    showBall?: boolean;
    loading?: boolean; // added loading prop
};
export const AnimatedSecondaryButton = ({
    children,
    className = '',
    position = 'start',
    primary = false,
    large = true,
    showBall = true,
    loading = false, // new prop
    ...props
}: AnimatedSecondaryButtonProps) => {
    return (
        <button {...props}
            className={`group relative transition ${primary ? "bg-primary hover:bg-primary-hover" : "bg-secondary hover:bg-secondary-hover"} text-white
                  ${large ? "w-[180px] sm:w-[200px] 2xl:w-[242px]" : " w-[140px] lg:w-[160px]"} h-[45px] sm:h-[50px] 2xl:h-[53px] overflow-hidden
                  rounded-md font-medium   ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
            style={{ boxShadow: "0px 4px 12px 0px #0000001F" }}
        >
            <span>{children}</span>

            {showBall && (
                <>
                    <AnimatedBall position={position} large={large} variant="white" offset={5} />
                    <AnimatedBall position={position} large={large} variant="highlight" offset={0} />
                </>
            )}
        </button>
    );
};


type AnimatedBallProps = {
    position: 'start' | 'end';
    large?: boolean;
    variant?: 'white' | 'highlight';
    offset?: number;
};

export const AnimatedBall = ({
    position,
    large = true,
    variant = 'white',
    offset = 0
}: AnimatedBallProps) => {
    const baseSize = large
        ? 'sm:w-[70px] 2xl:w-[75px] h-[60px] sm:h-[70px] 2xl:h-[75px]'
        : 'w-[60px] xl:w-[65px] h-[60px] xl:h-[65px]';

    const color = variant === 'white' ? 'bg-white' : 'bg-highlight';

    const style: React.CSSProperties = {
        position: 'absolute',
        bottom: `${-40 + offset}px`,
        [position === 'start' ? 'insetInlineStart' : 'insetInlineEnd']: `${-20 + offset}px`
    };

    const hoverTranslate =
        position === 'start'
            ? 'ltr:group-hover:translate-y-[-5px] ltr:group-hover:translate-x-[5px] rtl:group-hover:translate-[-5px]'
            : 'ltr:group-hover:translate-[-5px] rtl:group-hover:translate-x-[5px] rtl:group-hover:translate-y-[-5px]';

    return (
        <div
            className={`${color} ${baseSize} rounded-full transition-all duration-300 ease-out ${hoverTranslate} group-hover:scale-105`}
            style={style}
        />
    );
};
