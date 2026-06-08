import type { ReactNode } from 'react';

type AuthCardProps = {
    title: string;
    subtitle: string;
    children: ReactNode;
    className?: string;
};

export default function AuthCard({ title, subtitle, children, className = '' }: AuthCardProps) {
    return (
        <div
            className={`w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-md ${className}`.trim()}
        >
            <h2 className="text-center text-3xl font-bold">{title}</h2>
            <p className="mt-2 text-center text-sm text-gray-500">{subtitle}</p>
            {children}
        </div>
    );
}
