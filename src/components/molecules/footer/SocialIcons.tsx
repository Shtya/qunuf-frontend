'use client';

import { FaFacebook, FaLinkedin, FaPinterest, FaTiktok, FaTwitter, FaYoutube } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { Link } from "@/i18n/navigation";
import { useValues } from "@/contexts/GlobalContext";
import { useMemo } from "react";

type SocialIconsProps = {
    primary?: boolean;
    size?: number; // 👈 control icon size
    itemClassName?: string; // 👈 extra classes for each social item
};

export default function SocialIcons({
    primary = true,
    size = 24,
    itemClassName = "",
}: SocialIconsProps) {
    const { settings, loadingSettings } = useValues();

    const socials = useMemo(() => {
        return [
            settings?.twitter && { href: settings.twitter, Icon: FaTwitter, label: "Twitter" },
            settings?.youtube && { href: settings.youtube, Icon: FaYoutube, label: "YouTube" },
            settings?.instagram && { href: settings.instagram, Icon: AiFillInstagram, label: "Instagram" },
            settings?.facebook && { href: settings.facebook, Icon: FaFacebook, label: "Facebook" },
            settings?.linkedin && { href: settings.linkedin, Icon: FaLinkedin, label: "LinkedIn" },
            settings?.pinterest && { href: settings.pinterest, Icon: FaPinterest, label: "Pinterest" },
            settings?.tiktok && { href: settings.tiktok, Icon: FaTiktok, label: "TikTok" },
        ].filter(Boolean) as {
            href: string;
            Icon: React.ComponentType<{ size: number }>;
            label: string;
        }[];
    }, [settings]);


    if (loadingSettings) {
        // Skeleton placeholder while loading
        return (
            <div className="flex gap-2 sm:self-end">
                <div className="w-8 h-8 bg-gray-600 animate-pulse rounded-full" />
                <div className="w-8 h-8 bg-gray-600 animate-pulse rounded-full" />
                <div className="w-8 h-8 bg-gray-600 animate-pulse rounded-full" />
            </div>
        );
    }

    if (!socials.length) return null;

    return (
        <div className="flex gap-2 sm:self-end">
            {socials.map(({ href, Icon, label }) => (
                <Link
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-white transition ${primary
                        ? "hover:bg-secondary hover:text-white"
                        : "bg-secondary hover:bg-white hover:text-secondary"
                        } ${itemClassName}`}
                >
                    <Icon size={size} />
                </Link>
            ))}
        </div>
    );
}
