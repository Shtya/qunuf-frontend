'use client'
import { useState } from 'react';
import Image from 'next/image';

interface FallbackImageProps {
    src?: string;
    alt?: string;
    fill?: boolean;
    width?: number;
    height?: number;
    defaultImage?: string;
    className?: string;
}

const FallbackImage: React.FC<FallbackImageProps> = ({
    src,
    alt = 'User',
    width = 40,
    height = 40,
    fill = false,
    defaultImage = '/users/default-user.png',
    className = 'w-10 h-10 rounded-full object-cover',
}) => {
    const [hasError, setHasError] = useState(false);

    const imageSrc =
        !hasError && typeof src === 'string' && src.trim() !== ''
            ? src
            : defaultImage;

    return (

        !hasError ? <Image
            src={imageSrc}
            alt={alt}
            {...(fill
                ? { fill: true }
                : { width, height })}
            className={className}
            onError={() => setHasError(true)}
        /> : <Image
            src={imageSrc}
            alt={alt}
            {...(fill
                ? { fill: true }
                : { width, height })}
            className={className} />

    );
};

export default FallbackImage;
