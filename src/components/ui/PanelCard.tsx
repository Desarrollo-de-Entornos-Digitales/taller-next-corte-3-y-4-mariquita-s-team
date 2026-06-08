import type { ReactNode } from 'react';

type PanelCardProps = {
    title: string;
    children: ReactNode;
};

export default function PanelCard({ title, children }: PanelCardProps) {
    return (
        <section className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <div className="mt-3">{children}</div>
        </section>
    );
}
