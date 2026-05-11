import Logo from "@/components/atoms/Logo";
import { useTranslations } from "next-intl";


export default function EmptyChatState() {
    const t = useTranslations('dashboard.chats');

    return (
        <div className=" h-[500px]  flex-center flex flex-col items-center justify-center text-center gap-6 px-4">
            <Logo />
            <p className="text-lg text-gray-500 font-medium">
                {t('selectConversation')}
            </p>
        </div>
    );
}
