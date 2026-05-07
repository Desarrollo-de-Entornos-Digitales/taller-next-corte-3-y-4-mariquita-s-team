import Image from 'next/image';
import Link from 'next/link';

type NavbarProps = {
    mode?: 'guest' | 'authenticated';
    userName?: string;
    onMenuClick?: () => void;
    onLogout?: () => void;
};

export default function Navbar({ mode = 'guest', userName = 'Usuario', onMenuClick, onLogout }: NavbarProps) {
    return (
        <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex w-full max-w-[1600px] items-center gap-4 px-4 py-4 md:px-6">
                <button type="button" className="text-2xl text-gray-500" onClick={onMenuClick}>
                    =
                </button>
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/LogoVin.png" alt="Logo VincoBov" width={30} height={30} priority />
                    <span className="text-3xl font-semibold text-[#1f4f32]">VincoBov</span>
                </Link>

                <div className="ml-2 hidden flex-1 md:block">
                    <input
                        type="text"
                        placeholder="Search for..."
                        className="w-full rounded-lg border border-[#a7b3a9] px-4 py-2 text-sm outline-none focus:border-green-700"
                    />
                </div>

                {mode === 'authenticated' ? (
                    <div className="ml-auto flex items-center gap-3 text-sm">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium text-gray-700">{userName}</p>
                        <button
                            type="button"
                            className="rounded border border-gray-300 px-4 py-1.5 text-gray-600 hover:bg-gray-50"
                            onClick={onLogout}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="ml-auto flex items-center gap-2 text-sm">
                        <Link href="/login" className="rounded border border-gray-300 px-4 py-1.5 text-gray-600">
                            Log in
                        </Link>
                        <Link href="/registro" className="rounded bg-[#2f7d4d] px-4 py-1.5 text-white">
                            Sign up
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}
