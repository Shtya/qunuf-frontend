import StarWrapper from "./StarWrapper";


type CircularRatingProps = {
    /** Number shown in the center */
    rating: number;
    /** star color (defaults to neon lime like the image) */
    starColor?: string;
    className?: string;
};

export default function CircularRating({
    rating,
    starColor = "#F4C430",
    className = "",
}: CircularRatingProps) {
    const size = 50;
    const starSize = 15;
    const center = size / 2;
    // radius controls how far the stars sit from the center
    const radius = size * 0.68;

    const stars = 5;
    // arc angles (degrees) so the middle star sits at 270deg (bottom)
    const startDeg = 210;
    const endDeg = 330;
    const clamped = Math.max(0, Math.min(stars, rating));
    const full = Math.floor(clamped);
    const frac = clamped - full;

    const starsPos = Array.from({ length: stars }).map((_, i) => {
        const t = i / (stars - 1);
        const angleDeg = startDeg + t * (endDeg - startDeg);
        const angleRad = (angleDeg * Math.PI) / 180;
        const x = center + radius * Math.cos(angleRad);
        const y = center + radius * Math.sin(angleRad);
        return { left: x, bottom: y };
    });

    return (
        <div
            className={className}
            style={{
                width: size,
                height: size,
                position: "relative",
                display: "inline-block",
            }}
        >
            {/* Center number */}
            <div
                style={{
                    position: "absolute",
                    left: center,
                    top: size * 0.33,
                    transform: "translate(-50%,-20%)",
                    fontSize: 22,
                    lineHeight: 1,
                    fontWeight: 700,
                    color: 'var(--primary)',
                    userSelect: "none",
                }}
            >
                {rating}
            </div>

            {/* Stars on an arc under the number */}
            {
                starsPos.map((p, i) => {
                    const isFull = i < full;
                    const isPartial = i === full && frac > 0;

                    return (<div
                        key={i}
                        style={{
                            position: "absolute",
                            left: p.left,
                            bottom: p.bottom,
                            transform: "translate(-50%,-50%)",
                            width: starSize,
                            height: starSize,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            pointerEvents: "none",
                        }}
                        aria-hidden
                    >
                        <StarWrapper
                            isFull={isFull}
                            isPartial={isPartial}
                            size={starSize}
                            fullColor={starColor}
                        />
                    </div>)
                })
            }
        </div >
    );
}
