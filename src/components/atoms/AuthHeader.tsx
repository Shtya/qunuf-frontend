import LocaleSwitcher from "../atoms/LocaleSwitcher";
import Logo from "../atoms/Logo";


export default function AuthHeader({ className }: { className?: string }) {
    return (
        <div className={`mb-10 flex justify-between items-center ${className}`}>
            <Logo small />
            <LocaleSwitcher />
        </div>
    );
}