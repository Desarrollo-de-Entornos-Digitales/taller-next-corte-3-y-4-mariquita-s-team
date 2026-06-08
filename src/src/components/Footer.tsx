import Image from 'next/image';
import Link from 'next/link';

const footerLinks = [
    { label: 'About Us', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Privacy', href: '#' },
    { label: 'Help', href: '#' },
];

export default function Footer() {
    return (
        <footer className="bg-[#204b32] px-6 py-4 text-white md:px-10">
            <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-4 md:flex-row md:justify-between">
                <div className="flex items-center gap-3">
                    <Image src="/LogoVin.png" alt="Logo VincoBov" width={46} height={46} priority />
                    <span className="text-xl font-semibold leading-none md:text-2xl">VincoBov</span>
                </div>

                <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-white/90 md:gap-8 md:text-sm">
                    {footerLinks.map((item) => (
                        <Link key={item.label} href={item.href} className="hover:text-white">
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <p className="text-center text-[11px] text-white/85 md:text-xs">
                    CompanyName @ 202X. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
