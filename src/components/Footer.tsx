import Image from 'next/image';
import Link from 'next/link';

const helpLinks = [
    { label: 'Help Center', href: '/help' },
    { label: 'Getting Started', href: '/help/getting-started' },
    { label: 'Buying', href: '/help/buying' },
    { label: 'Selling', href: '/help/selling' },
    { label: 'Contact', href: '/help/contact' },
];

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-[#1a3d28] text-white">
            <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-4 px-4 py-4 md:flex-row md:justify-between md:gap-6 md:px-6">
                <div className="flex shrink-0 items-center gap-2">
                    <Image src="/LogoVin.png" alt="Logo VincoBov" width={28} height={28} priority />
                    <span className="text-sm font-semibold">VincoBov</span>
                </div>

                <nav className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1">
                    {helpLinks.map((item, index) => (
                        <span key={item.href} className="flex items-center">
                            {index > 0 ? <span className="mx-2 text-white/20">·</span> : null}
                            <Link
                                href={item.href}
                                className="text-xs text-white/75 transition hover:text-white sm:text-sm"
                            >
                                {item.label}
                            </Link>
                        </span>
                    ))}
                </nav>

                <p className="shrink-0 text-center text-[10px] text-white/45 sm:text-xs">© {year} VincoBov</p>
            </div>
        </footer>
    );
}
