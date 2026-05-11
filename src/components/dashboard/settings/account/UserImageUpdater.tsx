import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import api from "@/libs/axios";
import { resolveUrl } from "@/utils/upload";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { MdCameraAlt } from "react-icons/md";

export default function UserImageUpdater() {
    const t = useTranslations('dashboard.account');
    const [imageUploading, setImageUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user, setCurrentUser } = useAuth();
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation (optional: check size or type here if needed)
        if (!file.type.startsWith('image/')) {
            toast.error(t('messages.invalidFileType'));
            return;
        }

        const formData = new FormData();
        formData.append('image', file); // The backend expects a field named 'image'

        setImageUploading(true);
        const toastId = toast.loading(t('messages.uploadingImage'));

        try {

            const res = await api.post('/users/profile-image', formData);

            toast.success(t('messages.imageUpdated'), { id: toastId });

            setCurrentUser(({ ...user, imagePath: res.data.imagePath }));
        } catch (error: any) {
            const errorMsg = t('messages.updateError');
            toast.error(errorMsg, { id: toastId });
        } finally {
            setImageUploading(false);
            // Reset input so the same file can be picked again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col items-center pb-8 mb-6 border-b border-gray/10">
            <div className="relative group/avatar mb-6">
                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                />

                {/* Outer Glow Ring - Multiple layers */}
                <div className="absolute -inset-2 bg-gradient-to-br from-secondary/30 via-primary/30 to-secondary/30 rounded-full opacity-0 group-hover/avatar:opacity-100 blur-xl transition-opacity duration-500" />
                <div className="absolute -inset-1 bg-gradient-to-br from-secondary/40 to-primary/40 rounded-full opacity-0 group-hover/avatar:opacity-100 blur-lg transition-opacity duration-300" />

                {/* Image Container */}
                <div className={cn(
                    "relative h-32 w-32 sm:h-40 sm:w-40 rounded-full overflow-hidden",
                    "ring-4 ring-white shadow-xl",
                    "group-hover/avatar:ring-secondary group-hover/avatar:ring-8",
                    "transition-all duration-300"
                )}>
                    {user?.imagePath ? (
                        <Image
                            src={resolveUrl(user.imagePath) || "/users/default-user.png"}
                            alt={user.name}
                            fill
                            className={cn(
                                "object-cover transition-all duration-300",
                                imageUploading ? 'opacity-50 scale-110 blur-sm' : 'opacity-100 scale-100 group-hover/avatar:scale-110'
                            )}
                            sizes="(max-width: 640px) 128px, 160px"
                            priority
                        />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center text-secondary text-5xl sm:text-6xl font-bold transition-transform duration-300 group-hover/avatar:scale-110">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    )}

                    {/* Hover Overlay */}
                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-t from-dark/60 via-dark/20 to-transparent",
                        "flex items-end justify-center pb-4",
                        "opacity-0 group-hover/avatar:opacity-100 transition-all duration-300",
                        imageUploading && "opacity-0"
                    )}>
                        <span className="text-white text-sm font-semibold">
                            {t('changeImage')}
                        </span>
                    </div>

                    {/* Loading Spinner Overlay */}
                    {imageUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-dark/40 backdrop-blur-sm">
                            <div className="relative">
                                {/* Outer spinning ring */}
                                <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                                {/* Inner pulsing dot */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit Icon Button */}
                <button
                    type="button"
                    onClick={() => !imageUploading && fileInputRef.current?.click()}
                    disabled={imageUploading}
                    className={cn(
                        "absolute bottom-2 right-2 sm:bottom-3 sm:right-3",
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        "bg-gradient-to-br from-secondary to-primary text-white",
                        "shadow-lg hover:shadow-xl transition-all duration-200",
                        "hover:scale-110 active:scale-95",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "group/btn"
                    )}
                    title={t('changeImage')}
                >
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-br from-secondary/50 to-primary/50 rounded-full opacity-0 group-hover/btn:opacity-100 blur-md transition-opacity duration-200 -z-10" />

                    <MdCameraAlt className="w-6 h-6 group-hover/btn:scale-110 transition-transform duration-200" />
                </button>
            </div>

            {/* User Data Display */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-dark bg-gradient-to-r from-dark via-dark/90 to-dark/70 bg-clip-text">
                    {user?.name}
                </h2>
                <p className="text-dark/60 text-sm sm:text-base font-medium">
                    {user?.email}
                </p>
            </div>
        </div>
    );
}