import React from "react";
import StarWrapper from "./StarWrapper";

type StarsProps = {
    rating: number; // e.g., 4.5
    size?: number;  // defaults to 21 
    reverse?: boolean;
};


const RatingStars: React.FC<StarsProps> = ({ rating, size = 21, reverse = false }) => {
    const clamped = Math.max(0, Math.min(5, rating));
    const full = Math.floor(clamped);
    const frac = clamped - full;

    const starGap = 6; // px spacing between stars

    return (
        <div style={{ display: "flex", alignItems: "center", gap: starGap }} className={reverse ? "flex-row-reverse" : ""}>
            {Array.from({ length: 5 }).map((_, i) => {
                const isFull = i < full;
                const isPartial = i === full && frac > 0;

                return (
                    <StarWrapper
                        key={i}
                        isFull={isFull}
                        isPartial={isPartial}
                        size={size}
                    />
                );
            })}
        </div>
    );
};


export default RatingStars;