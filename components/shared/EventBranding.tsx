import Image from "next/image";

export function EventBranding({ className = "" }: { className?: string }) {
    return (
        <div className={`flex items-center gap-6 opacity-80 ${className}`}>
            <Image src="/RV-logo-white.png" alt="RV College of Engineering" width={140} height={44} className="h-9 w-auto object-contain" />
            <div className="h-8 w-px bg-white/20" />
            <Image src="/CC_10_Years_Logo_White.png" alt="RVCE Coding Club — 10 Years" width={100} height={44} className="h-10 w-auto object-contain" />
        </div>
    );
}
