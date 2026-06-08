type RoleOptionCardProps = {
    title: string;
    description: string;
    icon: string;
    selected?: boolean;
    onClick: () => void;
};

export default function RoleOptionCard({ title, description, icon, selected = false, onClick }: RoleOptionCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full rounded-xl border p-4 text-left transition ${
                selected ? 'border-green-700 bg-green-50 shadow-sm' : 'border-gray-300 bg-white hover:border-green-500'
            }`}
            aria-pressed={selected}
        >
            <div className="mb-3 text-2xl" aria-hidden>
                {icon}
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-xs text-gray-600">{description}</p>
        </button>
    );
}
