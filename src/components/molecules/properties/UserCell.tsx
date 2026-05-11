import { User } from "@/types/dashboard/user";
import { resolveUrl } from "@/utils/upload";
import Image from "next/image";
import Link from 'next/link';
import { UserRole } from "@/constants/user";
import SmartTooltip from "@/components/atoms/SmartTooltip";

interface UserCellProps {
    user?: User; // From row.tenant or row.landlord
    role?: UserRole; // Current logged-in user role or specific role passed
}

export function UserCell({ user, role }: UserCellProps) {
    if (!user) return <span className="text-gray-400">—</span>;

    const isAdmin = role === UserRole.ADMIN;
    const imageSrc = user?.imagePath ? resolveUrl(user.imagePath) : "/users/default-user.png";

    // Reusable Content to keep the DRY principle
    const renderContent = () => (
        <SmartTooltip
            value={user.name || "—"}
            maxLength={{ xs: 10, sm: 15, md: 20, lg: 30, xl: 40 }}
            className={`font-medium ${isAdmin ? 'text-secondary hover:underline' : 'text-dark'}`}
        />
    );

    return (
        <div className="flex items-center gap-2 min-w-fit">
            {/* Avatar Section */}
            <div className="relative w-[40px] h-[40px] shrink-0">
                <Image
                    src={imageSrc}
                    fill
                    sizes="40px"
                    alt={user.name || "User"}
                    className="rounded-full object-cover border border-gray-100"
                />
            </div>

            {/* Name Section with Conditional Link */}
            {isAdmin ? (
                <Link href={`/dashboard/users?view=${user.id}`} className="cursor-pointer">
                    {renderContent()}
                </Link>
            ) : (
                renderContent()
            )}
        </div>
    );
}